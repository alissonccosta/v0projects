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

afterEach(() => mockedQuery.mockReset());

describe('AccessRequest routes', () => {
  it('lists requests', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ id: 1, usuario_id: 1, status: 'pendente' }] });
    const res = await request(app)
      .get('/api/solicitacoes-acesso')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 1, usuario_id: 1, status: 'pendente' }]);
  });

  it('creates request', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ id: 2, usuario_id: 2, status: 'pendente' }] });
    const res = await request(app)
      .post('/api/solicitacoes-acesso')
      .set('Authorization', `Bearer ${token}`)
      .send({ usuario_id: 2, status: 'pendente' });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 2, usuario_id: 2, status: 'pendente' });
  });

  it('updates request', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ id: 2, usuario_id: 2, status: 'aprovado' }] });
    const res = await request(app)
      .put('/api/solicitacoes-acesso/2')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'aprovado' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 2, usuario_id: 2, status: 'aprovado' });
  });
});
