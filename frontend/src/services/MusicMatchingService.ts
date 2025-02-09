import { SpotifyTrack, AudioFeatures } from '../types';

class MusicMatchingService {
  selectSongForHeartRate(
    songs: SpotifyTrack[],
    heartRate: number,
    metadata: Map<string, AudioFeatures>
  ): SpotifyTrack | null {
    if (songs.length === 0) return null;

    const targetBPM = heartRate;
    const targetEnergy = this.calculateTargetEnergy(heartRate);

    const scoredSongs = songs.map(song => {
      const trackId = song['Track URI'].split(':')[2];
      const features = metadata.get(trackId);
      
      if (!features) return { song, score: Infinity };

      const score = this.calculateSongScore(features, targetBPM, targetEnergy);
      return { song, score };
    });

    scoredSongs.sort((a, b) => a.score - b.score);
    const topMatches = scoredSongs.slice(0, 3);
    
    return topMatches[Math.floor(Math.random() * topMatches.length)].song;
  }

  private calculateTargetEnergy(heartRate: number): number {
    if (heartRate < 100) return 0.3;
    if (heartRate < 140) return 0.6;
    return 0.9;
  }

  private calculateSongScore(
    features: AudioFeatures,
    targetBPM: number,
    targetEnergy: number
  ): number {
    const bpmDiff = Math.abs(features.tempo - targetBPM);
    const energyDiff = Math.abs(features.energy - targetEnergy);
    const danceabilityBonus = features.danceability * 0.2;
    const valenceBonus = features.valence * 0.1;
    
    return (bpmDiff * 0.5) + (energyDiff * 0.3) - danceabilityBonus - valenceBonus;
  }
}

export default new MusicMatchingService();