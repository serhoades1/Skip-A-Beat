class SpotifyPlayerService {
  async initialize(): Promise<void> {
    // No initialization needed for embed player
    return Promise.resolve();
  }

  async playTrack(trackUri: string): Promise<void> {
    // No direct playback control needed for embed player
    return Promise.resolve();
  }

  cleanup(): void {
    // No cleanup needed for embed player
  }
}

export default new SpotifyPlayerService();