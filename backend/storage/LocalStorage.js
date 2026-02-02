const fs = require('node:fs/promises');
const path = require('node:path');
const Storage = require('./Storage');

/**
 * Local filesystem implementation of Storage.
 */
class LocalStorage extends Storage {
    /**
     * @param {string} basePath - Base directory for all file operations
     */
    constructor(basePath) {
        super();
        this.basePath = basePath;
    }

    /**
     * Resolve a key to a full filesystem path.
     * @param {string} key - The file key
     * @returns {string} - Full path
     */
    _resolvePath(key) {
        return path.join(this.basePath, key);
    }

    async exists(key) {
        try {
            await fs.access(this._resolvePath(key));
            return true;
        } catch {
            return false;
        }
    }

    async stat(key) {
        const filePath = this._resolvePath(key);
        const stats = await fs.stat(filePath);
        return {
            size: stats.size,
            lastModified: stats.mtime
        };
    }

    async read(key) {
        const filePath = this._resolvePath(key);
        return await fs.readFile(filePath);
    }

    async write(key, data) {
        if (!Buffer.isBuffer(data)) {
            throw new TypeError('Data must be a Buffer');
        }

        const filePath = this._resolvePath(key);

        // Ensure parent directory exists
        const dir = path.dirname(filePath);
        await fs.mkdir(dir, { recursive: true });

        await fs.writeFile(filePath, data);
    }

    async delete(key) {
        const filePath = this._resolvePath(key);
        await fs.unlink(filePath);
    }
}

module.exports = LocalStorage;
