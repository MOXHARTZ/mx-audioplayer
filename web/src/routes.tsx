import { createHashRouter } from 'react-router-dom';
import ErrorBoundary from '@/components/ErrorBoundary';
import MainLayout from '@/pages/MainLayout';
import Home from '@/pages/Home';
import Search from '@/pages/Search';
import Radio from '@/pages/Radio';
import PlaylistPage from '@/pages/Playlist';
import LoginPage from '@/pages/Login';
import RegisterPage from '@/pages/Register';

const router = createHashRouter([
    {
        path: '/',
        ErrorBoundary,
        element: <MainLayout />,
        children: [
            { index: true, element: <Home /> },
            { path: 'search', element: <Search /> },
            { path: 'radio', element: <Radio /> },
            { path: 'playlist/:playlistId', element: <PlaylistPage /> },
        ],
    },
    { path: '/login', ErrorBoundary, element: <LoginPage /> },
    { path: '/register', ErrorBoundary, element: <RegisterPage /> },
]);

export default router;
