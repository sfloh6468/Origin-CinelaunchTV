
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Movie, DEFAULT_CATEGORIES } from './types';
import MovieCard from './components/MovieCard';
import MovieForm from './components/MovieForm';

const App: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [movieToEdit, setMovieToEdit] = useState<Movie | undefined>(undefined);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Initial Load
  useEffect(() => {
    const savedMovies = localStorage.getItem('cinelaunch_movies');
    const savedCategories = localStorage.getItem('cinelaunch_categories');
    
    if (savedMovies) {
      try { 
        const parsed = JSON.parse(savedMovies);
        setMovies(parsed); 
      } catch (e) { console.error("Error loading movies:", e); }
    }
    
    if (savedCategories) {
      try { 
        const parsed = JSON.parse(savedCategories);
        const merged = Array.from(new Set([...DEFAULT_CATEGORIES, ...parsed]));
        setCategories(merged); 
      } catch (e) { console.error("Error loading categories:", e); }
    }
  }, []);

  // Sync to Storage
  useEffect(() => {
    localStorage.setItem('cinelaunch_movies', JSON.stringify(movies));
  }, [movies]);

  useEffect(() => {
    localStorage.setItem('cinelaunch_categories', JSON.stringify(categories));
  }, [categories]);

  const handleAddOrUpdateMovie = useCallback((movieData: Movie) => {
    setMovies(prev => {
      if (movieToEdit) {
        return prev.map(m => m.id === movieToEdit.id ? movieData : m);
      } else {
        return [movieData, ...prev];
      }
    });
    
    // Check if we need to add a new category to the global list
    if (movieData.category && !categories.includes(movieData.category)) {
      setCategories(prev => [...prev, movieData.category]);
    }

    setIsFormOpen(false);
    setMovieToEdit(undefined);
  }, [movieToEdit, categories]);

  const handleDeleteMovie = useCallback((id: string) => {
    setMovies(prev => prev.filter(m => m.id !== id));
  }, []);

  const handleEditClick = useCallback((movie: Movie) => {
    setMovieToEdit(movie);
    setIsFormOpen(true);
  }, []);

  const filteredMovies = useMemo(() => {
    return movies.filter(movie => {
      const matchesCategory = activeCategory === 'All' || movie.category === activeCategory;
      const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           movie.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [movies, activeCategory, searchTerm]);

  return (
    <div className="min-h-screen pb-24 bg-[#080c14] selection:bg-sky-500/30">
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-2xl border-b border-white/5 px-8 py-6 shadow-2xl">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-5">
            <div className="bg-gradient-to-tr from-sky-500 to-indigo-600 p-3 rounded-2xl shadow-2xl shadow-sky-500/40 transform -rotate-3 hover:rotate-0 transition-transform cursor-pointer">
              <i className="fas fa-play text-white text-2xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">CineLaunch <span className="text-sky-400 not-italic">TV</span></h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <p className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase">Private Cinema Hub</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 max-w-2xl w-full relative">
            <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"></i>
            <input 
              type="text" 
              placeholder="Search by title, description, or genre..." 
              className="w-full bg-slate-900/60 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-slate-100 focus:ring-2 focus:ring-sky-500 focus:bg-slate-900 transition-all outline-none placeholder:text-slate-600 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button 
            onClick={() => { setMovieToEdit(undefined); setIsFormOpen(true); }}
            className="flex items-center gap-3 bg-white text-slate-950 px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-sky-400 hover:text-white transition-all transform active:scale-95 shadow-xl shadow-white/5"
          >
            <i className="fas fa-plus-circle"></i>
            Add Video
          </button>
        </div>

        {/* Dynamic Categories Bar */}
        <div className="max-w-[1600px] mx-auto mt-8 flex gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
          <button 
            onClick={() => setActiveCategory('All')}
            className={`px-8 py-2.5 rounded-xl whitespace-nowrap text-xs font-black uppercase tracking-widest transition-all border ${
              activeCategory === 'All' 
              ? 'bg-sky-500 text-white border-sky-400 shadow-xl shadow-sky-500/30' 
              : 'bg-slate-900/40 text-slate-500 border-white/5 hover:border-white/20 hover:text-slate-200'
            }`}
          >
            All Collections
          </button>
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-8 py-2.5 rounded-xl whitespace-nowrap text-xs font-black uppercase tracking-widest transition-all border ${
                activeCategory === cat 
                ? 'bg-sky-500 text-white border-sky-400 shadow-xl shadow-sky-500/30' 
                : 'bg-slate-900/40 text-slate-500 border-white/5 hover:border-white/20 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-8 mt-12">
        {filteredMovies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 text-slate-500 text-center animate-in fade-in duration-700">
            <div className="w-32 h-32 bg-slate-900/40 rounded-full flex items-center justify-center mb-8 ring-1 ring-white/5">
              <i className="fas fa-video-slash text-5xl text-slate-700"></i>
            </div>
            <h2 className="text-3xl font-black text-slate-300 tracking-tight">Empty Library</h2>
            <p className="text-slate-500 mt-3 max-w-md text-lg font-medium leading-relaxed">Start adding YouTube videos to build your custom Google TV launcher.</p>
            <button 
              onClick={() => setIsFormOpen(true)} 
              className="mt-10 px-10 py-4 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-sky-500 hover:text-white transition-all"
            >
              Add first entry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-10">
            {filteredMovies.map(movie => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                onDelete={handleDeleteMovie}
                onEdit={handleEditClick}
              />
            ))}
          </div>
        )}
      </main>

      {isFormOpen && (
        <MovieForm 
          movieToEdit={movieToEdit}
          categories={categories}
          onClose={() => { setIsFormOpen(false); setMovieToEdit(undefined); }} 
          onSave={handleAddOrUpdateMovie} 
        />
      )}

      {/* Persistent TV Remote Helper */}
      <footer className="fixed bottom-0 left-0 right-0 bg-slate-950/95 border-t border-white/5 px-12 py-4 text-[11px] text-slate-500 flex justify-between items-center z-50 backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-sky-500 rounded-full"></div>
            <span className="font-black text-white tracking-[0.1em]">CINELAUNCH ENGINE v1.5</span>
          </div>
          <span className="opacity-40 font-medium">READY FOR GOOGLE TV</span>
        </div>
        <div className="flex gap-10 font-black uppercase tracking-widest text-slate-400">
          <span className="flex items-center gap-3"><kbd className="bg-slate-800 px-2 py-1 rounded text-sky-400 border border-white/10">OK</kbd> Launch</span>
          <span className="flex items-center gap-3"><kbd className="bg-slate-800 px-2 py-1 rounded text-sky-400 border border-white/10">↔</kbd> Browse</span>
          <span className="flex items-center gap-3"><kbd className="bg-slate-800 px-2 py-1 rounded text-sky-400 border border-white/10">MENU</kbd> Edit</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
