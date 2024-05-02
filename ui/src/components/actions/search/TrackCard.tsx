import { Track } from "@/fake-api/search-results";
import { Card, CardHeader, Image } from "@nextui-org/react";
import i18next from "i18next";

type TrackCardProps = {
  track: Track;
  onClick: (track: Track) => void;
}

export default function TrackCard({ track, onClick }: TrackCardProps) {
  return (
    <Card isPressable isHoverable className="w-full text-left" onPress={() => onClick(track)}>
      <CardHeader className="flex gap-3">
        <Image
          alt="Track logo"
          radius="sm"
          src={track.thumbnails[0].url}
          width={64}
        />
        <div className="flex flex-col">
          <p className="text-md">{track.name ?? i18next.t('general.unknown')}</p>
          <p className="text-small text-default-500">{track?.artist ? track?.artist?.name : track?.artists?.[0]?.name ?? i18next.t('general.unknown')}</p>
        </div>
      </CardHeader>
    </Card>
  )
}