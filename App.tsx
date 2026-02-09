
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Movie, ROOT_LANGUAGES, GENRE_MAP, DEFAULT_GENRES, CloudConfig } from './types';
import MovieCard from './components/MovieCard';
import MovieForm from './components/MovieForm';
import { fetchRemoteLibrary, generateSyncPackage } from './services/syncService';

const App: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [activeLanguage, setActiveLanguage] = useState<string>(ROOT_LANGUAGES[0]);
  const [activeGenre, setActiveGenre] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [movieToEdit, setMovieToEdit] = useState<Movie | undefined>(undefined);
  
  // Cloud Sync State
  const [config, setConfig] = useState<CloudConfig>({
    remoteUrl: localStorage.getItem('sync_url') || '',
    isAdmin: localStorage.getItem('is_admin') === 'true',
    syncInterval: 5,
    lastSync: 0
  });
  const [isSyncing, setIsSyncing] = useState(false);

  // Custom Modal States
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [urlInput, setUrlInput] = useState(config.remoteUrl);
  const [modalError, setModalError] = useState('');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'fail'>('idle');

  const logoRef = useRef<HTMLDivElement>(null);
  const gearRef = useRef<HTMLButtonElement>(null);

  // Load persistence
  useEffect(() => {
    const saved = localStorage.getItem('cinelaunch_v2_movies');
    if (saved) {
      try { setMovies(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  // Sync Logic
  const performSync = useCallback(async () => {
    if (config.isAdmin || !config.remoteUrl) return;
    setIsSyncing(true);
    const remoteData = await fetchRemoteLibrary(config.remoteUrl);
    if (remoteData) {
      setMovies(remoteData);
      localStorage.setItem('cinelaunch_v2_movies', JSON.stringify(remoteData));
      setConfig(prev => ({ ...prev, lastSync: Date.now() }));
    }
    setIsSyncing(false);
  }, [config.remoteUrl, config.isAdmin]);

  useEffect(() => {
    performSync();
    const interval = setInterval(performSync, config.syncInterval * 60 * 1000);
    return () => clearInterval(interval);
  }, [performSync, config.syncInterval]);

  useEffect(() => {
    if (config.isAdmin) {
      localStorage.setItem('cinelaunch_v2_movies', JSON.stringify(movies));
    }
  }, [movies, config.isAdmin]);

  const handleSave = useCallback((movie: Movie) => {
    if (!config.isAdmin) return;
    setMovies(prev => {
      const exists = prev.find(m => m.id === movie.id);
      if (exists) return prev.map(m => m.id === movie.id ? movie : m);
      return [movie, ...prev];
    });
    setIsFormOpen(false);
    setMovieToEdit(undefined);
  }, [config.isAdmin]);

  const handleDelete = useCallback((id: string) => {
    if (!config.isAdmin) return;
    setMovies(prev => prev.filter(m => m.id !== id));
  }, [config.isAdmin]);

  const handleEdit = useCallback((movie: Movie) => {
    if (!config.isAdmin) return;
    setMovieToEdit(movie);
    setIsFormOpen(true);
  }, [config.isAdmin]);

  const filteredMovies = useMemo(() => {
    return movies.filter(m => {
      const matchLang = m.language === activeLanguage;
      const matchGenre = activeGenre === 'All' || m.category === activeGenre;
      const matchSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchLang && matchGenre && matchSearch;
    });
  }, [movies, activeLanguage, activeGenre, searchTerm]);

  const currentLanguageGenres = useMemo(() => {
    const custom = movies
      .filter(m => m.language === activeLanguage && !DEFAULT_GENRES.includes(m.category))
      .map(m => m.category);
    return Array.from(new Set([...DEFAULT_GENRES, ...custom]));
  }, [movies, activeLanguage]);

  // Admin Verification
  const verifyAdmin = useCallback(() => {
    if (passInput === "hotel2024") {
      const newState = !config.isAdmin;
      setConfig(prev => ({ ...prev, isAdmin: newState }));
      localStorage.setItem('is_admin', newState.toString());
      setIsPassModalOpen(false);
      setPassInput('');
      setModalError('');
    } else {
      setModalError("Invalid Security Key");
    }
  }, [passInput, config.isAdmin]);

  const testConnection = async () => {
    if (!urlInput.startsWith('http')) {
      setModalError("URL must start with http:// or https://");
      return;
    }
    setTestStatus('testing');
    setModalError('');
    const data = await fetchRemoteLibrary(urlInput);
    if (data) {
      setTestStatus('success');
    } else {
      setTestStatus('fail');
      setModalError("Could not reach library. Check URL or CORS settings.");
    }
  };

  const saveRemoteUrl = useCallback(() => {
    if (!urlInput.startsWith('http')) {
      setModalError("Invalid URL format");
      return;
    }
    setConfig(prev => ({ ...prev, remoteUrl: urlInput }));
    localStorage.setItem('sync_url', urlInput);
    setIsUrlModalOpen(false);
    setModalError('');
    setTestStatus('idle');
  }, [urlInput]);

  return (
    <div className="min-h-screen pb-32 bg-[#050810]">
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-3xl border-b border-white/5 px-8 pt-8 pb-6 shadow-2xl">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
            <div 
              ref={logoRef}
              role="button"
              tabIndex={0}
              onClick={() => setIsPassModalOpen(true)}
              onKeyDown={(e) => e.key === 'Enter' && setIsPassModalOpen(true)}
              className="flex items-center gap-6 cursor-pointer p-3 rounded-3xl transition-all focus:ring-4 focus:ring-sky-500 focus:bg-white/5 active:scale-95 group outline-none"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg shadow-sky-500/20 transform -rotate-2">
                <i className={`fas ${config.isAdmin ? 'fa-user-shield' : 'fa-play-circle'}`}></i>
              </div>
              <div>
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic group-focus:text-sky-400">
                  CineLaunch <span className="text-sky-500 not-italic">TV</span>
                </h1>
                <p className="text-[10px] text-slate-500 font-bold tracking-[0.4em] uppercase">
                  {config.isAdmin ? 'MASTER CLOUD CONTROLLER' : 'Private Theater Engine'}
                </p>
              </div>
            </div>

            <div className="flex-1 max-w-xl w-full relative group">
              <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-sky-400 transition-colors"></i>
              <input 
                type="text" 
                placeholder="Find a masterpiece..."
                className="w-full bg-slate-900/60 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-slate-100 focus:ring-4 focus:ring-sky-500 focus:bg-slate-900 transition-all outline-none font-medium text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-4">
               {config.isAdmin && (
                 <>
                   <button 
                     onClick={() => generateSyncPackage(movies)}
                     className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all active:scale-95 outline-none focus:ring-4 focus:ring-sky-500"
                   >
                     <i className="fas fa-cloud-upload-alt mr-2"></i> Deploy
                   </button>
                   <button 
                     onClick={() => { setMovieToEdit(undefined); setIsFormOpen(true); }}
                     className="bg-sky-500 hover:bg-sky-400 text-white px-8 py-4 rounded-2xl font-black text-lg uppercase tracking-widest shadow-xl shadow-sky-500/20 transition-all active:scale-95 outline-none focus:ring-4 focus:ring-sky-500"
                   >
                     <i className="fas fa-plus mr-3"></i> Add Video
                   </button>
                 </>
               )}
               
               <button 
                 ref={gearRef}
                 onClick={() => setIsUrlModalOpen(true)}
                 onKeyDown={(e) => e.key === 'Enter' && setIsUrlModalOpen(true)}
                 className={`p-4 rounded-2xl transition-all active:scale-95 outline-none focus:ring-4 focus:ring-sky-500 ${config.remoteUrl ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                 title="Cloud Sync URL"
               >
                 <i className="fas fa-cog text-2xl"></i>
               </button>
            </div>
          </div>

          <div className="flex items-center gap-6 mb-8 border-b border-white/5 pb-4 overflow-x-auto no-scrollbar">
            <span className="text-xl font-black text-slate-500 uppercase tracking-widest mr-4 whitespace-nowrap">Region:</span>
            {ROOT_LANGUAGES.map(lang => (
              <button
                key={lang}
                onClick={() => { setActiveLanguage(lang); setActiveGenre('All'); }}
                className={`px-8 py-3 rounded-2xl text-xl font-black uppercase tracking-widest transition-all whitespace-nowrap outline-none ${
                  activeLanguage === lang 
                  ? 'bg-white text-slate-950 shadow-2xl scale-110' 
                  : 'text-slate-500 hover:text-white hover:bg-white/5 focus:bg-white/10'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2">
            <button
              onClick={() => setActiveGenre('All')}
              className={`px-6 py-2.5 rounded-full text-lg font-black uppercase tracking-widest border transition-all whitespace-nowrap outline-none ${
                activeGenre === 'All'
                ? 'bg-sky-500 border-sky-400 text-white shadow-xl shadow-sky-500/40 scale-105'
                : 'bg-slate-900/40 border-white/5 text-slate-400 hover:border-white/20 focus:bg-white/5'
              }`}
            >
              {GENRE_MAP[activeLanguage]?.['All'] || 'All Collections'}
            </button>
            {currentLanguageGenres.map(genre => (
              <button
                key={genre}
                onClick={() => setActiveGenre(genre)}
                className={`px-6 py-2.5 rounded-full text-lg font-black uppercase tracking-widest border transition-all whitespace-nowrap outline-none ${
                  activeGenre === genre
                  ? 'bg-sky-500 border-sky-400 text-white shadow-xl shadow-sky-500/40 scale-105'
                  : 'bg-slate-900/40 border-white/5 text-slate-400 hover:border-white/20 focus:bg-white/5'
                }`}
              >
                {GENRE_MAP[activeLanguage]?.[genre] || genre}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-8 mt-12">
        {filteredMovies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 animate-in fade-in duration-1000">
            <div className="w-32 h-32 bg-slate-900/50 rounded-full flex items-center justify-center mb-8 border border-white/5">
              <i className={`fas ${isSyncing ? 'fa-sync fa-spin text-sky-500' : 'fa-compact-disc fa-spin text-slate-700'} text-5xl`}></i>
            </div>
            <h2 className="text-3xl font-black text-slate-400 tracking-widest uppercase italic">
              {isSyncing ? 'Synchronizing with Cloud...' : 'The Library is Silent'}
            </h2>
            <p className="text-slate-600 mt-4 font-bold uppercase tracking-widest text-xs">
              {config.isAdmin ? 'Click + Add Video to begin' : 'Waiting for sync command from Master'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-10">
            {filteredMovies.map(movie => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                onDelete={handleDelete} 
                onEdit={handleEdit}
                readOnly={!config.isAdmin}
              />
            ))}
          </div>
        )}
      </main>

      {/* CUSTOM PASS MODAL */}
      {isPassModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-6 modal-enter">
          <div className="bg-slate-900 border border-white/10 p-10 rounded-[3rem] w-full max-w-lg shadow-2xl space-y-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-sky-500/20 rounded-3xl flex items-center justify-center text-sky-500 text-4xl mx-auto mb-6">
                <i className="fas fa-lock"></i>
              </div>
              <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Security Access</h3>
              <p className="text-slate-400 mt-2 font-bold uppercase text-[10px] tracking-widest">Enter Management Key</p>
            </div>
            {modalError && <p className="text-red-400 text-center text-xs font-black uppercase tracking-widest animate-pulse">{modalError}</p>}
            <input 
              autoFocus
              type="password"
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-white/10 rounded-2xl py-6 px-8 text-white text-center text-3xl focus:ring-4 focus:ring-sky-500 outline-none"
              value={passInput}
              onChange={(e) => setPassInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && verifyAdmin()}
            />
            <div className="grid grid-cols-2 gap-4">
              <button 
                tabIndex={0}
                onClick={() => { setIsPassModalOpen(false); setModalError(''); setPassInput(''); }}
                onKeyDown={(e) => e.key === 'Enter' && setIsPassModalOpen(false)}
                className="py-5 bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest active:scale-95 outline-none focus:bg-white/10"
              >
                Cancel
              </button>
              <button 
                tabIndex={0}
                onClick={verifyAdmin}
                onKeyDown={(e) => e.key === 'Enter' && verifyAdmin()}
                className="py-5 bg-sky-500 text-white rounded-2xl font-black uppercase tracking-widest active:scale-95 shadow-xl shadow-sky-500/20 outline-none focus:bg-sky-400"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM URL MODAL (CLOUD CONFIG) */}
      {isUrlModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-6 modal-enter">
          <div className="bg-slate-900 border border-white/10 p-10 rounded-[3rem] w-full max-w-3xl shadow-2xl space-y-8 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="text-center">
              <div className="w-20 h-20 bg-sky-500/20 rounded-3xl flex items-center justify-center text-sky-500 text-4xl mx-auto mb-6">
                <i className="fas fa-cloud"></i>
              </div>
              <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Cloud Synchronization</h3>
              <p className="text-slate-400 mt-2 font-bold uppercase text-[10px] tracking-widest">Connect your 200 TVs</p>
            </div>

            <div className="bg-white/5 p-6 rounded-2xl space-y-4">
              <p className="text-sky-400 font-black uppercase text-xs tracking-widest">How to sync:</p>
              <ol className="text-slate-300 text-sm space-y-2 list-decimal list-inside font-medium leading-relaxed">
                <li>On Master Device: Add movies & click <span className="text-emerald-400">Deploy</span>.</li>
                <li>Upload the file to a host (GitHub, Dropbox, etc).</li>
                <li>Paste the public <span className="underline">Raw JSON URL</span> below.</li>
                <li>Wait 5 mins for automatic library update.</li>
              </ol>
            </div>

            <div className="space-y-4">
              {modalError && <p className="text-red-400 text-center text-xs font-black uppercase tracking-widest">{modalError}</p>}
              {testStatus === 'success' && <p className="text-emerald-400 text-center text-xs font-black uppercase tracking-widest">Connection Verified!</p>}
              
              <input 
                autoFocus
                type="url"
                placeholder="https://server.com/vault.json"
                className="w-full bg-slate-950 border border-white/10 rounded-2xl py-6 px-8 text-white text-lg focus:ring-4 focus:ring-sky-500 outline-none font-mono"
                value={urlInput}
                onChange={(e) => { setUrlInput(e.target.value); setTestStatus('idle'); }}
                onKeyDown={(e) => e.key === 'Enter' && testConnection()}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <button 
                tabIndex={0}
                onClick={() => { setIsUrlModalOpen(false); setModalError(''); setTestStatus('idle'); }}
                onKeyDown={(e) => e.key === 'Enter' && setIsUrlModalOpen(false)}
                className="py-5 bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest active:scale-95 outline-none focus:bg-white/10"
              >
                Close
              </button>
              <button 
                tabIndex={0}
                onClick={testConnection}
                onKeyDown={(e) => e.key === 'Enter' && testConnection()}
                disabled={testStatus === 'testing'}
                className="py-5 bg-white/5 text-sky-400 border border-sky-500/20 rounded-2xl font-black uppercase tracking-widest active:scale-95 outline-none focus:bg-sky-500/20"
              >
                {testStatus === 'testing' ? 'Testing...' : 'Test URL'}
              </button>
              <button 
                tabIndex={0}
                onClick={saveRemoteUrl}
                onKeyDown={(e) => e.key === 'Enter' && saveRemoteUrl()}
                className="py-5 bg-sky-500 text-white rounded-2xl font-black uppercase tracking-widest active:scale-95 shadow-xl shadow-sky-500/20 outline-none focus:bg-sky-400"
              >
                Save & Link
              </button>
            </div>
          </div>
        </div>
      )}

      {isFormOpen && (
        <MovieForm 
          movieToEdit={movieToEdit}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSave}
        />
      )}

      <footer className="fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-2xl border-t border-white/5 px-12 py-5 text-xs text-slate-500 flex justify-between items-center z-50">
        <div className="flex items-center gap-6">
          <span className="font-black text-white/80 tracking-widest uppercase text-base italic">CineLaunch <span className="text-sky-500">v3.6</span></span>
          <div className="h-4 w-px bg-white/10"></div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${config.remoteUrl ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`}></div>
            <span className="font-bold text-sm uppercase tracking-tighter">
               {config.isAdmin ? 'MASTER CONTROLLER' : (config.remoteUrl ? `CLOUD SYNC ACTIVE` : 'OFFLINE MODE')}
            </span>
          </div>
          {isSyncing && <span className="text-sky-500 font-black animate-pulse ml-2 uppercase tracking-widest">FETCHING DATA...</span>}
        </div>
        <div className="flex gap-10 font-black uppercase tracking-[0.2em] text-sm">
          <span className="flex items-center gap-2"><kbd className="bg-slate-800 px-2 py-1 rounded border border-white/10 text-sky-400 shadow-inner">OK</kbd> Launch</span>
          <span className="flex items-center gap-2"><kbd className="bg-slate-800 px-2 py-1 rounded border border-white/10 text-sky-400 shadow-inner">INFO</kbd> Plot</span>
          {config.isAdmin && <span className="flex items-center gap-2"><kbd className="bg-slate-800 px-2 py-1 rounded border border-white/10 text-sky-400 shadow-inner">MENU</kbd> Edit</span>}
        </div>
      </footer>
    </div>
  );
};

export default App;
