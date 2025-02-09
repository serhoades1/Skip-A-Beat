import { SpotifyTrack, AudioFeatures } from '../types';
import WebSocketService from './WebSocketService';

class SongMatchingService {
  private songPool: SpotifyTrack[] = [];
  private lastSelectedSongs: Set<string> = new Set();
  private readonly MAX_HISTORY = 5;
  private readonly BPM_THRESHOLD = 4; // ±4 BPM for strict 8-point range
  private readonly ENERGY_WEIGHT = 0.3;
  private readonly DANCEABILITY_WEIGHT = 0.2;
  private readonly VALENCE_WEIGHT = 0.1;
  private readonly BPM_WEIGHT = 0.4;

  constructor() {
    WebSocketService.connect();
    WebSocketService.onRecommendations((data) => {
      if (data.songs) {
        this.updateSongPool(data.songs);
      }
    });
  }

  private updateSongPool(recommendations: any[]): void {
    const recommendedSongs = recommendations.map(rec => {
      return this.songPool.find(song => 
        song['Track URI'].split(':')[2] === rec.track_id
      );
    }).filter((song): song is SpotifyTrack => song !== undefined);

    if (recommendedSongs.length > 0) {
      this.songPool = recommendedSongs;
      this.lastSelectedSongs.clear();
    }
  }

  private getBpmRange(heartRate: number): [number, number] {
    // Strict ±4 BPM range
    return [
      Math.max(40, heartRate - this.BPM_THRESHOLD),
      Math.min(200, heartRate + this.BPM_THRESHOLD)
    ];
  }

  private getSongsInBpmRange(
    songs: SpotifyTrack[],
    heartRate: number,
    metadata: Map<string, AudioFeatures>
  ): SpotifyTrack[] {
    const [minBPM, maxBPM] = this.getBpmRange(heartRate);
    
    return songs.filter(song => {
      const trackId = song['Track URI'].split(':')[2];
      const features = metadata.get(trackId);
      if (!features) return false;

      const bpm = features.tempo;
      return bpm >= minBPM && bpm <= maxBPM;
    });
  }

  selectSongForHeartRate(
    songs: SpotifyTrack[],
    heartRate: number,
    metadata: Map<string, AudioFeatures>,
    currentSongId?: string
  ): SpotifyTrack | null {
    if (songs.length === 0) return null;

    // Get songs within the strict BPM range
    let matchingSongs = this.getSongsInBpmRange(songs, heartRate, metadata);

    // If no songs in range, slightly expand it
    if (matchingSongs.length === 0) {
      const expandedThreshold = this.BPM_THRESHOLD + 2;
      matchingSongs = songs.filter(song => {
        const trackId = song['Track URI'].split(':')[2];
        const features = metadata.get(trackId);
        if (!features) return false;

        return Math.abs(features.tempo - heartRate) <= expandedThreshold;
      });
    }

    // If still no songs, use all songs
    if (matchingSongs.length === 0) {
      matchingSongs = songs;
    }

    // Filter out recently played songs
    const availableSongs = matchingSongs.filter(song => 
      !this.lastSelectedSongs.has(song['Track URI'])
    );

    // Use available songs if we have enough, otherwise use all matching songs
    const poolToUse = availableSongs.length >= 2 ? availableSongs : matchingSongs;

    // Score and sort songs
    const scoredSongs = poolToUse.map(song => {
      const trackId = song['Track URI'].split(':')[2];
      const features = metadata.get(trackId);
      if (!features) return { song, score: -Infinity };

      const score = this.calculateSongScore(features, heartRate);
      return { song, score };
    }).sort((a, b) => b.score - a.score);

    // Select one of the top songs randomly for variety
    const topSongs = scoredSongs.slice(0, Math.min(3, scoredSongs.length));
    const selectedSong = topSongs[Math.floor(Math.random() * topSongs.length)].song;

    // Update history
    this.lastSelectedSongs.add(selectedSong['Track URI']);
    if (this.lastSelectedSongs.size > this.MAX_HISTORY) {
      const [firstItem] = this.lastSelectedSongs;
      this.lastSelectedSongs.delete(firstItem);
    }

    return selectedSong;
  }

  private calculateSongScore(features: AudioFeatures, targetHeartRate: number): number {
    // BPM match (weighted heavily)
    const bpmDiff = Math.abs(features.tempo - targetHeartRate);
    const bpmScore = Math.max(0, 1 - (bpmDiff / this.BPM_THRESHOLD));

    // Energy score based on heart rate intensity
    const targetEnergy = this.calculateTargetEnergy(targetHeartRate);
    const energyScore = 1 - Math.abs(features.energy - targetEnergy);

    // Weighted sum of all factors
    return (
      bpmScore * this.BPM_WEIGHT +
      energyScore * this.ENERGY_WEIGHT +
      features.danceability * this.DANCEABILITY_WEIGHT +
      features.valence * this.VALENCE_WEIGHT
    );
  }

  private calculateTargetEnergy(heartRate: number): number {
    // More granular energy mapping
    if (heartRate < 60) return 0.3;       // Rest
    if (heartRate < 75) return 0.4;       // Very light
    if (heartRate < 90) return 0.5;       // Light
    if (heartRate < 105) return 0.6;      // Light-moderate
    if (heartRate < 120) return 0.7;      // Moderate
    if (heartRate < 135) return 0.8;      // Moderate-vigorous
    if (heartRate < 150) return 0.85;     // Vigorous
    return 0.9;                           // Peak
  }

  shouldChangeSong(
    currentSongId: string | undefined,
    heartRate: number,
    metadata: Map<string, AudioFeatures>
  ): boolean {
    // Always change if no current song
    if (!currentSongId) return true;

    const features = metadata.get(currentSongId);
    if (!features) return true;

    // Get current BPM range
    const [minBPM, maxBPM] = this.getBpmRange(heartRate);

    // Immediately change if current song's BPM is outside the strict range
    const currentBPM = features.tempo;
    if (currentBPM < minBPM || currentBPM > maxBPM) {
      console.log('Song BPM out of range:', {
        currentBPM,
        heartRate,
        range: [minBPM, maxBPM],
        difference: Math.abs(currentBPM - heartRate)
      });
      return true;
    }

    return false;
  }
}

export default new SongMatchingService();