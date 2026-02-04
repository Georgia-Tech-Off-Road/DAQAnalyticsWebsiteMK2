/**
 * Abstract Storage class that defines the interface for file storage operations.
 * Implementations should handle both local filesystem and cloud storage (e.g., S3).
 */
class Storage {
    /**
     * Check if a file exists at the given key.
     * @param {string} key - The file path/key
     * @returns {Promise<boolean>} - True if file exists, false otherwise
     */
    async exists(key) {
        throw new Error('Method exists() must be implemented');
    }

    /**
     * Get file metadata.
     * @param {string} key - The file path/key
     * @returns {Promise<{size: number, lastModified: Date}>} - File metadata
     * @throws {Error} - If file does not exist
     */
    async stat(key) {
        throw new Error('Method stat() must be implemented');
    }

    /**
     * Read file contents.
     * @param {string} key - The file path/key
     * @returns {Promise<Buffer>} - File contents as a Buffer
     * @throws {Error} - If file does not exist or cannot be read
     */
    async read(key) {
        throw new Error('Method read() must be implemented');
    }

    /**
     * Write data to a file. Creates the file if it doesn't exist, replaces if it does.
     * @param {string} key - The file path/key
     * @param {Buffer} data - The data to write
     * @returns {Promise<void>}
     */
    async write(key, data) {
        throw new Error('Method write() must be implemented');
    }

    /**
     * Delete a file.
     * @param {string} key - The file path/key
     * @returns {Promise<void>}
     * @throws {Error} - If file does not exist or cannot be deleted
     */
    async delete(key) {
        throw new Error('Method delete() must be implemented');
    }

    /**
     * Get a readable stream for the file.
     * @param {string} key - The file path/key
     * @returns {Promise<import('stream').Readable>} - Readable stream
     * @throws {Error} - If file does not exist or cannot be read
     */
    async getReadStream(key) {
        throw new Error('Method getReadStream() must be implemented');
    }
}

module.exports = Storage;
