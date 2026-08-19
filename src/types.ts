export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  coverUrl: string;
  audioUrl: string;
  youtubeId: string;
  youtubeUrl?: string;
  spotifyUrl?: string;
  vibeTag?: string;
}

export interface Playlist {
  id: string;
  name: string;
  tagline: string;
  coverImage: string;
  trackCount: number;
  tracks: Track[];
  externalUrl?: string;
}

export type ActiveModal = 'none' | 'playlists' | 'songs' | 'install' | 'qrcode';
export type DeviceView = 'laptop' | 'mobile';
