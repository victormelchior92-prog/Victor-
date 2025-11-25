import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/Store';
import { Content, SubscriptionPlan, ContentType, Episode } from '../../types';
import { Play, Info, Search, User as UserIcon, LogOut, Video, MessageSquare, Plus, ChevronDown } from 'lucide-react';
import { VideoPlayer } from '../../components/VideoPlayer';

const ContentCard: React.FC<{ item: Content, onClick: () => void, rank?: number }> = ({ item, onClick, rank }) => (
  <div onClick={onClick} className="group relative cursor-pointer h-full transition-transform hover:scale-105 hover:z-20">
    <div className={`aspect-[2/3] overflow-hidden rounded-lg relative ${rank ? 'ml-12 md:ml-20' : ''}`}>
      <img src={item.posterUrl} className="w-full h-full object-cover transition duration-300 group-hover:brightness-75" loading="lazy" />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
        <div className="bg-vtv-neon rounded-full p-3 shadow-lg">
          <Play fill="black" className="text-black ml-1" size={24} />
        </div>
      </div>
    </div>
    
    {/* Top 10 Styling */}
    {rank && (
        <span className="absolute bottom-0 -left-4 md:-left-8 text-[100px] md:text-[140px] font-black leading-[0.7] text-black" 
              style={{ WebkitTextStroke: '2px #555', textShadow: '4px 4px 10px black', zIndex: -1 }}>
            {rank}
        </span>
    )}
  </div>
);

