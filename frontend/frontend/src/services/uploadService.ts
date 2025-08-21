import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:5008/api/izvodaci';

axios.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export const uploadFile = async (file: File): Promise<{ fileName: string }> => {
  console.log('🔧 uploadService: Starting upload...');
  console.log('🔧 uploadService: API_URL:', API_URL);
  console.log('🔧 uploadService: File:', file.name, file.size, 'bytes');
  
  try {
    const formData = new FormData();
    formData.append('file', file);
    console.log('🔧 uploadService: FormData created');

    console.log('🔧 uploadService: Sending POST request to:', `${API_URL}/upload`);
    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('🔧 uploadService: Response received:', response.status, response.statusText);
    console.log('🔧 uploadService: Response data:', response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('🔧 uploadService: Error uploading file:', error);
    console.error('🔧 uploadService: Error response:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers
    });
    throw error;
  }
};

export const downloadFile = async (fileName: string): Promise<Blob> => {
  try {
    const response = await axios.get(`${API_URL}/download/${fileName}`, {
      responseType: 'blob',
    });

    return response.data;
  } catch (error: any) {
    console.error('Error downloading file:', error);
    throw error;
  }
};
