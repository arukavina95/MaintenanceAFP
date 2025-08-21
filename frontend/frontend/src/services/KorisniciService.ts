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

export interface User {
  id: number;
  korisnik: string;
  ime: string;
  razinaPristupa: number;
  aktivan: boolean;
  brojKartice: string;
  potpis: string;
  odjel: string;
  datumRodenja: string;
  zaposlenOd: string;
  ukupnoDanaGo: number;
  ukupnoDanaStarogGo: number;
  lozinkaHash?: string;
  lozinkaSalt?: string;
}

class UserService {
  async getUsers(): Promise<User[]> {
    try {
      const response = await axios.get(`${API_URL}/Korisnici`);
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }

  async createUser(user: any): Promise<User> {
    try {
      // KORISTI AUTH/REGISTER ENDPOINT!
      const response = await axios.post(`${API_URL}/Auth/register`, user);
      return response.data;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async updateUser(id: number, user: User): Promise<User> {
    try {
      const response = await axios.put(`${API_URL}/Korisnici/${id}`, user);
      return response.data;
    } catch (error) {
      console.error(`Error updating user with id ${id}:`, error);
      throw error;
    }
  }

  async deleteUser(id: number): Promise<void> {
    try {
      console.log(`Attempting to delete user with id: ${id}`);
      const response = await axios.delete(`${API_URL}/Korisnici/${id}`);
      console.log('Delete response:', response);
    } catch (error: any) {
      console.error(`Error deleting user with id ${id}:`, error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        console.error('Response headers:', error.response.headers);
      }
      if (error.request) {
        console.error('Request was made but no response received:', error.request);
      }
      throw error;
    }
  }

  async changeUserPassword(id: number, novaLozinka: string): Promise<void> {
    try {
      await axios.put(`${API_URL}/Korisnici/${id}/PromjenaLozinke`, { novaLozinka });
    } catch (error) {
      console.error(`Error changing password for user with id ${id}:`, error);
      throw error;
    }
  }
}

export default new UserService(); 