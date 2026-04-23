import client from './client';

export const getDocuments = (params?: any) => client.get('/documents', { params });
export const getDocument = (id: string) => client.get(`/documents/${id}`);
export const createDocument = (data: any) => client.post('/documents', data);
export const updateDocument = (id: string, data: any) => client.put(`/documents/${id}`, data);
export const deleteDocument = (id: string) => client.delete(`/documents/${id}`);
export const logDocumentAccess = (id: string, action: string) => client.post(`/documents/${id}/log-access`, { action });
export const browseSP = (library?: string, folder?: string) =>
  client.get('/documents/sharepoint/browse', { params: { library, folder } });
