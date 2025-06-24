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

export interface Obavijest {
  id: number;
  imeObavijesti: string;
  opis: string;
  datumObjave: string;
  aktivno: boolean;
  slika: string | File | null;
  dokumenti?: string | File | null; // Assuming documents might also be a base64 string or URL
}

class ObavijestiService {
  async getObavijesti(): Promise<Obavijest[]> {
    try {
      const response = await axios.get(`${API_URL}/Obavijesti`);
      return response.data;
    } catch (error) {
      console.error("Error fetching news:", error);
      throw error;
    }
  }

  async createObavijest(obavijest: Omit<Obavijest, 'id'>): Promise<Obavijest> {
    try {
      const formData = new FormData();
      formData.append('imeObavijesti', obavijest.imeObavijesti);
      formData.append('opis', obavijest.opis);
      formData.append('aktivno', String(obavijest.aktivno));
      formData.append('datumObjave', obavijest.datumObjave);

      if (obavijest.slika instanceof File) {
        formData.append('slika', obavijest.slika);
      } else if (typeof obavijest.slika === 'string') {
        formData.append('slika', obavijest.slika);
      }

      if (obavijest.dokumenti instanceof File) {
        formData.append('dokumenti', obavijest.dokumenti);
      } else if (typeof obavijest.dokumenti === 'string') {
        formData.append('dokumenti', obavijest.dokumenti);
      }

      const response = await axios.post(`${API_URL}/Obavijesti`, formData);
      return response.data;
    } catch (error) {
      console.error("Error creating news:", error);
      throw error;
    }
  }

  async getObavijestById(id: number): Promise<Obavijest> {
    try {
      const response = await axios.get(`${API_URL}/Obavijesti/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching news with id ${id}:`, error);
      throw error;
    }
  }

  async updateObavijest(id: number, obavijest: Obavijest): Promise<Obavijest> {
    try {
      const formData = new FormData();
      formData.append('id', String(id)); // Assuming id is needed for update
      formData.append('imeObavijesti', obavijest.imeObavijesti);
      formData.append('opis', obavijest.opis);
      formData.append('aktivno', String(obavijest.aktivno));
      formData.append('datumObjave', obavijest.datumObjave);

      if (obavijest.slika instanceof File) {
        formData.append('slika', obavijest.slika);
      } else if (typeof obavijest.slika === 'string') {
        formData.append('slika', obavijest.slika);
      } else if (obavijest.slika === null) {
        // If image is explicitly set to null, send an empty string or a specific indicator
        // to clear the image on the backend. This depends on backend implementation.
        // For now, sending empty string.
        formData.append('slika', '');
      }

      if (obavijest.dokumenti instanceof File) {
        formData.append('dokumenti', obavijest.dokumenti);
      } else if (typeof obavijest.dokumenti === 'string') {
        formData.append('dokumenti', obavijest.dokumenti);
      } else if (obavijest.dokumenti === null) {
        // Same as above for documents
        formData.append('dokumenti', '');
      }

      const response = await axios.put(`${API_URL}/Obavijesti/${id}`, formData);
      return response.data;
    } catch (error) {
      console.error(`Error updating news with id ${id}:`, error);
      throw error;
    }
  }

  async deleteObavijest(id: number): Promise<void> {
    try {
      await axios.delete(`${API_URL}/Obavijesti/${id}`);
    } catch (error) {
      console.error(`Error deleting news with id ${id}:`, error);
      throw error;
    }
  }
}

export default new ObavijestiService(); 