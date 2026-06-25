import { Track, Playlist } from '../types';

export const TRACK_LIST: Track[] = [
  // COLUMN 1
  {
    id: 'track-1',
    title: 'A Casa É Sua',
    artist: 'Casa Worship',
    album: 'A Casa É Sua (Ao Vivo)',
    coverUrl: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=400&auto=format&fit=crop&q=80', // church / worship background
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: 180,
    genre: 'Adoração',
    lyrics: [
      { time: 0, text: '🎵 A Casa É Sua - Casa Worship' },
      { time: 5, text: 'Essa casa é sua casa, nós deixamos ela pra Você...' },
      { time: 15, text: 'Apareça, que o Teu nome cresça...' }
    ]
  },
  {
    id: 'track-2',
    title: 'Lugar Secreto',
    artist: 'Gabriela Rocha',
    album: 'Céu (Ao Vivo)',
    coverUrl: 'https://images.unsplash.com/photo-1442468989248-8415785a93dd?w=400&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: 195,
    genre: 'Adoração',
    lyrics: [
      { time: 0, text: '🎵 Lugar Secreto - Gabriela Rocha' },
      { time: 5, text: 'Tu és tudo o que eu mais quero, o meu fôlego, meu tudo...' }
    ]
  },
  {
    id: 'track-3',
    title: 'Galileu',
    artist: 'Fernandinho',
    album: 'Galileu (Ao Vivo)',
    coverUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    duration: 165,
    genre: 'Gospel Pop',
    lyrics: [
      { time: 0, text: '🎵 Galileu - Fernandinho' },
      { time: 5, text: 'Cristo, Cordeiro de Deus, que tira o pecado do mundo...' }
    ]
  },
  {
    id: 'track-4',
    title: 'Ninguém Explica Deus',
    artist: 'Preto no Branco, Gabriela Rocha',
    album: 'Preto no Branco (Ao Vivo)',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    duration: 210,
    genre: 'Gospel Pop',
    lyrics: [
      { time: 0, text: '🎵 Ninguém Explica Deus' },
      { time: 5, text: 'Nada é igual ao Seu redor, tudo se curva com o Teu falar...' }
    ]
  },

  // COLUMN 2
  {
    id: 'track-5',
    title: 'É Tudo Sobre Você',
    artist: 'Morada',
    album: 'Lembre-se (Ao Vivo)',
    coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    duration: 220,
    genre: 'Adoração',
    lyrics: [
      { time: 0, text: '🎵 É Tudo Sobre Você - Morada' }
    ]
  },
  {
    id: 'track-6',
    title: 'Ressuscita-me',
    artist: 'Aline Barros',
    album: 'Extraordinária Graça',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    duration: 155,
    genre: 'Pentecostal',
    lyrics: [
      { time: 0, text: '🎵 Ressuscita-me - Aline Barros' }
    ]
  },
  {
    id: 'track-7',
    title: 'Caminho no Deserto',
    artist: 'Soraya Moraes',
    album: 'Caminho no Deserto',
    coverUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    duration: 170,
    genre: 'Adoração',
    lyrics: [
      { time: 0, text: '🎵 Caminho no Deserto (Way Maker)' }
    ]
  },
  {
    id: 'track-8',
    title: 'Advogado Fiel',
    artist: 'Bruna Karla',
    album: 'Advogado Fiel',
    coverUrl: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=400&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    duration: 185,
    genre: 'Pentecostal',
    lyrics: [
      { time: 0, text: '🎵 Advogado Fiel - Bruna Karla' }
    ]
  },

  // COLUMN 3
  {
    id: 'track-9',
    title: 'Hey Pai',
    artist: 'Isadora Pompeo, Marcela Taís',
    album: 'Pra Te Contar Meus Segredos',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    duration: 240,
    genre: 'Gospel Pop',
    lyrics: [
      { time: 0, text: '🎵 Hey Pai - Isadora Pompeo' }
    ]
  },
  {
    id: 'track-10',
    title: 'Arde Outra Vez',
    artist: 'Thalles Roberto',
    album: 'Uma História Escrita pelo Dedo de Deus',
    coverUrl: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=400&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    duration: 175,
    genre: 'Adoração',
    lyrics: [
      { time: 0, text: '🎵 Arde Outra Vez - Thalles' }
    ]
  },
  {
    id: 'track-11',
    title: 'Filho do Deus Vivo',
    artist: 'Nívea Soares',
    album: 'Reino de Justiça (Ao Vivo)',
    coverUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
    duration: 145,
    genre: 'Adoração',
    lyrics: [
      { time: 0, text: '🎵 Filho do Deus Vivo' }
    ]
  },
  {
    id: 'track-12',
    title: 'A Ele a Glória',
    artist: 'Diante do Trono',
    album: 'Preciso de Ti',
    coverUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
    duration: 190,
    genre: 'Adoração',
    lyrics: [
      { time: 0, text: '🎵 A Ele a Glória - Diante do Trono' }
    ]
  },

  // COLUMN 4
  {
    id: 'track-13',
    title: 'Oh Quão Lindo Esse Nome É',
    artist: 'Kemuel',
    album: 'Kemuel Worship',
    coverUrl: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
    duration: 200,
    genre: 'Adoração',
    lyrics: [
      { time: 0, text: '🎵 Oh Quão Lindo Esse Nome É' }
    ]
  },
  {
    id: 'track-14',
    title: 'Todavia Me Alegrarei',
    artist: 'Samuel Miranda',
    album: 'Singles',
    coverUrl: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=400&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3',
    duration: 185,
    genre: 'Pentecostal',
    lyrics: [
      { time: 0, text: '🎵 Todavia Me Alegrarei' }
    ]
  },
  {
    id: 'track-15',
    title: 'Abba',
    artist: 'Laura Souguellis',
    album: 'Fornalha Laura Souguellis',
    coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
    duration: 175,
    genre: 'Adoração',
    lyrics: [
      { time: 0, text: '🎵 Abba - Laura Souguellis' }
    ]
  },
  {
    id: 'track-16',
    title: 'Escudo',
    artist: 'Voz da Verdade',
    album: 'O Melhor de Deus',
    coverUrl: 'https://images.unsplash.com/photo-1484755560693-a4074577af3a?w=400&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: 215,
    genre: 'Pentecostal',
    lyrics: [
      { time: 0, text: '🎵 Escudo - Voz da Verdade' }
    ]
  }
];

