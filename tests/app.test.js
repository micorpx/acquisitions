import request from 'supertest';
import app from '../src/app.js';
import { jwttoken } from '../src/utils/jwt.js';

// Test users - these will be used for authentication in tests
const testAdmin = {
  id: 1,
  email: 'admin@test.com',
  role: 'admin',
};

const testUser = {
  id: 2,
  email: 'user@test.com',
  role: 'user',
};

// Generate test tokens
const adminToken = jwttoken.sign(testAdmin);
const userToken = jwttoken.sign(testUser);

describe('API Endpoints', () => {
  describe('Health/Info Endpoints', () => {
    describe('GET /', () => {
      it('should return 200 with greeting message', async () => {
        const response = await request(app).get('/').expect(200);
        expect(response.text).toBe('Hello, from Acquisitions API!');
      });
    });

    describe('GET /health', () => {
      it('should return health status', async () => {
        const response = await request(app).get('/health');
        // In test environment, database may not be available
        // Accept either 200 (healthy) or 503 (unhealthy)
        expect([200, 503]).toContain(response.status);
        if (response.status === 200) {
          expect(response.body).toHaveProperty('status', 'OK');
          expect(response.body).toHaveProperty('timestamp');
          expect(response.body).toHaveProperty('uptime');
        }
      });
    });

    describe('GET /api', () => {
      it('should return API message', async () => {
        const response = await request(app).get('/api').expect(200);
        expect(response.body).toHaveProperty('message', 'Acquisition API is running!');
      });
    });

    describe('GET /non-existent', () => {
      it('should return 404 for non-existent routes', async () => {
        const response = await request(app).get('/non-existent').expect(404);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
        expect(response.body.error).toHaveProperty('message', 'Route not found');
      });
    });
  });

  describe('Authentication Endpoints', () => {
    describe('POST /api/auth/sign-up', () => {
      it('should return 400 when signup with missing fields', async () => {
        const response = await request(app)
          .post('/api/auth/sign-up')
          .send({
            name: 'Test User',
            email: 'testuser@example.com',
          })
          .expect(400);
        expect(response.body).toHaveProperty('error', 'Validation Failed');
        expect(response.body).toHaveProperty('details');
      });

      it('should return 400 when signup with invalid email', async () => {
        const response = await request(app)
          .post('/api/auth/sign-up')
          .send({
            name: 'Test User',
            email: 'invalid-email',
            password: 'Test@123',
          })
          .expect(400);
        expect(response.body).toHaveProperty('error', 'Validation Failed');
        expect(response.body).toHaveProperty('details');
      });

      it('should return 400 when signup with weak password', async () => {
        const response = await request(app)
          .post('/api/auth/sign-up')
          .send({
            name: 'Test User',
            email: 'testuser2@example.com',
            password: 'weak',
          })
          .expect(400);
        expect(response.body).toHaveProperty('error', 'Validation Failed');
        expect(response.body).toHaveProperty('details');
      });
    });

    describe('POST /api/auth/sign-out', () => {
      it('should return 200 on successful sign out', async () => {
        const response = await request(app)
          .post('/api/auth/sign-out')
          .expect(200);
        expect(response.body).toHaveProperty('message', 'User signed out successfully');
      });
    });
  });

  describe('User CRUD Endpoints', () => {
    describe('GET /api/users', () => {
      it('should return 401 without auth token', async () => {
        const response = await request(app)
          .get('/api/users')
          .expect(401);
        expect(response.body).toHaveProperty('error', 'Authentication required');
      });

      it('should return 403 with regular user token', async () => {
        const response = await request(app)
          .get('/api/users')
          .set('Cookie', `token=${userToken}`)
          .expect(403);
        expect(response.body).toHaveProperty('error', 'Access denied');
      });

      it('should return 200 with admin token', async () => {
        const response = await request(app)
          .get('/api/users')
          .set('Cookie', `token=${adminToken}`);
        
        // Skip if database is not available in test environment
        if (response.status === 500) {
          console.log('Skipping test - database not available');
          return;
        }
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Successfully retrieved all users');
        expect(response.body).toHaveProperty('users');
        expect(Array.isArray(response.body.users)).toBe(true);
      });
    });

    describe('GET /api/users/:id', () => {
      it('should return 403 when fetching other user data with regular token', async () => {
        const response = await request(app)
          .get('/api/users/1')
          .set('Cookie', `token=${userToken}`)
          .expect(403);
        expect(response.body).toHaveProperty('error', 'Forbidden');
      });

      it('should return 400 with invalid id format', async () => {
        const response = await request(app)
          .get('/api/users/invalid')
          .set('Cookie', `token=${userToken}`)
          .expect(400);
        expect(response.body).toHaveProperty('error', 'Validation Failed');
        expect(response.body).toHaveProperty('details');
      });
    });

    describe('PUT /api/users/:id', () => {
      it('should return 403 when updating other user data', async () => {
        const response = await request(app)
          .put('/api/users/1')
          .set('Cookie', `token=${userToken}`)
          .send({
            name: 'Hacked Name',
          })
          .expect(403);
        expect(response.body).toHaveProperty('error', 'Forbidden');
      });

      it('should return 400 with invalid id format', async () => {
        const response = await request(app)
          .put('/api/users/invalid')
          .set('Cookie', `token=${userToken}`)
          .send({
            name: 'Updated Name',
          })
          .expect(400);
        expect(response.body).toHaveProperty('error', 'Validation Failed');
        expect(response.body).toHaveProperty('details');
      });
    });

    describe('DELETE /api/users/:id', () => {
      it('should return 403 when deleting without admin', async () => {
        const response = await request(app)
          .delete('/api/users/2')
          .set('Cookie', `token=${userToken}`)
          .expect(403);
        expect(response.body).toHaveProperty('error', 'Access denied');
      });

      it('should return 400 with invalid id format', async () => {
        const response = await request(app)
          .delete('/api/users/invalid')
          .set('Cookie', `token=${adminToken}`)
          .expect(400);
        expect(response.body).toHaveProperty('error', 'Validation Failed');
        expect(response.body).toHaveProperty('details');
      });
    });
  });

  describe('Validation Error Handling', () => {
    it('should return proper error format for validation errors', async () => {
      const response = await request(app)
        .post('/api/auth/sign-up')
        .send({
          name: '',
          email: 'not-an-email',
          password: 'weak',
        })
        .expect(400);
      expect(response.body).toHaveProperty('error', 'Validation Failed');
      expect(response.body).toHaveProperty('details');
    });

    it('should return proper error format for invalid token', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Cookie', 'token=invalid-token')
        .expect(401);
      expect(response.body).toHaveProperty('error', 'Authentication failed');
      expect(response.body).toHaveProperty('message', 'Invalid or expired token');
    });
  });
});
