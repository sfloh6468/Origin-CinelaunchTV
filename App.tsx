
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Movie, ROOT_LANGUAGES, GENRE_MAP, DEFAULT_GENRES } from './types';
import MovieCard from './components/MovieCard';
import MovieForm from './components/MovieForm';

const App: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [activeLanguage, setActiveLanguage] = useState<string>(ROOT_LANGUAGES[0]);
  const [activeGenre, setActiveGenre] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [movieToEdit, setMovieToEdit] = useState<Movie | undefined>(undefined);

  // Load persistence
  useEffect(() => {
    const saved = localStorage.getItem('cinelaunch_v2_movies');
    if (saved) {
      try { setMovies(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cinelaunch_v2_movies', JSON.stringify(movies));
  }, [movies]);

  const handleSave = useCallback((movie: Movie) => {
    setMovies(prev => {
      const exists = prev.find(m => m.id === movie.id);
      if (exists) return prev.map(m => m.id === movie.id ? movie : m);
      return [movie, ...prev];
    });
    setIsFormOpen(false);
    setMovieToEdit(undefined);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setMovies(prev => prev.filter(m => m.id !== id));
  }, []);

  const handleEdit = useCallback((movie: Movie) => {
    setMovieToEdit(movie);
    setIsFormOpen(true);
  }, []);

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

  return (
    <div className="min-h-screen pb-32 bg-[#050810]">
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-3xl border-b border-white/5 px-8 pt-8 pb-6 shadow-2xl">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg shadow-sky-500/20 transform -rotate-2">
                <i className="fas fa-play-circle"></i>
              </div>
              <div>
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                  CineLaunch <span className="text-sky-500 not-italic">TV</span>
                </h1>
                <p className="text-[10px] text-slate-500 font-bold tracking-[0.4em] uppercase">Private Theater Engine</p>
              </div>
            </div>

            <div className="flex-1 max-w-xl w-full relative group">
              <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-sky-400 transition-colors"></i>
              <input 
                type="text" 
                placeholder="Find a masterpiece..."
                className="w-full bg-slate-900/60 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-slate-100 focus:ring-2 focus:ring-sky-500 focus:bg-slate-900 transition-all outline-none font-medium text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button 
              onClick={() => { setMovieToEdit(undefined); setIsFormOpen(true); }}
              className="bg-sky-500 hover:bg-sky-400 text-white px-8 py-4 rounded-2xl font-black text-lg uppercase tracking-widest shadow-xl shadow-sky-500/20 active:scale-95 transition-all"
            >
              <i className="fas fa-plus mr-3"></i> Add Video
            </button>
          </div>

          {/* ROOT MENU: Language Selector - REDUCED FROM 2XL TO XL */}
          <div className="flex items-center gap-6 mb-8 border-b border-white/5 pb-4">
            <span className="text-xl font-black text-slate-500 uppercase tracking-widest mr-4">Region:</span>
            {ROOT_LANGUAGES.map(lang => (
              <button
                key={lang}
                onClick={() => { setActiveLanguage(lang); setActiveGenre('All'); }}
                className={`px-8 py-3 rounded-2xl text-xl font-black uppercase tracking-widest transition-all ${
                  activeLanguage === lang 
                  ? 'bg-white text-slate-950 shadow-2xl scale-110' 
                  : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* SUB MENU: Genre Selector - REDUCED FROM XL TO LG */}
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2">
            <button
              onClick={() => setActiveGenre('All')}
              className={`px-6 py-2.5 rounded-full text-lg font-black uppercase tracking-widest border transition-all ${
                activeGenre === 'All'
                ? 'bg-sky-500 border-sky-400 text-white shadow-xl shadow-sky-500/40'
                : 'bg-slate-900/40 border-white/5 text-slate-400 hover:border-white/20'
              }`}
            >
              {GENRE_MAP[activeLanguage]?.['All'] || 'All Collections'}
            </button>
            {currentLanguageGenres.map(genre => (
              <button
                key={genre}
                onClick={() => setActiveGenre(genre)}
                className={`px-6 py-2.5 rounded-full text-lg font-black uppercase tracking-widest border transition-all ${
                  activeGenre === genre
                  ? 'bg-sky-500 border-sky-400 text-white shadow-xl shadow-sky-500/40'
                  : 'bg-slate-900/40 border-white/5 text-slate-400 hover:border-white/20'
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
              <i className="fas fa-compact-disc fa-spin text-5xl text-slate-700"></i>
            </div>
            <h2 className="text-3xl font-black text-slate-400 tracking-widest uppercase italic">The Library is Silent</h2>
            <p className="text-xl text-slate-600 mt-4 font-medium">Add content to the {activeLanguage} collection to begin.</p>
          </div>
        ) : (
          /* BIG CARDS MAINTAINED (Fewer columns) */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-10">
            {filteredMovies.map(movie => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                onDelete={handleDelete} 
                onEdit={handleEdit} 
              />
            ))}
          </div>
        )}
      </main>

      {isFormOpen && (
        <MovieForm 
          movieToEdit={movieToEdit}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSave}
        />
      )}

      <footer className="fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-2xl border-t border-white/5 px-12 py-5 text-xs text-slate-500 flex justify-between items-center z-50">
        <div className="flex items-center gap-6">
          <span className="font-black text-white/80 tracking-widest uppercase text-base">CineLaunch v3.1</span>
          <div className="h-4 w-px bg-white/10"></div>
          <span className="font-bold text-sm">REGION: {activeLanguage.toUpperCase()}</span>
        </div>
        <div className="flex gap-10 font-black uppercase tracking-[0.2em] text-sm">
          <span className="flex items-center gap-2"><kbd className="bg-slate-800 px-2 py-1 rounded border border-white/10 text-sky-400">OK</kbd> Watch</span>
          <span className="flex items-center gap-2"><kbd className="bg-slate-800 px-2 py-1 rounded border border-white/10 text-sky-400">INFO</kbd> Story</span>
          <span className="flex items-center gap-2"><kbd className="bg-slate-800 px-2 py-1 rounded border border-white/10 text-sky-400">MENU</kbd> Edit</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
