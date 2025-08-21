import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:5008/api/izvodaci';

// Axios interceptor za automatsko dodavanje Authorization headera
axios.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Interface matching the backend DTO
export interface Izvodaci {
  id?: number;
  broj: string;
  vanjskiIzvodac: string;
  kategorijaIzvodaca: string;
  pocetniDatum: string;
  zavrsniDatum: string;
  mjestoRada: string;
  kontakt: string;
  opisRada: string;
  odgovornaOsoba: string;
  zastoj: boolean;
  status: string;
  tipRadova: string;
  privitak: string;
}

// Create DTO
export interface CreateIzvodaciDTO {
  broj: string;
  vanjskiIzvodac: string;
  kategorijaIzvodaca: string;
  pocetniDatum: string;
  zavrsniDatum: string;
  mjestoRada: string;
  kontakt: string;
  opisRada: string;
  odgovornaOsoba: string;
  zastoj: boolean;
  status: string;
  tipRadova: string;
  privitak: string;
}

// Update DTO
export interface UpdateIzvodaciDTO {
  id: number;
  broj: string;
  vanjskiIzvodac: string;
  kategorijaIzvodaca: string;
  pocetniDatum: string;
  zavrsniDatum: string;
  mjestoRada: string;
  kontakt: string;
  opisRada: string;
  odgovornaOsoba: string;
  zastoj: boolean;
  status: string;
  tipRadova: string;
  privitak: string;
}

// Get all izvodaci
export const getIzvodaci = async (): Promise<Izvodaci[]> => {
  try {
    const response = await axios.get(API_URL);
    
    // Map backend data to frontend structure
    const mappedData = response.data.map((item: any) => ({
      id: item.id,
      broj: item.broj,
      vanjskiIzvodac: item.izvodac, // Map izvodac to vanjskiIzvodac
      kategorijaIzvodaca: item.kategorijaIzvodaca || '',
      pocetniDatum: item.pocetniDatum,
      zavrsniDatum: item.zavrsniDatum,
      mjestoRada: item.mjestoRada,
      kontakt: item.kontakt,
      opisRada: item.opisRada,
      odgovornaOsoba: item.odgovornaOsoba,
      zastoj: item.zastoj, // This is already boolean
      status: item.status,
      tipRadova: item.tipRadova,
      privitak: item.privitak
    }));

    console.log('Backend response:', response.data);
    console.log('Mapped frontend data:', mappedData);
    
    return mappedData;
  } catch (error: any) {
    console.error('Error fetching izvodaci:', error);
    throw error;
  }
};

// Get izvodac by ID
export const getIzvodacById = async (id: number): Promise<Izvodaci> => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    
    // Map backend data to frontend structure
    const item = response.data;
    const mappedData = {
      id: item.id,
      broj: item.broj,
      vanjskiIzvodac: item.izvodac, // Map izvodac to vanjskiIzvodac
      kategorijaIzvodaca: item.kategorijaIzvodaca || '',
      pocetniDatum: item.pocetniDatum,
      zavrsniDatum: item.zavrsniDatum,
      mjestoRada: item.mjestoRada,
      kontakt: item.kontakt,
      opisRada: item.opisRada,
      odgovornaOsoba: item.odgovornaOsoba,
      zastoj: item.zastoj, // This is already boolean
      status: item.status,
      tipRadova: item.tipRadova,
      privitak: item.privitak
    };
    
    return mappedData;
  } catch (error: any) {
    console.error('Error fetching izvodac:', error);
    throw error;
  }
};

// Create new izvodac
export const createIzvodac = async (data: CreateIzvodaciDTO): Promise<Izvodaci> => {
  try {
    // Map frontend data to backend DTO structure
    const backendData = {
      broj: data.broj,
      izvodac: data.vanjskiIzvodac, // Map vanjskiIzvodac to izvodac
      pocetniDatum: data.pocetniDatum,
      zavrsniDatum: data.zavrsniDatum,
      mjestoRada: data.mjestoRada,
      kontakt: data.kontakt,
      opisRada: data.opisRada,
      odgovornaOsoba: data.odgovornaOsoba,
      zastoj: data.zastoj, // This is already boolean, which is correct
      status: data.status,
      tipRadova: data.tipRadova,
      privitak: data.privitak
    };

    console.log('Frontend data:', data);
    console.log('Backend data being sent:', backendData);

    const response = await axios.post(API_URL, backendData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating izvodac:', error);
    if (error.response) {
      console.error('Backend error response:', error.response.data);
    }
    throw error;
  }
};

// Update izvodac
export const updateIzvodac = async (id: number, data: UpdateIzvodaciDTO): Promise<void> => {
  try {
    // Map frontend data to backend DTO structure
    const backendData = {
      id: data.id,
      broj: data.broj,
      izvodac: data.vanjskiIzvodac, // Map vanjskiIzvodac to izvodac
      pocetniDatum: data.pocetniDatum,
      zavrsniDatum: data.zavrsniDatum,
      mjestoRada: data.mjestoRada,
      kontakt: data.kontakt,
      opisRada: data.opisRada,
      odgovornaOsoba: data.odgovornaOsoba,
      zastoj: data.zastoj, // This is already boolean
      status: data.status,
      tipRadova: data.tipRadova,
      privitak: data.privitak
    };

    await axios.put(`${API_URL}/${id}`, backendData);
  } catch (error: any) {
    console.error('Error updating izvodac:', error);
    throw error;
  }
};

export const deleteIzvodac = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (error: any) {
    console.error('Error deleting izvodac:', error);
    throw error;
  }
};

// Get list of izvodaci for dropdown (from vanjski izvodaci)
export const getIzvodaciLista = async (): Promise<string[]> => {
  try {
    const response = await axios.get('http://localhost:5008/api/VanjskiIzvodaci/lista');
    return response.data;
  } catch (error) {
    console.error('Error fetching izvodaci lista:', error);
    // Return empty array if API fails - data will come from backend
    return [];
  }
};

// Convert to update DTO
export const convertToUpdateDTO = (data: Izvodaci): UpdateIzvodaciDTO => {
  return {
    id: data.id!,
    broj: data.broj,
    vanjskiIzvodac: data.vanjskiIzvodac,
    kategorijaIzvodaca: data.kategorijaIzvodaca,
    pocetniDatum: data.pocetniDatum,
    zavrsniDatum: data.zavrsniDatum,
    mjestoRada: data.mjestoRada,
    kontakt: data.kontakt,
    opisRada: data.opisRada,
    odgovornaOsoba: data.odgovornaOsoba,
    zastoj: data.zastoj,
    status: data.status,
    tipRadova: data.tipRadova,
    privitak: data.privitak
  };
};


