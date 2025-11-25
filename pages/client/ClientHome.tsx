import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/Store';
import { Content, SubscriptionPlan } from '../../types';
import { Play, Info, Search, User as UserIcon, LogOut, Video } from 'lucide-react';
import { VideoPlayer } from '../../components/VideoPlayer';
import { VoiceAssistant } from '../../components/VoiceAssistant';

const ContentCard: React.FC<{ item: Content, onClick: () => void }> = ({ item, onClick }) => (
  <div onClick={onClick} className="group relative cursor-pointer aspect-[2/3] overflow-hidden rounded-lg transition-transform hover:scale-105 hover:z-20 hover:shadow-[0_0_20px_rgba(0,0,0,0.5)]">
    <img src={item.posterUrl} className="w-full h-full object-cover transition duration-300 group-hover:brightness-75" loading="lazy" />
    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
      <div className="bg-vtv-neon rounded-full p-3 shadow-lg">
        <Play fill="black" className="text-black ml-1" size={24} />
      </div>
    </div>
    <div className="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition">
      <p className="text-xs font-bold text-white truncate">{item.title}</p>
    </div>
  </div>
);

export const ClientHome = () => {
  const { content, categories, user, logout, requestSubscription, updateUser } = useStore();
  const [featured, setFeatured] = useState<Content | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [playingContent, setPlayingContent] = useState<Content | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    // Random featured content rotation
    const rotate = () => {
      const random = content[Math.floor(Math.random() * content.length)];
      setFeatured(random);
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
    return <VideoPlayer src={playingContent.videoUrl} poster={playingContent.posterUrl} onBack={() => setPlayingContent(null)} />;
  }

  const filteredContent = content.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-vtv-dark pb-20">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-40 bg-gradient-to-b from-black/90 to-transparent px-6 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold neon-text tracking-wider">VTV</div>
        
        <div className="flex items-center gap-4 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Rechercher..." 
            className="bg-transparent outline-none w-24 md:w-48 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button onClick={() => setShowProfile(true)}>
          <img src={user.avatar} alt="Profile" className="w-9 h-9 rounded-full border border-vtv-neon" />
        </button>
      </nav>

      {/* Hero Section */}
      {!searchTerm && featured && (
        <div className="relative h-[70vh] w-full">
          <div className="absolute inset-0">
            <img src={featured.posterUrl} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-vtv-dark via-vtv-dark/40 to-transparent"></div>
          </div>
          <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 pb-12">
             <span className="bg-vtv-pink px-2 py-1 rounded text-xs font-bold uppercase mb-2 inline-block">À la une</span>
             <h1 className="text-4xl md:text-6xl font-bold mb-4 max-w-2xl drop-shadow-xl">{featured.title}</h1>
             <p className="text-gray-200 max-w-xl mb-6 line-clamp-2 md:line-clamp-3">{featured.description}</p>
             <div className="flex gap-4">
               <button onClick={() => setPlayingContent(featured)} className="bg-white text-black px-6 py-3 rounded flex items-center gap-2 font-bold hover:bg-vtv-neon transition">
                 <Play fill="black" size={20} /> Lecture
               </button>
               <button onClick={() => setSelectedContent(featured)} className="bg-gray-500/50 backdrop-blur text-white px-6 py-3 rounded flex items-center gap-2 font-bold hover:bg-gray-500/70 transition">
                 <Info size={20} /> Détails
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Content Rows */}
      <div className={`px-6 ${!searchTerm && featured ? '-mt-10 relative z-10' : 'mt-24'}`}>
        {searchTerm ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredContent.map(item => (
              <ContentCard key={item.id} item={item} onClick={() => setSelectedContent(item)} />
            ))}
          </div>
        ) : (
          categories.map(cat => {
            const catContent = content.filter(c => c.category === cat.name);
            if (catContent.length === 0) return null;
            return (
              <div key={cat.id} className="mb-8">
                <h2 className="text-xl font-bold mb-4 text-gray-200 hover:text-vtv-neon transition-colors cursor-pointer">{cat.name}</h2>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                  {catContent.map(item => (
                    <div key={item.id} className="min-w-[160px] md:min-w-[200px] snap-start">
                       <ContentCard item={item} onClick={() => setSelectedContent(item)} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
      
      <div className="text-center py-10 text-gray-500 text-sm">
        <p className="neon-text mb-2 text-xl">Le meilleur du streaming</p>
        <p>© 2024 VTV Gabon. Tous droits réservés.</p>
      </div>

      {/* Detail Modal */}
      {selectedContent && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm overflow-y-auto p-4 flex items-center justify-center">
          <div className="bg-vtv-card max-w-4xl w-full rounded-2xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
             <button onClick={() => setSelectedContent(null)} className="absolute top-4 right-4 z-10 bg-black/50 p-2 rounded-full hover:bg-white/20">✕</button>
             
             <div className="grid md:grid-cols-[2fr_3fr]">
                <div className="h-64 md:h-full relative">
                   <img src={selectedContent.posterUrl} className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-gradient-to-t from-vtv-card to-transparent md:hidden"></div>
                </div>
                <div className="p-8 flex flex-col justify-center">
                   <h2 className="text-3xl font-bold mb-2">{selectedContent.title}</h2>
                   <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
                      <span>{selectedContent.releaseYear}</span>
                      <span className="border border-gray-600 px-1 rounded">{Math.floor(selectedContent.duration / 60)} min</span>
                      <span className="text-vtv-neon">{selectedContent.category}</span>
                   </div>
                   
                   <p className="text-gray-300 mb-6 leading-relaxed">{selectedContent.description}</p>
                   
                   <div className="mb-8">
                     <p className="text-gray-500 text-sm mb-1">Casting:</p>
                     <p className="text-white">{selectedContent.cast.join(', ')}</p>
                   </div>
                   
                   <div className="flex flex-col gap-3">
                       <button 
                         onClick={() => {
                            setPlayingContent(selectedContent);
                            setSelectedContent(null);
                         }}
                         className="bg-vtv-neon text-black font-bold py-3 px-8 rounded-full hover:bg-white transition flex items-center justify-center gap-2"
                       >
                         <Play fill="black" size={20} /> REGARDER MAINTENANT
                       </button>

                       {selectedContent.trailerUrl && (
                           <button 
                             onClick={() => {
                                setPlayingContent({
                                    ...selectedContent,
                                    videoUrl: selectedContent.trailerUrl,
                                    title: `Bande-annonce: ${selectedContent.title}`
                                });
                                setSelectedContent(null);
                             }}
                             className="bg-gray-800 text-white font-bold py-3 px-8 rounded-full hover:bg-gray-700 transition flex items-center justify-center gap-2 border border-gray-600"
                           >
                             <Video size={20} /> BANDE-ANNONCE
                           </button>
                       )}
                   </div>
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

      {/* Floating Gemini AI */}
      <VoiceAssistant />
    </div>
  );
};