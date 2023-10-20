import { memo } from 'react';
import Info from './info';
import Volume from './volume';
import Controller from './controller';

const Header = () => {
    return (
        <header className='grid grid-cols-3 w-full justify-between items-center gap-24'>
            <Info />
            <Controller />
            <Volume />
        </header>
    )
}

export default memo(Header)