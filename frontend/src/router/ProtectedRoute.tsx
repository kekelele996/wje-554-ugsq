import { Navigate, Outlet } from 'react-router-dom';
import { UserRole } from '../constants/enums';
import { useAuthStore } from '../stores/authStore';

export function ProtectedRoute({ roles }: { roles?: UserRole[] }) {
  const { user, token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (roles && (!user || !roles.includes(user.role))) return <Navigate to="/" replace />;
  return <Outlet />;
}
