import request from 'supertest';
jest.mock('../src/services/db');
import app from '../src/app';
import bcrypt from 'bcrypt';
import db from '../src/services/db';

const mockedQuery = db.query as jest.Mock;

let token: string;

beforeAll(async () => {
  mockedQuery.mockResolvedValueOnce({
    rows: [{ id: 1, senha_hash: bcrypt.hashSync('password', 10), permissoes: ['admin'] }]
  });
  const res = await request(app)
    .post('/auth/login')
    .send({ email: 'admin@example.com', senha: 'password' });
  token = res.body.token;
});

afterEach(() => {
  mockedQuery.mockReset();
});

describe('Project routes', () => {
  it('should list projects', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ id_projeto: '1', nome: 'P1' }] });
    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id_projeto: '1', nome: 'P1' }]);
  });

  it('should get project by id', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ id_projeto: '1', nome: 'P1' }] });
    const res = await request(app)
      .get('/api/projects/1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id_projeto: '1', nome: 'P1' });
  });

  it('should create project', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ code: '2' }] });
    mockedQuery.mockResolvedValueOnce({ rows: [{ id_projeto: '2', nome: 'New' }] });
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'New' });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id_projeto: '2', nome: 'New' });
  });

  it('should update project', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ id_projeto: '2', nome: 'Upd' }] });
    const res = await request(app)
      .put('/api/projects/2')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Upd' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id_projeto: '2', nome: 'Upd' });
  });

  it('should delete project', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ id_projeto: '2' }] });
    const res = await request(app)
      .delete('/api/projects/2')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({});
  });
});
