
import React, { useState } from 'react';
import { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
  onDelete: (id: string) => void;
  onEdit: (movie: Movie) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onDelete, onEdit }) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const launchVideo = (e: React.MouseEvent | React.KeyboardEvent) => {
    // Only launch if we're not currently in the middle of a delete confirmation
    if (isConfirmingDelete) return;
    window.open(movie.youtubeUrl, '_blank');
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(movie);
  };

  const handleDeleteTrigger = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConfirmingDelete(true);
  };

  const confirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(movie.id);
    setIsConfirmingDelete(false);
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConfirmingDelete(false);
  };

  return (
    <div className="group relative flex flex-col gap-2 rounded-xl p-2 transition-all hover:bg-slate-800/50 focus-within:ring-2 focus-within:ring-sky-500">
      {/* Poster Area */}
      <div 
        role="button"
        tabIndex={0}
        onClick={launchVideo}
        onKeyDown={(e) => e.key === 'Enter' && launchVideo(e)}
        className="aspect-[2/3] relative rounded-lg overflow-hidden bg-slate-800 shadow-lg cursor-pointer transform group-hover:scale-[1.02] transition-all duration-300"
      >
        <img 
          src={movie.photoUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop'} 
          alt={movie.title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop';
          }}
        />
        
        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center text-white shadow-xl opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
            <i className="fas fa-play ml-1"></i>
          </div>
        </div>

        {/* Delete Confirmation Overlay */}
        {isConfirmingDelete && (
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center z-10 animate-in fade-in zoom-in duration-200">
            <p className="text-xs font-bold text-white mb-3">Remove this movie?</p>
            <div className="flex flex-col w-full gap-2">
              <button 
                onClick={confirmDelete}
                className="w-full py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Delete
              </button>
              <button 
                onClick={cancelDelete}
                className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info & Actions */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-sm font-bold text-slate-100 line-clamp-1 flex-1 leading-tight">{movie.title}</h3>
          <div className="flex gap-2 shrink-0">
            <button 
              onClick={handleEdit}
              className="text-slate-400 hover:text-sky-400 transition-colors focus:outline-none"
              title="Edit"
            >
              <i className="fas fa-edit text-xs"></i>
            </button>
            <button 
              onClick={handleDeleteTrigger}
              className="text-slate-400 hover:text-red-500 transition-colors focus:outline-none"
              title="Delete"
            >
              <i className="fas fa-trash-alt text-xs"></i>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 bg-sky-500/10 text-sky-400 rounded-full font-bold uppercase tracking-wider border border-sky-500/20">
            {movie.category}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
