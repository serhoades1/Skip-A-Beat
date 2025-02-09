import { SpotifyTrack, AudioFeatures } from '../types';

class SongMatchingService {
  selectSongForHeartRate(
    songs: SpotifyTrack[],
    heartRate: number,
    metadata: Map<string, AudioFeatures>,
    currentSongId?: string
  ): SpotifyTrack | null {
    if (songs.length === 0) return null;

    const targetBPM = heartRate;
    const targetEnergy = this.calculateTargetEnergy(heartRate);

    // Score all songs
    const scoredSongs = songs.map(song => {
      const trackId = song['Track URI'].split(':')[2];
      const features = metadata.get(trackId);
      
      if (!features) return { song, score: Infinity };

      // Calculate BPM match (weighted heavily)
      const bpmDiff = Math.abs(features.tempo - targetBPM);
      const normalizedBpmDiff = bpmDiff / targetBPM;
      
      // Energy level match
      const energyDiff = Math.abs(features.energy - targetEnergy);
      
      // Danceability bonus for higher heart rates
      const danceabilityBonus = heartRate > 120 ? features.danceability * 0.1 : 0;
      
      // Valence (positivity) bonus for higher heart rates
      const valenceBonus = heartRate > 140 ? features.valence * 0.1 : 0;

      // Calculate final score (lower is better)
      const score = (normalizedBpmDiff * 0.6) +    // 60% weight on BPM match
                   (energyDiff * 0.4) -            // 40% weight on energy match
                   danceabilityBonus -             // Bonus for danceable songs at high HR
                   valenceBonus;                   // Bonus for uplifting songs at high HR

      // Add penalty for current song to avoid repetition
      const isCurrent = currentSongId && trackId === currentSongId;
      const currentSongPenalty = isCurrent ? Infinity : 0;

      return { song, score: score + currentSongPenalty };
    });

    // Sort by score (lower is better)
    scoredSongs.sort((a, b) => a.score - b.score);

    // Get the best matching song (excluding current song)
    const bestMatch = scoredSongs[0];
    
    // Log the match quality for debugging
    if (bestMatch && bestMatch.score !== Infinity) {
      const features = metadata.get(bestMatch.song['Track URI'].split(':')[2]);
      console.log('Best match:', {
        song: bestMatch.song['Track Name'],
        score: bestMatch.score,
        targetBPM: targetBPM,
        songBPM: features?.tempo,
        targetEnergy: targetEnergy,
        songEnergy: features?.energy
      });
    }

    return bestMatch.song;
  }

  private calculateTargetEnergy(heartRate: number): number {
    // More granular energy mapping based on heart rate zones
    if (heartRate < 60) return 0.2;    // Very low intensity / rest
    if (heartRate < 80) return 0.3;    // Low intensity
    if (heartRate < 100) return 0.4;   // Light activity
    if (heartRate < 120) return 0.5;   // Moderate activity
    if (heartRate < 140) return 0.6;   // Cardio
    if (heartRate < 160) return 0.7;   // Intense
    if (heartRate < 180) return 0.8;   // Very intense
    return 0.9;                        // Maximum intensity
  }

  shouldChangeSong(
    currentSongId: string | undefined,
    heartRate: number,
    metadata: Map<string, AudioFeatures>
  ): boolean {
    if (!currentSongId) return true;

    const features = metadata.get(currentSongId);
    if (!features) return true;

    // Calculate how well the current song matches the heart rate
    const bpmDiff = Math.abs(features.tempo - heartRate);
    const normalizedBpmDiff = bpmDiff / heartRate;

    // Calculate energy mismatch
    const targetEnergy = this.calculateTargetEnergy(heartRate);
    const energyDiff = Math.abs(features.energy - targetEnergy);

    // Change song if either:
    // 1. BPM difference is more than 20%
    // 2. Energy level is significantly mismatched (more than 30%)
    return normalizedBpmDiff > 0.2 || energyDiff > 0.3;
  }
}

export default new SongMatchingService();