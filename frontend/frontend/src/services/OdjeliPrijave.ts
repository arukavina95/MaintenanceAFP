import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:5008/api';

axios.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface Department {
  id: number;
  naslov: string;
}

class OdjeliPrijaveService {
  async getDepartments(): Promise<Department[]> {
    try {
      const response = await axios.get(`${API_URL}/Korisnici/OdjeliPrijave`);
      return response.data;
    } catch (error) {
      console.error("Error fetching departments:", error);
      throw error;
    }
  }
}

export default new OdjeliPrijaveService(); 