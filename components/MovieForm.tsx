
import React, { useState, useEffect } from 'react';
import { Movie } from '../types';
import { getMovieMetadata } from '../services/geminiService';

interface MovieFormProps {
  movieToEdit?: Movie;
  categories: string[];
  onClose: () => void;
  onSave: (movie: Movie) => void;
}

const MovieForm: React.FC<MovieFormProps> = ({ movieToEdit, categories, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    youtubeUrl: '',
    photoUrl: '',
    description: '',
    category: categories[0] || 'Action'
  });
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (movieToEdit) {
      setFormData({
        title: movieToEdit.title,
        youtubeUrl: movieToEdit.youtubeUrl,
        photoUrl: movieToEdit.photoUrl,
        description: movieToEdit.description,
        category: movieToEdit.category
      });
    }
  }, [movieToEdit]);

  const handleAutoFill = async () => {
    const input = formData.youtubeUrl || formData.title;
    if (!input) {
      setError('Provide a YouTube URL or Title for AI.');
      return;
    }
    
    setError('');
    setIsAIThinking(true);
    const result = await getMovieMetadata(input, categories);
    setIsAIThinking(false);

    if (result) {
      setFormData(prev => ({
        ...prev,
        title: result.title || prev.title,
        description: result.description || prev.description,
        category: result.category || prev.category
      }));
      // If AI suggests a new category, ensure we're ready to use it
      if (!categories.includes(result.category)) {
        setIsNewCategory(true);
        setCustomCategory(result.category);
      }
    } else {
      setError('AI could not fetch details.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.youtubeUrl) {
      setError('Title and YouTube URL are required.');
      return;
    }

    const finalCategory = isNewCategory 
      ? (customCategory.trim() || 'Other') 
      : formData.category;

    const movie: Movie = {
      id: movieToEdit?.id || crypto.randomUUID(),
      ...formData,
      category: finalCategory,
      createdAt: movieToEdit?.createdAt || Date.now()
    };

    onSave(movie);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="px-8 py-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <div className="bg-sky-500/20 p-2 rounded-lg">
              <i className={`fas ${movieToEdit ? 'fa-edit' : 'fa-plus-circle'} text-sky-500`}></i>
            </div>
            {movieToEdit ? 'Edit Movie Details' : 'Add to TV Library'}
          </h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-center gap-3">
              <i className="fas fa-circle-exclamation"></i>
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">YouTube URL</label>
                <input 
                  type="url" 
                  placeholder="Paste video link..."
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                  value={formData.youtubeUrl}
                  onChange={(e) => setFormData({...formData, youtubeUrl: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Poster URL (Optional)</label>
                <input 
                  type="url" 
                  placeholder="Image link..."
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                  value={formData.photoUrl}
                  onChange={(e) => setFormData({...formData, photoUrl: e.target.value})}
                />
              </div>
            </div>

            <button 
              type="button" 
              onClick={handleAutoFill}
              disabled={isAIThinking}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500/10 text-sky-400 text-sm font-semibold hover:bg-sky-500/20 transition-all border border-sky-500/20 active:scale-95"
            >
              <i className={`fas ${isAIThinking ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`}></i>
              {isAIThinking ? 'AI is analyzing video...' : 'Smart Auto-fill'}
            </button>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Movie Title</label>
              <input 
                type="text" 
                placeholder="Enter title..."
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category</label>
                <button 
                  type="button" 
                  onClick={() => setIsNewCategory(!isNewCategory)}
                  className="text-[10px] text-sky-400 font-bold uppercase hover:text-sky-300 transition-colors"
                >
                  {isNewCategory ? '← Use Existing' : '+ Create New Category'}
                </button>
              </div>
              
              {isNewCategory ? (
                <div className="relative animate-in slide-in-from-left-2 duration-200">
                  <input 
                    type="text" 
                    placeholder="Type new category name..."
                    className="w-full bg-slate-800/50 border border-sky-500/30 rounded-xl py-3 px-4 text-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    autoFocus
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-sky-500/50 uppercase">New</div>
                </div>
              ) : (
                <select 
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none cursor-pointer appearance-none"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Description</label>
              <textarea 
                rows={3}
                placeholder="Brief summary..."
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none resize-none transition-all"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-6 flex gap-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3.5 rounded-xl font-bold transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-[2] bg-sky-600 hover:bg-sky-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-sky-600/30 transition-all active:scale-[0.98]"
            >
              {movieToEdit ? 'Update Details' : 'Add to Collection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MovieForm;
