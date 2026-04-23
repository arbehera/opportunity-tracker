export type UserRole = 'ADMIN' | 'MANAGER' | 'SALES' | 'PRESALES' | 'VIEWER';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  businessUnit?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  segment?: string;
  region?: string;
  isActive: boolean;
}

export interface ProductCategory {
  id: string;
  name: string;
  isActive: boolean;
}

export interface ProductSubcategory {
  id: string;
  name: string;
  categoryId: string;
  category?: ProductCategory;
  isActive: boolean;
}

export interface BusinessCategory {
  id: string;
  name: string;
  isActive: boolean;
}

export interface BusinessUnit {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface DealStage {
  id: string;
  code: string;
  classification: string;
  status: string;
  winningProbability: number;
  sortOrder: number;
  isActive: boolean;
}

export interface ConfidenceLevel {
  id: string;
  name: string;
  sortOrder: number;
}

export interface Opportunity {
  id: string;
  serialNumber: number;
  customerId: string;
  customer: Customer;
  description: string;
  businessUnitId: string;
  businessUnit: BusinessUnit;
  productCategoryId: string;
  productCategory: ProductCategory;
  productSubcategoryId: string;
  productSubcategory: ProductSubcategory;
  businessCategoryId: string;
  businessCategory: BusinessCategory;
  pinSalesId: string;
  pinSales: User;
  pinPresalesId?: string;
  pinPresales?: User;
  dealStageId: string;
  dealStage: DealStage;
  confidenceLevelId: string;
  confidenceLevel: ConfidenceLevel;
  estimatedClosureDate?: string;
  lifetimeVolume: number;
  unitPriceInr: number;
  unitPriceUsd: number;
  tcvUsdMillion: number;
  comments?: string;
  pms?: string;
  remarks?: string;
  isActive: boolean;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface OpportunityHistory {
  id: string;
  opportunityId: string;
  changedBy: User;
  changedAt: string;
  fieldName: string;
  oldValue?: string;
  newValue?: string;
  changeNote?: string;
}

export interface Document {
  id: string;
  title: string;
  documentType: string;
  receivedDate?: string;
  receivedBy?: User;
  customer?: Customer;
  customerId?: string;
  opportunity?: Opportunity;
  opportunityId?: string;
  sharepointUrl: string;
  sharepointFileId?: string;
  sharepointLibrary?: string;
  fileName: string;
  fileSizeKb?: number;
  mimeType?: string;
  version?: string;
  description?: string;
  tags: string[];
  isConfidential: boolean;
  uploadedBy: User;
  createdAt: string;
}

export interface Notification {
  id: string;
  message: string;
  entity: string;
  entityId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface DashboardSummary {
  totalOpportunities: number;
  totalPipelineTcv: number;
  securedTcv: number;
  highConfidenceTcv: number;
  closingThisQuarter: number;
  winRate: number;
}

export interface PivotRow {
  rowLabel: string;
  [colKey: string]: number | string;
}

export interface OpportunityFilters {
  customerIds?: string[];
  businessUnitIds?: string[];
  productCategoryIds?: string[];
  productSubcategoryIds?: string[];
  businessCategoryIds?: string[];
  dealStageIds?: string[];
  confidenceLevelIds?: string[];
  pinSalesIds?: string[];
  search?: string;
  fromDate?: string;
  toDate?: string;
  tcvMin?: number;
  tcvMax?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
