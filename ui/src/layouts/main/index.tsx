import { Outlet } from 'react-router-dom'
import Actions from '@/components/actions'
import Header from '@/components/header'
import PlaylistContainer from '@/components/container';

const MainLayout = () => {
    return (
        <section className='sm:w-[80vh] md:w-[100vh] xl:w-[105vh] p-6 rounded-lg text-white bg-content1'>
            <Header />
            <Actions />
            <PlaylistContainer />
            <Outlet />
        </section>
    )
}

export default MainLayout