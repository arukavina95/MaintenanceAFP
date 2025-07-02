import axios from 'axios';

const API_URL = 'http://localhost:5008/api'; // Promijenjen port na 5008

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    korisnik: string;
    ime: string;
    razinaPristupa: number;
  };
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    if (response.data.token && response.data.user?.korisnik) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  }

  logout() {
    localStorage.removeItem('user');
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userObj = JSON.parse(userStr);
      // Return the inner user object directly
      return userObj.user || userObj;
    }
    return null;
  }

  getToken() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userObj = JSON.parse(userStr);
      return userObj.token;
    }
    return null;
  }
}

export default new AuthService(); 