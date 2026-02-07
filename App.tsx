
import React, { useState, useEffect, useMemo } from 'react';
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

  // Load data from local storage on mount
  useEffect(() => {
    const savedMovies = localStorage.getItem('cinelaunch_movies');
    const savedCategories = localStorage.getItem('cinelaunch_categories');
    
    if (savedMovies) {
      try { setMovies(JSON.parse(savedMovies)); } catch (e) { console.error(e); }
    }
    if (savedCategories) {
      try { 
        const parsed = JSON.parse(savedCategories);
        // Ensure default categories are always present
        const merged = Array.from(new Set([...DEFAULT_CATEGORIES, ...parsed]));
        setCategories(merged); 
      } catch (e) { console.error(e); }
    }
  }, []);

  // Sync with local storage
  useEffect(() => {
    localStorage.setItem('cinelaunch_movies', JSON.stringify(movies));
    
    // Cleanup unused custom categories (optional: keep if you want to keep them forever)
    // For this app, we'll keep categories once created to avoid menu jumping
  }, [movies]);

  useEffect(() => {
    localStorage.setItem('cinelaunch_categories', JSON.stringify(categories));
  }, [categories]);

  const handleAddOrUpdateMovie = (movieData: Movie) => {
    if (movieToEdit) {
      setMovies(prev => prev.map(m => m.id === movieToEdit.id ? movieData : m));
    } else {
      setMovies(prev => [movieData, ...prev]);
    }
    
    // Auto-add new category if it doesn't exist
    if (!categories.includes(movieData.category)) {
      setCategories(prev => [...prev, movieData.category]);
    }

    setIsFormOpen(false);
    setMovieToEdit(undefined);
  };

  const handleDeleteMovie = (id: string) => {
    setMovies(prev => prev.filter(m => m.id !== id));
  };

  const handleEditClick = (movie: Movie) => {
    setMovieToEdit(movie);
    setIsFormOpen(true);
  };

  const filteredMovies = useMemo(() => {
    return movies.filter(movie => {
      const matchesCategory = activeCategory === 'All' || movie.category === activeCategory;
      const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           movie.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [movies, activeCategory, searchTerm]);

  return (
    <div className="min-h-screen pb-20 bg-[#0f172a]">
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 px-6 py-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-sky-400 to-sky-600 p-2.5 rounded-2xl shadow-lg shadow-sky-500/20 ring-1 ring-white/20">
              <i className="fas fa-play text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white uppercase">CineLaunch <span className="text-sky-400">TV</span></h1>
              <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">My Personal Library</p>
            </div>
          </div>
          
          <div className="flex-1 max-w-xl w-full relative group">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-400 transition-colors"></i>
            <input 
              type="text" 
              placeholder="Search movies, series, categories..." 
              className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-slate-200 focus:ring-2 focus:ring-sky-500 focus:bg-slate-800 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button 
            onClick={() => {
              setMovieToEdit(undefined);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-3 bg-sky-600 hover:bg-sky-500 text-white px-8 py-3 rounded-2xl font-bold transition-all transform active:scale-95 shadow-xl shadow-sky-600/20 ring-1 ring-white/10"
          >
            <i className="fas fa-plus"></i>
            Add Movie
          </button>
        </div>

        {/* Categories Bar */}
        <div className="max-w-7xl mx-auto mt-6 flex gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
          <button 
            onClick={() => setActiveCategory('All')}
            className={`px-6 py-2 rounded-xl whitespace-nowrap text-xs font-black uppercase tracking-widest transition-all border ${
              activeCategory === 'All' 
              ? 'bg-sky-500 text-white border-sky-400 shadow-lg shadow-sky-500/20' 
              : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-xl whitespace-nowrap text-xs font-black uppercase tracking-widest transition-all border ${
                activeCategory === cat 
                ? 'bg-sky-500 text-white border-sky-400 shadow-lg shadow-sky-500/20' 
                : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-10">
        {filteredMovies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-500 text-center animate-in fade-in slide-in-from-bottom-4">
            <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 ring-1 ring-slate-700">
              <i className="fas fa-film text-4xl text-slate-600"></i>
            </div>
            <h2 className="text-2xl font-bold text-slate-300">Nothing Found</h2>
            <p className="text-slate-500 mt-2 max-w-sm">Try a different search or add a new movie to your collection.</p>
            <button 
              onClick={() => setIsFormOpen(true)} 
              className="mt-8 text-sky-400 font-black uppercase tracking-widest text-sm hover:text-sky-300 transition-colors"
            >
              Add a movie now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
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
          onClose={() => {
            setIsFormOpen(false);
            setMovieToEdit(undefined);
          }} 
          onSave={handleAddOrUpdateMovie} 
        />
      )}

      <footer className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 px-8 py-3 text-[10px] text-slate-500 flex justify-between items-center z-30">
        <div className="flex items-center gap-4">
          <span className="font-bold text-slate-400 tracking-wider">CINELAUNCH v1.2</span>
          <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
          <span>Personal Movie Portal</span>
        </div>
        <div className="flex gap-6 font-bold uppercase tracking-widest opacity-60">
          <span className="flex items-center gap-2"><i className="fas fa-arrows-alt text-sky-500"></i> Navigate</span>
          <span className="flex items-center gap-2"><i className="fas fa-mouse-pointer text-sky-500"></i> Select</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
