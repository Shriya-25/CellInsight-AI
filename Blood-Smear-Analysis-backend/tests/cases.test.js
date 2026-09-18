import { jest } from '@jest/globals';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import CaseSubject from '../src/models/CaseSubject.js';

jest.setTimeout(60000); // 60 seconds timeout for mongodb download

let app;
let server;
let mongoServer;

beforeAll(async () => {
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  
  // Now dynamically import server so it uses the right MONGODB_URI
  const serverModule = await import('../src/server.js');
  app = serverModule.app;
  server = serverModule.server;
});

afterAll(async () => {
  if (server) {
    server.close();
  }
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';

describe('Phase 1 Backend API Tests', () => {
  let testSubjectId;
  let token;

  beforeAll(async () => {
    // Create a mock subject to use in case tests
    const subject = await CaseSubject.create({
      patientIdentifier: 'TEST-PATIENT-001',
      name: 'Test Patient',
      contact: '1234567890'
    });
    testSubjectId = subject._id.toString();

    // Create a test user and obtain a token
    const passwordHash = await bcrypt.hash('testpass', 10);
    await User.create({
      name: 'Test User',
      email: 'test@test.com',
      password: passwordHash,
      role: 'technician',
    });

    const authRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'testpass' });
    
    token = authRes.body.token;
  });

  it('GET /api/health should return ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  let createdCaseId;

  it('POST /api/cases should create a new case with valid payload', async () => {
    const res = await request(app)
      .post('/api/cases')
      .set('Authorization', `Bearer ${token}`)
      .send({
        subjectId: testSubjectId,
        notes: 'Test case note',
      });
    
    expect(res.status).toBe(201);
    expect(res.body._id).toBeDefined();
    expect(res.body.status).toBe('draft');
    expect(res.body.subjectId).toBe(testSubjectId);
    
    createdCaseId = res.body._id;
  });

  it('POST /api/cases should return 400 for invalid payload (missing subjectId)', async () => {
    const res = await request(app)
      .post('/api/cases')
      .set('Authorization', `Bearer ${token}`)
      .send({
        notes: 'Invalid case missing subject',
      });
    
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('GET /api/cases should return list of cases', async () => {
    const res = await request(app).get('/api/cases').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /api/cases/:id should return a specific case', async () => {
    const res = await request(app).get(`/api/cases/${createdCaseId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body._id).toBe(createdCaseId);
    expect(res.body.subjectId._id).toBe(testSubjectId); // populated
  });

  it('POST /api/analysis should work and use cautious terminology', async () => {
    // Mock global fetch to simulate FastAPI inference service
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ wbcCount: 25, prediction: "mocked" }),
      })
    );

    const res = await request(app)
      .post('/api/analysis')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', Buffer.from('mock image data'), 'test.jpg');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Processing complete');
    expect(res.body.risk).toBe('Review required'); // Because mocked wbcCount > 20
    expect(res.body.prediction).toBe('mocked');
  });
});
