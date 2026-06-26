import { Track, Playlist } from '../types';

export function isSongLocked(trackId: string): boolean {
  if (trackId !== 'track-1') return false;
  const releaseTime = new Date('2026-07-16T12:00:00');
  const now = new Date();
  return now < releaseTime;
}

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
      return `/api/stream-audio?id=${driveId}`;
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

const AUDIO_O_ALTAR_DRIVE_ID = '1CuwSkKC_f1gd3sC9_zHc8akL2EqLUaaP';
const COVER_O_ALTAR_DRIVE_ID = '1fVT7J-TBsVBfcQYoSCJ5RIRyZSZ7P87E';

export const TRACK_LIST: Track[] = [
  {
    id: 'track-1',
    title: 'Quem é Este?',
    artist: 'Cenáculo Music',
    album: 'Quem é Este? (Single)',
    coverUrl: getAssetUrl('/quem_e_este_capa.jpg', COVER_DRIVE_ID, 'image'),
    audioUrl: getAssetUrl('/quem_e_este.mp3', AUDIO_DRIVE_ID, 'audio'),
    duration: 453,
    genre: 'Adoração',
    isNew: true,
    isPopular: true,
    lyrics: [
      { time: 0, text: "Quem é Este que o vento e o mar obedecem?" },
      { time: 10, text: "Quem é Este que a tempestade faz calar?" },
      { time: 20, text: "Quem é Este que cura o meu pranto e traz calmaria?" },
      { time: 30, text: "Quem é Este?" },
      { time: 35, text: "" },
      { time: 40, text: "Ele é o Santo!" },
      { time: 45, text: "Deus forte e valente!" },
      { time: 50, text: "Grande e temível" },
      { time: 55, text: "Ninguém se levanta à Sua frente!" },
      { time: 60, text: "" },
      { time: 65, text: "Ele é o Santo!" },
      { time: 70, text: "Deus forte e valente!" },
      { time: 75, text: "Grande e temível" },
      { time: 80, text: "Ninguém se levanta à Sua frente!" },
      { time: 85, text: "" },
      { time: 90, text: "Quem é Este que sara as minhas feridas?" },
      { time: 100, text: "Quem é Este que derrama graça nas minhas quedas?" },
      { time: 110, text: "Quem é Este que cura o meu pranto e traz calmaria?" },
      { time: 120, text: "Quem é Este?" },
      { time: 125, text: "" },
      { time: 130, text: "Ele é o Santo!" },
      { time: 135, text: "Deus forte e valente!" },
      { time: 140, text: "Grande e temível" },
      { time: 145, text: "Ninguém se levanta à Sua frente!" },
      { time: 150, text: "" },
      { time: 155, text: "Ele é o Santo!" },
      { time: 160, text: "Deus forte e valente!" },
      { time: 165, text: "Grande e temível" },
      { time: 170, text: "Ninguém se levanta à Sua frente!" },
      { time: 175, text: "" },
      { time: 180, text: "Ele é o Santo!" },
      { time: 185, text: "Deus forte e valente!" },
      { time: 190, text: "Grande e temível" },
      { time: 195, text: "Ninguém se levanta à Sua frente!" },
      { time: 200, text: "" },
      { time: 205, text: "(Ninguém se levanta à Sua frente! Quem é Este? Ninguém se levanta à Sua frente!)" },
      { time: 215, text: "" },
      { time: 220, text: "Onipotente, incomensurável!" },
      { time: 225, text: "Digno de glória, indescritível!" },
      { time: 230, text: "" },
      { time: 235, text: "Onipotente, incomensurável!" },
      { time: 240, text: "Digno de glória, indescritível!" },
      { time: 245, text: "" },
      { time: 250, text: "Onipotente, incomensurável!" },
      { time: 255, text: "Digno de glória, indescritível!" },
      { time: 260, text: "" },
      { time: 265, text: "Onipotente, incomensurável!" },
      { time: 270, text: "Digno de glória, indescritível!" },
      { time: 275, text: "" },
      { time: 280, text: "Ele é Yeshua Hamashiach!" },
      { time: 288, text: "O Grande Hebreu, o Messias!" },
      { time: 296, text: "" },
      { time: 300, text: "Ele é Yeshua Hamashiach!" },
      { time: 308, text: "O Grande Hebreu, o Messias!" },
      { time: 316, text: "" },
      { time: 320, text: "Ele é o Santo!" },
      { time: 325, text: "Deus forte e valente!" },
      { time: 330, text: "Grande e temível" },
      { time: 335, text: "Ninguém se levanta à Sua frente!" },
      { time: 340, text: "" },
      { time: 345, text: "Ele é o Santo!" },
      { time: 350, text: "Deus forte e valente!" },
      { time: 355, text: "Grande e temível" },
      { time: 360, text: "Ninguém se levanta à Sua frente!" },
      { time: 365, text: "" },
      { time: 370, text: "“Não, não há quem possa resistir à Sua presença! Ao Poderoso de Israel, ao Leão da Tribo de Judá! Erga a sua voz neste lugar e adore Aquele cujo nome reina acima de todo nome por séculos e séculos! Alguém profetiza e declare comigo hoje: Tu és Onipotente!”" },
      { time: 395, text: "" },
      { time: 400, text: "Onipotente, incomensurável, Ele é adorável!" },
      { time: 405, text: "Soberano sobre a história, inigualável, incomparável!" },
      { time: 410, text: "" },
      { time: 413, text: "Ele é Yeshua Hamashiach!" },
      { time: 416, text: "O Grande Hebreu, o Messias!" },
      { time: 420, text: "" },
      { time: 422, text: "Ele é o Santo..." },
      { time: 425, text: "Deus forte e valente..." },
      { time: 428, text: "Grande e temível" },
      { time: 431, text: "Ninguém se levanta à Sua frente." },
      { time: 434, text: "" },
      { time: 436, text: "Ele é o Santo..." },
      { time: 438, text: "Deus forte e valente..." },
      { time: 440, text: "Grande e temível" },
      { time: 442, text: "Ninguém se levanta à Sua frente." },
      { time: 444, text: "" },
      { time: 445, text: "Ele é o Santo!" },
      { time: 446, text: "Deus forte e valente!" },
      { time: 447, text: "Grande e temível" },
      { time: 448, text: "Ninguém se levanta à Sua frente!" },
      { time: 449, text: "" },
      { time: 450, text: "Ele é o Santo!" },
      { time: 451, text: "Deus forte e valente!" },
      { time: 452, text: "Grande e temível" },
      { time: 453, text: "Ninguém se levanta à Sua frente!" },
      { time: 454, text: "" },
      { time: 455, text: "Ninguém se levanta à Sua frente..." },
      { time: 458, text: "Ninguém se levanta à Sua frente..." },
      { time: 461, text: "À Sua frente." }
    ]
  },
  {
    id: 'track-2',
    title: 'O Altar Está Pronto',
    artist: 'Cenáculo Music',
    album: 'O Altar Está Pronto (Single)',
    coverUrl: getAssetUrl('/o_altar_esta_pronto_capa.jpg', COVER_O_ALTAR_DRIVE_ID, 'image'),
    audioUrl: getAssetUrl('/o_altar_esta_pronto.mp3', AUDIO_O_ALTAR_DRIVE_ID, 'audio'),
    duration: 355,
    genre: 'Adoração',
    isNew: true,
    isPopular: true,
    lyrics: [
      { time: 0, text: "Sinto um tremor que vem do chão" },
      { time: 5, text: "Um som que invade o coração" },
      { time: 10, text: "Não é apenas movimento ou emoção" },
      { time: 15, text: "É a promessa de uma nova unção" },
      { time: 20, text: "Eu vejo o brilho da glória descer" },
      { time: 25, text: "O céu se abre, eu posso perceber" },
      { time: 30, text: "O selo do Espírito a nos envolver" },
      { time: 35, text: "O que era frio hoje vai arder" },
      { time: 40, text: "" },
      { time: 42, text: "Nossa oferta já está no altar" },
      { time: 47, text: "O sacrifício pronto pra queimar" },
      { time: 52, text: "O vento impetuoso pode soprar" },
      { time: 57, text: "Vem esse lugar incendiar!" },
      { time: 62, text: "" },
      { time: 65, text: "Derrama o fogo, batiza outra vez" },
      { time: 70, text: "Queremos a glória que o mundo não vê" },
      { time: 75, text: "Consome o orgulho, refaz o meu ser" },
      { time: 80, text: "Espírito Santo, vem nos envolver!" },
      { time: 85, text: "" },
      { time: 88, text: "Derrama o fogo, batiza outra vez" },
      { time: 93, text: "Queremos a glória que o mundo não vê" },
      { time: 98, text: "Consome o orgulho, refaz o meu ser" },
      { time: 103, text: "Espírito Santo, vem nos envolver!" },
      { time: 108, text: "" },
      { time: 112, text: "Sinto um tremor que vem do chão" },
      { time: 117, text: "Um som que invade o coração" },
      { time: 122, text: "Não é apenas movimento ou emoção" },
      { time: 127, text: "É a promessa de uma nova unção" },
      { time: 132, text: "" },
      { time: 135, text: "Derrama o fogo, batiza outra vez" },
      { time: 140, text: "Queremos a glória que o mundo não vê" },
      { time: 145, text: "Consome o orgulho, refaz o meu ser" },
      { time: 150, text: "Espírito Santo, vem nos envolver!" },
      { time: 155, text: "" },
      { time: 160, text: "Há uma lenha separada!" },
      { time: 164, text: "Há uma brasa preparada!" },
      { time: 168, text: "Onde o fogo cair, a vida vai brotar" },
      { time: 172, text: "Ninguém vai conseguir nos segurar!" },
      { time: 176, text: "" },
      { time: 180, text: "Há uma lenha separada!" },
      { time: 184, text: "Há uma brasa preparada!" },
      { time: 188, text: "Onde o fogo cair, a vida vai brotar" },
      { time: 192, text: "Ninguém vai conseguir nos segurar!" },
      { time: 196, text: "" },
      { time: 200, text: "Há uma lenha separada!" },
      { time: 204, text: "Há uma brasa preparada!" },
      { time: 208, text: "Onde o fogo cair, a vida vai brotar" },
      { time: 212, text: "Ninguém vai conseguir nos segurar!" },
      { time: 216, text: "" },
      { time: 220, text: "Vem queimar! Vem batizar!" },
      { time: 224, text: "Vem queimar! Vem batizar!" },
      { time: 228, text: "O fogo não se apagará!" },
      { time: 232, text: "Vem queimar! Vem batizar!" },
      { time: 236, text: "Vem queimar! Vem batizar!" },
      { time: 240, text: "O fogo não se apagará!" },
      { time: 244, text: "" },
      { time: 248, text: "AVIVA ESTA GERAÇÃO!" },
      { time: 252, text: "AVIVA ESTA NAÇÃO!" },
      { time: 256, text: "ACENDE O FOGO, ACENDE O FOGO!" },
      { time: 260, text: "BATIZA COM FOGO!" },
      { time: 264, text: "" },
      { time: 268, text: "AVIVA ESTA GERAÇÃO!" },
      { time: 272, text: "AVIVA ESTA NAÇÃO!" },
      { time: 276, text: "ACENDE O FOGO, ACENDE O FOGO!" },
      { time: 280, text: "BATIZA COM FOGO!" },
      { time: 284, text: "" },
      { time: 288, text: "Me batiza com fogo!" },
      { time: 292, text: "Reacende a chama em mim!" },
      { time: 296, text: "Me batiza com fogo!" },
      { time: 300, text: "Reacende a chama em mim!" },
      { time: 304, text: "" },
      { time: 308, text: "Acende outra vez..." },
      { time: 312, text: "Acende outra vez..." },
      { time: 316, text: "Tua chama em nós..." },
      { time: 320, text: "Amém." }
    ]
  }
];

