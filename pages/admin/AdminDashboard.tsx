import React, { useState } from 'react';
import { useStore } from '../../context/Store';
import { Content, ContentType, Episode } from '../../types';
import { Plus, Trash, Users, Film, LogOut, MessageSquare, Check, Video, Settings, List, Star, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';

export const AdminDashboard = () => {
  const { 
    content, addContent, deleteContent, 
    users, validateSubscription, logout, 
    adminSwitchToClient, categories, addCategory, deleteCategory,
    suggestions, deleteSuggestion
  } = useStore();
  
  const [tab, setTab] = useState<'content' | 'users' | 'custom' | 'suggestions'>('content');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Customization State
  const [newCatName, setNewCatName] = useState('');

  // Form State
  const [newContent, setNewContent] = useState<Partial<Content>>({
    type: ContentType.MOVIE,
    category: categories[0]?.name || 'Action',
    rating: 5,
    episodes: [],
    videoUrl: '',
    trailerUrl: '',
    posterUrl: ''
  });

  // Episode Form State (Temp)
  const [tempEp, setTempEp] = useState<Partial<Episode>>({ season: 1, episodeNumber: 1, videoUrl: '' });

  // Helper to convert file to base64 for local storage persistence
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: 'posterUrl' | 'videoUrl' | 'trailerUrl') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (field === 'posterUrl') {
        // Convert images to Base64 so they persist after reload
        try {
            const base64 = await fileToBase64(file);
            setNewContent(prev => ({ ...prev, [field]: base64 }));
        } catch (err) {
            console.error("Error converting image", err);
        }
      } else {
        // For videos, we still use Blob URL for preview, but recommend URL for persistence
        const url = URL.createObjectURL(file);
        setNewContent(prev => ({ ...prev, [field]: url }));
        
        // Auto detect duration
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
            setNewContent(prev => ({...prev, duration: Math.floor(video.duration)}));
        };
        video.src = url;
      }
    }
  };

  const handleEpisodeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const url = URL.createObjectURL(e.target.files[0]);
          setTempEp(prev => ({ ...prev, videoUrl: url }));
           const video = document.createElement('video');
           video.preload = 'metadata';
           video.onloadedmetadata = () => {
               setTempEp(prev => ({...prev, duration: Math.floor(video.duration)}));
           };
           video.src = url;
      }
  }

  const addEpisodeToNewContent = () => {
      if (tempEp.title && tempEp.videoUrl) {
          const newEp: Episode = {
              id: Math.random().toString(36).substr(2, 9),
              title: tempEp.title,
              season: tempEp.season || 1,
              episodeNumber: tempEp.episodeNumber || 1,
              videoUrl: tempEp.videoUrl,
              duration: tempEp.duration || 0
          };
          setNewContent(prev => ({
              ...prev,
              episodes: [...(prev.episodes || []), newEp]
          }));
          setTempEp({ season: (tempEp.season || 1), episodeNumber: (tempEp.episodeNumber || 1) + 1, title: '', videoUrl: '' });
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.title || !newContent.posterUrl) return;

    addContent({
      ...newContent,
      id: Math.random().toString(36).substr(2, 9),
      addedAt: Date.now(),
      cast: (newContent.cast as any || '').toString().split(',').map((s: string) => s.trim())
    } as Content);
    
    setShowAddModal(false);
    setNewContent({ 
        type: ContentType.MOVIE, 
        category: categories[0]?.name || 'Action', 
        rating: 5, 
        episodes: [],
        videoUrl: '',
        trailerUrl: '',
        posterUrl: ''
    });
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if(newCatName.trim()) {
      addCategory(newCatName.trim());
      setNewCatName('');
    }
  };

  const pendingUsersCount = users.filter(u => u.subscriptionStatus === 'PENDING').length;
  const suggestionsCount = suggestions.length;

  return (
    <div className="min-h-screen bg-vtv-dark text-white p-4 pb-20 md:pb-4">
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-gray-800 pb-4">
        <h1 className="text-3xl font-bold neon-text">VTV <span className="text-white text-lg font-normal">ADMIN</span></h1>
        <div className="flex gap-4">
          <button onClick={adminSwitchToClient} className="bg-vtv-purple px-4 py-2 rounded font-bold hover:bg-opacity-80">Mode Client</button>
          <button onClick={logout} className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"><LogOut size={18} /></button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        <button onClick={() => setTab('content')} className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition whitespace-nowrap ${tab === 'content' ? 'bg-vtv-neon text-black' : 'bg-vtv-card text-gray-400'}`}>
          <Film size={20} /> Contenu
        </button>
        <button onClick={() => setTab('users')} className={`relative flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition whitespace-nowrap ${tab === 'users' ? 'bg-vtv-neon text-black' : 'bg-vtv-card text-gray-400'}`}>
          <Users size={20} /> Abonnés
          {pendingUsersCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full animate-pulse">
              {pendingUsersCount}
            </span>
          )}
        </button>
        <button onClick={() => setTab('suggestions')} className={`relative flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition whitespace-nowrap ${tab === 'suggestions' ? 'bg-vtv-neon text-black' : 'bg-vtv-card text-gray-400'}`}>
          <MessageSquare size={20} /> Suggestions
          {suggestionsCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full">
              {suggestionsCount}
            </span>
          )}
        </button>
        <button onClick={() => setTab('custom')} className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition whitespace-nowrap ${tab === 'custom' ? 'bg-vtv-neon text-black' : 'bg-vtv-card text-gray-400'}`}>
          <Settings size={20} /> Personnalisation
        </button>
      </div>

      {tab === 'content' && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-vtv-pink hover:bg-pink-600 px-4 py-2 rounded-full font-bold">
              <Plus size={20} /> Importer Contenu
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {content.map(item => (
              <div key={item.id} className="relative group bg-vtv-card rounded-lg overflow-hidden border border-gray-800">
                <img src={item.posterUrl} alt={item.title} className="w-full aspect-[2/3] object-cover" />
                <div className="absolute top-2 left-2 bg-black/70 px-2 py-0.5 rounded text-xs font-bold text-yellow-400 flex items-center gap-1">
                    <Star size={10} fill="currentColor" /> {item.rating || '-'}
                </div>
                <div className="p-3">
                  <h3 className="font-bold truncate">{item.title}</h3>
                  <div className="flex justify-between items-center text-xs text-gray-400">
                      <span>{item.category}</span>
                      {item.type === ContentType.SERIES && <span>{item.episodes?.length || 0} eps</span>}
                  </div>
                </div>
                <button 
                  onClick={() => deleteContent(item.id)}
                  className="absolute top-2 right-2 bg-red-600 p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash size={16} />
                </button>
              </div>
            ))}
            {content.length === 0 && (
                <div className="col-span-full text-center py-20 text-gray-500">
                    Aucun contenu importé. Cliquez sur "Importer Contenu".
                </div>
            )}
          </div>
        </>
      )}

      {tab === 'users' && (
        <div className="bg-vtv-card rounded-xl overflow-hidden shadow-2xl">
          <div className="p-4 bg-gray-800/50 border-b border-gray-700">
             <h2 className="font-bold text-xl flex items-center gap-2">
               <Users className="text-vtv-neon" /> Gestion des Abonnements
             </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-900 text-gray-300 text-sm uppercase">
                  <th className="p-4">Utilisateur</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Formule</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {users
                  .filter(u => u.role !== 'ADMIN')
                  .sort((a, b) => {
                      if (a.subscriptionStatus === 'PENDING' && b.subscriptionStatus !== 'PENDING') return -1;
                      if (a.subscriptionStatus !== 'PENDING' && b.subscriptionStatus === 'PENDING') return 1;
                      return 0;
                  })
                  .map(u => (
                  <tr key={u.id} className={`border-t border-gray-800 hover:bg-white/5 ${u.subscriptionStatus === 'PENDING' ? 'bg-yellow-500/5' : ''}`}>
                    <td className="p-4 flex items-center gap-3">
                      <img src={u.avatar} className="w-10 h-10 rounded-full border border-gray-700" />
                      <div>
                          <div className="font-bold">{u.name}</div>
                          <div className="text-xs text-gray-500">ID: {u.id}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{u.email}</div>
                      {u.subscriptionStatus === 'PENDING' && (
                        <div className="text-lg font-mono font-bold text-vtv-neon mt-1 bg-vtv-neon/10 inline-block px-2 rounded border border-vtv-neon/30">
                          {u.phone}
                        </div>
                      )}
                      {u.subscriptionStatus !== 'PENDING' && <div className="text-xs text-gray-400">{u.phone}</div>}
                    </td>
                    <td className="p-4">
                        <span className="bg-gray-800 px-2 py-1 rounded text-xs border border-gray-600">{u.subscriptionPlan}</span>
                    </td>
                    <td className="p-4">
                      {u.subscriptionStatus === 'PENDING' ? (
                          <div className="flex flex-col gap-1">
                             <span className="text-yellow-500 font-bold text-xs uppercase bg-yellow-500/10 px-2 py-1 rounded w-fit">En attente</span>
                             {u.subscriptionExpiry ? (
                                 <span className="text-[10px] text-orange-400">Renouvellement</span>
                             ) : (
                                 <span className="text-[10px] text-blue-400">Nouveau</span>
                             )}
                          </div>
                      ) : (
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                            u.subscriptionStatus === 'ACTIVE' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                        }`}>
                            {u.subscriptionStatus}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {u.subscriptionStatus === 'PENDING' && (
                        <button onClick={() => validateSubscription(u.id)} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 mx-auto shadow-lg shadow-green-900/50 transition-transform hover:scale-105">
                          <Check size={16} /> VALIDER (30j)
                        </button>
                      )}
                      {u.subscriptionStatus === 'EXPIRED' && (
                          <span className="text-xs text-gray-500 italic">En attente de paiement</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'suggestions' && (
          <div className="bg-vtv-card rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-400">
                  <MessageSquare size={20} /> Suggestions des clients
              </h2>
              <div className="grid gap-4">
                  {suggestions.length === 0 ? (
                      <p className="text-gray-500 italic">Aucune suggestion pour le moment.</p>
                  ) : (
                      suggestions.map(s => (
                          <div key={s.id} className="bg-black/40 p-4 rounded border border-gray-800 flex justify-between items-start">
                              <div>
                                  <h3 className="font-bold text-lg text-vtv-neon">{s.title}</h3>
                                  <p className="text-gray-300 my-2">{s.message}</p>
                                  <div className="flex items-center gap-3 text-xs text-gray-500">
                                      <span>Par: {s.userName}</span>
                                      <span>•</span>
                                      <span>{new Date(s.date).toLocaleDateString()}</span>
                                  </div>
                              </div>
                              <button onClick={() => deleteSuggestion(s.id)} className="text-gray-600 hover:text-red-500">
                                  <Trash size={16} />
                              </button>
                          </div>
                      ))
                  )}
              </div>
          </div>
      )}

      {tab === 'custom' && (
         <div className="grid md:grid-cols-2 gap-6">
             <div className="bg-vtv-card rounded-xl p-6 border border-gray-800">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-vtv-neon">
                    <List size={20} /> Gestion des Catalogues
                </h2>
                
                <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
                    <input 
                        type="text" 
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        placeholder="Nouveau catalogue (ex: Documentaire)"
                        className="flex-1 bg-black border border-gray-700 rounded p-2 focus:border-vtv-neon outline-none"
                    />
                    <button type="submit" className="bg-vtv-purple hover:bg-vtv-purple/80 px-4 rounded font-bold">
                        <Plus />
                    </button>
                </form>

                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {categories.map(cat => (
                        <div key={cat.id} className="flex justify-between items-center bg-black/40 p-3 rounded border border-gray-800">
                            <span>{cat.name}</span>
                            <button onClick={() => deleteCategory(cat.id)} className="text-red-500 hover:text-red-400 p-1">
                                <Trash size={16} />
                            </button>
                        </div>
                    ))}
                </div>
             </div>
         </div>
      )}

      {/* Add Content Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-vtv-card w-full max-w-lg rounded-xl border border-vtv-purple p-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <h2 className="text-2xl font-bold mb-4 text-vtv-neon">Ajouter du contenu</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                type="text" placeholder="Titre" 
                className="w-full bg-black border border-gray-700 rounded p-3 focus:border-vtv-neon outline-none"
                onChange={e => setNewContent({...newContent, title: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <select 
                  className="bg-black border border-gray-700 rounded p-3"
                  onChange={e => setNewContent({...newContent, type: e.target.value as ContentType})}
                >
                  {Object.values(ContentType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select 
                   className="bg-black border border-gray-700 rounded p-3"
                   onChange={e => setNewContent({...newContent, category: e.target.value})}
                   value={newContent.category}
                >
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4 bg-black/30 p-3 rounded">
                  <span className="text-sm text-gray-400">Note (Top 10):</span>
                  <input 
                    type="range" min="0" max="10" step="0.1" 
                    value={newContent.rating} 
                    onChange={e => setNewContent({...newContent, rating: parseFloat(e.target.value)})}
                    className="flex-1 accent-vtv-neon"
                  />
                  <span className="font-bold text-yellow-400">{newContent.rating}</span>
              </div>
              
              {/* Poster Upload - Using Base64 */}
              <div className="border border-gray-700 rounded p-4 border-dashed hover:border-vtv-neon transition-colors relative group">
                <div className="flex items-center gap-2 mb-2">
                    <ImageIcon size={16} className="text-vtv-neon" />
                    <label className="text-sm text-gray-400 pointer-events-none">Affiche (Image)</label>
                </div>
                <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'posterUrl')} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-vtv-neon file:text-black hover:file:bg-cyan-300"/>
              </div>

              {newContent.type !== ContentType.SERIES ? (
                <div className="space-y-4">
                    {/* Video Input */}
                    <div className="border border-gray-700 rounded p-4 border-dashed bg-black/20">
                        <label className="block mb-2 text-sm text-gray-400 flex items-center gap-2"><Video size={16}/> Film Complet</label>
                        <div className="space-y-2">
                            <input type="file" accept="video/*" onChange={e => handleFileChange(e, 'videoUrl')} className="text-xs w-full"/>
                            <div className="text-center text-xs text-gray-500">- OU -</div>
                            <input 
                                type="text" 
                                placeholder="Coller le lien MP4 ici..." 
                                className="w-full bg-black border border-gray-600 rounded p-2 text-xs"
                                value={newContent.videoUrl}
                                onChange={e => setNewContent({...newContent, videoUrl: e.target.value})}
                            />
                        </div>
                    </div>
                    
                    {/* Trailer Input */}
                    <div className="border border-gray-700 rounded p-4 border-dashed bg-black/20">
                        <label className="block mb-2 text-sm text-gray-400 flex items-center gap-2"><LinkIcon size={16}/> Bande-annonce</label>
                        <div className="space-y-2">
                            <input type="file" accept="video/*" onChange={e => handleFileChange(e, 'trailerUrl')} className="text-xs w-full"/>
                            <div className="text-center text-xs text-gray-500">- OU -</div>
                            <input 
                                type="text" 
                                placeholder="Lien MP4 Bande-annonce" 
                                className="w-full bg-black border border-gray-600 rounded p-2 text-xs"
                                value={newContent.trailerUrl}
                                onChange={e => setNewContent({...newContent, trailerUrl: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
              ) : (
                  /* Series Episode Manager */
                  <div className="bg-black/20 p-4 rounded border border-gray-800">
                      <h3 className="font-bold text-sm mb-2 text-gray-400">Gestion des Épisodes</h3>
                      <div className="grid grid-cols-4 gap-2 mb-2">
                          <input type="number" placeholder="Saison" className="bg-black p-2 rounded text-sm" value={tempEp.season} onChange={e => setTempEp({...tempEp, season: parseInt(e.target.value)})} />
                          <input type="number" placeholder="Ep" className="bg-black p-2 rounded text-sm" value={tempEp.episodeNumber} onChange={e => setTempEp({...tempEp, episodeNumber: parseInt(e.target.value)})} />
                          <input type="text" placeholder="Titre épisode" className="col-span-2 bg-black p-2 rounded text-sm" value={tempEp.title} onChange={e => setTempEp({...tempEp, title: e.target.value})} />
                      </div>
                      
                      <div className="mb-2">
                          <input type="file" accept="video/*" onChange={handleEpisodeFile} className="text-xs mb-1 block w-full" />
                          <input 
                                type="text" 
                                placeholder="OU Lien Vidéo MP4" 
                                className="w-full bg-black border border-gray-600 rounded p-2 text-xs"
                                value={tempEp.videoUrl}
                                onChange={e => setTempEp({...tempEp, videoUrl: e.target.value})}
                           />
                      </div>

                      <button type="button" onClick={addEpisodeToNewContent} disabled={!tempEp.title || !tempEp.videoUrl} className="w-full bg-gray-700 hover:bg-white hover:text-black py-2 rounded text-xs font-bold transition disabled:opacity-50">
                          AJOUTER ÉPISODE
                      </button>

                      {newContent.episodes && newContent.episodes.length > 0 && (
                          <div className="mt-3 space-y-1 max-h-32 overflow-y-auto">
                              {newContent.episodes.map((ep, idx) => (
                                  <div key={idx} className="flex justify-between text-xs bg-black/40 p-1 px-2 rounded">
                                      <span>S{ep.season} E{ep.episodeNumber}: {ep.title}</span>
                                      <span className="text-green-500">OK</span>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              )}

              <textarea 
                placeholder="Synopsis" 
                className="w-full bg-black border border-gray-700 rounded p-3 focus:border-vtv-neon outline-none"
                onChange={e => setNewContent({...newContent, description: e.target.value})}
              ></textarea>
              
              <input 
                type="text" placeholder="Casting (séparé par des virgules)" 
                className="w-full bg-black border border-gray-700 rounded p-3 focus:border-vtv-neon outline-none"
                onChange={e => setNewContent({...newContent, cast: e.target.value as any})}
              />

              <div className="flex gap-4 pt-2">
                  <button type="submit" className="flex-1 bg-vtv-neon text-black font-bold py-3 rounded hover:bg-cyan-300">
                    PUBLIER
                  </button>
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-gray-800 text-white font-bold py-3 rounded hover:bg-gray-700">
                    ANNULER
                  </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};