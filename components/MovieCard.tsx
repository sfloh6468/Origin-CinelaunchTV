
import React, { useState, useCallback } from 'react';
import { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
  onDelete: (id: string) => void;
  onEdit: (movie: Movie) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onDelete, onEdit }) => {
  const [showDeletePrompt, setShowDeletePrompt] = useState(false);

  const handleLaunch = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
    if (showDeletePrompt) return;
    window.open(movie.youtubeUrl, '_blank');
  }, [movie.youtubeUrl, showDeletePrompt]);

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(movie);
  }, [movie, onEdit]);

  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeletePrompt(true);
  }, []);

  const handleConfirmDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(movie.id);
    setShowDeletePrompt(false);
  }, [movie.id, onDelete]);

  const handleCancelDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeletePrompt(false);
  }, []);

  return (
    <div className="group relative flex flex-col gap-3">
      {/* Poster Display */}
      <div 
        role="button"
        tabIndex={0}
        onClick={handleLaunch}
        onKeyDown={(e) => e.key === 'Enter' && handleLaunch(e)}
        className="aspect-[2/3] relative rounded-2xl overflow-hidden bg-slate-900 shadow-2xl cursor-pointer transform transition-all duration-500 group-hover:scale-[1.05] group-hover:-translate-y-2 group-focus:scale-[1.05] group-focus:-translate-y-2 ring-1 ring-white/5"
      >
        <img 
          src={movie.photoUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop'} 
          alt={movie.title}
          className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500"
          loading="lazy"
        />
        
        {/* Play Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 bg-sky-500 rounded-full flex items-center justify-center text-white shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500">
            <i className="fas fa-play text-xl ml-1"></i>
          </div>
          <span className="text-white text-[10px] font-black uppercase tracking-[0.3em] bg-black/60 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10">
            Launch Video
          </span>
        </div>

        {/* REBUILT DELETE CONFIRMATION - TOP LAYER */}
        {showDeletePrompt && (
          <div className="absolute inset-0 bg-slate-950/98 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center z-[100] animate-in fade-in zoom-in duration-300">
            <i className="fas fa-exclamation-triangle text-red-500 text-3xl mb-4"></i>
            <p className="text-sm font-black text-white mb-6 uppercase tracking-wider leading-tight">Remove this entry?</p>
            <div className="flex flex-col w-full gap-3">
              <button 
                onClick={handleConfirmDelete}
                className="w-full py-4 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-red-600/20 transition-all active:scale-95"
              >
                Confirm Delete
              </button>
              <button 
                onClick={handleCancelDelete}
                className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
              >
                Go Back
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Movie Details & Quick Actions */}
      <div className="px-1 flex flex-col gap-1.5">
        <div className="flex justify-between items-start">
          <h3 className="text-sm font-black text-white line-clamp-1 flex-1 leading-none tracking-tight group-hover:text-sky-400 transition-colors">
            {movie.title}
          </h3>
          <div className="flex items-center gap-3 shrink-0 ml-2">
            <button 
              onClick={handleEdit}
              className="text-slate-600 hover:text-white transition-colors focus:text-sky-400 p-1"
              title="Edit Video"
            >
              <i className="fas fa-pen-nib text-xs"></i>
            </button>
            <button 
              onClick={handleDeleteClick}
              className="text-slate-600 hover:text-red-500 transition-colors focus:text-red-500 p-1"
              title="Delete Video"
            >
              <i className="fas fa-trash text-xs"></i>
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[9px] font-black text-sky-500 uppercase tracking-widest bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-md">
            {movie.category}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
