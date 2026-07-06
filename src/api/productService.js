import { createApiClient } from './axiosClient';

const client = createApiClient('http://localhost:3000');

export function getAllProducts() {
  return client.get('/products').then((res) => res.data);
}

export function getProductById(id) {
  return client.get(`/products/${id}`).then((res) => res.data);
}
