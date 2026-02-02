const path = require('node:path');
const LocalStorage = require('./LocalStorage');
const S3Storage = require('./S3Storage');

/**
 * Storage singleton instance
 * @type {import('./Storage')|null}
 */
let storageInstance = null;

/**
 * Get the storage instance based on environment configuration.
 *
 * Uses STORAGE_TYPE environment variable:
 *   - 'local' (default): Uses LocalStorage with DAQFiles directory
 *   - 's3': Uses S3Storage with S3_BUCKET environment variable
 *
 * @returns {import('./Storage')} Storage instance
 */
function getStorage() {
    if (storageInstance) {
        return storageInstance;
    }

    const storageType = process.env.STORAGE_TYPE || 'local';

    if (storageType === 's3') {
        const bucket = process.env.S3_BUCKET;
        if (!bucket) {
            throw new Error('S3_BUCKET environment variable is required for S3 storage');
        }
        storageInstance = new S3Storage(bucket);
    } else {
        // Default to local storage
        const basePath = process.env.STORAGE_PATH || path.join(process.cwd(), 'DAQFiles');
        storageInstance = new LocalStorage(basePath);
    }

    return storageInstance;
}

/**
 * Reset the storage instance (useful for testing).
 */
function resetStorage() {
    storageInstance = null;
}

module.exports = {
    getStorage,
    resetStorage,
    Storage: require('./Storage'),
    LocalStorage,
    S3Storage
};
