import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:5008/api/VanjskiIzvodaci';

// Axios interceptor za automatsko dodavanje Authorization headera
axios.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export interface CreateVanjskiIzvodaciDTO {
  imeFirme: string;
  kontaktOsoba: string;
  kontaktTelefon: string;
  kontaktEmail: string;
  opisPoslova: string;
  opremaServisiraju: string;
  dokumenti: string;
}

export interface VanjskiIzvodaci {
  id: number;
  imeFirme: string;
  kontaktOsoba: string;
  kontaktTelefon: string;
  kontaktEmail: string;
  opisPoslova: string;
  opremaServisiraju: string;
  dokumenti: string;
  datumKreiranja: string;
  aktivan: boolean;
}

// Get all vanjski izvodaci
export const getVanjskiIzvodaci = async (): Promise<VanjskiIzvodaci[]> => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching vanjski izvodaci:', error);
    throw error;
  }
};

// Get vanjski izvodac by ID
export const getVanjskiIzvodacById = async (id: number): Promise<VanjskiIzvodaci> => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching vanjski izvodac:', error);
    throw error;
  }
};

// Create new vanjski izvodac
export const createVanjskiIzvodac = async (data: CreateVanjskiIzvodaciDTO): Promise<VanjskiIzvodaci> => {
  try {
    const response = await axios.post(API_URL, data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating vanjski izvodac:', error);
    throw error;
  }
};

// Update vanjski izvodac
export const updateVanjskiIzvodac = async (id: number, data: CreateVanjskiIzvodaciDTO): Promise<void> => {
  try {
    await axios.put(`${API_URL}/${id}`, data);
  } catch (error) {
    console.error('Error updating vanjski izvodac:', error);
    throw error;
  }
};

// Delete vanjski izvodac
export const deleteVanjskiIzvodac = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (error) {
    console.error('Error deleting vanjski izvodac:', error);
    throw error;
  }
};

// Get list of vanjski izvodaci names
export const getVanjskiIzvodaciLista = async (): Promise<string[]> => {
  try {
    const response = await axios.get(`${API_URL}/lista`);
    return response.data;
  } catch (error) {
    console.error('Error fetching vanjski izvodaci lista:', error);
    return [];
  }
};

export const uploadDocument = async (file: File): Promise<{ fileName: string }> => {
  console.log('🔧 vanjskiIzvodaciService: Starting document upload...');
  console.log('🔧 vanjskiIzvodaciService: API_URL:', API_URL);
  console.log('🔧 vanjskiIzvodaciService: File:', file.name, file.size, 'bytes');
  
  try {
    const formData = new FormData();
    formData.append('file', file);
    console.log('🔧 vanjskiIzvodaciService: FormData created');

    console.log('🔧 vanjskiIzvodaciService: Sending POST request to:', `${API_URL}/upload`);
    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('🔧 vanjskiIzvodaciService: Response received:', response.status, response.statusText);
    console.log('🔧 vanjskiIzvodaciService: Response data:', response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('🔧 vanjskiIzvodaciService: Error uploading document:', error);
    console.error('🔧 vanjskiIzvodaciService: Error response:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers
    });
    throw error;
  }
};

export const downloadDocument = async (fileName: string): Promise<Blob> => {
  try {
    const response = await axios.get(`${API_URL}/download/${fileName}`, {
      responseType: 'blob',
    });

    return response.data;
  } catch (error: any) {
    console.error('Error downloading document:', error);
    throw error;
  }
};
