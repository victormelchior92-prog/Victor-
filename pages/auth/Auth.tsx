import React, { useState } from 'react';
import { useStore } from '../../context/Store';
import { SubscriptionPlan } from '../../types';

export const Auth = () => {
  const { login, signup } = useStore();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(SubscriptionPlan.BASIC);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const success = await login(email, pin);
        if (!success) setError('Email ou Code incorrect');
      } else {
        const success = await signup(email, phone, pin, selectedPlan);
        if (!success) setError('Cet email existe déjà');
      }
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://picsum.photos/1920/1080?blur=5')] bg-cover opacity-30"></div>
      <div className="absolute w-[500px] h-[500px] bg-vtv-purple blur-[120px] rounded-full opacity-20 -top-20 -left-20"></div>
      <div className="absolute w-[500px] h-[500px] bg-vtv-neon blur-[120px] rounded-full opacity-20 bottom-0 right-0"></div>

      <div className="relative z-10 bg-black/60 backdrop-blur-xl border border-gray-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <h1 className="text-4xl font-bold text-center mb-2 neon-text tracking-widest">VTV</h1>
        <p className="text-center text-gray-400 mb-8 text-sm uppercase tracking-wider">Le cinéma à la maison</p>

        {error && <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded text-sm mb-4 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input 
              type="email" 
              placeholder="Email" 
              required
              className="w-full bg-white/5 border border-gray-700 rounded p-4 text-white placeholder-gray-500 focus:border-vtv-neon outline-none transition"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          {!isLogin && (
            <div>
              <input 
                type="tel" 
                placeholder="Numéro de téléphone" 
                required
                className="w-full bg-white/5 border border-gray-700 rounded p-4 text-white placeholder-gray-500 focus:border-vtv-neon outline-none transition"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
          )}

          <div>
            <input 
              type="password" 
              placeholder={isLogin ? "Code Secret / PIN" : "Créer un code (PIN)"}
              required
              className="w-full bg-white/5 border border-gray-700 rounded p-4 text-white placeholder-gray-500 focus:border-vtv-neon outline-none transition font-mono tracking-widest"
              value={pin}
              onChange={e => setPin(e.target.value)}
            />
            {isLogin && <div className="text-right mt-1"><a href="#" className="text-xs text-gray-500 hover:text-white">Code oublié ?</a></div>}
          </div>

          {!isLogin && (
            <div className="grid grid-cols-3 gap-2 pt-2">
               <div 
                 onClick={() => setSelectedPlan(SubscriptionPlan.BASIC)}
                 className={`cursor-pointer border rounded p-2 text-center text-xs transition ${selectedPlan === SubscriptionPlan.BASIC ? 'border-vtv-neon bg-vtv-neon/10' : 'border-gray-700 opacity-50'}`}
               >
                 <div className="font-bold">BASIC</div>
                 <div>5000</div>
               </div>
               <div 
                 onClick={() => setSelectedPlan(SubscriptionPlan.STANDARD)}
                 className={`cursor-pointer border rounded p-2 text-center text-xs transition ${selectedPlan === SubscriptionPlan.STANDARD ? 'border-vtv-purple bg-vtv-purple/10' : 'border-gray-700 opacity-50'}`}
               >
                 <div className="font-bold">STD</div>
                 <div>10500</div>
               </div>
               <div 
                 onClick={() => setSelectedPlan(SubscriptionPlan.PREMIUM)}
                 className={`cursor-pointer border rounded p-2 text-center text-xs transition ${selectedPlan === SubscriptionPlan.PREMIUM ? 'border-vtv-pink bg-vtv-pink/10' : 'border-gray-700 opacity-50'}`}
               >
                 <div className="font-bold">PREMIUM</div>
                 <div>15000</div>
               </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-vtv-neon to-vtv-purple text-black font-bold py-4 rounded hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(0,242,234,0.3)]"
          >
            {loading ? 'Chargement...' : (isLogin ? 'SE CONNECTER' : "S'INSCRIRE")}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-gray-400 text-sm hover:text-white transition"
          >
            {isLogin ? "Nouveau ? Créer un compte" : "Déjà membre ? Se connecter"}
          </button>
        </div>
      </div>
    </div>
  );
};
