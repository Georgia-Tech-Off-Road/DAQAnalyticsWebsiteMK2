const request = require('supertest');
const db = require('../database/db.js');
const fs = require('node:fs');
const path = require('node:path');

// Store original fetch and create mock before importing app
const originalFetch = global.fetch;
const mockFetch = jest.fn();
global.fetch = mockFetch;

const app = require('../index');

const DAQ_FILES_DIR = path.join(process.cwd(), 'DAQFiles');

describe('Datasets API', () => {
    const testDatasetId = 'test-dataset-id-12345';
    const testJsonPath = path.join(DAQ_FILES_DIR, `${testDatasetId}.json`);
    const testCsvPath = path.join(DAQ_FILES_DIR, `${testDatasetId}.csv`);

    const sampleJsonData = [
        { sec: 1761484790, microsec: 7842085, rpm1: 0, rpm2: 0 },
        { sec: 1761484790, microsec: 7858044, rpm1: 100, rpm2: 50 }
    ];

    beforeEach(() => {
        // Clean up test data before each test
        db.prepare('DELETE FROM Dataset').run();

        // Reset fetch mock
        mockFetch.mockReset();

        // Clean up test files
        if (fs.existsSync(testJsonPath)) {
            fs.unlinkSync(testJsonPath);
        }
        if (fs.existsSync(testCsvPath)) {
            fs.unlinkSync(testCsvPath);
        }
    });

    afterAll(() => {
        // Clean up test files
        if (fs.existsSync(testJsonPath)) {
            fs.unlinkSync(testJsonPath);
        }
        if (fs.existsSync(testCsvPath)) {
            fs.unlinkSync(testCsvPath);
        }
        // Restore original fetch
        global.fetch = originalFetch;
        db.close();
    });

    // Helper to insert a test dataset
    function insertTestDataset(overrides = {}) {
        const dataset = {
            id: testDatasetId,
            title: 'Test Dataset',
            description: 'Test Description',
            date: '2025-01-15 10:00:00',
            uploaded_at: '2025-01-01 00:00:00',
            updated_at: '2025-01-01 00:00:00',
            location_id: null,
            vehicle_id: null,
            competition: 0,
            ...overrides
        };

        db.prepare(`INSERT INTO Dataset VALUES (
            @id, @title, @description, @date, @uploaded_at,
            @updated_at, @location_id, @vehicle_id, @competition
        )`).run(dataset);

        return dataset;
    }

    // Helper to create test JSON file
    function createTestJsonFile() {
        fs.writeFileSync(testJsonPath, JSON.stringify(sampleJsonData));
    }

    // Helper to create test CSV file with specific mtime
    function createTestCsvFile(content = 'sec,microsec,rpm1,rpm2\n1761484790,7842085,0,0') {
        fs.writeFileSync(testCsvPath, content);
    }

    // Helper to set file modification time
    function setFileMtime(filePath, date) {
        fs.utimesSync(filePath, date, date);
    }

    describe('GET /datasets', () => {
        test('should return empty array when no datasets exist', async () => {
            const response = await request(app)
                .get('/datasets')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toEqual([]);
        });

        test('should return all datasets', async () => {
            insertTestDataset();

            const response = await request(app)
                .get('/datasets')
                .expect(200);

            expect(response.body).toHaveLength(1);
            expect(response.body[0].title).toBe('Test Dataset');
            expect(response.body[0].id).toBe(testDatasetId);
        });

        test('should return multiple datasets', async () => {
            insertTestDataset({ id: 'dataset-1', title: 'Dataset One' });
            insertTestDataset({ id: 'dataset-2', title: 'Dataset Two' });

            const response = await request(app)
                .get('/datasets')
                .expect(200);

            expect(response.body).toHaveLength(2);
        });
    });

    describe('GET /datasets/:id', () => {
        test('should return dataset by id', async () => {
            insertTestDataset();

            const response = await request(app)
                .get(`/datasets/${testDatasetId}`)
                .expect(200);

            expect(response.body.id).toBe(testDatasetId);
            expect(response.body.title).toBe('Test Dataset');
            expect(response.body.description).toBe('Test Description');
        });

        test('should return undefined for non-existent dataset', async () => {
            const response = await request(app)
                .get('/datasets/non-existent-id')
                .expect(200);

            // Current implementation returns undefined/null for missing datasets
            expect(response.body).toBeFalsy();
        });
    });

    describe('GET /datasets/download/:id', () => {
        test('should download JSON file when it exists', async () => {
            insertTestDataset();
            createTestJsonFile();

            const response = await request(app)
                .get(`/datasets/download/${testDatasetId}`)
                .expect(200);

            expect(response.headers['content-disposition']).toContain(`${testDatasetId}.json`);
            const responseData = JSON.parse(response.text);
            expect(responseData).toEqual(sampleJsonData);
        });

        test('should return 404 when JSON file does not exist', async () => {
            insertTestDataset();
            // Don't create the JSON file

            const response = await request(app)
                .get(`/datasets/download/${testDatasetId}`)
                .expect(404);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('does not exist');
        });
    });

    describe('GET /datasets/download/csv/:id', () => {
        test('should return 404 when dataset does not exist in database', async () => {
            const response = await request(app)
                .get('/datasets/download/csv/non-existent-id')
                .expect(404);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Dataset not found');
        });

        test('should call microservices when CSV does not exist', async () => {
            insertTestDataset();
            createTestJsonFile();

            // Mock microservices - create CSV file when called (simulating what microservices does)
            mockFetch.mockImplementationOnce(async () => {
                createTestCsvFile();
                return {
                    ok: true,
                    json: async () => ({ output_path: testCsvPath })
                };
            });

            const response = await request(app)
                .get(`/datasets/download/csv/${testDatasetId}`)
                .expect(200);

            // Verify microservices was called
            expect(mockFetch).toHaveBeenCalledTimes(1);
            expect(mockFetch).toHaveBeenCalledWith(
                'http://127.0.0.1:5000/convert/json/csv',
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: expect.stringContaining(testDatasetId)
                })
            );

            expect(response.headers['content-disposition']).toContain('.csv');
        });

        test('should call microservices when CSV is older than updated_at', async () => {
            // Insert dataset with recent updated_at
            const recentDate = '2025-01-20 12:00:00';
            insertTestDataset({ updated_at: recentDate });
            createTestJsonFile();

            // Create CSV file with old modification time
            createTestCsvFile();
            const oldDate = new Date('2025-01-10T00:00:00');
            setFileMtime(testCsvPath, oldDate);

            // Mock microservices - recreate CSV file when called
            mockFetch.mockImplementationOnce(async () => {
                createTestCsvFile();  // Overwrites with fresh content
                return {
                    ok: true,
                    json: async () => ({ output_path: testCsvPath })
                };
            });

            const response = await request(app)
                .get(`/datasets/download/csv/${testDatasetId}`)
                .expect(200);

            // Verify microservices was called because CSV is stale
            expect(mockFetch).toHaveBeenCalledTimes(1);
        });

        test('should NOT call microservices when CSV is newer than updated_at', async () => {
            // Insert dataset with old updated_at
            const oldDate = '2025-01-01 00:00:00';
            insertTestDataset({ updated_at: oldDate });
            createTestJsonFile();

            // Create CSV file with recent modification time
            createTestCsvFile();
            const recentDate = new Date('2025-01-15T00:00:00');
            setFileMtime(testCsvPath, recentDate);

            const response = await request(app)
                .get(`/datasets/download/csv/${testDatasetId}`)
                .expect(200);

            // Verify microservices was NOT called
            expect(mockFetch).not.toHaveBeenCalled();

            expect(response.headers['content-disposition']).toContain('.csv');
        });

        test('should return 500 when microservices call fails', async () => {
            insertTestDataset();
            createTestJsonFile();

            // Mock failed microservices response
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500
            });

            const response = await request(app)
                .get(`/datasets/download/csv/${testDatasetId}`)
                .expect(500);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Failed to convert');
        });

        test('should return 500 when microservices is unavailable', async () => {
            insertTestDataset();
            createTestJsonFile();

            // Mock network error
            mockFetch.mockRejectedValueOnce(new Error('Connection refused'));

            const response = await request(app)
                .get(`/datasets/download/csv/${testDatasetId}`)
                .expect(500);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Microservices unavailable');
        });

        test('should serve existing fresh CSV without microservices call', async () => {
            const csvContent = 'sec,microsec,rpm1,rpm2\n1761484790,7842085,0,0\n1761484790,7858044,100,50';

            // Insert dataset with old updated_at
            insertTestDataset({ updated_at: '2025-01-01 00:00:00' });
            createTestJsonFile();
            createTestCsvFile(csvContent);

            // Set CSV mtime to be newer than updated_at
            setFileMtime(testCsvPath, new Date('2025-01-10T00:00:00'));

            const response = await request(app)
                .get(`/datasets/download/csv/${testDatasetId}`)
                .expect(200);

            // Microservices should not be called
            expect(mockFetch).not.toHaveBeenCalled();

            // Response should contain CSV data
            expect(response.text).toContain('sec,microsec,rpm1,rpm2');
            expect(response.headers['content-type']).toMatch(/text\/csv|application\/octet-stream/);
        });
    });

    describe('POST /datasets/upload', () => {
        const testUploadFile = path.join(__dirname, 'test-upload.csv');
        const tempStorageDir = path.join(DAQ_FILES_DIR, 'tmp');

        beforeEach(() => {
            // Create a small CSV file to use as upload payload
            fs.writeFileSync(testUploadFile, 'sec,microsec,rpm1\n1000,500,42\n');
        });

        afterEach(() => {
            if (fs.existsSync(testUploadFile)) {
                fs.unlinkSync(testUploadFile);
            }
            // Clean up any temp files created in storage
            if (fs.existsSync(tempStorageDir)) {
                fs.rmSync(tempStorageDir, { recursive: true, force: true });
            }
        });

        test('should upload file and return tempId', async () => {
            const response = await request(app)
                .post('/datasets/upload')
                .attach('file', testUploadFile)
                .expect(201);

            expect(response.body).toHaveProperty('tempId');
            expect(response.body.tempId).toBeTruthy();
        });

        test('should store file in abstract storage under tmp/ prefix', async () => {
            const response = await request(app)
                .post('/datasets/upload')
                .attach('file', testUploadFile)
                .expect(201);

            const tempId = response.body.tempId;
            const storedPath = path.join(DAQ_FILES_DIR, 'tmp', tempId);
            expect(fs.existsSync(storedPath)).toBe(true);

            const content = fs.readFileSync(storedPath, 'utf-8');
            expect(content).toContain('sec,microsec,rpm1');
        });

        test('should return 400 when no file is attached', async () => {
            const response = await request(app)
                .post('/datasets/upload')
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('No file uploaded');
        });
    });

    describe('POST /datasets/validate/:tempID', () => {
        test('should return valid: true', async () => {
            const response = await request(app)
                .post('/datasets/validate/any-temp-id')
                .expect(200);

            expect(response.body).toEqual({ valid: true });
        });
    });

    describe('POST /datasets/upload/confirm', () => {
        const testTempId = 'test-temp-id-for-confirm';
        const tempFilePath = path.join(DAQ_FILES_DIR, 'tmp', testTempId);
        const tempStorageDir = path.join(DAQ_FILES_DIR, 'tmp');
        const sampleFileContent = JSON.stringify([{ sec: 1000, rpm1: 42 }]);

        // Helper to seed a temp file in storage
        function seedTempFile() {
            fs.mkdirSync(tempStorageDir, { recursive: true });
            fs.writeFileSync(tempFilePath, sampleFileContent);
        }

        afterEach(() => {
            // Clean up temp and permanent files
            if (fs.existsSync(tempStorageDir)) {
                fs.rmSync(tempStorageDir, { recursive: true, force: true });
            }
            // Clean up any permanent files created by confirm
            const files = fs.readdirSync(DAQ_FILES_DIR);
            for (const file of files) {
                if (file.endsWith('.json')) {
                    fs.unlinkSync(path.join(DAQ_FILES_DIR, file));
                }
            }
        });

        test('should create dataset and move file to permanent storage', async () => {
            seedTempFile();

            const response = await request(app)
                .post('/datasets/upload/confirm')
                .send({
                    tempId: testTempId,
                    title: 'Confirmed Dataset',
                    description: 'A confirmed test dataset',
                    date: '2025-06-15 14:30:00',
                    competition: true
                })
                .expect(201);

            expect(response.body).toHaveProperty('id');
            const datasetId = response.body.id;

            // Verify DB record was created
            const dataset = db.prepare('SELECT * FROM Dataset WHERE id = ?').get(datasetId);
            expect(dataset.title).toBe('Confirmed Dataset');
            expect(dataset.description).toBe('A confirmed test dataset');
            expect(dataset.date).toBe('2025-06-15 14:30:00');
            expect(dataset.competition).toBe(1);

            // Verify permanent file exists
            const permanentPath = path.join(DAQ_FILES_DIR, `${datasetId}.json`);
            expect(fs.existsSync(permanentPath)).toBe(true);
            expect(fs.readFileSync(permanentPath, 'utf-8')).toBe(sampleFileContent);

            // Verify temp file was deleted
            expect(fs.existsSync(tempFilePath)).toBe(false);
        });

        test('should return 400 when missing tempId', async () => {
            const response = await request(app)
                .post('/datasets/upload/confirm')
                .send({ title: 'Test', date: '2025-01-01 00:00:00' })
                .expect(400);

            expect(response.body.error).toContain('Missing required fields');
        });

        test('should return 400 when missing title', async () => {
            const response = await request(app)
                .post('/datasets/upload/confirm')
                .send({ tempId: testTempId, date: '2025-01-01 00:00:00' })
                .expect(400);

            expect(response.body.error).toContain('Missing required fields');
        });

        test('should return 400 when missing date', async () => {
            const response = await request(app)
                .post('/datasets/upload/confirm')
                .send({ tempId: testTempId, title: 'Test' })
                .expect(400);

            expect(response.body.error).toContain('Missing required fields');
        });

        test('should return 404 when temp file does not exist', async () => {
            const response = await request(app)
                .post('/datasets/upload/confirm')
                .send({
                    tempId: 'non-existent-temp-id',
                    title: 'Test',
                    date: '2025-01-01 00:00:00'
                })
                .expect(404);

            expect(response.body.error).toContain('Temp upload not found');
        });

        test('should format datetime-local date correctly', async () => {
            seedTempFile();

            const response = await request(app)
                .post('/datasets/upload/confirm')
                .send({
                    tempId: testTempId,
                    title: 'Date Format Test',
                    date: '2025-11-11T13:50'
                })
                .expect(201);

            const dataset = db.prepare('SELECT * FROM Dataset WHERE id = ?').get(response.body.id);
            expect(dataset.date).toBe('2025-11-11 13:50:00');
        });

        test('should format date-only input correctly', async () => {
            seedTempFile();

            const response = await request(app)
                .post('/datasets/upload/confirm')
                .send({
                    tempId: testTempId,
                    title: 'Date Only Test',
                    date: '2025-06-15'
                })
                .expect(201);

            const dataset = db.prepare('SELECT * FROM Dataset WHERE id = ?').get(response.body.id);
            expect(dataset.date).toBe('2025-06-15 00:00:00');
        });

        test('should set optional fields to null when not provided', async () => {
            seedTempFile();

            const response = await request(app)
                .post('/datasets/upload/confirm')
                .send({
                    tempId: testTempId,
                    title: 'Minimal Dataset',
                    date: '2025-01-01 00:00:00'
                })
                .expect(201);

            const dataset = db.prepare('SELECT * FROM Dataset WHERE id = ?').get(response.body.id);
            expect(dataset.description).toBeNull();
            expect(dataset.location_id).toBeNull();
            expect(dataset.vehicle_id).toBeNull();
            expect(dataset.competition).toBe(0);
        });
    });
});
