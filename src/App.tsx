import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Shuffle, 
  Repeat, 
  Heart, 
  Download, 
  Plus, 
  ListPlus,
  Volume2,
  Trash2,
  AlertCircle,
  FolderHeart,
  FolderPlus,
  ChevronLeft,
  ChevronRight,
  Disc,
  ArrowRight,
  Sparkles,
  Radio,
  Clock,
  Music,
  CheckCircle,
  Check,
  PlusCircle,
  Settings,
  WifiOff,
  MoreHorizontal,
  Search,
  MinusCircle,
  Loader2,
  Lock
} from 'lucide-react';

import { Track, Playlist, AppState } from './types';
import { TRACK_LIST, SYSTEM_PLAYLISTS, RADIO_STATIONS, isSongLocked } from './data/songs';
import { audioSynthInstance } from './utils/audioSynth';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TrackRow from './components/TrackRow';
import SongCard from './components/SongCard';
import BottomPlayer from './components/BottomPlayer';
import FullScreenPlayer from './components/FullScreenPlayer';
import LoginModal from './components/LoginModal';
import ProfileModal from './components/ProfileModal';
import PlaylistModal from './components/PlaylistModal';
import { userDataService } from './lib/supabase';

const DEFAULT_PLAY_COUNTS: Record<string, number> = {};

const formatPlayCount = (count: number): string => {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1).replace('.0', '') + 'M';
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace('.0', '') + 'k';
  }
  return count.toString();
};

