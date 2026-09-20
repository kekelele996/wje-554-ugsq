import { createBrowserRouter } from 'react-router-dom';
import { UserRole } from '../constants/enums';
import { MainLayout } from '../components/layout/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { Home } from '../pages/Home';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { OrderList } from '../pages/OrderList';
import { OrderDetail } from '../pages/OrderDetail';
import { WorkerManage } from '../pages/WorkerManage';
import { ServiceManage } from '../pages/ServiceManage';
import { NotFound } from '../pages/NotFound';

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: '/', element: <Home /> },
          { path: '/orders', element: <OrderList /> },
          { path: '/orders/:id', element: <OrderDetail /> },
          {
            element: <ProtectedRoute roles={[UserRole.ADMIN]} />,
            children: [
              { path: '/workers', element: <WorkerManage /> },
              { path: '/services', element: <ServiceManage /> }
            ]
          }
        ]
      }
    ]
  },
  { path: '*', element: <NotFound /> }
]);
