import { Track } from "@/fake-api/search-results";
import { motion } from "framer-motion";
import i18next from "i18next";
import { IoPlayOutline, IoAddOutline } from "react-icons/io5";

type TrackCardProps = {
  track: Track;
  onClick: (track: Track) => void;
}

export default function TrackCard({ track, onClick }: TrackCardProps) {
  return (
    <motion.div
      className="w-full p-4 rounded-xl bg-black/20 border border-rose-500/20 cursor-pointer group hover:border-rose-400/40 hover:bg-black/30 transition-all duration-300 !overflow-hidden"
      onClick={() => onClick(track)}
    >
      <div className="flex gap-4 items-center">
        <motion.div
          className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-rose-500/30 group-hover:border-rose-400/50 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <img
            src={track.thumbnails[0].url}
            alt="Track cover"
            className="w-full h-full object-cover"
          />

          <motion.div
            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <IoPlayOutline className="text-white text-xl" />
          </motion.div>
        </motion.div>

        <div className="flex flex-col gap-1 flex-1">
          <motion.h3
            className="text-white font-medium text-sm line-clamp-1 group-hover:text-rose-300 transition-colors duration-300"
            whileHover={{ x: 2 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {track.name ?? i18next.t('general.unknown')}
          </motion.h3>

          <motion.p
            className="text-gray-400 text-xs line-clamp-1 group-hover:text-gray-300 transition-colors duration-300"
            whileHover={{ x: 2 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.05 }}
          >
            {track?.artist ? track?.artist?.name : track?.artists?.[0]?.name ?? i18next.t('general.unknown')}
          </motion.p>
        </div>

        <motion.div
          className="flex items-center justify-center w-8 h-8 rounded-full bg-rose-500/20 border border-rose-500/30 group-hover:bg-rose-500/30 group-hover:border-rose-400/50 transition-all duration-300"
          whileHover={{
            scale: 1.1,
            boxShadow: "0 0 15px rgba(244, 63, 94, 0.3)",
            transition: { type: "spring", stiffness: 300, damping: 20 }
          }}
          whileTap={{
            scale: 0.9,
            transition: { type: "spring", stiffness: 400, damping: 15 }
          }}
        >
          <IoAddOutline className="text-rose-400 text-sm group-hover:text-rose-300 transition-colors duration-300" />
        </motion.div>
      </div>
    </motion.div>
  )
}