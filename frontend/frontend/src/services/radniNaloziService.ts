import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:5008/api/RadniNalozi';
const USERS_URL = 'http://localhost:5008/api/Korisnici';
const MACHINES_URL = 'http://localhost:5008/api/Strojevi';
const DEPARTMENTS_URL = 'http://localhost:5008/api/Korisnici/OdjeliPrijave';

// Axios interceptor za automatsko dodavanje Authorization headera
axios.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Complete interface matching database schema
export interface RadniNalog {
  id?: number;
  brojRN: string;
  naslov: string;
  odjelPrijaveId: number;
  ustanovioId: number;
  datumPrijave: string;
  strojId: number;
  opisKvara: string;
  zaOdjel: number;
  stupanjHitnosti: string;
  otklonitiDo: string;
  vrstaNaloga: string;
  status: 'Otvoren' | 'U tijeku' | 'Završen' | 'Zatvoren';
  obrazlozenje?: string;
  tehnoloskaOznaka?: string;
  nacinRjesavanja?: string;
  utrosenoMaterijala?: string;
  datumZatvaranja?: string;
  napomena?: string;
  odradioId?: number;
  satiRada?: number;
  rdifOprema?: string;
  potpis?: string;
  datumVrijemePreuzimanja?: string;
  dodijeljenoId?: number;
  datumVrijemeDodjele?: string;
  privitakPath?: string;
  
  // Frontend display fields (not in database)
  odjelPrijave?: string;
  ustanovio?: string;
  stroj?: string;
  odradio?: string;
  dodijeljeno?: string;
  sudionici?: any[];
  sudjelovaliIds?: number[];
}

// Work order creation DTO
export interface CreateRadniNalogDTO {
  BrojRN: string;
  Naslov: string;
  OdjelPrijaveId: number;
  UstanovioId: number;
  DatumPrijave: string;
  StrojId: number;
  OpisKvara: string;
  ZaOdjel: number;
  StupanjHitnosti: string;
  OtklonitiDo: string;
  VrstaNaloga: string;
  Status: string;
  TehnoloskaOznaka?: string;
  DodijeljenoId?: number;
  DatumVrijemeDodjele?: string;
  SudjelovaliIds?: number[];
}

// Work order update DTO
export interface UpdateRadniNalogDTO {
  Id: number;
  BrojRN: string;
  Naslov: string;
  OdjelPrijaveId: number;
  UstanovioId: number;
  DatumPrijave: string;
  StrojId: number;
  OpisKvara: string;
  ZaOdjel: number;
  StupanjHitnosti: string;
  OtklonitiDo: string;
  VrstaNaloga: string;
  Status: string;
  Obrazlozenje?: string;
  TehnoloskaOznaka?: string;
  NacinRjesavanja?: string;
  UtrosenoMaterijala?: string;
  DatumZatvaranja?: string;
  Napomena?: string;
  OdradioId?: number;
  SatiRada?: number;
  RDIFOPrema?: string;
  Potpis?: string;
  DatumVrijemePreuzimanja?: string;
  DodijeljenoId?: number;
  DatumVrijemeDodjele?: string;
  PrivitakPath?: string;
  SudjelovaliIds?: number[];
}

export interface User { id: number; ime: string; }
export interface Machine { id: number; naslov: string; }
export interface Department { id: number; naslov: string; }

export const getRadniNalozi = async (): Promise<RadniNalog[]> => {
  try {
    const res = await axios.get(API_URL);
    console.log('Raw API response:', res.data);
    if (res.data && res.data.length > 0) {
      console.log('First item keys:', Object.keys(res.data[0]));
      console.log('First item dodijeljenoId:', res.data[0].dodijeljenoId);
      console.log('First item DodijeljenoId:', res.data[0].DodijeljenoId);
    }
    return res.data;
  } catch (error: any) {
    console.error('[AXIOS ERROR] getRadniNalozi', error);
    if (error.response) {
      console.error('Response:', error.response);
    }
    if (error.message) {
      console.error('Message:', error.message);
    }
    throw error;
  }
};

export const getUsers = async (): Promise<User[]> => {
  try {
    const res = await axios.get(USERS_URL);
    return res.data;
  } catch (error: any) {
    console.error('[AXIOS ERROR] getUsers', error);
    if (error.response) {
      console.error('Response:', error.response);
    }
    if (error.message) {
      console.error('Message:', error.message);
    }
    throw error;
  }
};

export const getMachines = async (): Promise<Machine[]> => {
  try {
    const res = await axios.get(MACHINES_URL);
    return res.data;
  } catch (error: any) {
    console.error('[AXIOS ERROR] getMachines', error);
    if (error.response) {
      console.error('Response:', error.response);
    }
    if (error.message) {
      console.error('Message:', error.message);
    }
    throw error;
  }
};

