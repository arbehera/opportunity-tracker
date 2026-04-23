import client from './client';

export const getUsers = (params?: any) => client.get('/users', { params });
export const getUser = (id: string) => client.get(`/users/${id}`);
export const createUser = (data: any) => client.post('/users', data);
export const updateUser = (id: string, data: any) => client.put(`/users/${id}`, data);
export const deactivateUser = (id: string) => client.patch(`/users/${id}/deactivate`);
export const resetUserPassword = (id: string, password: string) =>
  client.post(`/users/${id}/reset-password`, { password });
