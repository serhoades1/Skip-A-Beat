import React from 'react';
import { SpotifyTrack } from '../types';

interface Props {
  song: SpotifyTrack | null;
}

const SpotifyPlayer: React.FC<Props> = ({ song }) => {
  if (!song) return null;

  const trackId = song['Track URI'].split(':')[2];

  return (
    <div className="mt-4">
      <iframe
        src={`https://open.spotify.com/embed/track/${trackId}`}
        width="100%"
        height="80"
        frameBorder="0"
        allow="encrypted-media"
        className="rounded-lg"
      />
    </div>
  );
};

export default SpotifyPlayer;