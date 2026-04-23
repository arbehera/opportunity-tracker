import client from './client';

const crud = (path: string) => ({
  list: (params?: any) => client.get(`/master/${path}`, { params }),
  create: (data: any) => client.post(`/master/${path}`, data),
  update: (id: string, data: any) => client.put(`/master/${path}/${id}`, data),
  remove: (id: string) => client.delete(`/master/${path}/${id}`),
});

export const customersApi = crud('customers');
export const productCategoriesApi = crud('product-categories');
export const productSubcategoriesApi = crud('product-subcategories');
export const businessCategoriesApi = crud('business-categories');
export const businessUnitsApi = crud('business-units');
export const dealStagesApi = crud('deal-stages');
export const confidenceLevelsApi = crud('confidence-levels');
