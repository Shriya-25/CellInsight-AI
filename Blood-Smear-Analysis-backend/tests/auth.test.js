import { jest } from '@jest/globals';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';

jest.setTimeout(60000);

let app;
let server;
let mongoServer;

let validToken;
let doctorToken;
let adminToken;
let techUserId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  process.env.JWT_SECRET = 'test_secret';
  
  const serverModule = await import('../src/server.js');
  app = serverModule.app;
  server = serverModule.server;

  // Create users for tests
  const passwordHash = await bcrypt.hash('testpass', 10);
  
  const techUser = await User.create({
    name: 'Tech',
    email: 'tech@test.com',
    password: passwordHash,
    role: 'technician',
  });
  techUserId = techUser._id.toString();

  await User.create({
    name: 'Doc',
    email: 'doc@test.com',
    password: passwordHash,
    role: 'doctor/pathologist',
  });

  await User.create({
    name: 'Admin',
    email: 'admin@test.com',
    password: passwordHash,
    role: 'administrator',
  });
});

afterAll(async () => {
  if (server) server.close();
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

describe('Phase 2 Authentication & Authorization Tests', () => {

  it('1. Valid login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'tech@test.com', password: 'testpass' });
    
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('tech@test.com');
    expect(res.body.user.role).toBe('technician');
    expect(res.body.user.password).toBeUndefined(); // Password hash never returned
    
    validToken = res.body.token;
  });

  it('2. Invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'tech@test.com', password: 'wrongpass' });
    
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid email or password.');
  });

  it('3. Unknown user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: 'testpass' });
    
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid email or password.');
  });

  it('4. Missing token accessing protected case endpoint', async () => {
    const res = await request(app).get('/api/cases');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authentication token is required.');
  });

  it('5. Invalid token accessing protected case endpoint', async () => {
    const res = await request(app)
      .get('/api/cases')
      .set('Authorization', 'Bearer invalid.token.here');
      
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Invalid or expired token.');
  });

  it('6. Expired/invalid JWT', async () => {
    import('jsonwebtoken').then(jwt => {
      const expiredToken = jwt.default.sign({ id: '123' }, 'test_secret', { expiresIn: '-1h' });
      return request(app).get('/api/cases').set('Authorization', `Bearer ${expiredToken}`);
    }).then(res => {
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Invalid or expired token.');
    });
  });

  // Fetch tokens for role tests
  beforeAll(async () => {
    const docRes = await request(app).post('/api/auth/login').send({ email: 'doc@test.com', password: 'testpass' });
    doctorToken = docRes.body.token;

    const adminRes = await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'testpass' });
    adminToken = adminRes.body.token;
  });

  it('10. Protected case endpoint with valid token', async () => {
    const res = await request(app)
      .get('/api/cases')
      .set('Authorization', `Bearer ${validToken}`);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
  
  // Note: specific endpoint role tests (7,8,9) are verified by the fact that requireRole middleware is written.
  // But we can test the middleware directly if we mock a route. Let's create a temporary mock route in tests to verify `requireRole`.
  
  describe('Role Middleware', () => {
    beforeAll(async () => {
      const { requireRole, authenticateToken } = await import('../src/middleware/auth.js');
      app.get('/api/test-tech', authenticateToken, requireRole(['technician']), (req, res) => res.json({ ok: true }));
      app.get('/api/test-doc', authenticateToken, requireRole(['doctor/pathologist']), (req, res) => res.json({ ok: true }));
      app.get('/api/test-admin', authenticateToken, requireRole(['administrator']), (req, res) => res.json({ ok: true }));
    });

    it('7. Technician authorization', async () => {
      const resOk = await request(app).get('/api/test-tech').set('Authorization', `Bearer ${validToken}`);
      expect(resOk.status).toBe(200);

      const resFail = await request(app).get('/api/test-admin').set('Authorization', `Bearer ${validToken}`);
      expect(resFail.status).toBe(403);
    });

    it('8. Doctor authorization', async () => {
      const resOk = await request(app).get('/api/test-doc').set('Authorization', `Bearer ${doctorToken}`);
      expect(resOk.status).toBe(200);

      const resFail = await request(app).get('/api/test-tech').set('Authorization', `Bearer ${doctorToken}`);
      expect(resFail.status).toBe(403);
    });

    it('9. Administrator authorization', async () => {
      const resOk = await request(app).get('/api/test-admin').set('Authorization', `Bearer ${adminToken}`);
      expect(resOk.status).toBe(200);

      const resFail = await request(app).get('/api/test-doc').set('Authorization', `Bearer ${adminToken}`);
      expect(resFail.status).toBe(403);
    });
  });

});
