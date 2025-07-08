import { MinimalHudPosition } from '@/utils/types';
import Header from '../header'
import { AnimatePresence, motion, MotionStyle } from 'framer-motion'
import { useMemo } from 'react';
import { DefaultMinimalHudPosition } from '@/utils/defaults';

type ShortDisplayProps = Readonly<{
    visible: boolean;
    position?: MinimalHudPosition
}>

const positions = new Map<MinimalHudPosition, { initial: any, animate: any }>([
    ['top-left', {
        initial: {
            left: '0',
            top: '0',
            y: '-100%'
        },
        animate: {
            x: 0,
            y: 0
        }
    }],
    ['top-right', {
        initial: {
            right: '0',
            top: '0',
            y: '-100%'
        },
        animate: {
            x: 0,
            y: 0
        }
    }],
    ['bottom-left', {
        initial: {
            left: '0',
            bottom: '0',
            y: '100%'
        },
        animate: {
            x: 0,
            y: 0
        }
    }],
    ['bottom-right', {
        initial: {
            right: '0',
            bottom: '0',
            y: '100%'
        },
        animate: {
            x: 0,
            y: 0
        }
    }]
])

export default function ShortDisplay({ visible, position }: ShortDisplayProps) {
    const styleProps = useMemo(() => positions.get(position ?? DefaultMinimalHudPosition), [position])

    return (
        <AnimatePresence mode='wait'>
            {visible && (
                <motion.div
                    initial={styleProps?.initial}
                    animate={styleProps?.animate}
                    exit={styleProps?.initial}
                    className='absolute z-50'
                >
                    <Header key={'short-display-header'} isShort />
                </motion.div>
            )}
        </AnimatePresence>
    )
}