export const ClientHome = () => {
  const { content, categories, user, logout, requestSubscription, updateUser, addSuggestion } = useStore();
  const [featured, setFeatured] = useState<Content | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [playingContent, setPlayingContent] = useState<{ url: string, poster: string } | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);

  // Suggestion Form State
  const [suggTitle, setSuggTitle] = useState('');
  const [suggMsg, setSuggMsg] = useState('');

  useEffect(() => {
    // Random featured content rotation
    const rotate = () => {
        if(content.length > 0) {
            const random = content[Math.floor(Math.random() * content.length)];
            setFeatured(random);
        }
    };
    rotate();
    const interval = setInterval(rotate, 30000);
    return () => clearInterval(interval);
  }, [content]);

  // If subscription is not active
  if (user?.subscriptionStatus !== 'ACTIVE') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4 bg-[url('https://picsum.photos/1920/1080?blur=10')] bg-cover bg-center bg-no-repeat relative">
         <div className="absolute inset-0 bg-black/80"></div>
         <div className="relative z-10 bg-vtv-card p-8 rounded-2xl max-w-md w-full border border-vtv-pink shadow-[0_0_50px_rgba(255,0,85,0.3)] text-center">
            <h1 className="text-4xl font-bold neon-text mb-2">VTV</h1>
            <h2 className="text-xl text-white mb-6">Abonnement requis</h2>
            
            {user?.subscriptionStatus === 'PENDING' ? (
              <div className="bg-yellow-500/20 text-yellow-200 p-4 rounded-lg mb-6 border border-yellow-500/50">
                <p className="font-bold">Validation en attente</p>
                <p className="text-sm mt-1">L'administrateur va valider votre paiement sous peu.</p>
                <p className="text-xs mt-2 text-gray-400">Paiement Mobile Money: +241074087064</p>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                <p className="text-gray-300 mb-4">Choisissez votre formule pour accéder au catalogue.</p>
                <button onClick={() => requestSubscription(SubscriptionPlan.BASIC)} className="w-full bg-gray-800 hover:bg-gray-700 py-3 rounded border border-gray-600">Basic (5000 FCFA)</button>
                <button onClick={() => requestSubscription(SubscriptionPlan.STANDARD)} className="w-full bg-vtv-purple hover:bg-opacity-80 py-3 rounded">Standard (10 500 FCFA)</button>
                <button onClick={() => requestSubscription(SubscriptionPlan.PREMIUM)} className="w-full bg-gradient-to-r from-vtv-pink to-orange-500 hover:scale-105 transition py-3 rounded font-bold">Premium (15 000 FCFA)</button>
              </div>
            )}
            
            <button onClick={logout} className="text-gray-400 hover:text-white text-sm underline">Se déconnecter</button>
         </div>
      </div>
    );
  }

  if (playingContent) {
    return <VideoPlayer src={playingContent.url} poster={playingContent.poster} onBack={() => setPlayingContent(null)} />;
  }

  const filteredContent = content.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));
  
  // Sort by admin rating for Top 10
  const top10Content = [...content].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 10);

  const handleSuggestionSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      addSuggestion(suggTitle, suggMsg);
      setShowSuggestionModal(false);
      setSuggTitle('');
      setSuggMsg('');
      alert("Merci ! Votre suggestion a été envoyée à l'équipe VTV.");
  };

  const playMedia = (content: Content, episode?: Episode) => {
      // Determine what URL to play
      let url = content.videoUrl;
      let title = content.title;
      
      if (content.type === ContentType.SERIES && episode) {
          url = episode.videoUrl;
          title = `${content.title} - S${episode.season} E${episode.episodeNumber}`;
      } else if (content.type === ContentType.SERIES && !episode) {
          // If trying to play series without specific episode, try to find first ep
          if (content.episodes && content.episodes.length > 0) {
              const firstEp = content.episodes.sort((a,b) => (a.season - b.season) || (a.episodeNumber - b.episodeNumber))[0];
              url = firstEp.videoUrl;
              title = `${content.title} - S${firstEp.season} E${firstEp.episodeNumber}`;
          }
      }

      if(url) {
          setPlayingContent({ url, poster: content.posterUrl });
          setSelectedContent(null);
      } else {
          alert("Vidéo non disponible pour le moment.");
      }
  };

  return (
    <div className="min-h-screen bg-vtv-dark pb-20 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-40 bg-gradient-to-b from-black/90 to-transparent px-6 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold neon-text tracking-wider flex items-center gap-2">
            VTV
        </div>
        
        <div className="hidden md:flex gap-6 text-sm font-bold text-gray-300">
            <a href="#" className="hover:text-white transition" onClick={(e) => {e.preventDefault(); setSearchTerm('');}}>Accueil</a>
            <a href="#" className="hover:text-white transition">Séries</a>
            <a href="#" className="hover:text-white transition">Films</a>
            <button onClick={() => setShowSuggestionModal(true)} className="hover:text-vtv-neon transition flex items-center gap-1">
                Suggestions <Plus size={14} />
            </button>
        </div>

        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            <Search size={16} className="text-gray-400" />
            <input 
                type="text" 
                placeholder="Titres, genres..." 
                className="bg-transparent outline-none w-20 md:w-32 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            </div>

            <button onClick={() => setShowProfile(true)}>
            <img src={user.avatar} alt="Profile" className="w-8 h-8 rounded-full border border-vtv-neon" />
            </button>
        </div>
      </nav>

      {/* Hero Section */}
      {!searchTerm && featured && (
        <div className="relative h-[80vh] w-full">
          <div className="absolute inset-0">
            <img src={featured.posterUrl} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-vtv-dark via-vtv-dark/20 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent"></div>
          </div>
          <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 pb-20 md:pb-24">
             <div className="flex items-center gap-2 mb-4">
                 <span className="bg-vtv-pink text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                    {featured.type}
                 </span>
                 <span className="text-vtv-neon font-bold text-sm tracking-wider">{featured.category}</span>
             </div>
             
             <h1 className="text-4xl md:text-7xl font-black mb-4 max-w-3xl drop-shadow-2xl uppercase italic tracking-tighter">
                {featured.title}
             </h1>
             
             <div className="flex items-center gap-4 mb-6">
                 <div className="flex text-green-400 font-bold text-sm">
                     {featured.rating ? `${featured.rating * 10}% Recommandé` : 'Nouveauté'}
                 </div>
                 <div className="text-gray-300 text-sm">{featured.releaseYear}</div>
             </div>

             <p className="text-gray-300 max-w-xl mb-8 line-clamp-3 text-lg font-light leading-relaxed drop-shadow-md">
                {featured.description}
             </p>
             
             <div className="flex gap-4">
               <button onClick={() => playMedia(featured)} className="bg-white text-black px-8 py-3 rounded font-bold hover:bg-vtv-neon transition flex items-center gap-2">
                 <Play fill="black" size={24} /> Lecture
               </button>
               <button onClick={() => setSelectedContent(featured)} className="bg-gray-600/60 backdrop-blur text-white px-8 py-3 rounded font-bold hover:bg-gray-500/70 transition flex items-center gap-2">
                 <Info size={24} /> Plus d'infos
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className={`px-6 md:px-12 relative z-10 ${!searchTerm && featured ? '-mt-12' : 'mt-24'}`}>
        {searchTerm ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {filteredContent.map(item => (
              <ContentCard key={item.id} item={item} onClick={() => setSelectedContent(item)} />
            ))}
          </div>
        ) : (
          <>
            {/* Top 10 Section */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                    Top 10 en <span className="text-vtv-neon">VTV Gabon</span> aujourd'hui
                </h2>
                <div className="flex overflow-x-auto pb-8 scrollbar-hide snap-x gap-4 pl-4 md:pl-8">
                    {top10Content.map((item, index) => (
                        <div key={item.id} className="min-w-[140px] md:min-w-[180px] snap-start relative">
                            <ContentCard item={item} onClick={() => setSelectedContent(item)} rank={index + 1} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Categories */}
            {categories.map(cat => {
              const catContent = content.filter(c => c.category === cat.name);
              if (catContent.length === 0) return null;
              return (
                <div key={cat.id} className="mb-10 group/row">
                  <h2 className="text-lg font-bold mb-3 text-gray-300 group-hover/row:text-vtv-neon transition-colors cursor-pointer flex items-center gap-2">
                      {cat.name} <ChevronDown size={14} className="-rotate-90 opacity-0 group-hover/row:opacity-100 transition-all" />
                  </h2>
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                    {catContent.map(item => (
                      <div key={item.id} className="min-w-[150px] md:min-w-[220px] snap-start">
                         <ContentCard item={item} onClick={() => setSelectedContent(item)} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
      
      <div className="text-center py-12 text-gray-500 text-sm bg-black/50 mt-12 border-t border-gray-900">
        <p className="neon-text mb-2 text-xl font-bold">VTV</p>
        <p>© 2024 VTV Gabon. Le meilleur du streaming.</p>
      </div>

      {/* Suggestion Modal */}
      {showSuggestionModal && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
              <div className="bg-vtv-card border border-vtv-neon max-w-md w-full p-6 rounded-xl shadow-[0_0_30px_rgba(0,242,234,0.2)] animate-in zoom-in-95">
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                          <MessageSquare className="text-vtv-neon" /> Suggérer un contenu
                      </h2>
                      <button onClick={() => setShowSuggestionModal(false)} className="text-gray-400 hover:text-white">✕</button>
                  </div>
                  <form onSubmit={handleSuggestionSubmit} className="space-y-4">
                      <div>
                          <label className="block text-xs text-gray-400 mb-1">Titre du film/série</label>
                          <input 
                            required 
                            className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-vtv-neon outline-none" 
                            placeholder="ex: Inception, Naruto..."
                            value={suggTitle}
                            onChange={e => setSuggTitle(e.target.value)}
                          />
                      </div>
                      <div>
                          <label className="block text-xs text-gray-400 mb-1">Pourquoi ? (Optionnel)</label>
                          <textarea 
                            className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-vtv-neon outline-none h-24" 
                            placeholder="J'adore ce film..."
                            value={suggMsg}
                            onChange={e => setSuggMsg(e.target.value)}
                          />
                      </div>
                      <button type="submit" className="w-full bg-vtv-neon text-black font-bold py-3 rounded hover:bg-cyan-300 transition">ENVOYER</button>
                  </form>
              </div>
          </div>
      )}

      {/* Detail Modal */}
      {selectedContent && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm overflow-y-auto p-4 flex items-center justify-center">
          <div className="bg-vtv-card max-w-5xl w-full rounded-2xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 border border-gray-800">
             <button onClick={() => setSelectedContent(null)} className="absolute top-4 right-4 z-20 bg-black/50 p-2 rounded-full hover:bg-white/20">✕</button>
             
             <div className="grid md:grid-cols-[2fr_3fr]">
                <div className="h-[40vh] md:h-full relative">
                   <img src={selectedContent.posterUrl} className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-gradient-to-t from-vtv-card to-transparent md:hidden"></div>
                </div>
                <div className="p-8 flex flex-col">
                   <h2 className="text-4xl font-bold mb-2">{selectedContent.title}</h2>
                   <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
                      <span className="text-green-500 font-bold">{selectedContent.rating ? `${selectedContent.rating}/10` : 'Non noté'}</span>
                      <span>{selectedContent.releaseYear}</span>
                      {selectedContent.type !== ContentType.SERIES && (
                          <span className="border border-gray-600 px-1 rounded">{Math.floor(selectedContent.duration / 60)} min</span>
                      )}
                      <span className="text-vtv-neon px-2 py-0.5 bg-vtv-neon/10 rounded border border-vtv-neon/20">{selectedContent.category}</span>
                   </div>
                   
                   <p className="text-gray-300 mb-6 leading-relaxed text-lg">{selectedContent.description}</p>
                   
                   <div className="mb-8">
                     <p className="text-gray-500 text-sm mb-1 uppercase tracking-wider">Casting</p>
                     <p className="text-white font-medium">{selectedContent.cast.join(', ')}</p>
                   </div>
                   
                   <div className="flex gap-3 mb-8">
                       {/* Play button depends on Type */}
                       {selectedContent.type !== ContentType.SERIES ? (
                            <button 
                                onClick={() => playMedia(selectedContent)}
                                className="bg-white text-black font-bold py-3 px-8 rounded hover:bg-vtv-neon transition flex items-center justify-center gap-2"
                            >
                                <Play fill="black" size={20} /> Lecture
                            </button>
                       ) : null}

                       {selectedContent.trailerUrl && (
                           <button 
                             onClick={() => {
                                setPlayingContent({
                                    url: selectedContent.trailerUrl,
                                    poster: selectedContent.posterUrl
                                });
                             }}
                             className="bg-gray-800 text-white font-bold py-3 px-8 rounded hover:bg-gray-700 transition flex items-center justify-center gap-2 border border-gray-600"
                           >
                             <Video size={20} /> Bande-annonce
                           </button>
                       )}
                   </div>

                   {/* Episodes List for Series */}
                   {selectedContent.type === ContentType.SERIES && (
                       <div className="mt-4 border-t border-gray-800 pt-6">
                           <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold">Épisodes</h3>
                                <span className="text-gray-500 text-sm">{selectedContent.episodes?.length || 0} épisodes</span>
                           </div>
                           
                           {!selectedContent.episodes || selectedContent.episodes.length === 0 ? (
                               <p className="text-gray-500 italic">Aucun épisode disponible pour le moment.</p>
                           ) : (
                               <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                   {selectedContent.episodes.sort((a,b) => (a.season - b.season) || (a.episodeNumber - b.episodeNumber)).map(ep => (
                                       <div 
                                         key={ep.id} 
                                         onClick={() => playMedia(selectedContent, ep)}
                                         className="flex items-center gap-4 p-4 hover:bg-gray-800 rounded cursor-pointer group border border-transparent hover:border-gray-700 transition"
                                       >
                                           <div className="text-gray-400 text-lg font-bold w-6">{ep.episodeNumber}</div>
                                           <div className="relative w-32 aspect-video bg-gray-900 rounded overflow-hidden flex-shrink-0">
                                               {/* Placeholder thumbnail using poster */}
                                               <img src={selectedContent.posterUrl} className="w-full h-full object-cover opacity-60" />
                                               <div className="absolute inset-0 flex items-center justify-center">
                                                   <Play className="text-white opacity-0 group-hover:opacity-100 transition" fill="white" size={20} />
                                               </div>
                                           </div>
                                           <div className="flex-1">
                                               <div className="flex justify-between">
                                                    <h4 className="font-bold text-white">{ep.title}</h4>
                                                    <span className="text-sm text-gray-500">{Math.floor(ep.duration / 60)}m</span>
                                               </div>
                                               <p className="text-sm text-gray-400">Saison {ep.season}</p>
                                           </div>
                                       </div>
                                   ))}
                               </div>
                           )}
                       </div>
                   )}
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 z-50 bg-black/80 flex justify-end">
          <div className="w-full max-w-sm bg-vtv-card h-full p-6 animate-in slide-in-from-right duration-300 border-l border-gray-800">
             <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Mon Profil</h2>
                <button onClick={() => setShowProfile(false)}>✕</button>
             </div>
             
             <div className="flex flex-col items-center mb-8">
                <div className="relative mb-4">
                  <img src={user.avatar} className="w-24 h-24 rounded-full border-2 border-vtv-neon" />
                  <label className="absolute bottom-0 right-0 bg-gray-800 p-1.5 rounded-full cursor-pointer hover:bg-gray-700">
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                       if(e.target.files?.[0]) updateUser({ avatar: URL.createObjectURL(e.target.files[0]) });
                    }} />
                    <UserIcon size={14} />
                  </label>
                </div>
                <h3 className="text-xl font-bold">{user.name}</h3>
                <p className="text-gray-400">{user.email}</p>
                <div className="mt-2 bg-gradient-to-r from-vtv-pink to-orange-500 text-xs px-2 py-0.5 rounded font-bold uppercase">{user.subscriptionPlan}</div>
             </div>
             
             <div className="space-y-4">
               <div className="bg-white/5 p-4 rounded-lg">
                 <p className="text-xs text-gray-500 mb-1">Code PIN</p>
                 <div className="flex justify-between items-center">
                    <span className="font-mono text-xl">••••</span>
                    <button onClick={() => {
                      const newPin = prompt("Nouveau code PIN ?");
                      if(newPin) updateUser({ pin: newPin });
                    }} className="text-vtv-neon text-sm">Modifier</button>
                 </div>
               </div>

               <div className="bg-white/5 p-4 rounded-lg">
                 <p className="text-xs text-gray-500 mb-1">Expiration Abonnement</p>
                 <p>{user.subscriptionExpiry ? new Date(user.subscriptionExpiry).toLocaleDateString() : 'Inactif'}</p>
                 <button onClick={() => requestSubscription(user.subscriptionPlan)} className="w-full mt-3 bg-vtv-purple py-2 rounded text-sm font-bold">Prolonger (Réabonnement)</button>
               </div>
             </div>

             <button onClick={logout} className="w-full mt-12 flex items-center justify-center gap-2 text-red-500 hover:text-red-400">
               <LogOut size={18} /> Déconnexion
             </button>
          </div>
        </div>
      )}
    </div>
  );
};