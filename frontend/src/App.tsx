import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import { ReactNode } from 'react';
import AppLayout from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import OpportunityListPage from './pages/opportunities/OpportunityListPage';
import OpportunityFormPage from './pages/opportunities/OpportunityFormPage';
import OpportunityDetailPage from './pages/opportunities/OpportunityDetailPage';
import CategoryWisePage from './pages/analytics/CategoryWisePage';
import SubcategoryWisePage from './pages/analytics/SubcategoryWisePage';
import ConfidenceLevelPage from './pages/analytics/ConfidenceLevelPage';
import BUWisePage from './pages/analytics/BUWisePage';
import StageWisePage from './pages/analytics/StageWisePage';
import CustomerWisePage from './pages/analytics/CustomerWisePage';
import TeamMembersPage from './pages/analytics/TeamMembersPage';
import OpportunityCountPage from './pages/analytics/OpportunityCountPage';
import DocumentListPage from './pages/documents/DocumentListPage';
import DocumentDetailPage from './pages/documents/DocumentDetailPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import MasterDataPage from './pages/admin/MasterDataPage';
import { useAuthStore } from './stores/authStore';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30000 } } });

function PrivateRoute({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.accessToken);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={{ token: { colorPrimary: '#e30613', borderRadius: 6, colorLink: '#e30613' } }}>
        <BrowserRouter>
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Route>
            <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/opportunities" element={<OpportunityListPage />} />
              <Route path="/opportunities/new" element={<OpportunityFormPage />} />
              <Route path="/opportunities/:id" element={<OpportunityDetailPage />} />
              <Route path="/opportunities/:id/edit" element={<OpportunityFormPage />} />
              <Route path="/analytics/category" element={<CategoryWisePage />} />
              <Route path="/analytics/subcategory" element={<SubcategoryWisePage />} />
              <Route path="/analytics/confidence" element={<ConfidenceLevelPage />} />
              <Route path="/analytics/bu" element={<BUWisePage />} />
              <Route path="/analytics/stage" element={<StageWisePage />} />
              <Route path="/analytics/customer" element={<CustomerWisePage />} />
              <Route path="/analytics/team" element={<TeamMembersPage />} />
              <Route path="/analytics/count" element={<OpportunityCountPage />} />
              <Route path="/documents" element={<DocumentListPage />} />
              <Route path="/documents/:id" element={<DocumentDetailPage />} />
              <Route path="/admin/users" element={<UserManagementPage />} />
              <Route path="/admin/master" element={<MasterDataPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
