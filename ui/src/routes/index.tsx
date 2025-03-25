import LoginPage from '@/components/login';
import RegisterPage from '@/components/register';
import MainLayout from '@/layouts/main';
import { createBrowserRouter } from 'react-router-dom'

const routes = createBrowserRouter([
    {
        path: '*',
        element: <MainLayout />
    },
    {
        path: '/login',
        element: <LoginPage />
    },
    {
        path: '/register',
        element: <RegisterPage />
    }
]);

export default routes;