export default function App() {
  // --- Persistent Local States ---
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('celeiro_favorites');
    return saved ? JSON.parse(saved) : ['track-1', 'track-6', 'track-10']; // pre-favorite some beautiful folk/pagode
  });

  const [playCounts, setPlayCounts] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('celeiro_play_counts_real');
    return saved ? JSON.parse(saved) : DEFAULT_PLAY_COUNTS;
  });

  const [downloaded, setDownloaded] = useState<string[]>(() => {
    const saved = localStorage.getItem('celeiro_downloaded');
    return saved ? JSON.parse(saved) : ['track-1', 'track-11']; // pre-download track 1 and lofi for offline preview
  });

  const [customPlaylists, setCustomPlaylists] = useState<Playlist[]>(() => {
    const saved = localStorage.getItem('celeiro_custom_playlists');
    return saved ? JSON.parse(saved) : [];
  });

  // --- App Playback & Navigation States ---
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(() => {
    const saved = localStorage.getItem('celeiro_volume');
    return saved ? parseFloat(saved) : 0.6;
  });
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'all' | 'one'>('none');
  const [activeTab, setActiveTab] = useState<'home' | 'browse' | 'radio' | 'library-playlists' | 'library-favorites' | 'library-offline' | 'search'>('browse');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [offlineMode, setOfflineMode] = useState<boolean>(false);
  
  // Panels/Drawers
  const [isFullScreenOpen, setIsFullScreenOpen] = useState<boolean>(false);
  const [isQueueDrawerOpen, setIsQueueDrawerOpen] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Playback Queue State
  const [queue, setQueue] = useState<string[]>([]);
  const [playbackHistory, setPlaybackHistory] = useState<string[]>([]);
  const [synthActive, setSynthActive] = useState<boolean>(false);

  // Gemini Daily Recommendations State
  const [recommendedTrackIds, setRecommendedTrackIds] = useState<string[]>([]);
  const [recommendationsJustification, setRecommendationsJustification] = useState<string>('');
  const [loadingRecommendations, setLoadingRecommendations] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    const fetchRecommendations = async () => {
      setLoadingRecommendations(true);
      try {
        const response = await fetch('/api/recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ history: [] }),
        });
        if (response.ok && active) {
          const data = await response.json();
          setRecommendedTrackIds(data.recommendedTrackIds || []);
          setRecommendationsJustification(data.justification || '');
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        if (active) setLoadingRecommendations(false);
      }
    };

    fetchRecommendations();
    return () => {
      active = false;
    };
  }, []);

  // Featured Carousel slider index (for Novidades/Browse view)
  const [carouselIndex, setCarouselIndex] = useState<number>(0);

  // --- Google OAuth & User Session States ---
  const [userProfile, setUserProfile] = useState<{ name: string; email: string; photoUrl: string } | null>(() => {
    const saved = localStorage.getItem('celeiro_user_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [activeRecMenuId, setActiveRecMenuId] = useState<string | null>(null);

  // --- Custom Premium Toast Notification System ---
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // --- Refs ---
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthIntervalRef = useRef<any>(null);
  const sliderRef = useRef<HTMLDivElement | null>(null);

  const scrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.clientWidth * 0.75;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Google OAuth Listener on Mount
  useEffect(() => {
    const handleOAuthMessage = async (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'GOOGLE_OAUTH_SUCCESS' && event.data?.token) {
        try {
          const res = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${event.data.token}`);
          if (res.ok) {
            const data = await res.json();
            const profile = {
              name: data.name || data.given_name || 'Google User',
              email: data.email,
              photoUrl: data.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
            };
            setUserProfile(profile);
            localStorage.setItem('celeiro_user_profile', JSON.stringify(profile));
          }
        } catch (error) {
          console.error('Failed to fetch google user info:', error);
        }
      }
    };

    window.addEventListener('message', handleOAuthMessage);

    // Parse Token if callback loaded in main window
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      if (accessToken) {
        if (window.opener) {
          window.opener.postMessage({ type: 'GOOGLE_OAUTH_SUCCESS', token: accessToken }, '*');
          window.close();
        } else {
          window.location.hash = '';
          fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`)
            .then(res => res.json())
            .then(data => {
              const profile = {
                name: data.name || data.given_name || 'Google User',
                email: data.email,
                photoUrl: data.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
              };
              setUserProfile(profile);
              localStorage.setItem('celeiro_user_profile', JSON.stringify(profile));
            })
            .catch(e => console.error(e));
        }
      }
    }

    return () => window.removeEventListener('message', handleOAuthMessage);
  }, []);

  const [userDataLoaded, setUserDataLoaded] = useState<boolean>(false);

  // Load user data on profile change
  useEffect(() => {
    const loadUserData = async () => {
      if (userProfile) {
        setUserDataLoaded(false);
        try {
          const favs = await userDataService.getFavorites(userProfile.email);
          const hist = await userDataService.getHistory(userProfile.email);
          const playlists = await userDataService.getPlaylists(userProfile.email);
          const counts = await userDataService.getPlayCounts(userProfile.email);

          setFavorites(favs);
          setPlaybackHistory(hist);
          setCustomPlaylists(playlists);
          if (counts && Object.keys(counts).length > 0) {
            setPlayCounts(counts);
          }
        } catch (e) {
          console.error("Error loading user data:", e);
        } finally {
          setUserDataLoaded(true);
        }
      } else {
        setUserDataLoaded(false);
        // Restore to generic unlogged storage or defaults
        const savedFavs = localStorage.getItem('celeiro_favorites');
        setFavorites(savedFavs ? JSON.parse(savedFavs) : ['track-1', 'track-6', 'track-10']);
        
        const savedHist = localStorage.getItem('celeiro_playback_history');
        setPlaybackHistory(savedHist ? JSON.parse(savedHist) : []);
        
        const savedPlaylists = localStorage.getItem('celeiro_custom_playlists');
        setCustomPlaylists(savedPlaylists ? JSON.parse(savedPlaylists) : []);

        const savedCounts = localStorage.getItem('celeiro_play_counts_real');
        setPlayCounts(savedCounts ? JSON.parse(savedCounts) : DEFAULT_PLAY_COUNTS);
      }
    };

    loadUserData();
  }, [userProfile]);

  // --- Sync storage ---
  useEffect(() => {
    localStorage.setItem('celeiro_favorites', JSON.stringify(favorites));
    if (userProfile && userDataLoaded) {
      userDataService.saveFavorites(userProfile.email, favorites);
    }
  }, [favorites, userProfile, userDataLoaded]);

  useEffect(() => {
    localStorage.setItem('celeiro_play_counts_real', JSON.stringify(playCounts));
    if (userProfile && userDataLoaded) {
      userDataService.savePlayCounts(userProfile.email, playCounts);
    }
  }, [playCounts, userProfile, userDataLoaded]);

  useEffect(() => {
    if (currentTrackId) {
      setPlayCounts(prev => ({
        ...prev,
        [currentTrackId]: (prev[currentTrackId] || 0) + 1
      }));
    }
  }, [currentTrackId]);

  useEffect(() => {
    localStorage.setItem('celeiro_downloaded', JSON.stringify(downloaded));
  }, [downloaded]);

  useEffect(() => {
    localStorage.setItem('celeiro_custom_playlists', JSON.stringify(customPlaylists));
    if (userProfile && userDataLoaded) {
      userDataService.savePlaylists(userProfile.email, customPlaylists);
    }
  }, [customPlaylists, userProfile, userDataLoaded]);

  useEffect(() => {
    localStorage.setItem('celeiro_playback_history', JSON.stringify(playbackHistory));
    if (userProfile && userDataLoaded) {
      userDataService.saveHistory(userProfile.email, playbackHistory);
    }
  }, [playbackHistory, userProfile, userDataLoaded]);

  useEffect(() => {
    localStorage.setItem('celeiro_volume', volume.toString());
    audioSynthInstance.setVolume(isMuted ? 0 : volume);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle Offline mode changes
  useEffect(() => {
    if (offlineMode) {
      // Force viewing only offline/downloaded library tab
      setActiveTab('library-offline');
      setSelectedPlaylistId(null);
      // If current playing track is not downloaded, stop it
      if (currentTrackId && !downloaded.includes(currentTrackId)) {
        stopPlayback();
      }
    }
  }, [offlineMode]);

  // --- Initialize Audio Element ---
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // --- Handle Audio Event Listeners ---
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (!synthActive && audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      if (!synthActive && audioRef.current) {
        setDuration(audioRef.current.duration);
      }
    };

    const handleEnded = () => {
      handleTrackEnded();
    };

    const handleError = () => {
      // Fallback to Generative Audio Synthesis immediately if URL blocked/error
      console.warn("Audio URL block or CORS error. Activating beautiful Celeiro Synthesizer fallback.");
      activateSynthFallback();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      stopSynthTimer();
    };
  }, [currentTrackId, queue, repeatMode, isShuffle, synthActive]);

  // --- Helper Methods & Music Core Logic ---

  const currentTrack = TRACK_LIST.find(t => t.id === currentTrackId) || null;

  const stopPlayback = () => {
    setIsPlaying(false);
    if (audioRef.current) audioRef.current.pause();
    audioSynthInstance.stop();
    stopSynthTimer();
  };

  const stopSynthTimer = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
  };

  const activateSynthFallback = () => {
    if (!currentTrack) return;
    setSynthActive(true);
    audioSynthInstance.stop();
    audioSynthInstance.setVolume(isMuted ? 0 : volume);
    audioSynthInstance.start(currentTrack.genre);
    
    // Simulate current time progression since synth doesn't have internal timing
    stopSynthTimer();
    setDuration(currentTrack.duration);
    
    synthIntervalRef.current = setInterval(() => {
      setCurrentTime(prev => {
        if (prev >= currentTrack.duration) {
          handleTrackEnded();
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const handlePlayTrack = (trackId: string, trackListContext: string[] = []) => {
    // Check if the track is locked (e.g. "QUEM É ESTE?")
    if (isSongLocked(trackId)) {
      const track = TRACK_LIST.find(t => t.id === trackId);
      showToast(`"${track?.title || 'Quem é Este?'}" estará disponível em 16/07 às 12:00h!`);
      return;
    }

    // Check offline constraints
    if (offlineMode && !downloaded.includes(trackId)) {
      showToast("Esta música não está baixada. Desative o Modo Offline para reproduzir.");
      return;
    }

    const targetTrack = TRACK_LIST.find(t => t.id === trackId);
    if (!targetTrack) return;

    // Set context queue if provided
    if (trackListContext.length > 0) {
      // Filter out duplicate or non-downloaded tracks if in offline mode
      const filteredContext = offlineMode 
        ? trackListContext.filter(id => downloaded.includes(id))
        : trackListContext;
      
      const currentIdx = filteredContext.indexOf(trackId);
      if (currentIdx !== -1) {
        const upcoming = filteredContext.slice(currentIdx + 1);
        setQueue(upcoming);
      }
    }

    stopPlayback();
    setCurrentTrackId(trackId);
    setCurrentTime(0);
    setSynthActive(false);

    // Add to history
    setPlaybackHistory(prev => {
      const filtered = prev.filter(id => id !== trackId);
      return [trackId, ...filtered].slice(0, 30);
    });

    setIsPlaying(true);

    // Try normal HTML5 playback
    if (audioRef.current) {
      audioRef.current.src = targetTrack.audioUrl;
      audioRef.current.load();
      
      // Delay play to handle browser autoplay policies
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // Autoplay or CORS fail - failover gracefully
          console.log("Autoplay restrictions triggered. Moving to audio synth generator fallback.");
          activateSynthFallback();
        });
      }
    } else {
      activateSynthFallback();
    }
  };

  const handlePlayPause = () => {
    if (!currentTrackId) {
      // Play a default popular track
      const popular = getFilteredTracks().find(t => t.isPopular) || getFilteredTracks()[0];
      if (popular) handlePlayTrack(popular.id);
      return;
    }

    if (isPlaying) {
      setIsPlaying(false);
      if (audioRef.current) audioRef.current.pause();
      audioSynthInstance.stop();
      stopSynthTimer();
    } else {
      setIsPlaying(true);
      if (synthActive) {
        activateSynthFallback();
      } else if (audioRef.current) {
        audioRef.current.play().catch(() => {
          activateSynthFallback();
        });
      }
    }
  };

  const handleNext = () => {
    if (queue.length > 0) {
      const nextId = queue[0];
      setQueue(prev => prev.slice(1));
      handlePlayTrack(nextId);
    } else {
      // No tracks in queue. Check repeat mode or loop matching genre
      if (repeatMode === 'all') {
        const list = getFilteredTracks().map(t => t.id);
        if (list.length > 0) {
          handlePlayTrack(list[0], list);
        }
      } else {
        // Play a random matching track
        const list = getFilteredTracks();
        if (list.length > 0) {
          const rand = list[Math.floor(Math.random() * list.length)];
          handlePlayTrack(rand.id);
        }
      }
    }
  };

  const handlePrevious = () => {
    // If we've played > 3 seconds, restart the song
    if (currentTime > 3) {
      handleSeek(0);
      return;
    }

    if (playbackHistory.length > 1) {
      const lastPlayed = playbackHistory[1]; // index 0 is current track
      setPlaybackHistory(prev => prev.slice(1));
      
      // Push current track to queue front
      if (currentTrackId) {
        setQueue(prev => [currentTrackId, ...prev]);
      }
      handlePlayTrack(lastPlayed);
    } else {
      // No history, restart
      handleSeek(0);
    }
  };

  const handleTrackEnded = () => {
    if (repeatMode === 'one') {
      handleSeek(0);
      if (audioRef.current && !synthActive) {
        audioRef.current.play().catch(() => activateSynthFallback());
      } else {
        activateSynthFallback();
      }
    } else {
      handleNext();
    }
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    if (!synthActive && audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const handleShuffleToggle = () => {
    setIsShuffle(!isShuffle);
    if (!isShuffle && queue.length > 0) {
      // Shuffle active queue
      const shuffled = [...queue].sort(() => Math.random() - 0.5);
      setQueue(shuffled);
    }
  };

  const handleRepeatToggle = () => {
    setRepeatMode(prev => {
      if (prev === 'none') return 'all';
      if (prev === 'all') return 'one';
      return 'none';
    });
  };

  // --- Dynamic Filtering ---
  const getFilteredTracks = (): Track[] => {
    let list = TRACK_LIST;

    if (offlineMode) {
      list = list.filter(t => downloaded.includes(t.id));
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      list = list.filter(
        t => t.title.toLowerCase().includes(query) || 
             t.artist.toLowerCase().includes(query) ||
             t.album.toLowerCase().includes(query) ||
             (t.genre && t.genre.toLowerCase().includes(query)) ||
             (query === 'worship' && (t.genre?.toLowerCase() === 'adoração' || t.id === 'track-1'))
      );
    }

    return list;
  };

  // --- Track Interactions ---

  const handleToggleFavorite = (trackId: string) => {
    setFavorites(prev => {
      if (prev.includes(trackId)) {
        return prev.filter(id => id !== trackId);
      } else {
        return [...prev, trackId];
      }
    });
  };

  const handleToggleDownload = (trackId: string) => {
    setDownloaded(prev => {
      if (prev.includes(trackId)) {
        // If offline mode is active and we undownload, stop playback if it is current
        if (offlineMode && currentTrackId === trackId) {
          stopPlayback();
        }
        return prev.filter(id => id !== trackId);
      } else {
        return [...prev, trackId];
      }
    });
  };

  const handleAddToQueue = (trackId: string) => {
    if (queue.includes(trackId)) return;
    setQueue(prev => [...prev, trackId]);
  };

  const handlePlayNext = (trackId: string) => {
    setQueue(prev => {
      const filtered = prev.filter(id => id !== trackId);
      return [trackId, ...filtered];
    });
  };

  // --- Playlist Actions ---

  const handleCreatePlaylist = () => {
    if (!userProfile) {
      setIsLoginModalOpen(true);
      showToast('Inicie sessão para criar suas próprias playlists!');
      return;
    }
    setIsPlaylistModalOpen(true);
  };

  const handleCreatePlaylistConfirm = (name: string, description: string, coverUrl: string) => {
    const newPlaylist: Playlist = {
      id: `playlist-custom-${Date.now()}`,
      name: name,
      description: description,
      coverUrl: coverUrl,
      tracks: [],
      type: 'custom',
      creator: userProfile?.name || 'Adorador',
      updatedAt: 'Criada hoje'
    };

    setCustomPlaylists(prev => [...prev, newPlaylist]);
    setSelectedPlaylistId(newPlaylist.id);
    setActiveTab('library-playlists');
    showToast(`Playlist "${name}" criada com sucesso!`);
  };

  const handleAddToPlaylist = (playlistId: string, trackId: string) => {
    const targetTrack = TRACK_LIST.find(t => t.id === trackId);
    setCustomPlaylists(prev => prev.map(pl => {
      if (pl.id === playlistId) {
        if (pl.tracks.includes(trackId)) {
          showToast(`"${targetTrack?.title}" já está em "${pl.name}"`);
          return pl;
        }
        showToast(`Adicionado "${targetTrack?.title}" à playlist "${pl.name}"`);
        return { ...pl, tracks: [...pl.tracks, trackId] };
      }
      return pl;
    }));
  };

  const handleRemoveFromPlaylist = (playlistId: string, trackId: string) => {
    const targetTrack = TRACK_LIST.find(t => t.id === trackId);
    setCustomPlaylists(prev => prev.map(pl => {
      if (pl.id === playlistId) {
        showToast(`Removido "${targetTrack?.title}" de "${pl.name}"`);
        return { ...pl, tracks: pl.tracks.filter(id => id !== trackId) };
      }
      return pl;
    }));
  };

  const handleDeletePlaylist = (playlistId: string) => {
    if (confirm("Tem certeza que deseja excluir esta playlist permanentemente?")) {
      setCustomPlaylists(prev => prev.filter(pl => pl.id !== playlistId));
      setSelectedPlaylistId(null);
      setActiveTab('library-playlists');
    }
  };

  // --- Queue Actions ---

  const handleClearQueue = () => {
    setQueue([]);
  };

  const handleRemoveFromQueue = (trackId: string) => {
    setQueue(prev => prev.filter(id => id !== trackId));
  };

  // --- Live Radio Session Launcher ---
  const handleLaunchRadio = (station: Playlist) => {
    // Launcher of Live FM Station
    // Filter tracks matching offline context
    const radioTracks = offlineMode 
      ? station.tracks.filter(id => downloaded.includes(id))
      : station.tracks;

    if (radioTracks.length === 0) {
      showToast("Esta rádio não possui músicas baixadas no momento. Conecte-se para sintonizar.");
      return;
    }

    // Set randomized queued tracks
    const randomSorted = [...radioTracks].sort(() => Math.random() - 0.5);
    const startTrackId = randomSorted[0];
    
    // Inject a special simulated "locution" line as the first timed lyric line of this live broadcast
    const actualTrack = TRACK_LIST.find(t => t.id === startTrackId);
    if (actualTrack) {
      const clonedTrack = { ...actualTrack };
      // Inject sweet radio DJ commentary at second 1
      clonedTrack.lyrics = [
        { time: 0, text: `🎙️ [Rádio Celeiro FM] Sintonizado em ${station.stationHz || 'Celeiro Live'} • Papo de Varanda & Moda boa!` },
        { time: 3, text: '🎙️ Alô amigo ouvinte! No ar, o som rústico do seu Celeiro Digital... Sinta a batida!' },
        ...actualTrack.lyrics.filter(l => l.time > 5)
      ];
      
      // Override this track only for this active play, and play it!
      stopPlayback();
      setCurrentTrackId(startTrackId);
      setCurrentTime(0);
      setSynthActive(false);

      setQueue(randomSorted.slice(1));
      setIsPlaying(true);

      if (audioRef.current) {
        audioRef.current.src = clonedTrack.audioUrl;
        audioRef.current.load();
        audioRef.current.play().catch(() => activateSynthFallback());
      } else {
        activateSynthFallback();
      }
    }
  };

  // --- Dynamic Time-of-day Greeting Generator ---
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) return 'Bom dia';
    if (hours >= 12 && hours < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  // --- Novidades Featured Slideshow list ---
  const featuredBanners = [
    {
      trackId: 'track-1',
      title: 'Worship Nacional',
      subtitle: 'Destaque da Semana',
      description: 'Sinta a presença com "A Casa É Sua" da Casa Worship, o louvor mais ouvido da nossa plataforma.',
      buttonText: 'Ouvir Agora',
      cover: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=800&auto=format&fit=crop&q=80',
    },
    {
      trackId: 'track-2',
      title: 'Lugar Secreto',
      subtitle: 'Adoração Profunda',
      description: 'Entre no seu quarto e feche a porta com a tocante ministração de Gabriela Rocha em seu grande sucesso.',
      buttonText: 'Ministrar',
      cover: 'https://images.unsplash.com/photo-1442468989248-8415785a93dd?w=800&auto=format&fit=crop&q=80',
    },
    {
      trackId: 'track-3',
      title: 'Galileu',
      subtitle: 'Gospel Pop & Ritmo',
      description: 'Cante e exalte o nome de Jesus com o louvor contagiante e alegre de Fernandinho.',
      buttonText: 'Cantar Louvores',
      cover: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&auto=format&fit=crop&q=80',
    },
    {
      trackId: 'track-14',
      title: 'Todavia Me Alegrarei',
      subtitle: 'Fé e Intimidade',
      description: 'Mesmo no vento, mesmo na dor: encontre consolo e esperança com a tocante canção de Samuel Miranda.',
      buttonText: 'Ouvir Hino',
      cover: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&auto=format&fit=crop&q=80',
    },
    {
      trackId: 'track-15',
      title: 'Abba',
      subtitle: 'Momento de Devoção',
      description: 'Laura Souguellis em uma interpretação íntima que nos aproxima do coração do Pai.',
      buttonText: 'Entrar em Oração',
      cover: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=800&auto=format&fit=crop&q=80',
    }
  ];

  return (
    <div 
      id="celeiro-app-wrapper" 
      className="flex h-screen bg-[#1f1f1f] font-sans text-stone-200 overflow-hidden relative"
    >
      
      {/* 1. Left Sidebar menu */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedPlaylistId={selectedPlaylistId}
        setSelectedPlaylistId={setSelectedPlaylistId}
        customPlaylists={customPlaylists}
        onCreatePlaylist={handleCreatePlaylist}
        isMobileSidebarOpen={isMobileSidebarOpen}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        userProfile={userProfile}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onLogout={() => {
          setIsLoggingOut(true);
          setTimeout(() => {
            setUserProfile(null);
            localStorage.removeItem('celeiro_user_profile');
            setIsLoggingOut(false);
            showToast('Sessão encerrada com segurança.');
          }, 1600);
        }}
        onProfileClick={() => setIsProfileModalOpen(true)}
      />

      {/* 2. Main Content Canvas */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0 p-4 pl-0 bg-transparent">
        <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-[#1f1f1f]/60 border border-white/10 rounded-[24px] backdrop-blur-xl shadow-2xl overflow-hidden relative">
          
          {/* Top Header toolbar */}
          <Header 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            offlineMode={offlineMode}
            setOfflineMode={setOfflineMode}
            isMobileSidebarOpen={isMobileSidebarOpen}
            setIsMobileSidebarOpen={setIsMobileSidebarOpen}
            onShuffleAll={() => {
              const list = getFilteredTracks().map(t => t.id);
              if (list.length > 0) {
                const randId = list[Math.floor(Math.random() * list.length)];
                const shuffled = [...list].sort(() => Math.random() - 0.5);
                handlePlayTrack(randId, shuffled);
              }
            }}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

        {/* Offline Global Warning Bar banner */}
        {offlineMode && (
          <div className="bg-brand/20 text-brand px-6 py-2 border-b border-brand/30 flex items-center gap-2.5 text-xs font-semibold select-none">
            <WifiOff className="w-4 h-4 text-brand animate-pulse" />
            <span>VOCÊ ESTÁ OFFLINE • Exibindo apenas faixas pré-baixadas e gravadas no cache local.</span>
          </div>
        )}

        {/* Inner page container */}
        <main className="flex-1 overflow-y-auto px-6 py-8 pb-32 custom-scrollbar">
          
          {/* A. If we are on the search tab, render its integrated layout */}
          {activeTab === 'search' && !selectedPlaylistId ? (
            <div id="search-view-pane" className="space-y-8 animate-fade-in">
              
              {/* Centered Search Input styled like the mockup */}
              <div className="flex justify-center w-full max-w-xl mx-auto pt-2 pb-2">
                <div className="relative w-full">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por músicas, artistas ou álbuns..."
                    className="w-full pl-12 pr-12 py-3 bg-[#2c2c2e] border border-white/5 rounded-full text-sm text-white placeholder-stone-400 focus:outline-none focus:border-[#dfb26f]/40 focus:ring-1 focus:ring-[#dfb26f]/40 transition-all font-sans shadow-lg"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 hover:text-white transition-colors"
                    >
                      Limpar
                    </button>
                  )}
                </div>
              </div>

              {searchQuery.trim() === '' ? (
                <div className="space-y-6 pt-4">
                  <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Explorar categorias</h2>
                  
                  {/* Grid layout with exactly 2 categories: Worship and Pentecostal */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Worship Category Card */}
                    <button
                      onClick={() => setSearchQuery('Worship')}
                      className="relative aspect-[16/7] md:aspect-[21/9] rounded-[24px] overflow-hidden cursor-pointer group shadow-xl border border-white/5 active:scale-[0.98] transition-all text-left w-full"
                    >
                      {/* Premium gradient representing worship */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#ff124f] via-[#fe0170] to-[#9a0441] opacity-95 group-hover:scale-105 transition-transform duration-500" />
                      {/* Subtle elegant gloss highlight */}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_60%)]" />
                      
                      {/* Text in bottom-left corner */}
                      <div className="absolute bottom-6 left-6 z-10">
                        <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight font-sans">Worship</h3>
                      </div>
                    </button>

                    {/* Pentecostal Category Card */}
                    <button
                      onClick={() => setSearchQuery('Pentecostal')}
                      className="relative aspect-[16/7] md:aspect-[21/9] rounded-[24px] overflow-hidden cursor-pointer group shadow-xl border border-white/5 active:scale-[0.98] transition-all text-left w-full"
                    >
                      {/* Premium gradient representing pentecostal */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#ff5e36] via-[#ea3c12] to-[#7000ff] opacity-95 group-hover:scale-105 transition-transform duration-500" />
                      {/* Subtle elegant gloss highlight */}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_60%)]" />
                      
                      {/* Text in bottom-left corner */}
                      <div className="absolute bottom-6 left-6 z-10">
                        <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight font-sans">Pentecostal</h3>
                      </div>
                    </button>

                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-fade-in pt-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white font-sans">
                      Resultados para "{searchQuery}" ({getFilteredTracks().length})
                    </h2>
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="text-xs text-[#dfb26f] hover:underline font-bold"
                    >
                      Limpar busca
                    </button>
                  </div>

                  {getFilteredTracks().length === 0 ? (
                    <div className="py-16 text-center border border-dashed border-white/5 rounded-2xl">
                      <AlertCircle className="w-8 h-8 text-stone-600 mx-auto mb-2" />
                      <p className="text-sm text-stone-400 font-bold">Nenhuma música encontrada</p>
                      <p className="text-xs text-stone-500 mt-1">Experimente buscar por outros termos ou verifique a grafia.</p>
                    </div>
                  ) : (
                    <div className="bg-[#1c1c1e]/40 rounded-2xl border border-white/5 overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/5 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                            <th className="py-3 pl-4 w-12 text-center">#</th>
                            <th className="py-3 px-3">Música / Artista</th>
                            <th className="py-3 px-3 hidden md:table-cell">Álbum</th>
                            <th className="py-3 pr-4 w-40 text-right">Duração</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getFilteredTracks().map((track, idx) => (
                            <TrackRow
                              key={track.id}
                              track={track}
                              index={idx}
                              currentTrackId={currentTrackId}
                              isPlaying={isPlaying}
                              isFavorite={favorites.includes(track.id)}
                              isDownloaded={downloaded.includes(track.id)}
                              onPlayPause={() => {
                                if (currentTrackId === track.id) {
                                  handlePlayPause();
                                } else {
                                  handlePlayTrack(track.id, getFilteredTracks().map(t => t.id));
                                }
                              }}
                              onToggleFavorite={handleToggleFavorite}
                              onToggleDownload={handleToggleDownload}
                              onAddToQueue={handleAddToQueue}
                              onPlayNext={handlePlayNext}
                              customPlaylists={customPlaylists}
                              onAddToPlaylist={handleAddToPlaylist}
                              onCreatePlaylist={handleCreatePlaylist}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            
            /* B. Render Standard Multi-tabs */
            <>
              {/* TAB 1: INÍCIO (Home) */}
              {activeTab === 'home' && !selectedPlaylistId && (
                <div id="home-view-pane" className="space-y-8 animate-fade-in">
                  
                  {/* Dynamic greeting layout panel */}
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#261E17]/40 pb-6">
                    <div>
                      <h2 className="text-3xl font-extrabold tracking-tight text-white font-sans">
                        {getGreeting()}, {userProfile ? userProfile.name : 'Adorador'}!
                      </h2>
                      <p className="text-sm text-stone-400 mt-1">Sintonize o melhor da música cristã, louvor e adoração. O que quer ouvir hoje?</p>
                    </div>
                    
                    {/* Estações recomendadas quick tag */}
                    <div className="flex items-center gap-1.5 bg-brand/10 border border-brand/20 px-3 py-1.5 rounded-lg text-xs font-semibold text-brand">
                      <Radio className="w-3.5 h-3.5 animate-pulse" /> Sintonizado no Canal Celeiro
                    </div>
                  </div>

                  {/* Curated Grid Bento slots for System Playlists */}
                  <section>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Disc className="w-4 h-4 text-brand" /> Curadorias Celeiro Recomendadas
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {SYSTEM_PLAYLISTS.map((playlist) => (
                        <div 
                          key={playlist.id}
                          onClick={() => {
                            setSelectedPlaylistId(playlist.id);
                            setActiveTab('library-playlists');
                          }}
                          className="group flex items-center gap-4 bg-stone-900/40 hover:bg-stone-850/60 p-3 rounded-xl border border-[#261E17]/30 transition-all cursor-pointer relative"
                        >
                          <img 
                            src={playlist.coverUrl} 
                            alt={playlist.name} 
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border border-[#261E17]/40"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-bold text-brand uppercase tracking-widest font-mono">{playlist.updatedAt}</span>
                            <h4 className="text-sm font-bold text-white group-hover:text-brand transition-colors truncate mt-0.5">{playlist.name}</h4>
                            <p className="text-xs text-stone-400 line-clamp-1 mt-0.5">{playlist.description}</p>
                          </div>
                          
                          {/* Hover Play direct overlay */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const tracksOfPl = playlist.tracks;
                              if (tracksOfPl.length > 0) {
                                handlePlayTrack(tracksOfPl[0], tracksOfPl);
                              }
                            }}
                            className="absolute right-4 p-2.5 rounded-full bg-brand text-white opacity-0 group-hover:opacity-100 shadow-md transform scale-75 group-hover:scale-100 transition-all duration-300"
                            title="Tocar playlist"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Mood sections matching standard worship moments */}
                  <section>
                    <h3 className="text-lg font-bold text-white mb-4">Escolha seu momento de louvor</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { title: 'Adoração Profunda', desc: 'Canções de intimidade', color: 'from-[#4c0519] to-stone-950', genre: 'Adoração' },
                        { title: 'Louvor Festivo', desc: 'Canções alegres de celebração', color: 'from-[#1e3a8a] to-stone-950', genre: 'Gospel Pop' },
                        { title: 'Clássicos da Fé', desc: 'Hinos tradicionais e harpa', color: 'from-[#065f46] to-stone-950', genre: 'Pentecostal' },
                        { title: 'Devocional Diário', desc: 'Para momentos de oração', color: 'from-[#111827] to-stone-950', genre: 'Adoração' },
                      ].map((mood, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            // Find songs of this genre and play
                            const matches = TRACK_LIST.filter(t => t.genre.includes(mood.genre) || t.album.includes(mood.genre));
                            if (matches.length > 0) {
                              const ids = matches.map(m => m.id);
                              handlePlayTrack(ids[0], ids);
                            }
                          }}
                          className={`bg-gradient-to-br ${mood.color} p-4 rounded-xl border border-[#261E17]/45 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shadow-md group`}
                        >
                          <h4 className="text-sm font-bold text-white group-hover:text-brand transition-colors">{mood.title}</h4>
                          <p className="text-[10px] text-stone-400 mt-1.5 font-medium">{mood.desc}</p>
                          <div className="flex justify-end mt-4">
                            <span className="p-1 rounded-full bg-white/5 group-hover:bg-brand text-stone-400 group-hover:text-white transition-colors">
                              <Play className="w-3.5 h-3.5 fill-current" />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Recently played list */}
                  {playbackHistory.length > 0 && (
                    <section>
                      <h3 className="text-lg font-bold text-white mb-4">Recentemente Tocadas</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                        {playbackHistory.slice(0, 6).map(trackId => {
                          const track = TRACK_LIST.find(t => t.id === trackId);
                          if (!track) return null;
                          return (
                            <SongCard
                              key={track.id}
                              id={track.id}
                              title={track.title}
                              subtitle={track.artist}
                              coverUrl={track.coverUrl}
                              type="track"
                              onClick={() => handlePlayTrack(track.id, TRACK_LIST.map(t => t.id))}
                              onPlayDirectly={(e) => {
                                e.stopPropagation();
                                handlePlayTrack(track.id, TRACK_LIST.map(t => t.id));
                              }}
                              isNew={track.isNew}
                            />
                          );
                        })}
                      </div>
                    </section>
                  )}
                </div>
              )}

              {/* TAB 2: OUVINDO AGORA (Browse) */}
              {activeTab === 'browse' && !selectedPlaylistId && (
                <div id="browse-view-pane" className="space-y-8 animate-fade-in">
                  
                  {/* Banners Slider (Functional Carousel of TRACK_LIST) */}
                  <div className="relative group/slider overflow-hidden rounded-[24px]">
                    <div 
                      ref={sliderRef}
                      className="flex gap-5 overflow-x-auto scroll-smooth scrollbar-none snap-x snap-mandatory pr-6 pb-3"
                    >
                      {TRACK_LIST.map((track) => {
                        const isThisActive = currentTrackId === track.id;
                        return (
                          <div 
                            key={'slider-' + track.id}
                            className="flex flex-col flex-shrink-0 w-[140px] md:w-[170px] snap-start group/card cursor-pointer" 
                            onClick={() => handlePlayTrack(track.id, TRACK_LIST.map(t => t.id))}
                          >
                            <div className="relative aspect-square rounded-[24px] overflow-hidden border border-white/10 bg-stone-950 shadow-md">
                              <img 
                                src={track.coverUrl} 
                                className={`w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-115 ${isSongLocked(track.id) ? 'blur-[4px] opacity-50 grayscale' : ''}`} 
                              />
                              
                              {isSongLocked(track.id) ? (
                                <div className="absolute inset-0 bg-stone-950/50 backdrop-blur-md flex flex-col items-center justify-center p-3 text-center border border-white/10 rounded-[24px] transition-all duration-300">
                                  <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 text-[#dfb26f] flex items-center justify-center mb-2 shadow-lg backdrop-blur-lg animate-pulse">
                                    <Lock className="w-4.5 h-4.5 text-[#dfb26f]" />
                                  </div>
                                  <span className="text-[10px] tracking-widest font-black uppercase text-[#dfb26f] font-mono">
                                    Disponível
                                  </span>
                                  <span className="text-xs font-black text-white tracking-tight mt-0.5 font-sans">
                                    16/07 às 12:00h
                                  </span>
                                </div>
                              ) : (
                                /* Play Button hover overlay */
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                  <div className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center shadow-lg transform scale-90 group-hover/card:scale-100 transition-transform duration-350">
                                    {isThisActive && isPlaying ? (
                                      <Pause className="w-4 h-4 fill-current text-black" />
                                    ) : (
                                      <Play className="w-4 h-4 fill-current text-black ml-0.5" />
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <h3 className="text-xs font-bold text-white mt-3 leading-tight group-hover/card:text-[#dfb26f] transition-colors font-sans truncate">{track.title}</h3>
                            <span className="text-[10px] text-stone-400 mt-0.5 block truncate">{track.artist}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Left overlay arrow slider chevron */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        scrollSlider('left');
                      }}
                      className="absolute top-[40%] left-2 -translate-y-1/2 w-8 h-12 rounded-lg bg-black/55 hover:bg-black/75 border border-white/10 flex items-center justify-center cursor-pointer text-white hidden md:flex transition-all z-10 active:scale-95 shadow-md"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Right overlay arrow slider chevron */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        scrollSlider('right');
                      }}
                      className="absolute top-[40%] right-2 -translate-y-1/2 w-8 h-12 rounded-lg bg-black/55 hover:bg-black/75 border border-white/10 flex items-center justify-center cursor-pointer text-white hidden md:flex transition-all z-10 active:scale-95 shadow-md"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Two Column Layout (Next up & Popular Playlists) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
                    
                    {/* Column 1: Recomendações Diárias */}
                    <section className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl text-[#dfb26f]">★</span>
                          <div>
                            <h3 className="text-[18px] font-bold text-white tracking-tight font-sans">
                              Recomendações Diárias
                            </h3>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {loadingRecommendations ? (
                          <div className="flex flex-col items-center justify-center py-12 text-center bg-white/[0.01] border border-white/[0.03] rounded-2xl">
                            <Loader2 className="w-6 h-6 text-stone-400 animate-spin mb-3" />
                            <p className="text-xs text-stone-400 font-bold">Analisando seu estilo musical...</p>
                            <p className="text-[10px] text-stone-500 mt-1">Selecionando os melhores louvores.</p>
                          </div>
                        ) : (() => {
                          const recommendedTracks = recommendedTrackIds
                            .map(id => TRACK_LIST.find(t => t.id === id))
                            .filter((t): t is typeof TRACK_LIST[0] => !!t);

                          const displayTracks = recommendedTracks.length > 0 
                            ? recommendedTracks 
                            : TRACK_LIST.slice(0, 5); // Fallback if list is empty

                          return displayTracks.map((track) => {
                            const isThisActive = currentTrackId === track.id;
                            const isFav = favorites.includes(track.id);
                            return (
                              <div
                                key={'rec-' + track.id}
                                onClick={() => handlePlayTrack(track.id, displayTracks.map(t => t.id))}
                                className="flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.05] group transition-all cursor-pointer border border-transparent hover:border-white/5"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 border border-white/5">
                                    <img src={track.coverUrl} alt={track.title} className={`w-full h-full object-cover ${isSongLocked(track.id) ? 'blur-[1.5px] opacity-50 grayscale' : ''}`} />
                                    {isSongLocked(track.id) ? (
                                      <div className="absolute inset-0 bg-stone-950/60 flex items-center justify-center">
                                        <Lock className="w-3.5 h-3.5 text-[#dfb26f] animate-pulse" />
                                      </div>
                                    ) : (
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                                      </div>
                                    )}
                                  </div>

                                  <div className="min-w-0 text-left">
                                    <span className={`flex items-center gap-1.5 text-xs font-bold truncate ${isThisActive ? 'text-[#dfb26f]' : 'text-white'}`}>
                                      {track.title}
                                      {isSongLocked(track.id) && (
                                        <span className="px-1 py-0.2 text-[8px] font-black bg-amber-500/10 text-[#dfb26f] border border-amber-500/20 rounded font-mono uppercase">
                                          16/07
                                        </span>
                                      )}
                                    </span>
                                    <span className="block text-[10px] text-stone-400 truncate mt-0.5">
                                      {isSongLocked(track.id) ? 'Lançamento em Breve' : `${track.artist} • ${track.genre}`}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono text-stone-500 mr-2">
                                    {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                                  </span>

                                  {/* Favorite Button */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleFavorite(track.id);
                                    }}
                                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                      isFav 
                                        ? 'text-[#dfb26f] bg-[#dfb26f]/10' 
                                        : 'text-stone-500 hover:text-white hover:bg-white/5'
                                    }`}
                                  >
                                    <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                                  </button>

                                  <div className="relative">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveRecMenuId(activeRecMenuId === track.id ? null : track.id);
                                      }}
                                      className="p-1.5 rounded-lg text-stone-500 hover:text-white hover:bg-white/5 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                      <MoreHorizontal className="w-3.5 h-3.5" />
                                    </button>

                                    {activeRecMenuId === track.id && (
                                      <div 
                                        className="absolute right-0 mt-2 w-56 rounded-lg bg-[#16120E] border border-[#2B221A] shadow-2xl z-50 py-1 text-left animate-fade-in"
                                        onMouseLeave={() => setActiveRecMenuId(null)}
                                      >
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handlePlayNext(track.id);
                                            setActiveRecMenuId(null);
                                          }}
                                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-stone-300 hover:bg-brand hover:text-stone-950 transition-colors"
                                        >
                                          <Play className="w-3.5 h-3.5" />
                                          Tocar a Seguir
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddToQueue(track.id);
                                            setActiveRecMenuId(null);
                                          }}
                                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-stone-300 hover:bg-brand hover:text-stone-950 transition-colors"
                                        >
                                          <ListPlus className="w-3.5 h-3.5" />
                                          Adicionar à Fila
                                        </button>

                                        {/* Favorites option */}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleFavorite(track.id);
                                            setActiveRecMenuId(null);
                                          }}
                                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-stone-300 hover:bg-brand hover:text-stone-950 transition-colors"
                                        >
                                          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current text-[#dfb26f]' : ''}`} />
                                          {isFav ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
                                        </button>

                                        {/* Playlist Sub-list */}
                                        <div className="border-t border-[#261E17]/60 my-1 py-1">
                                          <p className="px-3 py-1 text-[9px] font-bold text-brand/60 uppercase tracking-wider">Adicionar à Playlist</p>
                                          {customPlaylists.length > 0 ? (
                                            customPlaylists.map(pl => (
                                              <button
                                                key={pl.id}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleAddToPlaylist(pl.id, track.id);
                                                  setActiveRecMenuId(null);
                                                }}
                                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-stone-400 hover:bg-stone-800 hover:text-white transition-colors truncate pl-5 text-left"
                                              >
                                                <FolderPlus className="w-3 h-3 text-brand/50" />
                                                <span className="truncate">{pl.name}</span>
                                              </button>
                                            ))
                                          ) : (
                                            <div className="px-5 py-1 text-[10px] text-stone-500 italic">
                                              Nenhuma playlist
                                            </div>
                                          )}

                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleCreatePlaylist();
                                              setActiveRecMenuId(null);
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#dfb26f] hover:bg-stone-800 hover:text-white transition-colors pl-5 text-left"
                                          >
                                            <Plus className="w-3 h-3 text-[#dfb26f]" />
                                            <span>Nova Playlist...</span>
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </section>

                    {/* Column 2: As Mais Ouvidas */}
                    <section className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl text-[#dfb26f]">♥</span>
                        <h3 className="text-[18px] font-bold text-white tracking-tight font-sans">
                          As Mais Ouvidas
                        </h3>
                      </div>

                      {(() => {
                        const topPlayedTracks = [...TRACK_LIST]
                          .filter(track => !isSongLocked(track.id))
                          .sort((a, b) => (playCounts[b.id] || 0) - (playCounts[a.id] || 0))
                          .slice(0, 8);

                        return (
                          <div className="grid grid-cols-2 gap-3">
                            {topPlayedTracks.map((track, idx) => {
                              const playCount = playCounts[track.id] || 0;
                              const isThisActive = currentTrackId === track.id;
                              return (
                                <div
                                  key={track.id}
                                  onClick={() => handlePlayTrack(track.id, topPlayedTracks.map(t => t.id))}
                                  className="flex items-center gap-3 p-2 bg-[#1c1917]/30 border border-white/5 rounded-xl hover:bg-white/[0.06] hover:border-white/10 transition-all cursor-pointer group relative overflow-hidden"
                                >
                                  <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 border border-white/5 shadow-md">
                                    <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                      {isThisActive && isPlaying ? (
                                        <Pause className="w-4 h-4 text-[#dfb26f] fill-[#dfb26f]" />
                                      ) : (
                                        <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                                      )}
                                    </div>
                                    <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded bg-stone-950/80 backdrop-blur-sm border border-white/10 flex items-center justify-center text-[9px] font-black font-mono text-[#dfb26f]">
                                      {idx + 1}
                                    </div>
                                  </div>

                                  <div className="min-w-0 flex-1 text-left">
                                    <span className={`block text-xs font-semibold truncate group-hover:text-[#dfb26f] transition-colors ${isThisActive ? 'text-[#dfb26f]' : 'text-stone-200'}`}>
                                      {track.title}
                                    </span>
                                    <span className="block text-[9px] text-stone-400 truncate mt-0.5">
                                      {track.artist}
                                    </span>
                                  </div>

                                  <div className="text-right flex-shrink-0 pr-1">
                                    <span className="block text-[9px] font-bold text-[#dfb26f] font-mono bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/10">
                                      {formatPlayCount(playCount)}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </section>

                  </div>
                </div>
              )}

              {/* TAB 3: RÁDIO (Radio) */}
              {activeTab === 'radio' && !selectedPlaylistId && (
                <div id="radio-view-pane" className="space-y-8 animate-fade-in">
                  
                  {/* Top Header layout */}
                  <div className="border-b border-[#261E17]/40 pb-6">
                    <h2 className="text-3xl font-extrabold text-white">Canais de Rádio Celeiro</h2>
                    <p className="text-sm text-stone-400 mt-1">Estações transmitindo música ininterrupta, modões e bate-papo rústico ao vivo.</p>
                  </div>

                  {/* Curated channels list dials */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {RADIO_STATIONS.map((station) => {
                      const isThisStationPlaying = currentTrackId && station.tracks.includes(currentTrackId);
                      return (
                        <div
                          key={station.id}
                          id={`radio-station-card-${station.id}`}
                          className="bg-[#16120E] border border-[#2B221A] rounded-2xl overflow-hidden shadow-xl p-5 hover:border-brand/40 transition-all group relative"
                        >
                          <div className="flex gap-4">
                            <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-stone-800 flex-shrink-0">
                              <img src={station.coverUrl} alt={station.name} className="w-full h-full object-cover" />
                              
                              <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-rose-600 text-white rounded text-[8px] font-bold tracking-wide uppercase flex items-center gap-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                                LIVE
                              </span>
                            </div>

                            <div className="min-w-0 flex-1 flex flex-col justify-between">
                              <div>
                                <span className="text-[10px] font-mono font-bold text-brand tracking-wider">
                                  {station.stationHz}
                                </span>
                                <h3 className="text-base font-bold text-white mt-1 group-hover:text-brand transition-colors truncate">
                                  {station.name}
                                </h3>
                                <p className="text-xs text-stone-400 line-clamp-2 mt-1 leading-relaxed font-medium">
                                  {station.description}
                                </p>
                              </div>

                              <button
                                onClick={() => handleLaunchRadio(station)}
                                className="mt-2 text-xs font-bold text-brand hover:text-white flex items-center gap-1 transition-colors"
                              >
                                Sintonizar Agora <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Quick launcher big icon */}
                          <button
                            onClick={() => handleLaunchRadio(station)}
                            className="absolute right-4 bottom-4 p-3 bg-brand text-white rounded-full opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 shadow-xl transition-all duration-300"
                            title="Sintonizar rádio"
                          >
                            <Radio className="w-5 h-5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Broadcast guidelines block */}
                  <div className="p-6 rounded-2xl bg-stone-950/60 border border-[#261E17]/45 text-stone-400 text-xs leading-relaxed space-y-2">
                    <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-brand" /> Como funcionam os canais ao vivo?
                    </h4>
                    <p>Sintonizar uma Rádio Celeiro ativa o modo de transmissão de rádio tradicional: o sistema cria uma lista rotativa aleatória contínua e injeta comentários exclusivos de locutores e IDs de rádio diretamente na tela de Letras do Player!</p>
                    <p>Experimente abrir a tela de **Letras Sincronizadas** (clicando na capa do tocador inferior) enquanto ouve uma rádio para ver os comentários ao vivo do DJ Celeiro!</p>
                  </div>
                </div>
              )}

              {/* TAB 4: LIBRARY FAVORITES (Favoritas) */}
              {activeTab === 'library-favorites' && !selectedPlaylistId && (
                <div id="favorites-view-pane" className="space-y-6 animate-fade-in">
                  <div className="flex items-center gap-4 border-b border-[#261E17]/40 pb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand to-brand/70 flex items-center justify-center text-white shadow-lg shadow-brand/10 border border-brand/20">
                      <Heart className="w-8 h-8 fill-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-extrabold text-white">Minhas Músicas Favoritas</h2>
                      <p className="text-sm text-stone-400 mt-1">Sua seleção pessoal de canções rústicas e acústicas preferidas.</p>
                    </div>
                  </div>

                  {favorites.length === 0 ? (
                    <div className="py-16 text-center border border-dashed border-[#261E17] rounded-xl">
                      <Heart className="w-8 h-8 text-stone-600 mx-auto mb-2" />
                      <p className="text-sm text-stone-400 font-semibold">Nenhuma favorita favoritada</p>
                      <p className="text-xs text-stone-500 mt-1">Clique no ícone de coração nas músicas de qualquer aba para construir sua biblioteca.</p>
                    </div>
                  ) : (
                    <div className="bg-stone-950/40 rounded-xl border border-[#261E17]/40 overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#261E17]/40 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                            <th className="py-3 pl-4 w-12 text-center">#</th>
                            <th className="py-3 px-3">Música / Artista</th>
                            <th className="py-3 px-3 hidden md:table-cell">Álbum</th>
                            <th className="py-3 pr-4 w-40 text-right">Duração</th>
                          </tr>
                        </thead>
                        <tbody>
                          {TRACK_LIST.filter(t => favorites.includes(t.id)).map((track, idx) => (
                            <TrackRow
                              key={track.id}
                              track={track}
                              index={idx}
                              currentTrackId={currentTrackId}
                              isPlaying={isPlaying}
                              isFavorite={true}
                              isDownloaded={downloaded.includes(track.id)}
                              onPlayPause={() => {
                                if (currentTrackId === track.id) {
                                  handlePlayPause();
                                } else {
                                  handlePlayTrack(track.id, TRACK_LIST.filter(t => favorites.includes(t.id)).map(t => t.id));
                                }
                              }}
                              onToggleFavorite={handleToggleFavorite}
                              onToggleDownload={handleToggleDownload}
                              onAddToQueue={handleAddToQueue}
                              onPlayNext={handlePlayNext}
                              customPlaylists={customPlaylists}
                              onAddToPlaylist={handleAddToPlaylist}
                              onCreatePlaylist={handleCreatePlaylist}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4.5: LIBRARY HISTORY (Histórico) */}
              {activeTab === 'library-history' && !selectedPlaylistId && (
                <div id="history-view-pane" className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-[#261E17]/40 pb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand to-brand/70 flex items-center justify-center text-white shadow-lg shadow-brand/10 border border-brand/20">
                        <Clock className="w-8 h-8" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-extrabold text-white">Seu Histórico de Ouvinte</h2>
                        <p className="text-sm text-stone-400 mt-1">Sua jornada musical no Celeiro. Histórico de músicas reproduzidas sincronizado na nuvem.</p>
                      </div>
                    </div>
                    {playbackHistory.length > 0 && (
                      <button
                        onClick={() => {
                          setPlaybackHistory([]);
                          showToast('Histórico limpo com sucesso.');
                        }}
                        className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-bold text-stone-400 hover:text-white transition-all cursor-pointer"
                      >
                        Limpar Histórico
                      </button>
                    )}
                  </div>

                  {playbackHistory.length === 0 ? (
                    <div className="py-16 text-center border border-dashed border-[#261E17] rounded-xl">
                      <Clock className="w-8 h-8 text-stone-600 mx-auto mb-2" />
                      <p className="text-sm text-stone-400 font-semibold">Nenhum louvor ouvido recentemente</p>
                      <p className="text-xs text-stone-500 mt-1">Os louvores que você ouvir vão aparecer aqui para você revisitá-los facilmente.</p>
                    </div>
                  ) : (
                    <div className="bg-stone-950/40 rounded-xl border border-[#261E17]/40 overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#261E17]/40 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                            <th className="py-3 pl-4 w-12 text-center">#</th>
                            <th className="py-3 px-3">Música / Artista</th>
                            <th className="py-3 px-3 hidden md:table-cell">Álbum</th>
                            <th className="py-3 pr-4 w-40 text-right">Duração</th>
                          </tr>
                        </thead>
                        <tbody>
                          {playbackHistory
                            .map(trackId => TRACK_LIST.find(t => t.id === trackId))
                            .filter((t): t is Track => !!t)
                            .map((track, idx) => (
                              <TrackRow
                                key={`${track.id}-history-${idx}`}
                                track={track}
                                index={idx}
                                currentTrackId={currentTrackId}
                                isPlaying={isPlaying}
                                isFavorite={favorites.includes(track.id)}
                                isDownloaded={downloaded.includes(track.id)}
                                onPlayPause={() => {
                                  if (currentTrackId === track.id) {
                                    handlePlayPause();
                                  } else {
                                    handlePlayTrack(track.id);
                                  }
                                }}
                                onToggleFavorite={handleToggleFavorite}
                                onToggleDownload={handleToggleDownload}
                                onAddToQueue={handleAddToQueue}
                                onPlayNext={handlePlayNext}
                                customPlaylists={customPlaylists}
                                onAddToPlaylist={handleAddToPlaylist}
                                onCreatePlaylist={handleCreatePlaylist}
                              />
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: LIBRARY OFFLINE / DOWNLOADED (Offline) */}
              {activeTab === 'library-offline' && !selectedPlaylistId && (
                <div id="offline-view-pane" className="space-y-6 animate-fade-in">
                  <div className="flex items-center gap-4 border-b border-[#261E17]/40 pb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand to-brand/70 flex items-center justify-center text-white shadow-lg shadow-brand/10 border border-brand/20">
                      <Download className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-extrabold text-white">Músicas Baixadas (Cache Local)</h2>
                      <p className="text-sm text-stone-400 mt-1">Lista de faixas salvas localmente prontas para ouvir sem internet.</p>
                    </div>
                  </div>

                  {downloaded.length === 0 ? (
                    <div className="py-16 text-center border border-dashed border-[#261E17] rounded-xl">
                      <Download className="w-8 h-8 text-stone-600 mx-auto mb-2" />
                      <p className="text-sm text-stone-400 font-semibold">Nenhuma música baixada</p>
                      <p className="text-xs text-stone-500 mt-1">Clique no ícone de download (seta para baixo) nas faixas para ouvi-las offline.</p>
                    </div>
                  ) : (
                    <div className="bg-stone-950/40 rounded-xl border border-[#261E17]/40 overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#261E17]/40 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                            <th className="py-3 pl-4 w-12 text-center">#</th>
                            <th className="py-3 px-3">Música / Artista</th>
                            <th className="py-3 px-3 hidden md:table-cell">Álbum</th>
                            <th className="py-3 pr-4 w-40 text-right">Duração</th>
                          </tr>
                        </thead>
                        <tbody>
                          {TRACK_LIST.filter(t => downloaded.includes(t.id)).map((track, idx) => (
                            <TrackRow
                              key={track.id}
                              track={track}
                              index={idx}
                              currentTrackId={currentTrackId}
                              isPlaying={isPlaying}
                              isFavorite={favorites.includes(track.id)}
                              isDownloaded={true}
                              onPlayPause={() => {
                                if (currentTrackId === track.id) {
                                  handlePlayPause();
                                } else {
                                  handlePlayTrack(track.id, TRACK_LIST.filter(t => downloaded.includes(t.id)).map(t => t.id));
                                }
                              }}
                              onToggleFavorite={handleToggleFavorite}
                              onToggleDownload={handleToggleDownload}
                              onAddToQueue={handleAddToQueue}
                              onPlayNext={handlePlayNext}
                              customPlaylists={customPlaylists}
                              onAddToPlaylist={handleAddToPlaylist}
                              onCreatePlaylist={handleCreatePlaylist}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: LIBRARY CUSTOM PLAYLISTS - Grid dashboard of custom playlists */}
              {activeTab === 'library-playlists' && !selectedPlaylistId && (
                <div id="custom-playlists-view" className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-[#261E17]/40 pb-6">
                    <div>
                      <h2 className="text-3xl font-extrabold text-white">Suas Playlists</h2>
                      <p className="text-sm text-stone-400 mt-1">Sua coleção de playlists personalizadas sincronizadas na nuvem.</p>
                    </div>
                    <button
                      onClick={handleCreatePlaylist}
                      className="px-4 py-2 rounded-xl bg-brand hover:bg-brand/95 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-brand/15 active:scale-95"
                    >
                      <Plus className="w-4 h-4" /> Criar Playlist
                    </button>
                  </div>

                  {customPlaylists.length === 0 ? (
                    <div className="py-12 text-center border border-dashed border-[#261E17] rounded-xl space-y-4 max-w-md mx-auto my-12">
                      <Music className="w-12 h-12 text-brand/40 mx-auto" />
                      <h3 className="text-lg font-bold text-white">Nenhuma playlist criada</h3>
                      <p className="text-xs text-stone-500 leading-relaxed px-6">Escolha uma playlist no menu esquerdo na seção de "Minhas Playlists" ou crie uma nova agora mesmo para começar a organizar sua coleção.</p>
                      <button
                        onClick={handleCreatePlaylist}
                        className="px-4 py-2 rounded-lg bg-brand text-white font-bold text-xs hover:bg-[#ff2d55] transition-colors"
                      >
                        Criar Nova Playlist
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {customPlaylists.map((playlist) => (
                        <div 
                          key={playlist.id}
                          onClick={() => {
                            setSelectedPlaylistId(playlist.id);
                          }}
                          className="group flex items-center gap-4 bg-stone-900/40 hover:bg-stone-850/60 p-3 rounded-xl border border-[#261E17]/30 transition-all cursor-pointer relative"
                        >
                          <img 
                            src={playlist.coverUrl} 
                            alt={playlist.name} 
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border border-[#261E17]/40"
                          />
                          <div className="min-w-0 flex-1 text-left">
                            <span className="text-[10px] font-bold text-brand uppercase tracking-widest font-mono">
                              {playlist.tracks.length} {playlist.tracks.length === 1 ? 'faixa' : 'faixas'}
                            </span>
                            <h4 className="text-sm font-bold text-white group-hover:text-brand transition-colors truncate mt-0.5">{playlist.name}</h4>
                            <p className="text-xs text-stone-400 line-clamp-1 mt-0.5">{playlist.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* C. Render SELECTED PLAYLIST/ALBUM DETAIL VIEW (Matches Screenshot 2 layout) */}
          {selectedPlaylistId && (
            (() => {
              // Find playlist in system or custom list
              const systemPl = SYSTEM_PLAYLISTS.find(p => p.id === selectedPlaylistId);
              const customPl = customPlaylists.find(p => p.id === selectedPlaylistId);
              const playlist = systemPl || customPl;

              if (!playlist) return null;

              // Filter tracks matching offline mode if enabled
              const plTrackIds = playlist.tracks;
              const plTracks = TRACK_LIST.filter(t => plTrackIds.includes(t.id));

              return (
                <div id="playlist-detail-container" className="space-y-8 animate-fade-in">
                  
                  {/* Playlist Profile Card (Screenshot 2: Cover on left, Metadata on right) */}
                  <div className="flex flex-col md:flex-row gap-8 items-start border-b border-[#261E17]/40 pb-8">
                    <div className="relative aspect-square w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 border border-[#261E17]/50">
                      <img src={playlist.coverUrl} alt={playlist.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 text-left min-w-0">
                      <span className="text-[10px] font-bold text-brand uppercase tracking-widest font-mono">
                        {playlist.creator || 'Curadoria Celeiro'}
                      </span>
                      <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mt-1.5 font-sans">
                        {playlist.name}
                      </h2>
                      <p className="text-xs text-stone-400 mt-1 font-mono uppercase">
                        {playlist.updatedAt || 'Atualizada recentemente'}
                      </p>
                      
                      <p className="text-sm text-stone-300 mt-4 leading-relaxed font-medium">
                        {playlist.description}
                      </p>

                      <div className="mt-6 flex flex-wrap items-center gap-4">
                        {/* Play "Prévia" Button */}
                        <button
                          id="play-playlist-btn"
                          onClick={() => {
                            if (plTracks.length > 0) {
                              const firstTrack = plTracks[0].id;
                              handlePlayTrack(firstTrack, plTracks.map(t => t.id));
                            }
                          }}
                          className="px-6 py-2.5 rounded-lg bg-white text-stone-950 font-bold text-xs hover:bg-brand hover:text-white transition-colors shadow-lg flex items-center gap-1.5"
                          disabled={plTracks.length === 0}
                        >
                          <Play className="w-4 h-4 fill-current text-stone-950" /> Prévia
                        </button>

                        {/* Mix/Shuffle Button */}
                        <button
                          id="mix-playlist-btn"
                          onClick={() => {
                            if (plTracks.length > 0) {
                              const rand = plTracks[Math.floor(Math.random() * plTracks.length)].id;
                              const shuffled = plTracks.map(t => t.id).sort(() => Math.random() - 0.5);
                              handlePlayTrack(rand, shuffled);
                            }
                          }}
                          className="px-6 py-2.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-200 hover:text-white font-bold text-xs hover:bg-stone-850 transition-colors flex items-center gap-1.5"
                          disabled={plTracks.length === 0}
                        >
                          <Shuffle className="w-4 h-4" /> Mix Aleatório
                        </button>

                        {/* Delete playlist if custom */}
                        {playlist.type === 'custom' && (
                          <button
                            onClick={() => handleDeletePlaylist(playlist.id)}
                            className="px-4 py-2.5 rounded-lg bg-rose-600/10 border border-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
                          >
                            <Trash2 className="w-4 h-4" /> Excluir Playlist
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tracks list table (Screenshot 2 style) */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4">Músicas</h3>

                    {plTracks.length === 0 ? (
                      <div className="py-12 text-center border border-dashed border-[#261E17] rounded-xl text-stone-500 text-xs leading-relaxed space-y-2">
                        <Music className="w-8 h-8 mx-auto text-stone-600" />
                        <p className="font-semibold">Nenhuma música nesta playlist</p>
                        <p>Para adicionar faixas, navegue pelas abas Explorar ou Novidades, clique nas reticências (...) de qualquer canção e selecione esta playlist.</p>
                      </div>
                    ) : (
                      <div className="bg-stone-950/40 rounded-xl border border-[#261E17]/40 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-[#261E17]/40 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                              <th className="py-3 pl-4 w-12 text-center">#</th>
                              <th className="py-3 px-3">Música / Artista</th>
                              <th className="py-3 px-3 hidden md:table-cell">Álbum</th>
                              <th className="py-3 pr-4 w-40 text-right">Duração</th>
                            </tr>
                          </thead>
                          <tbody>
                            {plTracks.map((track, idx) => (
                              <TrackRow
                                key={track.id}
                                track={track}
                                index={idx}
                                currentTrackId={currentTrackId}
                                isPlaying={isPlaying}
                                isFavorite={favorites.includes(track.id)}
                                isDownloaded={downloaded.includes(track.id)}
                                onPlayPause={() => {
                                  if (currentTrackId === track.id) {
                                    handlePlayPause();
                                  } else {
                                    handlePlayTrack(track.id, plTracks.map(t => t.id));
                                  }
                                }}
                                onToggleFavorite={handleToggleFavorite}
                                onToggleDownload={handleToggleDownload}
                                onAddToQueue={handleAddToQueue}
                                onPlayNext={handlePlayNext}
                                customPlaylists={customPlaylists}
                                onAddToPlaylist={handleAddToPlaylist}
                                onCreatePlaylist={handleCreatePlaylist}
                                onRemoveFromPlaylist={() => handleRemoveFromPlaylist(playlist.id, track.id)}
                                showRemoveOption={playlist.type === 'custom'}
                              />
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()
          )}
        </main>

        {/* 3. Floating Bottom Media Player bar */}
        <BottomPlayer 
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          isMuted={isMuted}
          isShuffle={isShuffle}
          repeatMode={repeatMode}
          onPlayPause={handlePlayPause}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onSeek={handleSeek}
          onVolumeChange={setVolume}
          onMuteToggle={handleMuteToggle}
          onShuffleToggle={handleShuffleToggle}
          onRepeatToggle={handleRepeatToggle}
          onOpenFullScreen={() => setIsFullScreenOpen(true)}
          isFavorite={currentTrack ? favorites.includes(currentTrack.id) : false}
          onToggleFavorite={() => currentTrack && handleToggleFavorite(currentTrack.id)}
          isDownloaded={currentTrack ? downloaded.includes(currentTrack.id) : false}
          onToggleDownload={() => currentTrack && handleToggleDownload(currentTrack.id)}
          onToggleQueueDrawer={() => setIsQueueDrawerOpen(!isQueueDrawerOpen)}
          isQueueDrawerOpen={isQueueDrawerOpen}
          synthActive={synthActive}
          customPlaylists={customPlaylists}
          onAddToPlaylist={handleAddToPlaylist}
          onCreatePlaylist={handleCreatePlaylist}
        />

        {/* 4. togglable Sliding Right-side Queue Drawer Panel */}
        {isQueueDrawerOpen && currentTrack && (
          <div 
            id="queue-panel-drawer"
            className="absolute right-6 top-6 bottom-32 w-80 md:w-96 bg-[#1c1c1e]/95 backdrop-blur-xl border border-white/10 z-30 p-6 flex flex-col select-none rounded-[24px] shadow-2xl animate-slide-in-right"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <h3 className="text-lg font-black text-white font-sans tracking-tight">
                Seguintes
              </h3>
              <button 
                onClick={handleClearQueue}
                className="text-xs text-[#dfb26f] hover:underline font-bold transition-all"
              >
                Apagar
              </button>
            </div>

            {/* List of upcoming tracks */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
              {(() => {
                const upcoming = queue.length > 0 
                  ? queue.map(id => TRACK_LIST.find(t => t.id === id)).filter((t): t is Track => !!t)
                  : TRACK_LIST.filter(t => t.id !== currentTrackId);

                if (upcoming.length === 0) {
                  return (
                    <div className="text-center py-12 border border-dashed border-white/5 rounded-2xl text-stone-500 text-xs leading-relaxed">
                      Nenhuma música a seguir.
                    </div>
                  );
                }

                return upcoming.map((track, idx) => {
                  const formatDuration = (secs: number) => {
                    if (isNaN(secs)) return '0:00';
                    const mins = Math.floor(secs / 60);
                    const remain = Math.floor(secs % 60);
                    return `${mins}:${remain < 10 ? '0' : ''}${remain}`;
                  };

                  return (
                    <div 
                      key={`${track.id}-${idx}`}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.04] group transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Album Art with hovering minus icon */}
                        <div className="relative shrink-0 w-10 h-10 rounded-lg overflow-hidden border border-white/5">
                          <img src={track.coverUrl} className="w-full h-full object-cover" />
                          
                          {/* Red minus button on hover over album cover */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (queue.length > 0) {
                                handleRemoveFromQueue(track.id);
                              } else {
                                // If auto queue, we can skip it by playing next or just remove it temporarily
                                setQueue(prev => prev.filter(id => id !== track.id));
                              }
                            }}
                            className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="Remover"
                          >
                            <MinusCircle className="w-5 h-5 text-[#dfb26f] fill-[#1c1c1e]" />
                          </button>
                        </div>

                        {/* Title & Artist */}
                        <div className="min-w-0 flex-1">
                          <span className="block text-xs font-bold text-stone-200 truncate leading-tight group-hover:text-white transition-colors">{track.title}</span>
                          <span className="block text-[10px] text-[#8e8e93] truncate leading-tight mt-0.5">{track.artist}</span>
                        </div>
                      </div>

                      {/* Exact minutage of the song on the right */}
                      <span className="text-xs font-mono font-medium text-[#8e8e93] pl-2 shrink-0 select-none">
                        {formatDuration(track.duration)}
                      </span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

      </div>
    </div>

      {/* 5. Immersive Fullscreen Scrolling Lyrics & Ambient Shifting background overlay */}
      {isFullScreenOpen && currentTrack && (
        <FullScreenPlayer 
          track={currentTrack}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          isMuted={isMuted}
          isShuffle={isShuffle}
          repeatMode={repeatMode}
          onClose={() => setIsFullScreenOpen(false)}
          onPlayPause={handlePlayPause}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onSeek={handleSeek}
          onVolumeChange={setVolume}
          onMuteToggle={handleMuteToggle}
          onShuffleToggle={handleShuffleToggle}
          onRepeatToggle={handleRepeatToggle}
          isFavorite={favorites.includes(currentTrack.id)}
          onToggleFavorite={() => handleToggleFavorite(currentTrack.id)}
          isDownloaded={downloaded.includes(currentTrack.id)}
          onToggleDownload={() => handleToggleDownload(currentTrack.id)}
          synthActive={synthActive}
          customPlaylists={customPlaylists}
          onAddToPlaylist={handleAddToPlaylist}
          onCreatePlaylist={handleCreatePlaylist}
          trackList={TRACK_LIST}
          queue={queue}
          playbackHistory={playbackHistory}
          onSelectTrack={(trackId: string) => handlePlayTrack(trackId)}
        />
      )}

      {/* 6. Google Login Modal popup */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onLoginSuccess={(profile) => {
          setUserProfile(profile);
          localStorage.setItem('celeiro_user_profile', JSON.stringify(profile));
        }} 
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProfile={userProfile}
        onProfileUpdate={(updatedProfile) => {
          setUserProfile(updatedProfile);
          localStorage.setItem('celeiro_user_profile', JSON.stringify(updatedProfile));
        }}
        showToast={showToast}
      />

      <PlaylistModal
        isOpen={isPlaylistModalOpen}
        onClose={() => setIsPlaylistModalOpen(false)}
        onCreate={handleCreatePlaylistConfirm}
      />

      {/* 7. Premium Toast Notifications */}
      {toastMessage && (
        <div 
          id="custom-toast-notification"
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-stone-900/95 border border-white/10 text-white font-medium text-xs shadow-xl backdrop-blur-md animate-fade-in"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#dfb26f]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 8. Fullscreen Secure Sign Out Animation Overlay */}
      {isLoggingOut && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-2xl animate-fade-in text-white select-none">
          <div className="flex flex-col items-center max-w-sm text-center px-6">
            <div className="relative mb-6">
              {/* Spinning glow ring */}
              <div className="absolute inset-0 rounded-full border border-[#dfb26f]/10 animate-ping" />
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#dfb26f]/20 to-[#dfb26f]/5 border border-[#dfb26f]/25 flex items-center justify-center relative shadow-xl shadow-[#dfb26f]/10">
                <Loader2 className="w-10 h-10 text-[#dfb26f] animate-spin absolute" style={{ animationDuration: '1.2s' }} />
                <Lock className="w-5 h-5 text-white absolute animate-pulse" />
              </div>
            </div>
            
            <h3 className="text-lg font-black tracking-tight mb-2">Encerrando Sessão</h3>
            <p className="text-xs text-stone-400 mb-5 leading-normal">
              Limpando tokens temporários e salvando suas playlists de forma segura...
            </p>
            
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-[#dfb26f] animate-pulse" />
              <span className="text-[10px] font-mono tracking-wider text-stone-300 uppercase">
                Conexão criptografada SSL
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
