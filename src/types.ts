export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  audioUrl: string;
  duration: number; // in seconds
  lyrics: LyricLine[];
  genre: string;
  isPopular?: boolean;
  isNew?: boolean;
  isExplicit?: boolean;
  featuredText?: string;
  lyricsWriter?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  tracks: string[]; // Track IDs
  type: 'system' | 'custom' | 'radio';
  creator?: string;
  updatedAt?: string;
  stationHz?: string; // used for Radio view to look like a true FM dial
}

export interface AppState {
  currentTrackId: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  queue: string[]; // List of Track IDs
  playbackHistory: string[]; // List of Track IDs
  isShuffle: boolean;
  repeatMode: 'none' | 'all' | 'one';
  activeTab: 'home' | 'browse' | 'radio' | 'library-playlists' | 'library-favorites' | 'library-offline';
  selectedPlaylistId: string | null; // For viewing a playlist detail
  selectedArtistName: string | null; // For viewing an artist detail
  searchQuery: string;
  favorites: string[]; // Track IDs
  downloaded: string[]; // Track IDs
  offlineMode: boolean; // Simulator for Offline mode
  customPlaylists: Playlist[];
}
