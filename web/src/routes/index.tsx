import { ErrorBoundary } from '@/components/ErrorBoundary';
import LoginPage from '@/components/login';
import RegisterPage from '@/components/register';
import MainLayout from '@/layouts/main';
import { createHashRouter } from 'react-router-dom'

const routes = createHashRouter([
    {
        path: '*',
        ErrorBoundary: ErrorBoundary,
        element: <MainLayout />
    },
    {
        path: '/login',
        ErrorBoundary: ErrorBoundary,
        element: <LoginPage />
    },
    {
        path: '/register',
        ErrorBoundary: ErrorBoundary,
        element: <RegisterPage />
    }
]);

export default routes;