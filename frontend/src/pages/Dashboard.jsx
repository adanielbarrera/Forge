import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

import Navbar from '../components/Navbar';

export default function Dashboard() {
    const navigate = useNavigate();
    const [workouts, setWorkouts] = useState([]);
    const [userData, setUserData] = useState(null);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Obtener entrenamientos para rachas y botón
                const workoutsRes = await api.get('workouts');
                setWorkouts(workoutsRes.data);

                // Obtener perfil para el peso
                const userRes = await api.get('auth/profile');
                setUserData(userRes.data);
            } catch (err) {
                console.error("Error al cargar datos:", err);
            }
        };

        if (token) fetchData();
    }, [token]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Lógica de rachas: Marcamos los días de la semana actual que tienen entrenamientos
    const getStreakDays = () => {
        const days = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        
        return [1, 2, 3, 4, 5, 6, 0].map(dayIdx => {
            const dayDate = new Date(startOfWeek);
            dayDate.setDate(startOfWeek.getDate() + dayIdx);
            const hasWorkout = workouts.some(w => new Date(w.fecha).toDateString() === dayDate.toDateString());
            const isToday = dayDate.toDateString() === today.toDateString();
            return { label: days[dayIdx], active: hasWorkout, current: isToday };
        });
    };

    const userName = userData?.nombre || userData?.email?.split('@')[0] || 'Usuario';
    const lastWeight = userData?.peso || '---';

    return (
        <div className="min-h-screen bg-[#0a0a0e] text-white font-['Figtree'] pb-28 relative selection:bg-[#e05c2a]">
            
            {/* Header */}
            <div className="flex justify-end p-6 animate-[fadeIn_0.5s_ease-out]">
                <button 
                    onClick={handleLogout}
                    className="w-10 h-10 rounded-full bg-[#14141e] flex items-center justify-center text-[#f5f0e8] hover:bg-red-500/20 hover:text-red-500 transition-colors shadow-lg"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                    </svg>
                </button>
            </div>

            <div className="max-w-md mx-auto px-4 animate-[slideUp_0.5s_ease-out_forwards] opacity-0" style={{ animationDelay: '0.1s' }}>
                <h1 className="font-['Syne'] font-extrabold text-[32px] sm:text-[36px] text-white mb-8 truncate">
                    Hola {userName}
                </h1>

                {/* Streak Card */}
                <div className="bg-[#14141e] rounded-[16px] p-5 mb-6 relative border border-white/5 shadow-lg">
                    <div className="flex justify-end mb-4">
                        <span className="font-semibold text-[18px] text-white">Tu racha</span>
                    </div>
                    
                    <div className="flex justify-between items-center gap-1 sm:gap-2">
                        {getStreakDays().map((day, idx) => (
                            <div 
                                key={idx} 
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold transition-all
                                    ${day.active ? 'bg-[#c8a96e] text-[#f5f0e8]' : 'border-2 border-[#c8a96e]/20 text-[#f5f0e8]/40'}
                                    ${day.current ? 'ring-2 ring-white ring-offset-2 ring-offset-[#14141e]' : ''}
                                `}
                            >
                                {day.label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Last Weight Card */}
                <div className="bg-[#14141e] rounded-[16px] h-[100px] flex items-center justify-center mb-6 border border-white/5 shadow-lg">
                    <div className="flex items-baseline gap-3">
                        <span className="font-['DM_Mono'] font-light text-[14px] text-white/70">Ultimo peso:</span>
                        <span className="font-['DM_Mono'] text-[48px] text-white leading-none">{lastWeight}</span>
                        <span className="font-['DM_Mono'] text-[24px] text-white">kg</span>
                    </div>
                </div>

                {/* Last Workout Resume */}
                {workouts.length > 0 && (
                    <div 
                        onClick={() => navigate('/workout')}
                        className="bg-[#14141e] p-6 rounded-[16px] mb-6 border border-white/5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors shadow-lg group"
                    >
                        <div>
                            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-2">Último entrenamiento</p>
                            <p className="text-xl font-bold text-white truncate max-w-[200px]">
                                {workouts[0].exercises[0]?.exercise?.nombre || 'Rutina'}...
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-[#e05c2a]/10 flex items-center justify-center text-[#e05c2a] group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                            </svg>
                        </div>
                    </div>
                )}

                {/* Primary Orange Action Button */}
                <button 
                    onClick={() => navigate('/workout')}
                    className="w-full bg-[#e05c2a] hover:bg-[#c84d20] transition-all rounded-[20px] h-[160px] flex flex-col items-center justify-center relative overflow-hidden group shadow-2xl shadow-[#e05c2a]/30 active:scale-95 mb-8"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
                    <div className="bg-white/20 p-4 rounded-2xl mb-4 group-hover:rotate-12 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 text-white">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </div>
                    <span className="font-['Syne'] font-extrabold text-[28px] text-white tracking-tight">
                        Empezar Rutina
                    </span>
                    <p className="text-white/60 text-sm font-medium mt-1 uppercase tracking-widest">Nueva sesión</p>
                </button>

                {/* Empty State / Welcome Note */}
                {workouts.length === 0 && (
                    <div className="py-10 text-center px-4">
                        <p className="text-white/30 text-lg italic">"La disciplina es el puente entre las metas y los logros."</p>
                    </div>
                )}
            </div>

            <Navbar />
        </div>
    );
}