import axios from 'axios';

const API_URL = 'http://localhost:5008/api'; // Promijenjen port na 5008

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RfidLoginRequest {
  brojKartice: string;
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

  async rfidLogin(brojKartice: string): Promise<AuthResponse> {
    console.log('Sending RFID login request with brojKartice:', brojKartice);
    console.log('Full URL:', `${API_URL}/auth/rfid-login`);
    
    try {
      const response = await axios.post(`${API_URL}/auth/rfid-login`, { brojKartice });
      console.log('Backend response:', response.data);
      
      if (response.data.token && response.data.user?.korisnik) {
        localStorage.setItem('user', JSON.stringify(response.data));
        console.log('Stored RFID user data:', response.data);
      } else {
        console.warn('Backend response missing token or user data:', response.data);
      }
      return response.data;
    } catch (error: any) {
      console.error('Full error details:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
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