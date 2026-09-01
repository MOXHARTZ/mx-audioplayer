import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useStore } from '@/store';
import { fetchNui } from '@/lib/nui';
import Sidebar from '@/components/Sidebar';
import WindowControls from '@/components/WindowControls';
import TransportStrip from '@/components/TransportStrip';
import QueuePanel from '@/components/QueuePanel';

const MainLayout = () => {
    const playlists = useStore(s => s.playlists);
    const setEditMode = useStore(s => s.setEditMode);
    const setSelectedSongs = useStore(s => s.setSelectedSongs);
    const setVisible = useStore(s => s.setVisible);
    const location = useLocation();

    useEffect(() => {
        setEditMode(false);
        setSelectedSongs([]);
    }, [location.pathname]);

    if (!playlists) return <Navigate to="/login" replace />;

    const closeUI = () => {
        setVisible(false);
        fetchNui('close');
    };

    return (
        <div className="bezel w-[90vw] max-w-[1600px] h-[90vh] min-h-[620px] overflow-hidden flex">
            <Sidebar />

            <div className="relative flex-1 min-w-0 flex flex-col">
                <WindowControls onClose={closeUI} />

                <main className="flex-1 min-h-0 flex flex-col">
                    <Outlet />
                </main>

                <TransportStrip />
            </div>

            <QueuePanel />
        </div>
    );
};

export default MainLayout;
