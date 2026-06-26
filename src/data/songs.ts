import { Track, Playlist } from '../types';

// Helper to resolve cover and audio assets based on environment (AI Studio vs. static Vercel deployment)
export function getAssetUrl(localPath: string, driveId: string, type: 'image' | 'audio'): string {
  if (typeof window === 'undefined') {
    return localPath;
  }
  
  const hostname = window.location.hostname;
  // Check if we are running in the AI Studio container or local dev server
  const isDevOrPreview = 
    hostname === 'localhost' || 
    hostname === '127.0.0.1' || 
    hostname.includes('us-west2.run.app') ||
    hostname.includes('gitpod.io') ||
    hostname.includes('stackblitz.io');

  if (isDevOrPreview) {
    return localPath;
  } else {
    // Static hosting (Vercel) - direct Google Drive links bypass the missing Express backend
    if (type === 'image') {
      return `https://lh3.googleusercontent.com/d/${driveId}`;
    } else {
      return `https://docs.google.com/uc?export=download&id=${driveId}`;
    }
  }
}

// Helper to convert Google Drive sharing URLs to direct file links
export function getDirectDriveUrl(url: string, type: 'image' | 'audio'): string {
  if (!url) return '';
  if (!url.includes('drive.google.com')) return url;
  
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    const id = match[1];
    return type === 'image'
      ? `https://lh3.googleusercontent.com/d/${id}`
      : `https://docs.google.com/uc?export=download&id=${id}`;
  }
  
  const queryMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (queryMatch && queryMatch[1]) {
    const id = queryMatch[1];
    return type === 'image'
      ? `https://lh3.googleusercontent.com/d/${id}`
      : `https://docs.google.com/uc?export=download&id=${id}`;
  }
  
  return url;
}

const AUDIO_DRIVE_ID = '1JKcbSg-qApsUO7bnXoGS2LXKgZZGTdGl';
const COVER_DRIVE_ID = '1HuLyBZi7Kg1WsbhmrOvRAg7BuYGF3WCq';

export const TRACK_LIST: Track[] = [
  {
    id: 'track-1',
    title: 'Quem é Este?',
    artist: 'Cenáculo Music',
    album: 'Quem é Este? (Single)',
    coverUrl: '/quem_e_este_capa.jpg',
    audioUrl: '/quem_e_este.mp3',
    duration: 453,
    genre: 'Adoração',
    isNew: true,
    isPopular: true,
    lyrics: [
      { time: 0, text: '🎵 Quem é Este? - Cenáculo Music' },
      { time: 10, text: 'Quem é este que o vento e o mar Lhe obedecem?' },
      { time: 24, text: 'Quem é este que abre as portas do céu?' },
      { time: 38, text: 'Ele é o Rei da Glória, o Senhor dos Exércitos.' },
      { time: 52, text: 'Santo, Santo é o Seu nome!' },
      { time: 66, text: 'Toda terra canta de Sua glória!' },
      { time: 80, text: 'Ele reina com poder e majestade.' },
      { time: 94, text: 'Prostrados Lhe adoramos, ó Rei!' },
      { time: 110, text: 'Santo é o Senhor!' }
    ]
  }
];

export const SYSTEM_PLAYLISTS: Playlist[] = [
  {
    id: 'playlist-adoracao',
    name: 'Worship Nacional',
    description: 'Os melhores louvores e canções de adoração profunda da atualidade.',
    coverUrl: '/quem_e_este_capa.jpg',
    tracks: ['track-1'],
    type: 'system',
    creator: 'Celeiro Music',
    updatedAt: 'ATUALIZADA'
  },
  {
    id: 'playlist-gospel-pop',
    name: 'Gospel Pop & Hits',
    description: 'Sucessos modernos da música cristã contemporânea com energia.',
    coverUrl: '/quem_e_este_capa.jpg',
    tracks: ['track-1'],
    type: 'system',
    creator: 'Celeiro Music',
    updatedAt: 'ATUALIZADA'
  },
  {
    id: 'playlist-pentecostal',
    name: 'Fé e Pentecostal',
    description: 'Canções inspiradoras de fé, intimidade com Deus e avivamento.',
    coverUrl: '/quem_e_este_capa.jpg',
    tracks: ['track-1'],
    type: 'system',
    creator: 'Celeiro Music',
    updatedAt: 'NOVIDADE'
  }
];

export const RADIO_STATIONS: Playlist[] = [
  {
    id: 'radio-celeiro-gospel',
    name: 'Rádio Celeiro Worship',
    description: 'Louvor, adoração e palavra ao vivo 24 horas por dia.',
    coverUrl: '/quem_e_este_capa.jpg',
    tracks: ['track-1'],
    type: 'radio',
    stationHz: '93.3 FM'
  }
];
