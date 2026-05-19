import client from './client';
import { ApiResponse, DashboardSummary } from '@/types';

export interface AnalyticsFilters {
  customerIds?: string[];
  businessUnitIds?: string[];
  productCategoryIds?: string[];
  dealStageIds?: string[];
  confidenceLevelIds?: string[];
  salesIds?: string[];
  fromDate?: string | null;
  toDate?: string | null;
}

export const getDashboardSummary = (filters?: AnalyticsFilters) =>
  client.get<ApiResponse<DashboardSummary>>('/analytics/dashboard', { params: filters });

export const getCategoryAnalytics = (filters?: AnalyticsFilters) =>
  client.get<ApiResponse<any[]>>('/analytics/category', { params: filters });

export const getSubcategoryAnalytics = (filters?: AnalyticsFilters) =>
  client.get<ApiResponse<any[]>>('/analytics/subcategory', { params: filters });

export const getSubcategoryByBUAnalytics = (filters?: AnalyticsFilters) =>
  client.get<ApiResponse<any[]>>('/analytics/subcategory-bu', { params: filters });

export const getConfidenceAnalytics = (filters?: AnalyticsFilters) =>
  client.get<ApiResponse<any[]>>('/analytics/confidence', { params: filters });

export const getBUAnalytics = (filters?: AnalyticsFilters) =>
  client.get<ApiResponse<any[]>>('/analytics/bu', { params: filters });

export const getStageAnalytics = (filters?: AnalyticsFilters) =>
  client.get<ApiResponse<any[]>>('/analytics/stage', { params: filters });

export const getCustomerAnalytics = (filters?: AnalyticsFilters) =>
  client.get<ApiResponse<any[]>>('/analytics/customer', { params: filters });

export const getCustomerCategoryAnalytics = (filters?: AnalyticsFilters) =>
  client.get<ApiResponse<any[]>>('/analytics/customer-category', { params: filters });

export const getTeamAnalytics = (filters?: AnalyticsFilters) =>
  client.get<ApiResponse<any[]>>('/analytics/team', { params: filters });

export const getCountAnalytics = (filters?: AnalyticsFilters) =>
  client.get<ApiResponse<any[]>>('/analytics/count', { params: filters });

export const getDashboardCharts = (filters?: AnalyticsFilters) =>
  client.get<ApiResponse<any>>('/analytics/charts', { params: filters });

export const getStaleOpportunities = () =>
  client.get<ApiResponse<any[]>>('/analytics/stale');
