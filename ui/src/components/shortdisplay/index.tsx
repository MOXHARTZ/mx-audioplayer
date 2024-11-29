import Header from '../header'
import { AnimatePresence, motion } from 'framer-motion'

type ShortDisplayProps = Readonly<{
    visible: boolean
}>

export default function ShortDisplay({ visible }: ShortDisplayProps) {
    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{
                        translateY: '100%',
                    }}
                    animate={{
                        translateY: 0,
                    }}
                    transition={{
                        duration: 0.3
                    }}
                    exit={{
                        translateY: '100%',
                    }}
                    className='absolute right-0 bottom-0 w-[30vw] z-50'
                >
                    <Header isShort />
                </motion.div>
            )}
        </AnimatePresence>
    )
}