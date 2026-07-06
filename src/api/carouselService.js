import { createApiClient } from './axiosClient';

const client = createApiClient('http://localhost:3000');

export function getCarouselSlides() {
  return client.get('/carousel').then((res) => res.data);
}
