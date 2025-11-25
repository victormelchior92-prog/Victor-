import React, { useRef, useState } from 'react';
import { Play, Pause, Maximize, FastForward, Rewind, RotateCcw } from 'lucide-react';

interface Props {
  src: string;
  poster: string;
  onBack: () => void;
}

export const VideoPlayer: React.FC<Props> = ({ src, poster, onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    if (videoRef.current) {
      if (playing) videoRef.current.pause();
      else videoRef.current.play();
      setPlaying(!playing);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p);
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) videoRef.current.currentTime += seconds;
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) document.exitFullscreen();
      else videoRef.current.requestFullscreen();
    }
  };

  return (
    <div className="relative w-full h-full bg-black group">
      <button 
        onClick={onBack}
        className="absolute top-4 left-4 z-20 text-white bg-black/50 p-2 rounded-full hover:bg-vtv-pink"
      >
        ✕ Fermer
      </button>

      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onClick={togglePlay}
      />

      {/* Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Progress Bar */}
        <div className="w-full bg-gray-700 h-1 rounded-full mb-4 cursor-pointer" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const width = rect.width;
          if (videoRef.current) {
              videoRef.current.currentTime = (clickX / width) * videoRef.current.duration;
          }
        }}>
          <div className="bg-vtv-neon h-full rounded-full relative" style={{ width: `${progress}%` }}>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_#00f2ea]"></div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={() => skip(-10)} className="text-white hover:text-vtv-neon"><Rewind /></button>
            <button onClick={togglePlay} className="text-black bg-vtv-neon p-3 rounded-full hover:scale-110 transition">
              {playing ? <Pause fill="black" /> : <Play fill="black" className="ml-1" />}
            </button>
            <button onClick={() => skip(10)} className="text-white hover:text-vtv-neon"><FastForward /></button>
            <button onClick={() => { if(videoRef.current) videoRef.current.currentTime = 0; }} className="text-white hover:text-vtv-neon"><RotateCcw size={20} /></button>
          </div>
          
          <div className="flex items-center gap-4">
             <span className="text-xs font-bold text-vtv-pink border border-vtv-pink px-2 py-0.5 rounded">HD</span>
             <button onClick={toggleFullscreen} className="text-white hover:text-vtv-neon"><Maximize /></button>
          </div>
        </div>
      </div>
    </div>
  );
};
