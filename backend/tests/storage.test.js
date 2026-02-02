const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { LocalStorage, getStorage, resetStorage } = require('../storage');

describe('LocalStorage', () => {
    let storage;
    let testDir;

    beforeEach(async () => {
        // Create a temporary directory for each test
        testDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'storage-test-'));
        storage = new LocalStorage(testDir);
    });

    afterEach(async () => {
        // Clean up temporary directory
        await fsp.rm(testDir, { recursive: true, force: true });
    });

    describe('exists()', () => {
        test('should return false for non-existent file', async () => {
            const result = await storage.exists('nonexistent.txt');
            expect(result).toBe(false);
        });

        test('should return true for existing file', async () => {
            const filePath = path.join(testDir, 'test.txt');
            await fsp.writeFile(filePath, 'test content');

            const result = await storage.exists('test.txt');
            expect(result).toBe(true);
        });
    });

    describe('stat()', () => {
        test('should return file metadata', async () => {
            const content = Buffer.from('test content');
            const filePath = path.join(testDir, 'test.txt');
            await fsp.writeFile(filePath, content);

            const result = await storage.stat('test.txt');

            expect(result.size).toBe(content.length);
            // Check it's a valid Date (instanceof can fail across Jest VM boundaries)
            expect(typeof result.lastModified.getTime).toBe('function');
            expect(isNaN(result.lastModified.getTime())).toBe(false);
        });

        test('should throw error for non-existent file', async () => {
            await expect(storage.stat('nonexistent.txt')).rejects.toThrow();
        });
    });

    describe('read()', () => {
        test('should read file contents as Buffer', async () => {
            const content = Buffer.from('test content');
            const filePath = path.join(testDir, 'test.txt');
            await fsp.writeFile(filePath, content);

            const result = await storage.read('test.txt');

            expect(Buffer.isBuffer(result)).toBe(true);
            expect(result.toString()).toBe('test content');
        });

        test('should throw error for non-existent file', async () => {
            await expect(storage.read('nonexistent.txt')).rejects.toThrow();
        });
    });

    describe('write()', () => {
        test('should write Buffer to file', async () => {
            const content = Buffer.from('new content');

            await storage.write('output.txt', content);

            const filePath = path.join(testDir, 'output.txt');
            const result = await fsp.readFile(filePath);
            expect(result.toString()).toBe('new content');
        });

        test('should overwrite existing file', async () => {
            const filePath = path.join(testDir, 'test.txt');
            await fsp.writeFile(filePath, 'original content');

            await storage.write('test.txt', Buffer.from('new content'));

            const result = await fsp.readFile(filePath);
            expect(result.toString()).toBe('new content');
        });

        test('should create parent directories if needed', async () => {
            const content = Buffer.from('nested content');

            await storage.write('nested/dir/file.txt', content);

            const filePath = path.join(testDir, 'nested/dir/file.txt');
            const result = await fsp.readFile(filePath);
            expect(result.toString()).toBe('nested content');
        });

        test('should throw TypeError if data is not a Buffer', async () => {
            await expect(storage.write('test.txt', 'string data'))
                .rejects.toThrow(TypeError);
            await expect(storage.write('test.txt', { data: 'object' }))
                .rejects.toThrow(TypeError);
        });
    });

    describe('delete()', () => {
        test('should delete existing file', async () => {
            const filePath = path.join(testDir, 'test.txt');
            await fsp.writeFile(filePath, 'content');

            await storage.delete('test.txt');

            const exists = fs.existsSync(filePath);
            expect(exists).toBe(false);
        });

        test('should throw error for non-existent file', async () => {
            await expect(storage.delete('nonexistent.txt')).rejects.toThrow();
        });
    });
});

describe('getStorage()', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        resetStorage();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
        resetStorage();
    });

    test('should return LocalStorage by default', () => {
        delete process.env.STORAGE_TYPE;
        const storage = getStorage();
        expect(storage).toBeInstanceOf(LocalStorage);
    });

    test('should return LocalStorage when STORAGE_TYPE is local', () => {
        process.env.STORAGE_TYPE = 'local';
        const storage = getStorage();
        expect(storage).toBeInstanceOf(LocalStorage);
    });

    test('should return same instance on subsequent calls', () => {
        const storage1 = getStorage();
        const storage2 = getStorage();
        expect(storage1).toBe(storage2);
    });

    test('should throw error for S3 storage without S3_BUCKET', () => {
        process.env.STORAGE_TYPE = 's3';
        delete process.env.S3_BUCKET;
        expect(() => getStorage()).toThrow('S3_BUCKET');
    });
});
