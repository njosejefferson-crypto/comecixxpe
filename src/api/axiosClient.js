import axios from 'axios';

export function createApiClient(baseURL) {
  const client = axios.create({ baseURL });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      const message =
        error.response?.data?.error ||
        error.message ||
        'Ocurrió un error inesperado al conectar con el servidor.';
      return Promise.reject(new Error(message));
    },
  );

  return client;
}
