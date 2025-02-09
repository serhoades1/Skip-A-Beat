import { Song, HeartRateZone } from '@/types';

const HEART_RATE_ZONES: HeartRateZone[] = [
  {
    min: 40,
    max: 60,
    name: 'Rest',
    description: 'Deep relaxation & recovery',
    musicPreferences: {
      minBPM: 60,
      maxBPM: 80,
      minEnergy: 0.1,
      minValence: 0.3,
      minDanceability: 0.2
    }
  },
  {
    min: 61,
    max: 90,
    name: 'Light',
    description: 'Light activity & warm-up',
    musicPreferences: {
      minBPM: 80,
      maxBPM: 110,
      minEnergy: 0.3,
      minValence: 0.4,
      minDanceability: 0.4
    }
  },
  {
    min: 91,
    max: 120,
    name: 'Moderate',
    description: 'Steady state cardio',
    musicPreferences: {
      minBPM: 110,
      maxBPM: 130,
      minEnergy: 0.5,
      minValence: 0.5,
      minDanceability: 0.6
    }
  },
  {
    min: 121,
    max: 150,
    name: 'Vigorous',
    description: 'High intensity workout',
    musicPreferences: {
      minBPM: 130,
      maxBPM: 150,
      minEnergy: 0.7,
      minValence: 0.6,
      minDanceability: 0.7
    }
  },
  {
    min: 151,
    max: 180,
    name: 'Peak',
    description: 'Maximum effort',
    musicPreferences: {
      minBPM: 150,
      maxBPM: 180,
      minEnergy: 0.8,
      minValence: 0.7,
      minDanceability: 0.8
    }
  }
];

class MusicMatcher {
  private getCurrentZone(heartRate: number): HeartRateZone {
    return HEART_RATE_ZONES.find(
      zone => heartRate >= zone.min && heartRate <= zone.max
    ) || HEART_RATE_ZONES[2];
  }

  private calculateSongScore(song: Song, zone: HeartRateZone): number {
    const { musicPreferences } = zone;
    
    const bpmScore = 1 - (Math.abs(song.bpm - ((musicPreferences.minBPM + musicPreferences.maxBPM) / 2)) / 100);
    const energyScore = song.energy >= musicPreferences.minEnergy ? song.energy : 0;
    const valenceScore = song.valence >= musicPreferences.minValence ? song.valence : 0;
    const danceScore = song.danceability >= musicPreferences.minDanceability ? song.danceability : 0;

    return (
      (bpmScore * 0.4) +
      (energyScore * 0.3) +
      (valenceScore * 0.15) +
      (danceScore * 0.15)
    );
  }

  findMatchingSongs(songs: Song[], heartRate: number, count: number = 5): Song[] {
    const currentZone = this.getCurrentZone(heartRate);
    
    const songScores = songs.map(song => ({
      song,
      score: this.calculateSongScore(song, currentZone)
    }));

    return songScores
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map(item => item.song);
  }

  findMatchingSong(songs: Song[], heartRate: number): Song {
    return this.findMatchingSongs(songs, heartRate, 1)[0];
  }

  getCurrentZoneInfo(heartRate: number): HeartRateZone {
    return this.getCurrentZone(heartRate);
  }
}

export const musicMatcher = new MusicMatcher();