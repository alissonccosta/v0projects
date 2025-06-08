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

describe('Pessoa routes', () => {
  it('lists pessoas', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ id_pessoa: '1', nome_completo: 'P1', email: 'a@example.com' }] });
    const res = await request(app)
      .get('/api/pessoas')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id_pessoa: '1', nome_completo: 'P1', email: 'a@example.com' }]);
  });

  it('creates pessoa', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ id_pessoa: '2', nome_completo: 'New', email: 'b@example.com' }] });
    const res = await request(app)
      .post('/api/pessoas')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome_completo: 'New', email: 'b@example.com' });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id_pessoa: '2', nome_completo: 'New', email: 'b@example.com' });
  });

  it('updates pessoa', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ id_pessoa: '2', nome_completo: 'Upd', email: 'b@example.com' }] });
    const res = await request(app)
      .put('/api/pessoas/2')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome_completo: 'Upd', email: 'b@example.com' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id_pessoa: '2', nome_completo: 'Upd', email: 'b@example.com' });
  });

  it('deletes pessoa', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ id_pessoa: '2' }] });
    const res = await request(app)
      .delete('/api/pessoas/2')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({});
  });
});
