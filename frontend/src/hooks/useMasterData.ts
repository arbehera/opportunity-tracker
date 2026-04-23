import { useQuery } from '@tanstack/react-query';
import {
  customersApi, productCategoriesApi, productSubcategoriesApi,
  businessCategoriesApi, businessUnitsApi, dealStagesApi, confidenceLevelsApi,
} from '@/api/master';
import { getUsers } from '@/api/users';

export function useMasterData() {
  const customers = useQuery({ queryKey: ['master', 'customers'], queryFn: () => customersApi.list(), staleTime: 60000 });
  const productCategories = useQuery({ queryKey: ['master', 'productCategories'], queryFn: () => productCategoriesApi.list(), staleTime: 60000 });
  const productSubcategories = useQuery({ queryKey: ['master', 'productSubcategories'], queryFn: () => productSubcategoriesApi.list(), staleTime: 60000 });
  const businessCategories = useQuery({ queryKey: ['master', 'businessCategories'], queryFn: () => businessCategoriesApi.list(), staleTime: 60000 });
  const businessUnits = useQuery({ queryKey: ['master', 'businessUnits'], queryFn: () => businessUnitsApi.list(), staleTime: 60000 });
  const dealStages = useQuery({ queryKey: ['master', 'dealStages'], queryFn: () => dealStagesApi.list(), staleTime: 60000 });
  const confidenceLevels = useQuery({ queryKey: ['master', 'confidenceLevels'], queryFn: () => confidenceLevelsApi.list(), staleTime: 60000 });
  const salesUsers = useQuery({ queryKey: ['users', 'sales'], queryFn: () => getUsers({ role: 'SALES' }), staleTime: 60000 });
  const presalesUsers = useQuery({ queryKey: ['users', 'presales'], queryFn: () => getUsers({ role: 'PRESALES' }), staleTime: 60000 });

  return {
    customers: (customers.data?.data?.data || []) as any[],
    productCategories: (productCategories.data?.data?.data || []) as any[],
    productSubcategories: (productSubcategories.data?.data?.data || []) as any[],
    businessCategories: (businessCategories.data?.data?.data || []) as any[],
    businessUnits: (businessUnits.data?.data?.data || []) as any[],
    dealStages: (dealStages.data?.data?.data || []) as any[],
    confidenceLevels: (confidenceLevels.data?.data?.data || []) as any[],
    salesUsers: (salesUsers.data?.data?.data || []) as any[],
    presalesUsers: (presalesUsers.data?.data?.data || []) as any[],
    isLoading:
      customers.isLoading || productCategories.isLoading || businessUnits.isLoading ||
      dealStages.isLoading || confidenceLevels.isLoading,
  };
}
