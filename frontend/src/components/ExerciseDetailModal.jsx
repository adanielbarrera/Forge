import { useState, useEffect } from 'react';

/**
 * ExerciseDetailModal Component
 * Shows a video, description and muscle groups for a specific exercise.
 */
export default function ExerciseDetailModal({ isOpen, onClose, exercise }) {
    const [animationState, setAnimationState] = useState('hidden');

    useEffect(() => {
        if (isOpen) {
            setAnimationState('showing');
        } else {
            setAnimationState('hidden');
        }
    }, [isOpen]);

    if (!isOpen || !exercise) return null;

    // Helper to format YouTube URLs for embed
    const getEmbedUrl = (url) => {
        if (!url) return null;
        if (url.includes('youtube.com/embed/')) return url;
        if (url.includes('youtu.be/')) {
            const id = url.split('/').pop();
            return `https://www.youtube.com/embed/${id}`;
        }
        if (url.includes('v=')) {
            const id = url.split('v=').pop().split('&')[0];
            return `https://www.youtube.com/embed/${id}`;
        }
        return url;
    };

    const embedUrl = getEmbedUrl(exercise.videoUrl);

    return (
        <div className={`fixed inset-0 z-[300] flex items-end justify-center bg-black/80 backdrop-blur-md transition-opacity duration-300 ${animationState === 'showing' ? 'opacity-100' : 'opacity-0'}`}>
            <div 
                className="absolute inset-0" 
                onClick={onClose}
            />
            
            <div className={`relative w-full max-w-lg bg-[#0A0A0E] rounded-t-[40px] border-t border-white/10 shadow-[0_-20px_60px_rgba(0,0,0,0.8)] flex flex-col max-h-[92vh] overflow-hidden transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${animationState === 'showing' ? 'translate-y-0' : 'translate-y-full'}`}>
                
                {/* Drag Handle */}
                <div className="w-16 h-1.5 bg-white/10 rounded-full mx-auto mt-4 mb-2" />

                {/* Close Button (Sticky Top Right) */}
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all z-10"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-12">
                    
                    {/* Exercise Title */}
                    <div className="mt-4 mb-8">
                        <h2 className="font-['Syne'] font-extrabold text-[32px] text-white leading-tight mb-2">
                            {exercise.nombre}
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {exercise.grupoMuscular && (
                                <span className="bg-[#e05c2a]/10 text-[#e05c2a] px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest border border-[#e05c2a]/20">
                                    {exercise.grupoMuscular}
                                </span>
                            )}
                            {exercise.musculoSecundario && exercise.musculoSecundario.split(',').map((m, i) => (
                                <span key={i} className="bg-white/5 text-white/40 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest border border-white/5">
                                    {m.trim()}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Video Player */}
                    <div className="mb-10 group">
                        <div className="aspect-video w-full bg-[#14141e] rounded-[24px] overflow-hidden border border-white/5 shadow-2xl relative">
                            {embedUrl ? (
                                <iframe 
                                    src={embedUrl}
                                    className="w-full h-full"
                                    title={exercise.nombre}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-white/20 p-8 text-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 mb-4 opacity-50">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                                    </svg>
                                    <p className="font-medium">Video demostrativo no disponible</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content Sections */}
                    <div className="space-y-10">
                        {exercise.descripcion && (
                            <section className="animate-[fadeIn_0.5s_ease-out_forwards]">
                                <h3 className="text-[#6B7AFF] text-[13px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#6B7AFF]"></span>
                                    Técnica y Ejecución
                                </h3>
                                <p className="text-[#f5f0e8]/80 leading-relaxed text-[16px]">
                                    {exercise.descripcion}
                                </p>
                            </section>
                        )}

                        {exercise.preparacion && (
                            <section className="animate-[fadeIn_0.5s_ease-out_forwards] delay-100">
                                <h3 className="text-[#c8a96e] text-[13px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#c8a96e]"></span>
                                    Preparación
                                </h3>
                                <p className="text-[#f5f0e8]/80 leading-relaxed text-[16px]">
                                    {exercise.preparacion}
                                </p>
                            </section>
                        )}
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 bg-gradient-to-t from-[#0A0A0E] via-[#0A0A0E] to-transparent">
                    <button 
                        onClick={onClose}
                        className="w-full bg-white text-black font-black py-4 rounded-[20px] text-lg active:scale-95 transition-all shadow-xl shadow-white/5"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
}
