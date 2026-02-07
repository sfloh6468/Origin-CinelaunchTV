
import React, { useState, useEffect, useRef } from 'react';
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
  
  const initialFocusRef = useRef<HTMLInputElement>(null);

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
    initialFocusRef.current?.focus();
  }, [movieToEdit]);

  const handleAutoFill = async () => {
    const input = formData.youtubeUrl || formData.title;
    if (!input) {
      setError('Enter a URL or Title first for AI to analyze.');
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
      if (!categories.includes(result.category)) {
        setIsNewCategory(true);
        setCustomCategory(result.category);
      }
    } else {
      setError('AI service unavailable or content not found.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.youtubeUrl) {
      setError('Please provide a Title and a valid YouTube URL.');
      return;
    }

    const finalCategory = isNewCategory 
      ? (customCategory.trim() || 'Uncategorized') 
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-3xl p-6 animate-in fade-in zoom-in duration-300">
      <div className="bg-[#0f172a] border border-white/10 rounded-[2.5rem] w-full max-w-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]">
        <div className="px-10 py-8 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-sky-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-xl shadow-sky-500/30">
              <i className={`fas ${movieToEdit ? 'fa-edit' : 'fa-film'}`}></i>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">
                {movieToEdit ? 'Modify Library Entry' : 'New Video Entry'}
              </h2>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">CineLaunch Personal Portal</p>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-500 hover:bg-slate-800 hover:text-white transition-all focus:bg-red-500 focus:text-white">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-5 rounded-2xl text-xs font-bold flex items-center gap-4 animate-in slide-in-from-top-2">
              <i className="fas fa-circle-exclamation text-lg"></i>
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">YouTube Link</label>
                <input 
                  ref={initialFocusRef}
                  type="url" 
                  placeholder="https://..."
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 px-6 text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all placeholder:text-slate-700 font-semibold"
                  value={formData.youtubeUrl}
                  onChange={(e) => setFormData({...formData, youtubeUrl: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Poster Image Link</label>
                <input 
                  type="url" 
                  placeholder="Paste URL..."
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 px-6 text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all placeholder:text-slate-700 font-semibold"
                  value={formData.photoUrl}
                  onChange={(e) => setFormData({...formData, photoUrl: e.target.value})}
                />
              </div>
            </div>

            <button 
              type="button" 
              onClick={handleAutoFill}
              disabled={isAIThinking}
              className="flex items-center gap-3 px-6 py-3 rounded-xl bg-sky-500/10 text-sky-400 text-xs font-black uppercase tracking-widest hover:bg-sky-500/20 transition-all border border-sky-500/20 active:scale-95 disabled:opacity-50"
            >
              <i className={`fas ${isAIThinking ? 'fa-sync fa-spin' : 'fa-wand-magic-sparkles'}`}></i>
              {isAIThinking ? 'Scanning Data...' : 'Auto-Generate Details'}
            </button>

            <div className="space-y-2.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Display Title</label>
              <input 
                type="text" 
                placeholder="Enter film or series name..."
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 px-6 text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all placeholder:text-slate-700 font-semibold"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Library Category</label>
                <button 
                  type="button" 
                  onClick={() => setIsNewCategory(!isNewCategory)}
                  className="text-[10px] text-sky-500 font-black uppercase tracking-widest hover:text-white transition-colors"
                >
                  {isNewCategory ? '← Choose Existing' : '+ Create New Group'}
                </button>
              </div>
              
              {isNewCategory ? (
                <div className="animate-in slide-in-from-bottom-2 duration-300">
                  <input 
                    type="text" 
                    placeholder="E.g. Favorites, Documentaries..."
                    className="w-full bg-slate-900/50 border border-sky-500/40 rounded-2xl py-4 px-6 text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none font-semibold"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    autoFocus
                  />
                </div>
              ) : (
                <div className="relative">
                  <select 
                    className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 px-6 text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none cursor-pointer appearance-none font-semibold"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                    ))}
                  </select>
                  <i className="fas fa-chevron-down absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none"></i>
                </div>
              )}
            </div>

            <div className="space-y-2.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Brief Narrative</label>
              <textarea 
                rows={3}
                placeholder="What is this video about? (AI can fill this for you)"
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 px-6 text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none resize-none transition-all placeholder:text-slate-700 font-medium"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-8 flex gap-6">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-xs transition-all active:scale-95"
            >
              Discard
            </button>
            <button 
              type="submit" 
              className="flex-[2] bg-sky-600 hover:bg-sky-500 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-sky-600/30 transition-all active:scale-95"
            >
              {movieToEdit ? 'Commit Changes' : 'Add to TV Vault'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MovieForm;
