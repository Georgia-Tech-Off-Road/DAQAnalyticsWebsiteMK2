const request = require('supertest');
const app = require('../index');
const db = require('../database/test-db');

describe('Vehicles API', () => {

    beforeEach(() => {
        // Clean up test data before each test
        db.prepare('DELETE FROM Vehicle').run();
    });

    afterAll(() => {
        // Clean up after all tests
        db.close();
    });

    describe('GET /vehicles', () => {
        test('should return empty array when no vehicles exist', async () => {
            const response = await request(app)
                .get('/vehicles')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toEqual([]);
        });

        test('should return all vehicles', async () => {
            // Insert test data
            const testVehicle = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                title: 'Test Vehicle',
                description: 'Test Description',
                uploaded_at: '2025-01-01 00:00:00',
                updated_at: '2025-01-01 00:00:00'
            };

            db.prepare(`INSERT INTO Vehicle VALUES (@id, @title, @description,
                @uploaded_at, @updated_at)`)
                .run(testVehicle);

            const response = await request(app)
                .get('/vehicles')
                .expect(200);

            expect(response.body).toHaveLength(1);
            expect(response.body[0].title).toBe('Test Vehicle');
        });
    });

    describe('POST /vehicles', () => {
        test('should create a new vehicle with valid data', async () => {
            const newVehicle = {
                title: 'New Vehicle',
                description: 'A test vehicle'
            };

            const response = await request(app)
                .post('/vehicles')
                .send(newVehicle)
                .expect('Content-Type', /json/)
                .expect(201);

            expect(response.body).toHaveProperty('id');

            // Verify it was actually inserted
            const vehicle = db.prepare('SELECT * FROM Vehicle WHERE id = ?')
                .get(response.body.id);

            expect(vehicle.title).toBe('New Vehicle');
            expect(vehicle.description).toBe('A test vehicle');
        });

        test('should create vehicle without optional description', async () => {
            const newVehicle = {
                title: 'Vehicle Without Description'
            };

            const response = await request(app)
                .post('/vehicles')
                .send(newVehicle)
                .expect(201);

            expect(response.body).toHaveProperty('id');

            const vehicle = db.prepare('SELECT * FROM Vehicle WHERE id = ?')
                .get(response.body.id);

            expect(vehicle.title).toBe('Vehicle Without Description');
            expect(vehicle.description).toBeNull();
        });

        test('should reject vehicle without required title', async () => {
            const invalidVehicle = {
                description: 'Missing title'
            };

            const response = await request(app)
                .post('/vehicles')
                .send(invalidVehicle)
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('required');
        });
    });

    describe('GET /vehicles/:id', () => {
        test('should return vehicle by id', async () => {
            const testId = '123e4567-e89b-12d3-a456-426614174000';

            db.prepare(`INSERT INTO Vehicle VALUES (?, ?, ?, ?, ?)`)
                .run(testId, 'Test Vehicle', 'Desc',
                     '2025-01-01 00:00:00', '2025-01-01 00:00:00');

            const response = await request(app)
                .get(`/vehicles/${testId}`)
                .expect(200);

            expect(response.body.id).toBe(testId);
            expect(response.body.title).toBe('Test Vehicle');
        });

        test('should return 404 for non-existent vehicle', async () => {
            const response = await request(app)
                .get('/vehicles/non-existent-id')
                .expect(404);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('not found');
        });
    });

    describe('PUT /vehicles/:id', () => {
        test('should update vehicle with valid data', async () => {
            const testId = '123e4567-e89b-12d3-a456-426614174000';

            // Insert test vehicle
            db.prepare(`INSERT INTO Vehicle VALUES (?, ?, ?, ?, ?)`)
                .run(testId, 'Original Title', 'Original Desc',
                     '2025-01-01 00:00:00', '2025-01-01 00:00:00');

            const updatedData = {
                title: 'Updated Title',
                description: 'Updated Description'
            };

            const response = await request(app)
                .put(`/vehicles/${testId}`)
                .send(updatedData)
                .expect(200);

            expect(response.body).toHaveProperty('message');

            // Verify the update
            const vehicle = db.prepare('SELECT * FROM Vehicle WHERE id = ?')
                .get(testId);

            expect(vehicle.title).toBe('Updated Title');
            expect(vehicle.description).toBe('Updated Description');
        });

        test('should reject update without required title', async () => {
            const testId = '123e4567-e89b-12d3-a456-426614174000';

            db.prepare(`INSERT INTO Vehicle VALUES (?, ?, ?, ?, ?)`)
                .run(testId, 'Test Vehicle', 'Desc',
                     '2025-01-01 00:00:00', '2025-01-01 00:00:00');

            const invalidUpdate = {
                description: 'Missing title'
            };

            const response = await request(app)
                .put(`/vehicles/${testId}`)
                .send(invalidUpdate)
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('required');
        });

        test('should return 404 when updating non-existent vehicle', async () => {
            const updatedData = {
                title: 'Updated Title',
                description: 'Updated Description'
            };

            const response = await request(app)
                .put('/vehicles/non-existent-id')
                .send(updatedData)
                .expect(404);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('not found');
        });
    });

    describe('DELETE /vehicles/:id', () => {
        test('should delete vehicle by id', async () => {
            const testId = '123e4567-e89b-12d3-a456-426614174000';

            db.prepare(`INSERT INTO Vehicle VALUES (?, ?, ?, ?, ?)`)
                .run(testId, 'Test Vehicle', 'Desc',
                     '2025-01-01 00:00:00', '2025-01-01 00:00:00');

            const response = await request(app)
                .delete(`/vehicles/${testId}`)
                .expect(200);

            expect(response.body).toHaveProperty('message');

            // Verify it was deleted
            const vehicle = db.prepare('SELECT * FROM Vehicle WHERE id = ?')
                .get(testId);

            expect(vehicle).toBeUndefined();
        });

        test('should return 404 when deleting non-existent vehicle', async () => {
            const response = await request(app)
                .delete('/vehicles/non-existent-id')
                .expect(404);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('not found');
        });
    });
});
