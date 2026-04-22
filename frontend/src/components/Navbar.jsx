import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [showActions, setShowActions] = useState(false);
    const [templates, setTemplates] = useState([]);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const res = await api.get('workouts/templates');
                setTemplates(res.data);
            } catch (err) {
                console.error("Error fetching templates in Navbar:", err);
            }
        };
        if (token) fetchTemplates();
    }, [token]);

    const isActive = (path) => location.pathname === path;

    const handleStartWorkout = (templateId = null) => {
        setShowActions(false);
        if (templateId) {
            navigate(`/workout?templateId=${templateId}`);
        } else {
            navigate('/workout');
        }
    };

    return (
        <>
            <div className="fixed bottom-0 w-full bg-[#14141e]/90 backdrop-blur-lg h-[85px] flex justify-around items-center px-4 border-t border-white/5 z-[60] pb-safe">
                {/* Home */}
                <button 
                    onClick={() => navigate('/dashboard')}
                    className={`flex flex-col items-center justify-center w-12 h-12 transition-all ${isActive('/dashboard') ? 'text-[#e05c2a] scale-110' : 'text-[#f5f0e8]/40 hover:text-[#e05c2a]'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                    <span className="text-[10px] mt-1 font-medium">Inicio</span>
                </button>

                {/* History */}
                <button 
                    onClick={() => navigate('/history')}
                    className={`flex flex-col items-center justify-center w-12 h-12 transition-all ${isActive('/history') ? 'text-[#e05c2a] scale-110' : 'text-[#f5f0e8]/40 hover:text-[#e05c2a]'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                    </svg>
                    <span className="text-[10px] mt-1 font-medium">Historial</span>
                </button>

                {/* Central Action Button (+) */}
                <div className="relative -top-6">
                    <button 
                        onClick={() => setShowActions(true)}
                        className="w-16 h-16 rounded-full bg-[#e05c2a] text-white flex items-center justify-center shadow-2xl shadow-[#e05c2a]/40 border-4 border-[#0a0a0e] active:scale-90 transition-transform"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </button>
                </div>

                {/* IA / AI (Placeholder or Stats) */}
                <button 
                    onClick={() => alert('Próximamente: Análisis IA')}
                    className="flex flex-col items-center justify-center w-12 h-12 text-[#f5f0e8]/40 hover:text-[#6b7aff] transition-all"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                    <span className="text-[10px] mt-1 font-medium">IA Forge</span>
                </button>

                {/* Profile */}
                <button 
                    onClick={() => navigate('/profile')}
                    className={`flex flex-col items-center justify-center w-12 h-12 transition-all ${isActive('/profile') ? 'text-[#e05c2a] scale-110' : 'text-[#f5f0e8]/40 hover:text-[#e05c2a]'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                    <span className="text-[10px] mt-1 font-medium">Perfil</span>
                </button>
            </div>

            {/* Contextual Menu (Bottom Sheet) */}
            {showActions && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out] px-4">
                    <div className="absolute inset-0" onClick={() => setShowActions(false)} />
                    <div className="relative w-full max-w-md bg-[#14141e] rounded-t-[32px] p-6 pb-12 animate-[slideUp_0.3s_ease-out_forwards] border-t border-white/10 shadow-2xl">
                        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-8" />
                        
                        <h2 className="font-['Syne'] font-extrabold text-2xl mb-8 text-white">Entrenamiento</h2>
                        
                        <div className="space-y-4">
                            <button 
                                onClick={() => handleStartWorkout()}
                                className="w-full bg-white/5 hover:bg-[#e05c2a]/10 p-5 rounded-2xl flex items-center gap-4 transition-all group border border-white/5 hover:border-[#e05c2a]/30"
                            >
                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/60 group-hover:text-[#e05c2a] transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-lg text-white">En blanco</p>
                                    <p className="text-white/40 text-sm">Empieza desde cero</p>
                                </div>
                            </button>

                            <button 
                                onClick={() => { setShowActions(false); navigate('/template/new'); }}
                                className="w-full bg-white/5 hover:bg-[#6b7aff]/10 p-5 rounded-2xl flex items-center gap-4 transition-all group border border-white/5 hover:border-[#6b7aff]/30"
                            >
                                <div className="w-12 h-12 rounded-xl bg-[#6b7aff]/10 flex items-center justify-center text-[#6b7aff]">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-lg text-white">Nueva plantilla</p>
                                    <p className="text-white/40 text-sm">Crea una rutina reutilizable</p>
                                </div>
                            </button>

                            {templates.length > 0 && (
                                <div className="pt-4">
                                    <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-4 px-2">Plantillas disponibles</p>
                                    <div className="grid grid-cols-1 gap-3 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                                        {templates.map(t => (
                                            <button 
                                                key={t.id}
                                                onClick={() => handleStartWorkout(t.id)}
                                                className="w-full bg-white/5 hover:bg-white/10 p-4 rounded-xl flex items-center justify-between group transition-all border border-transparent hover:border-white/10"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-[#c8a96e]" />
                                                    <span className="font-semibold text-white/80 group-hover:text-white">{t.nombre}</span>
                                                </div>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-white/20 group-hover:text-white transition-colors">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                                </svg>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}