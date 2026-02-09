
import React, { useState, useCallback } from 'react';
import { Movie, GENRE_MAP } from '../types';

interface MovieCardProps {
  movie: Movie;
  onDelete: (id: string) => void;
  onEdit: (movie: Movie) => void;
  readOnly?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onDelete, onEdit, readOnly }) => {
  const [showDeletePrompt, setShowDeletePrompt] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  const handleLaunch = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
    if (showDeletePrompt || showDescription) return;
    if ('key' in e && e.key !== 'Enter') return;
    window.open(movie.youtubeUrl, '_blank');
  }, [movie.youtubeUrl, showDeletePrompt, showDescription]);

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(movie);
  }, [movie, onEdit]);

  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeletePrompt(true);
  }, []);

  const handleInfoClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDescription(true);
  }, []);

  const handleConfirmDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(movie.id);
    setShowDeletePrompt(false);
  }, [movie.id, onDelete]);

  const handleCloseOverlays = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeletePrompt(false);
    setShowDescription(false);
  }, []);

  const localizedGenre = GENRE_MAP[movie.language]?.[movie.category] || movie.category;

  return (
    <div className="group relative flex flex-col gap-3 focus-within:outline-none focus-within:scale-105 transition-transform duration-300">
      <div 
        role="button"
        tabIndex={0}
        onClick={handleLaunch}
        onKeyDown={handleLaunch}
        className="aspect-[2/3] relative rounded-2xl overflow-hidden bg-slate-900 shadow-xl cursor-pointer ring-1 ring-white/5 outline-none group-focus:ring-sky-500"
      >
        <img 
          src={movie.photoUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop'} 
          alt={movie.title}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-focus:scale-110"
          loading="lazy"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity flex flex-col items-center justify-center">
          <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center text-white shadow-2xl transform transition-transform duration-500 group-hover:scale-110">
            <i className="fas fa-play text-lg ml-1"></i>
          </div>
        </div>

        {showDescription && (
          <div className="absolute inset-0 bg-slate-950/98 backdrop-blur-3xl flex flex-col p-6 z-[90] animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-black text-sky-400 uppercase tracking-widest">{localizedGenre}</span>
              <button onClick={handleCloseOverlays} className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white bg-white/10">
                <i className="fas fa-times text-xs"></i>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 text-slate-200 text-sm leading-relaxed font-bold">
              {movie.description || "No description provided."}
            </div>
          </div>
        )}

        {showDeletePrompt && (
          <div className="absolute inset-0 bg-slate-950/98 backdrop-blur-3xl flex flex-col items-center justify-center p-6 text-center z-[100] animate-in fade-in zoom-in duration-300">
            <i className="fas fa-trash-alt text-red-500 text-3xl mb-4 opacity-40"></i>
            <p className="text-sm font-black text-white mb-6 uppercase tracking-widest">Remove Entry?</p>
            <div className="flex flex-col w-full gap-3">
              <button onClick={handleConfirmDelete} className="w-full py-3 bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all">Delete</button>
              <button onClick={handleCloseOverlays} className="w-full py-3 bg-slate-800 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all">Cancel</button>
            </div>
          </div>
        )}
      </div>

      <div className="px-1 space-y-1">
        <div className="flex justify-between items-start gap-3">
          <h3 className="text-base font-black text-white line-clamp-1 flex-1 leading-tight tracking-tight group-hover:text-sky-400 transition-colors">
            {movie.title}
          </h3>
          <div className="flex items-center gap-2 shrink-0">
             <button onClick={handleInfoClick} className="text-slate-500 hover:text-sky-400 p-1"><i className="fas fa-info-circle text-sm"></i></button>
             {!readOnly && (
               <>
                 <button onClick={handleEdit} className="text-slate-500 hover:text-sky-400 p-1"><i className="fas fa-edit text-xs"></i></button>
                 <button onClick={handleDeleteClick} className="text-slate-500 hover:text-red-500 p-1"><i className="fas fa-trash-alt text-xs"></i></button>
               </>
             )}
          </div>
        </div>
        
        <p className="text-[11px] font-medium text-slate-400 line-clamp-2 leading-snug">
          {movie.description || "No narrative available."}
        </p>
      </div>
    </div>
  );
};

export default MovieCard;