export const SYSTEM_PLAYLISTS: Playlist[] = [
  {
    id: 'playlist-adoracao',
    name: 'Worship Nacional',
    description: 'Os melhores louvores e canções de adoração profunda da atualidade.',
    coverUrl: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=800&auto=format&fit=crop&q=80',
    tracks: ['track-1', 'track-2', 'track-5', 'track-7', 'track-10', 'track-11', 'track-13'],
    type: 'system',
    creator: 'Celeiro Music',
    updatedAt: 'PLAYLIST ATUALIZADA'
  },
  {
    id: 'playlist-gospel-pop',
    name: 'Gospel Pop & Hits',
    description: 'Sucessos modernos da música cristã contemporânea com energia.',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    tracks: ['track-3', 'track-4', 'track-9', 'track-15'],
    type: 'system',
    creator: 'Celeiro Music',
    updatedAt: 'PLAYLIST ATUALIZADA'
  },
  {
    id: 'playlist-pentecostal',
    name: 'Fé e Pentecostal',
    description: 'Canções inspiradoras de fé, intimidade com Deus e avivamento.',
    coverUrl: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&auto=format&fit=crop&q=80',
    tracks: ['track-6', 'track-8', 'track-14', 'track-16'],
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
    coverUrl: 'https://images.unsplash.com/photo-1484755560693-a4074577af3a?w=400&auto=format&fit=crop&q=80',
    tracks: ['track-1', 'track-2', 'track-5', 'track-13'],
    type: 'radio',
    stationHz: '93.3 FM'
  }
];
