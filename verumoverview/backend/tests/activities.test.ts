import request from 'supertest';
jest.mock('../src/services/db');
import app from '../src/app';
import bcrypt from 'bcrypt';
import db from '../src/services/db';
const mockedQuery = db.query as jest.Mock;
import { toMinutes, fromMinutes, diffIndicator } from '../src/utils/time';

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

afterEach(() => mockedQuery.mockReset());

describe('Activity routes', () => {
  it('lists activities', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ id_atividade: '1', titulo: 'A1' }] });
    const res = await request(app)
      .get('/api/atividades')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id_atividade: '1', titulo: 'A1' }]);
  });

  it('creates activity', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ id_atividade: '2', titulo: 'New' }] });
    const res = await request(app)
      .post('/api/atividades')
      .set('Authorization', `Bearer ${token}`)
      .send({ titulo: 'New' });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id_atividade: '2', titulo: 'New' });
  });

  it('updates activity', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ id_atividade: '2', titulo: 'Up' }] });
    const res = await request(app)
      .put('/api/atividades/2')
      .set('Authorization', `Bearer ${token}`)
      .send({ titulo: 'Up' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id_atividade: '2', titulo: 'Up' });
  });

  it('deletes activity', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ id_atividade: '2' }] });
    const res = await request(app)
      .delete('/api/atividades/2')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({});
  });
});

describe('time utils', () => {
  it('converts HH:MM to minutes', () => {
    expect(toMinutes('01:30')).toBe(90);
  });

  it('converts minutes to HH:MM', () => {
    expect(fromMinutes(75)).toBe('01:15');
  });

  it('calculates indicator', () => {
    expect(diffIndicator(60, 60)).toBe('green');
    expect(diffIndicator(60, 66)).toBe('yellow');
    expect(diffIndicator(60, 80)).toBe('red');
  });
});
