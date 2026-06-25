import { Track, Playlist } from '../types';

export const TRACK_LIST: Track[] = [
  // COLUMN 1
  {
    id: 'track-1',
    title: 'Falta de Amor (Ao Vivo)',
    artist: 'Péricles, Ferrugem',
    album: 'As Vozes, Vol. 1 (Ao Vivo)',
    coverUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: 180,
    genre: 'Worship',
    lyrics: [
      { time: 0, text: '🎵 Falta de Amor - Ao Vivo' },
      { time: 5, text: 'Essa falta de amor tá me machucando...' }
    ]
  },
  {
    id: 'track-2',
    title: 'Saudade Inconveniente (Ao Vivo)',
    artist: 'Grupo Menos É Mais, Pablo',
    album: 'Churrasquinho',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: 195,
    genre: 'Worship',
    lyrics: [
      { time: 0, text: '🎵 Saudade Inconveniente' }
    ]
  },
  {
    id: 'track-3',
    title: 'Localiza Aí Bebê (Ao Vivo)',
    artist: 'João Bosco & Gabriel',
    album: 'Ao Vivo no Celeiro',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    duration: 165,
    genre: 'Pentecostal',
    lyrics: [
      { time: 0, text: '🎵 Localiza Aí Bebê' }
    ]
  },
  {
    id: 'track-4',
    title: 'Reggae Sua Fé',
    artist: 'Maneva',
    album: 'Caminho do Sol',
    coverUrl: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=400&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    duration: 210,
    genre: 'Worship',
    lyrics: [
      { time: 0, text: '🎵 Reggae Sua Fé' }
    ]
  },

  // COLUMN 2
  {
    id: 'track-5',
    title: 'Magnata (Refix)',
    artist: 'BaianaSystem, Queens Tafari, Ric...',
    album: 'Refixes',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    duration: 220,
    genre: 'Pentecostal',
    lyrics: [
      { time: 0, text: '🎵 Magnata' }
    ]
  },
  {
    id: 'track-6',
    title: 'FACE DOWN',
    artist: 'Key Glock',
    album: 'Glockoma 2',
    coverUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    duration: 155,
    genre: 'Pentecostal',
    isExplicit: true,
    lyrics: [
      { time: 0, text: '🎵 Face Down' }
    ]
  },
  {
    id: 'track-7',
    title: 'Moça Pra Casar (Ao Vivo)',
    artist: 'Diego & Victor Hugo',
    album: 'Ao Vivo',
    coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    duration: 170,
    genre: 'Worship',
    lyrics: [
      { time: 0, text: '🎵 Moça Pra Casar' }
    ]
  },
  {
    id: 'track-8',
    title: 'Algema de Seda (Ao Vivo)',
    artist: 'Thiago Aquino',
    album: 'Arrocha Premium',
    coverUrl: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=400&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    duration: 185,
    genre: 'Pentecostal',
    lyrics: [
      { time: 0, text: '🎵 Algema de Seda' }
    ]
  },

  // COLUMN 3
  {
    id: 'track-9',
    title: 'A Sunset (Live)',
    artist: 'Pulp',
    album: 'Live Session',
    coverUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    duration: 240,
    genre: 'Worship',
    lyrics: [
      { time: 0, text: '🎵 A Sunset' }
    ]
  },
  {
    id: 'track-10',
    title: 'Só Com Ela (Ao Vivo)',
    artist: 'Murilo Huff, Matheus Fernandes',
    album: 'Sertanejo Fest',
    coverUrl: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    duration: 175,
    genre: 'Pentecostal',
    lyrics: [
      { time: 0, text: '🎵 Só Com Ela' }
    ]
  },
  {
    id: 'track-11',
    title: 'TOTEM',
    artist: 'Tierra Whack',
    album: 'World Grime',
    coverUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
    duration: 145,
    genre: 'Pentecostal',
    isExplicit: true,
    lyrics: [
      { time: 0, text: '🎵 Totem' }
    ]
  },
  {
    id: 'track-12',
    title: 'Quando A Onda Passar',
    artist: 'Murilo Huff',
    album: 'Singles',
    coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
    duration: 190,
    genre: 'Worship',
    lyrics: [
      { time: 0, text: '🎵 Quando A Onda Passar' }
    ]
  },

  // COLUMN 4
  {
    id: 'track-13',
    title: 'Talking Dirty',
    artist: 'Chlöe, Timbaland',
    album: 'Presents',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
    duration: 200,
    genre: 'Worship',
    lyrics: [
      { time: 0, text: '🎵 Talking Dirty' }
    ]
  },
  {
    id: 'track-14',
    title: 'FIFA (Ao Vivo no Bondinho, RJ)',
    artist: 'Lagum',
    album: 'Ao Vivo no Bondinho',
    coverUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3',
    duration: 185,
    genre: 'Pentecostal',
    lyrics: [
      { time: 0, text: '🎵 FIFA' }
    ]
  },
  {
    id: 'track-15',
    title: 'Ripa Na Xulipa',
    artist: 'Young Franco, LF SYSTEM',
    album: 'House Club',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
    duration: 175,
    genre: 'Pentecostal',
    lyrics: [
      { time: 0, text: '🎵 Ripa Na Xulipa' }
    ]
  },
  {
    id: 'track-16',
    title: 'Man On A Mission (feat. Wizkid)',
    artist: 'Chris Brown',
    album: '11:11',
    coverUrl: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=400&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: 215,
    genre: 'Worship',
    isExplicit: true,
    lyrics: [
      { time: 0, text: '🎵 Man On A Mission' }
    ]
  }
];

export const SYSTEM_PLAYLISTS: Playlist[] = [
  {
    id: 'playlist-sertanejo',
    name: 'Sertanejo VIP',
    description: 'Apple Music: sertanejo',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    tracks: ['track-1', 'track-2', 'track-3', 'track-7', 'track-10', 'track-12'],
    type: 'system',
    creator: 'Apple Music: sertanejo',
    updatedAt: 'PLAYLIST ATUALIZADA'
  },
  {
    id: 'playlist-pop-nacional',
    name: 'Pop hits Brasil',
    description: 'Apple Music: pop nacional',
    coverUrl: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&auto=format&fit=crop&q=80',
    tracks: ['track-4', 'track-5', 'track-14', 'track-15', 'track-16'],
    type: 'system',
    creator: 'Apple Music: pop nacional',
    updatedAt: 'PLAYLIST ATUALIZADA'
  },
  {
    id: 'playlist-as-vozes',
    name: 'As Vozes, Vol. 1 (Ao Vivo)',
    description: 'Péricles & Ferrugem',
    coverUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&auto=format&fit=crop&q=80',
    tracks: ['track-1', 'track-2', 'track-8', 'track-9', 'track-13'],
    type: 'system',
    creator: 'Péricles & Ferrugem',
    updatedAt: 'NOVO ÁLBUM'
  }
];

export const RADIO_STATIONS: Playlist[] = [
  {
    id: 'radio-celeiro-fm',
    name: 'Rádio Celeiro FM',
    description: 'Sertanejo, Modões e Pagode ao Vivo.',
    coverUrl: 'https://images.unsplash.com/photo-1484755560693-a4074577af3a?w=400&auto=format&fit=crop&q=80',
    tracks: ['track-1', 'track-2', 'track-3', 'track-7'],
    type: 'radio',
    stationHz: '102.3 MHz'
  }
];
