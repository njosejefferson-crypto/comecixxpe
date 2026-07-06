import { createApiClient } from './axiosClient';

const client = createApiClient('http://localhost:3002');

export function createOrder(order) {
  return client.post('/orders', order).then((res) => res.data);
}
