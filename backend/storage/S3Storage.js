const Storage = require('./Storage');

/**
 * AWS S3 implementation of Storage.
 *
 * Requires @aws-sdk/client-s3 to be installed:
 *   npm install @aws-sdk/client-s3
 *
 * Environment variables needed:
 *   AWS_REGION - AWS region (e.g., 'us-east-1')
 *   AWS_ACCESS_KEY_ID - AWS access key
 *   AWS_SECRET_ACCESS_KEY - AWS secret key
 *   S3_BUCKET - S3 bucket name
 */
class S3Storage extends Storage {
    /**
     * @param {string} bucket - S3 bucket name
     * @param {object} [s3Client] - Optional S3Client instance (for testing)
     */
    constructor(bucket, s3Client = null) {
        super();
        this.bucket = bucket;

        if (s3Client) {
            this.s3 = s3Client;
        } else {
            // Lazy-load AWS SDK to avoid requiring it when using LocalStorage
            const { S3Client } = require('@aws-sdk/client-s3');
            this.s3 = new S3Client({});
        }
    }

    async exists(key) {
        const { HeadObjectCommand } = require('@aws-sdk/client-s3');

        try {
            await this.s3.send(new HeadObjectCommand({
                Bucket: this.bucket,
                Key: key
            }));
            return true;
        } catch (err) {
            if (err.name === 'NotFound') {
                return false;
            }
            throw err;
        }
    }

    async stat(key) {
        const { HeadObjectCommand } = require('@aws-sdk/client-s3');

        const response = await this.s3.send(new HeadObjectCommand({
            Bucket: this.bucket,
            Key: key
        }));

        return {
            size: response.ContentLength,
            lastModified: response.LastModified
        };
    }

    async read(key) {
        const { GetObjectCommand } = require('@aws-sdk/client-s3');

        const response = await this.s3.send(new GetObjectCommand({
            Bucket: this.bucket,
            Key: key
        }));

        // Convert stream to Buffer
        const chunks = [];
        for await (const chunk of response.Body) {
            chunks.push(chunk);
        }
        return Buffer.concat(chunks);
    }

    async write(key, data) {
        if (!Buffer.isBuffer(data)) {
            throw new TypeError('Data must be a Buffer');
        }

        const { PutObjectCommand } = require('@aws-sdk/client-s3');

        await this.s3.send(new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: data
        }));
    }

    async delete(key) {
        const { DeleteObjectCommand } = require('@aws-sdk/client-s3');

        await this.s3.send(new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: key
        }));
    }

    async datasetFiles(id) {
        const { ListObjectsV2Command } = require('@aws-sdk/client-s3');

        const response = await this.s3.send(new ListObjectsV2Command({
            Bucket: this.bucket,
            Prefix: `${id}.`
        }));

        if (!response.Contents) return [];
        return response.Contents.map(obj => obj.Key);
    }

    async getReadStream(key) {
        const { GetObjectCommand } = require('@aws-sdk/client-s3');

        const response = await this.s3.send(new GetObjectCommand({
            Bucket: this.bucket,
            Key: key
        }));

        return response.Body;
    }
}

module.exports = S3Storage;
