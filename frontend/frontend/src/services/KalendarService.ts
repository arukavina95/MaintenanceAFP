import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:5008/api/Kalendar';

// Axios interceptor za automatsko dodavanje Authorization headera
axios.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export interface Izostanak {
    id: number;
    korisnikId: number;
    pocetniDatum: string;
    zavrsniDatum: string;
    razlogIzostankaNaziv: string;
    privitak: string | null;
    privitakNaziv: string | null;
    privitakPath?: string | null;
    imeKorisnika: string;
  }
export const getIzostanci = async (godina: number, mjesec: number): Promise<Izostanak[]> => {
  const response = await axios.get<Izostanak[]>(`${API_URL}?godina=${godina}&mjesec=${mjesec}`);
  return response.data;
};

export const createIzostanak = async (data: FormData): Promise<Izostanak> => {
  const response = await axios.post<Izostanak>(API_URL, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const updateIzostanak = async (id: number, data: FormData): Promise<Izostanak> => {
  const response = await axios.put<Izostanak>(`${API_URL}/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const deleteIzostanak = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};

export const getRazloziIzostanka = async (): Promise<string[]> => {
  const response = await axios.get<string[]>(`${API_URL}/razlozi-izostanka`);
  return response.data;
};