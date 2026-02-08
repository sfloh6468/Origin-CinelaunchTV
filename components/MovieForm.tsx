
import React, { useState, useEffect, useRef } from 'react';
import { Movie, ROOT_LANGUAGES, DEFAULT_GENRES, GENRE_MAP } from '../types';
import { getMovieMetadata } from '../services/geminiService';

interface MovieFormProps {
  movieToEdit?: Movie;
  onClose: () => void;
  onSave: (movie: Movie) => void;
}

const MovieForm: React.FC<MovieFormProps> = ({ movieToEdit, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    youtubeUrl: '',
    photoUrl: '',
    description: '',
    language: ROOT_LANGUAGES[0],
    category: DEFAULT_GENRES[0]
  });
  const [isNewGenre, setIsNewGenre] = useState(false);
  const [customGenre, setCustomGenre] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState('');

  const focusRef = useRef<HTMLInputElement>(null);

  // Helper to extract YouTube ID
  const extractYoutubeId = (url: string) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  useEffect(() => {
    if (movieToEdit) {
      setFormData({
        title: movieToEdit.title,
        youtubeUrl: movieToEdit.youtubeUrl,
        photoUrl: movieToEdit.photoUrl,
        description: movieToEdit.description,
        language: movieToEdit.language,
        category: movieToEdit.category
      });
    }
    focusRef.current?.focus();
  }, [movieToEdit]);

  const handleYoutubeUrlChange = (url: string) => {
    const id = extractYoutubeId(url);
    const thumbnail = id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '';
    
    setFormData(prev => ({
      ...prev,
      youtubeUrl: url,
      // Auto-fill photoUrl if it's currently empty or already a previous YT thumbnail
      photoUrl: (!prev.photoUrl || prev.photoUrl.includes('img.youtube.com')) ? thumbnail : prev.photoUrl
    }));
  };

  const handleAI = async () => {
    if (!formData.youtubeUrl && !formData.title) {
      setError('Provide a URL or Title for AI analysis.');
      return;
    }
    setIsThinking(true);
    setError('');
    const result = await getMovieMetadata(formData.youtubeUrl || formData.title, DEFAULT_GENRES);
    setIsThinking(false);

    if (result) {
      const ytId = extractYoutubeId(formData.youtubeUrl);
      const fallbackThumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '';

      setFormData(prev => ({
        ...prev,
        title: result.title || prev.title,
        description: result.description || prev.description,
        language: result.language && ROOT_LANGUAGES.includes(result.language) ? result.language : prev.language,
        category: result.category || prev.category,
        photoUrl: prev.photoUrl || fallbackThumb
      }));
    } else {
      setError('AI could not retrieve details. Fill manually.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalGenre = isNewGenre ? customGenre || 'Other' : formData.category;
    onSave({
      id: movieToEdit?.id || crypto.randomUUID(),
      ...formData,
      category: finalGenre,
      createdAt: movieToEdit?.createdAt || Date.now()
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/98 backdrop-blur-3xl p-6 animate-in fade-in zoom-in duration-300">
      <div className="bg-[#0b101a] border border-white/10 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="px-10 py-8 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-sky-500 rounded-xl flex items-center justify-center text-white text-xl">
              <i className="fas fa-layer-group"></i>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">
              {movieToEdit ? 'Modify Entry' : 'New Vault Entry'}
            </h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {error && <div className="text-red-400 text-[10px] font-black uppercase bg-red-400/10 p-4 rounded-xl border border-red-400/20">{error}</div>}

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">YouTube URL</label>
              <input 
                ref={focusRef}
                type="url" 
                placeholder="https://..."
                className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 px-6 text-slate-100 focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                value={formData.youtubeUrl}
                onChange={(e) => handleYoutubeUrlChange(e.target.value)}
                required
              />
            </div>

            <button type="button" onClick={handleAI} disabled={isThinking} className="w-full py-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 font-black text-xs uppercase tracking-[0.2em] hover:bg-sky-500 hover:text-white transition-all">
              {isThinking ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-magic mr-2"></i>}
              {isThinking ? 'Analyzing Cinematic Data...' : 'Smart Auto-Fill'}
            </button>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Language (Root)</label>
                <select 
                  className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 px-6 text-slate-100 outline-none"
                  value={formData.language}
                  onChange={(e) => setFormData({...formData, language: e.target.value})}
                >
                  {ROOT_LANGUAGES.map(l => <option key={l} value={l} className="bg-slate-900">{l}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Genre (Sub)</label>
                  <button type="button" onClick={() => setIsNewGenre(!isNewGenre)} className="text-[8px] text-sky-500 font-black uppercase">
                    {isNewGenre ? 'Select' : '+ New'}
                  </button>
                </div>
                {isNewGenre ? (
                  <input 
                    type="text" 
                    placeholder="E.g. Musical"
                    className="w-full bg-slate-900 border border-sky-500/30 rounded-2xl py-4 px-6 text-slate-100 outline-none"
                    value={customGenre}
                    onChange={(e) => setCustomGenre(e.target.value)}
                  />
                ) : (
                  <select 
                    className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 px-6 text-slate-100 outline-none"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    {DEFAULT_GENRES.map(g => (
                      <option key={g} value={g} className="bg-slate-900">{GENRE_MAP[formData.language]?.[g] || g}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Poster Link</label>
              <input 
                type="url" 
                placeholder="Auto-filled from YouTube ID..."
                className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 px-6 text-slate-100 outline-none font-medium italic opacity-80"
                value={formData.photoUrl}
                onChange={(e) => setFormData({...formData, photoUrl: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Movie Title</label>
              <input 
                type="text" 
                className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 px-6 text-slate-100 outline-none font-bold"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Narrative</label>
              <textarea 
                rows={3}
                className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 px-6 text-slate-100 outline-none resize-none font-medium"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4 flex gap-6">
            <button type="button" onClick={onClose} className="flex-1 py-5 rounded-2xl bg-slate-800 text-white font-black text-xs uppercase tracking-widest transition-all">Cancel</button>
            <button type="submit" className="flex-[2] py-5 rounded-2xl bg-sky-500 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-sky-500/20 transition-all">Save to Vault</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MovieForm;
