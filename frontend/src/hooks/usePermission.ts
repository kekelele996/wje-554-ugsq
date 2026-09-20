import { UserRole } from '../constants/enums';
import { useAuthStore } from '../stores/authStore';

export const usePermission = () => {
  const role = useAuthStore((state) => state.user?.role);
  return {
    role,
    isAdmin: role === UserRole.ADMIN,
    isWorker: role === UserRole.WORKER,
    isCustomer: role === UserRole.CUSTOMER,
    can: (...roles: UserRole[]) => Boolean(role && roles.includes(role))
  };
};
