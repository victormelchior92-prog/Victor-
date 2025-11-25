import React, { useState } from 'react';
import { useStore } from '../../context/Store';
import { Content, ContentType, SubscriptionPlan } from '../../types';
import { Plus, Trash, Users, Film, Play, LogOut, Smartphone, Check, X, Video, Settings, List } from 'lucide-react';

export const AdminDashboard = () => {
  const { 
    content, addContent, deleteContent, 
    users, validateSubscription, logout, 
    adminSwitchToClient, categories, addCategory, deleteCategory 
  } = useStore();
  
  const [tab, setTab] = useState<'content' | 'users' | 'custom'>('content');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Customization State
  const [newCatName, setNewCatName] = useState('');

  // Form State
  const [newContent, setNewContent] = useState<Partial<Content>>({
    type: ContentType.MOVIE,
    category: categories[0]?.name || 'Action'
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'posterUrl' | 'videoUrl' | 'trailerUrl') => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setNewContent(prev => ({ ...prev, [field]: url }));
      
      // Auto detect duration for video
      if(field === 'videoUrl') {
         const video = document.createElement('video');
         video.preload = 'metadata';
         video.onloadedmetadata = () => {
             setNewContent(prev => ({...prev, duration: Math.floor(video.duration)}));
         };
         video.src = url;
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.title || !newContent.posterUrl) return;

    addContent({
      ...newContent,
      id: Math.random().toString(36).substr(2, 9),
      addedAt: Date.now(),
      rating: 0,
      cast: (newContent.cast as any || '').toString().split(',').map((s: string) => s.trim())
    } as Content);
    
    setShowAddModal(false);
    setNewContent({ type: ContentType.MOVIE, category: categories[0]?.name || 'Action' });
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if(newCatName.trim()) {
      addCategory(newCatName.trim());
      setNewCatName('');
    }
  };

  const pendingUsersCount = users.filter(u => u.subscriptionStatus === 'PENDING').length;

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
      <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
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
                <div className="p-3">
                  <h3 className="font-bold truncate">{item.title}</h3>
                  <p className="text-xs text-gray-400">{item.category}</p>
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
                {users.length <= 1 && (
                    <tr><td colSpan={5} className="p-8 text-center text-gray-500">Aucun abonné pour le moment.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'custom' && (
         <div className="grid md:grid-cols-2 gap-6">
             {/* Category Management */}
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
             
             {/* General Settings (Placeholder for future) */}
             <div className="bg-vtv-card rounded-xl p-6 border border-gray-800 opacity-50 pointer-events-none">
                 <h2 className="text-xl font-bold mb-4">Thème & Apparence</h2>
                 <p className="text-gray-500 text-sm">Fonctionnalités à venir...</p>
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
              
              <div className="border border-gray-700 rounded p-4 border-dashed hover:border-vtv-neon transition-colors cursor-pointer relative group">
                <label className="block mb-2 text-sm text-gray-400 pointer-events-none">Affiche (Image)</label>
                <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'posterUrl')} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-vtv-neon file:text-black hover:file:bg-cyan-300"/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border border-gray-700 rounded p-4 border-dashed">
                    <label className="block mb-2 text-sm text-gray-400">Vidéo (MP4)</label>
                    <input type="file" accept="video/*" onChange={e => handleFileChange(e, 'videoUrl')} className="text-xs"/>
                </div>
                <div className="border border-gray-700 rounded p-4 border-dashed">
                    <label className="block mb-2 text-sm text-gray-400">Bande-annonce</label>
                    <input type="file" accept="video/*" onChange={e => handleFileChange(e, 'trailerUrl')} className="text-xs"/>
                </div>
              </div>

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