import axios from 'axios';

const API_URL = 'http://localhost:5008/api/Planiranje'; // Base URL for Planiranje endpoints

export interface Machine {
  id: number;
  naslov: string;
}

export interface PlaniranjeTask {
  id: number;
  vrstaZadataka: string;
  pocetniDatum: string;
  zavrsniDatum: string;
  strojId: number | null;
  strojNaslov: string;
  smjena: string;
  opis: string;
  privitak: File | null;
  status: string;
  djelatnik: string;
  korisnikIme?: string;
}

export const getMachineTitles = async (): Promise<string[]> => {
  const response = await axios.get<string[]>(`${API_URL}/StrojeviNaslovi`);
  return response.data;
};

export const getPlaniranjeTasks = async (): Promise<PlaniranjeTask[]> => {
  const response = await axios.get<PlaniranjeTask[]>(API_URL);
  return response.data;
};

export const getMachines = async (): Promise<Machine[]> => {
  const response = await axios.get<Machine[]>('http://localhost:5008/api/Strojevi');
  return response.data;
};

export const createPlaniranjeTask = async (taskData: PlaniranjeTask): Promise<PlaniranjeTask> => {
  const formData = new FormData();
  formData.append('VrstaZadataka', taskData.vrstaZadataka);
  formData.append('PocetniDatum', taskData.pocetniDatum);
  formData.append('ZavrsniDatum', taskData.zavrsniDatum);
  formData.append('StrojId', taskData.strojId?.toString() || '');
  formData.append('Smjena', taskData.smjena);
  formData.append('Opis', taskData.opis);
  formData.append('Status', taskData.status);
  if (taskData.privitak) {
    formData.append('Privitak', taskData.privitak);
  }

  const response = await axios.post(API_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deletePlaniranjeTask = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};