export const getDepartments = async (): Promise<Department[]> => {
  try {
    const res = await axios.get(DEPARTMENTS_URL);
    return res.data;
  } catch (error: any) {
    console.error('[AXIOS ERROR] getDepartments', error);
    if (error.response) {
      console.error('Response:', error.response);
    }
    if (error.message) {
      console.error('Message:', error.message);
    }
    throw error;
  }
};

export const createRadniNalog = async (data: CreateRadniNalogDTO) => {
  try {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => formData.append(key, v));
        } else {
          formData.append(key, value as any);
        }
      }
    });
    
    const res = await axios.post(API_URL, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  } catch (error: any) {
    console.error('[AXIOS ERROR] createRadniNalog', error);
    if (error.response) {
      console.error('Response:', error.response);
      console.error('Response data:', error.response.data);
      if (error.response.data.errors) {
        console.error('Validation errors:', JSON.stringify(error.response.data.errors, null, 2));
      }
    }
    if (error.message) {
      console.error('Message:', error.message);
    }
    throw error;
  }
};

export const updateRadniNalog = async (id: number, data: UpdateRadniNalogDTO) => {
  try {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => formData.append(key, v));
        } else {
          formData.append(key, value as any);
        }
      }
    });
    
    console.log('Sending update data:', data);
    console.log('FormData entries:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }
    
    const res = await axios.put(`${API_URL}/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    console.log('Update response:', res.data);
    console.log('Update response dodijeljenoId:', res.data.dodijeljenoId);
    console.log('Update response DodijeljenoId:', res.data.DodijeljenoId);
    return res.data;
  } catch (error: any) {
    console.error('[AXIOS ERROR] updateRadniNalog', error);
    if (error.response) {
      console.error('Response:', error.response);
    }
    if (error.message) {
      console.error('Message:', error.message);
    }
    throw error;
  }
};

// Helper function to convert frontend data to backend DTO
export const convertToCreateDTO = (data: Partial<RadniNalog>): CreateRadniNalogDTO => {
  return {
    BrojRN: data.brojRN || '',
    Naslov: data.naslov || '',
    OdjelPrijaveId: data.odjelPrijaveId || 0,
    UstanovioId: data.ustanovioId || 0,
    DatumPrijave: data.datumPrijave || '',
    StrojId: data.strojId || 0,
    OpisKvara: data.opisKvara || '',
    ZaOdjel: data.zaOdjel || 0,
    StupanjHitnosti: data.stupanjHitnosti || '',
    OtklonitiDo: data.otklonitiDo || '',
    VrstaNaloga: data.vrstaNaloga || '',
    Status: data.status || 'Otvoren',
    TehnoloskaOznaka: data.tehnoloskaOznaka,
    DodijeljenoId: data.dodijeljenoId,
    DatumVrijemeDodjele: data.datumVrijemeDodjele,
    SudjelovaliIds: data.sudjelovaliIds,
  };
};

// Helper function to convert frontend data to update DTO
export const convertToUpdateDTO = (id: number, data: Partial<RadniNalog>): UpdateRadniNalogDTO => {
  return {
    Id: id,
    BrojRN: data.brojRN || '',
    Naslov: data.naslov || '',
    OdjelPrijaveId: data.odjelPrijaveId || 0,
    UstanovioId: data.ustanovioId || 0,
    DatumPrijave: data.datumPrijave || '',
    StrojId: data.strojId || 0,
    OpisKvara: data.opisKvara || '',
    ZaOdjel: data.zaOdjel || 0,
    StupanjHitnosti: data.stupanjHitnosti || '',
    OtklonitiDo: data.otklonitiDo || '',
    VrstaNaloga: data.vrstaNaloga || '',
    Status: data.status || 'Otvoren',
    Obrazlozenje: data.obrazlozenje,
    TehnoloskaOznaka: data.tehnoloskaOznaka,
    NacinRjesavanja: data.nacinRjesavanja,
    UtrosenoMaterijala: data.utrosenoMaterijala,
    DatumZatvaranja: data.datumZatvaranja,
    Napomena: data.napomena,
    OdradioId: data.odradioId,
    SatiRada: data.satiRada,
    RDIFOPrema: data.rdifOprema,
    Potpis: data.potpis,
    DatumVrijemePreuzimanja: data.datumVrijemePreuzimanja,
    DodijeljenoId: data.dodijeljenoId !== undefined && data.dodijeljenoId !== 0 ? data.dodijeljenoId : undefined,
    DatumVrijemeDodjele: data.datumVrijemeDodjele,
    PrivitakPath: data.privitakPath,
    SudjelovaliIds: data.sudjelovaliIds,
  };
};
