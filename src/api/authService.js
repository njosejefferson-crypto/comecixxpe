import { createApiClient } from './axiosClient';

const client = createApiClient('http://localhost:3001');

export async function login(email, password) {
  const { data: users } = await client.get(`/users?email=${encodeURIComponent(email)}`);
  const user = users.find((u) => u.password === password);
  if (!user) {
    throw new Error('Correo o contraseña incorrectos.');
  }
  const { password: _password, ...authUser } = user;
  return authUser;
}

export async function register(name, email, password) {
  const { data: existing } = await client.get(`/users?email=${encodeURIComponent(email)}`);
  if (existing.length > 0) {
    throw new Error('Ya existe una cuenta con ese correo.');
  }
  const { data: user } = await client.post('/users', { name, email, password });
  const { password: _password, ...authUser } = user;
  return authUser;
}
