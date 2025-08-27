// src/App.js
import React from "react";
import { Routes, Route } from "react-router-dom";

// Global Styles
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// Context Providers
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

// Common Components
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./components/LandingPage";
import SplashScreen from "./components/SplashScreen";
import Register from "./components/registerComponent";
import Login from "./components/loginComponent";
import VerifyAccount from "./components/VerifyAccountPage";
import RequestReset from "./components/RequestResetPage";
import ResetPassword from "./components/ResetPasswordPage";
import ResetPasswordForm from "./components/resetpassword";
import AboutPage from "./components/AboutPage";
import ServicesPage from "./components/ServicesPage";

// Admin Components
import AdminLayout from "./components/AdminLayout";
import AdminDashboardPage from "./components/AdminDashboardPage";
import AdminStaffPage from "./components/AdminStaffPage";
import RegisterStaffPage from "./components/RegisterStaffPage";
import BroadcastMessagePage from "./components/BroadcastMessagePage";
import DefaulterListPage from "./components/DefaulterListPage";
import RelocationRequestPage from "./components/RelocationRequestPage";
import StaffListPage from "./components/StaffListPage";
import AdminCharts from "./components/AdminCharts";
import EditStaffPage from "./components/EditStaffPage";
import AuditLogsPage from "./components/AuditLogsPage";
import RelocationViewer from "./components/RelocationViewer";

// Tenant Components
import TenantSidebarLayout from "./components/TenantSidebarLayout";
import TenantDashboard from "./components/TenantDashboard";
import PaymentHistory from "./components/PaymentHistory";
import RelocationRequestForm from "./components/RelocationRequestForm";
import TenantChatRoom from "./components/TenantChatRoom";
import TenantMaintenancePage from "./components/TenantMaintenancePage";
import TenantVisitPage from "./components/TenantVisitsPage";
import TenantNotificationPage from "./components/TenantNotificationsPage";
import TenantProfileUpdateForm from "./components/TenantProfileUpdateForm";
import TenantRelocationPage from "./components/TenantRelocationPage";
import TenantPaymentPage from "./components/TenantPaymentsPage";

// Landlord Components
import LandlordSidebarLayout from "./components/LandlordSidebarLayout";
import LandlordDashboard from "./components/LandlordDashboard";
import HouseManagementTable from "./components/HouseManagementTable";
import HouseUploadForm from "./components/HouseUploadForm";
import TenantManagement from "./components/TenantManagement";
import Defaulters from "./components/Defaulters";
import Relocations from "./components/Relocations";
import Visits from "./components/VisitRequests";
import Payments from "./components/Payments";
import MaintenanceManagement from "./components/MaintenanceManagement";
import BroadcastMessage from "./components/BroadcastMessagePage";
import AssignCaretakerDropdown from "./components/AssignCaretakerDropdown"

// Caretaker Components
import CaretakerLayout from "./components/CaretakerLayout";
import CaretakerDashboardHome from "./components/CaretakerDashboardHome";
import CaretakerMaintenance from "./components/CaretakerMaintenance";
import CaretakerMessages from "./components/CaretakerMessages";
import CaretakerRelocation from "./components/CaretakerRelocations";
import CaretakerTenantRegistration from "./components/CaretakerTenantRegistration";
import CaretakerVisits from "./components/CaretakerVisits";
import Houses from "./components/Houses";
import NotFound from "./components/NotFound";


