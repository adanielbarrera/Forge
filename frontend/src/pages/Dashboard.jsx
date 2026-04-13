import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import Navbar from '../components/Navbar';

export default function Dashboard() {
    const navigate = useNavigate();
    const [workouts, setWorkouts] = useState([]);
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const token = localStorage.getItem('token');
    const API_BASE = 'http://localhost:3000/api';

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Obtener entrenamientos para rachas y botón
                const workoutsRes = await axios.get(`${API_BASE}/workouts`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setWorkouts(workoutsRes.data);

                // Obtener perfil para el peso
                const userRes = await axios.get('http://localhost:3000/auth/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setUserData(userRes.data);
            } catch (err) {
                console.error("Error al cargar datos:", err);
            } finally {
                setIsLoading(false);
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
        startOfWeek.setDate(today.getDate() - today.getDay()); // Empezamos en Domingo (0)
        
        return [1, 2, 3, 4, 5, 6, 0].map(dayIdx => { // Ordenamos L-D
            const dayDate = new Date(startOfWeek);
            dayDate.setDate(startOfWeek.getDate() + dayIdx);
            
            const hasWorkout = workouts.some(w => {
                const wDate = new Date(w.fecha);
                return wDate.toDateString() === dayDate.toDateString();
            });

            const isToday = dayDate.toDateString() === today.toDateString();
            
            return {
                label: days[dayIdx],
                active: hasWorkout,
                current: isToday
            };
        });
    };

    const userName = userData?.nombre || userData?.email?.split('@')[0] || 'Usuario';
    const lastWeight = userData?.peso || '---';

    return (
        <div className="min-h-screen bg-[#0a0a0e] text-white font-['Figtree'] pb-24 relative selection:bg-[#e05c2a]">
            
            {/* Header */}
            <div className="flex justify-end p-6">
                <button 
                    onClick={handleLogout}
                    className="w-10 h-10 rounded-full bg-[#14141e] flex items-center justify-center text-[#f5f0e8] hover:bg-red-500/20 hover:text-red-500 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                    </svg>
                </button>
            </div>

            <div className="max-w-md mx-auto px-4">
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
                <div className="bg-[#14141e] rounded-[16px] h-[90px] flex items-center justify-center mb-6 border border-white/5 shadow-lg">
                    <div className="flex items-baseline gap-3">
                        <span className="font-['DM_Mono'] font-light text-[12px] text-white/70">Ultimo peso:</span>
                        <span className="font-['DM_Mono'] text-[40px] text-white leading-none">{lastWeight}</span>
                        <span className="font-['DM_Mono'] text-[24px] text-white">kg</span>
                    </div>
                </div>

                {/* Action Button */}
                <button 
                    onClick={() => navigate('/workout')}
                    className="w-full bg-[#e05c2a] hover:bg-[#c84d20] transition-colors rounded-[16px] h-[160px] flex flex-col items-center justify-center relative overflow-hidden group shadow-lg shadow-[#e05c2a]/10"
                >
                    <div className="absolute top-4 right-4 text-white opacity-80 group-hover:scale-110 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                        </svg>
                    </div>
                    <span className="font-['Syne'] font-extrabold text-[28px] sm:text-[32px] text-white mt-4 tracking-wide">
                        {workouts.length > 0 ? 'Continuar Rutina' : 'Nueva Rutina'}
                    </span>
                    {workouts.length > 0 && (
                        <span className="text-white/60 text-sm font-medium">Chest + tricep</span>
                    )}
                </button>
            </div>

            <Navbar />
        </div>
    );
}