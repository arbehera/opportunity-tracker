import client from './client';
import { Opportunity, OpportunityFilters, PaginatedResponse, ApiResponse, OpportunityHistory } from '@/types';

export const getOpportunities = (filters: OpportunityFilters) =>
  client.get<PaginatedResponse<Opportunity>>('/opportunities', { params: filters });

export const getOpportunity = (id: string) =>
  client.get<ApiResponse<Opportunity>>(`/opportunities/${id}`);

export const createOpportunity = (data: Partial<Opportunity>) =>
  client.post<ApiResponse<Opportunity>>('/opportunities', data);

export const updateOpportunity = (id: string, data: Partial<Opportunity>) =>
  client.put<ApiResponse<Opportunity>>(`/opportunities/${id}`, data);

export const deleteOpportunity = (id: string) =>
  client.delete<ApiResponse<null>>(`/opportunities/${id}`);

export const getOpportunityHistory = (id: string) =>
  client.get<ApiResponse<OpportunityHistory[]>>(`/opportunities/${id}/history`);

export const exportOpportunities = (filters: OpportunityFilters) =>
  client.get('/opportunities/export/excel', { params: filters, responseType: 'blob' });