function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <ToastProvider>

            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/splash" element={<SplashScreen />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/reset-password" element={<ResetPasswordForm />} />
              <Route path="/verify-account/:token" element={<VerifyAccount />} />
              <Route path="/request-reset" element={<RequestReset />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/services" element={<ServicesPage />} />

              {/* Admin Routes */}
              <Route path="/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminLayout><AdminDashboardPage /></AdminLayout></ProtectedRoute>} />
              <Route path="/admin/staff" element={<ProtectedRoute requiredRole="admin"><AdminLayout><AdminStaffPage /></AdminLayout></ProtectedRoute>} />
              <Route path="/admin/staff/register" element={<ProtectedRoute requiredRole="admin"><AdminLayout><RegisterStaffPage /></AdminLayout></ProtectedRoute>} />
              <Route path="/admin/broadcast" element={<ProtectedRoute requiredRole="admin"><AdminLayout><BroadcastMessagePage /></AdminLayout></ProtectedRoute>} />
              <Route path="/admin/defaulters" element={<ProtectedRoute requiredRole="admin"><AdminLayout><DefaulterListPage /></AdminLayout></ProtectedRoute>} />
              <Route path="/admin/relocations" element={<ProtectedRoute requiredRole="admin"><AdminLayout><RelocationRequestPage /></AdminLayout></ProtectedRoute>} />
              <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminLayout><AdminDashboardPage /></AdminLayout></ProtectedRoute>} />
              <Route path="/admin/staff/list" element={<ProtectedRoute requiredRole="admin"><AdminLayout><StaffListPage /></AdminLayout></ProtectedRoute>} />
              <Route path="/admin/charts" element={<ProtectedRoute requiredRole="admin"><AdminLayout><AdminCharts /></AdminLayout></ProtectedRoute>} />
              <Route path="/admin/staff/edit" element={<ProtectedRoute requiredRole="admin"><AdminLayout><EditStaffPage /></AdminLayout></ProtectedRoute>} />
              <Route path="/admin/audit-logs" element={<ProtectedRoute requiredRole="admin"><AdminLayout><AuditLogsPage /></AdminLayout></ProtectedRoute>} />
              <Route path="/admin/relocation/view" element={<ProtectedRoute requiredRole="admin"><AdminLayout><RelocationViewer /></AdminLayout></ProtectedRoute>} />             
              {/* Tenant Routes */}
              <Route path="/tenant" element={<ProtectedRoute><TenantSidebarLayout /></ProtectedRoute>} >
                <Route path="dashboard" element={<TenantDashboard />} />
                <Route path="payments" element={<TenantPaymentPage />} />
                <Route path="payment-history" element={<PaymentHistory />} />
                <Route path="relocation" element={<TenantRelocationPage />} />
                <Route path="relocation/request" element={<RelocationRequestForm />} />
                <Route path="chat" element={<TenantChatRoom />} />
                <Route path="maintenance" element={<TenantMaintenancePage />} />
                <Route path="visit" element={<TenantVisitPage />} />
                <Route path="notifications" element={<TenantNotificationPage />} />
                <Route path="profile" element={<TenantProfileUpdateForm />} />
                <Route path="payment" element={<TenantPaymentPage />} />
              </Route>

              {/* Landlord Routes */}
              <Route path="/landlord"element={<ProtectedRoute requiredRole="landlord"><LandlordSidebarLayout /></ProtectedRoute>}>
                <Route path="dashboard" element={<LandlordDashboard />} />
                <Route path="houses" element={<Houses />} />
                <Route path="houses/upload" element={<HouseUploadForm />} />
                <Route path="houses/manage" element={<HouseManagementTable />} />
                <Route path="houses/assign" element={<AssignCaretakerDropdown />} />
                <Route path="tenants" element={<TenantManagement />} />
                <Route path="maintenance" element={<MaintenanceManagement />} />
                <Route path="caretaker" element={<AssignCaretakerDropdown />} />
                <Route path="defaulters" element={<Defaulters />} />
                <Route path="relocations" element={<Relocations />} />
                <Route path="visits" element={<Visits />} />
                <Route path="payments" element={<Payments />} />
                <Route path="broadcast" element={<BroadcastMessage />} />
                <Route path="*" element={<NotFound />} />
              </Route>

              <Route path="/caretaker"element={<ProtectedRoute requiredRole="caretaker"><CaretakerLayout /></ProtectedRoute>}>
                <Route path="dashboard" element={<CaretakerDashboardHome />} />
                <Route path="maintenance" element={<CaretakerMaintenance />} />
                <Route path="relocation" element={<CaretakerRelocation />} />
                <Route path="messages" element={<CaretakerMessages />} />
                <Route path="tenant-registration" element={<CaretakerTenantRegistration />} />
                <Route path="visits" element={<CaretakerVisits />} />
                {/* add more caretaker-specific pages */}
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
           
          </ToastProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
