import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://api.mifact.com',  // URL base de la API
  timeout: 1000,
  headers: { 'Authorization': 'Bearer your_token' }
});

export const getBoletas = () => apiClient.get('/boletas');
export const emitirBoleta = (boletaData) => apiClient.post('/boletas', boletaData);
