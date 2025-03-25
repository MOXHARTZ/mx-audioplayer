import { Outlet, useNavigate } from 'react-router-dom'
import Actions from '@/components/actions'
import Header from '@/components/header'
import PlaylistContainer from '@/components/container';
import { useEffect } from 'react';
import { useAppSelector } from '@/stores';

const MainLayout = () => {
    const { playlist } = useAppSelector(state => state.Main)
    const navigate = useNavigate()
    useEffect(() => {
        if (!playlist) navigate('/login')
    }, [playlist])
    return (
        <section className='sm:w-[80vh] md:w-[100vh] xl:w-[105vh] p-6 rounded-lg text-white bg-content1'>
            {playlist && (
                <>
                    <Header />
                    <Actions />
                    <PlaylistContainer />
                </>
            )}

            <Outlet />
        </section>
    )
}

export default MainLayout