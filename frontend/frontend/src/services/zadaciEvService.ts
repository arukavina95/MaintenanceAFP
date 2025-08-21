import axios from 'axios';

export interface ZadaciEvData {
  id?: number;
  broj: string;
  datum: string;
  smjena: string;
  djelatnik: string;
  odjel: string;
  prostorRada: string;
  stroj: string;
  opisRada: string;
  elePoz: string;
  satiRada: number;
  ugradeniDijelovi: string;
  napomena?: string; // Dodano
}

const API_BASE_URL = 'http://localhost:5008/api';

// Dohvaćanje svih zapisa
export const getZadaciEv = async (): Promise<ZadaciEvData[]> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/zadaci-ev`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Greška pri dohvaćanju zadaci-ev podataka:', error);
    throw error;
  }
};

// Kreiranje novog zapisa
export const createZadaciEv = async (data: Omit<ZadaciEvData, 'id'>): Promise<ZadaciEvData> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE_URL}/zadaci-ev`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Greška pri kreiranju zadaci-ev zapisa:', error);
    throw error;
  }
};

// Ažuriranje zapisa
export const updateZadaciEv = async (id: number, data: ZadaciEvData): Promise<ZadaciEvData> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_BASE_URL}/zadaci-ev/${id}`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Greška pri ažuriranju zadaci-ev zapisa:', error);
    throw error;
  }
};

// Brisanje zapisa
export const deleteZadaciEv = async (id: number): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_BASE_URL}/zadaci-ev/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Greška pri brisanju zadaci-ev zapisa:', error);
    throw error;
  }
};
