import MainLayout from '@/layouts/main';
import { createBrowserRouter } from 'react-router-dom'

const routes = createBrowserRouter([
    {
        path: '*',
        element: <MainLayout />
    }
]);

export default routes;