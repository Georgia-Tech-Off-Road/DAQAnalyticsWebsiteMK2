  const request = require('supertest');
  const app = require('../index');
  const db = require('../database/test-db');

  describe('Locations API', () => {

      beforeEach(() => {
          // Clean up test data before each test
          db.prepare('DELETE FROM Location').run();
      });

      afterAll(() => {
          // Clean up after all tests
          db.close();
      });

      describe('GET /locations', () => {
          test('should return empty array when no locations exist', async () => {
              const response = await request(app)
                  .get('/locations')
                  .expect('Content-Type', /json/)
                  .expect(200);

              expect(response.body.locations).toEqual([]);
          });

          test('should return all locations', async () => {
              // Insert test data
              const testLocation = {
                  id: '123e4567-e89b-12d3-a456-426614174000',
                  title: 'Test Track',
                  description: 'Test Description',
                  competition: 0,
                  created_at: '2025-01-01 00:00:00',
                  updated_at: '2025-01-01 00:00:00',
                  latitude: 33.7756,
                  longitude: -84.3963,
                  parent_id: null
              };

              db.prepare(`INSERT INTO Location VALUES (@id, @title, @description,
                  @competition, @created_at, @updated_at, @latitude, @longitude, @parent_id)`)
                  .run(testLocation);

              const response = await request(app)
                  .get('/locations')
                  .expect(200);

              expect(response.body.locations).toHaveLength(1);
              expect(response.body.locations[0].title).toBe('Test Track');
          });
      });

      describe('POST /locations', () => {
          test('should create a new location with valid data', async () => {
              const newLocation = {
                  title: 'New Track',
                  description: 'A test track',
                  competition: true,
                  latitude: 33.7756,
                  longitude: -84.3963
              };

              const response = await request(app)
                  .post('/locations')
                  .send(newLocation)
                  .expect('Content-Type', /json/)
                  .expect(201);

              expect(response.body).toHaveProperty('id');

              // Verify it was actually inserted
              const location = db.prepare('SELECT * FROM Location WHERE id = ?')
                  .get(response.body.id);

              expect(location.title).toBe('New Track');
              expect(location.competition).toBe(1);
          });

          test('should reject location without required title', async () => {
              const invalidLocation = {
                  latitude: 33.7756,
                  longitude: -84.3963
              };

              const response = await request(app)
                  .post('/locations')
                  .send(invalidLocation)
                  .expect(422);

              expect(response.body).toHaveProperty('error');
              expect(response.body.error).toContain('title');
          });

          test('should reject location with invalid latitude', async () => {
              const invalidLocation = {
                  title: 'Test',
                  latitude: 'not a number',
                  longitude: -84.3963
              };

              await request(app)
                  .post('/locations')
                  .send(invalidLocation)
                  .expect(422);
          });
      });

      describe('GET /locations/:id', () => {
          test('should return location by id', async () => {
              const testId = '123e4567-e89b-12d3-a456-426614174000';

              db.prepare(`INSERT INTO Location VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
                  .run(testId, 'Test Track', 'Desc', 0,
                       '2025-01-01 00:00:00', '2025-01-01 00:00:00',
                       33.7756, -84.3963, null);

              const response = await request(app)
                  .get(`/locations/${testId}`)
                  .expect(200);

              expect(response.body.location.id).toBe(testId);
              expect(response.body.location.title).toBe('Test Track');
          });

          test('should return 404 for non-existent location', async () => {
              const response = await request(app)
                  .get('/locations/non-existent-id')
                  .expect(404);

              expect(response.body).toHaveProperty('error');
          });
      });
  });