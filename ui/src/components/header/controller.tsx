import { memo, useState } from 'react';
import Timer from './control/timer';
import Control from './control';

const Controller = () => {
    const [timeStamp, setTimeStamp] = useState(0)

    return (
        <article className='w-full flex flex-col'>
            <Control timeStamp={timeStamp} setTimeStamp={setTimeStamp} />
            <Timer timeStamp={timeStamp} setTimeStamp={setTimeStamp} />
        </article>
    )
}

export default memo(Controller)