export const SYSTEM_PLAYLISTS: Playlist[] = [
  {
    id: 'playlist-adoracao',
    name: 'Worship Nacional',
    description: 'Os melhores louvores e canções de adoração profunda da atualidade.',
    coverUrl: getAssetUrl('/quem_e_este_capa.jpg', COVER_DRIVE_ID, 'image'),
    tracks: ['track-1', 'track-2'],
    type: 'system',
    creator: 'Celeiro Music',
    updatedAt: 'ATUALIZADA'
  },
  {
    id: 'playlist-gospel-pop',
    name: 'Gospel Pop & Hits',
    description: 'Sucessos modernos da música cristã contemporânea com energia.',
    coverUrl: getAssetUrl('/quem_e_este_capa.jpg', COVER_DRIVE_ID, 'image'),
    tracks: ['track-1', 'track-2'],
    type: 'system',
    creator: 'Celeiro Music',
    updatedAt: 'ATUALIZADA'
  },
  {
    id: 'playlist-pentecostal',
    name: 'Fé e Pentecostal',
    description: 'Canções inspiradoras de fé, intimidade com Deus e avivamento.',
    coverUrl: getAssetUrl('/quem_e_este_capa.jpg', COVER_DRIVE_ID, 'image'),
    tracks: ['track-1', 'track-2'],
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
    coverUrl: getAssetUrl('/quem_e_este_capa.jpg', COVER_DRIVE_ID, 'image'),
    tracks: ['track-1', 'track-2'],
    type: 'radio',
    stationHz: '93.3 FM'
  }
];
