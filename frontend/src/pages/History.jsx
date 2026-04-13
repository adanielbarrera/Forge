import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import Navbar from '../components/Navbar';

export default function History() {
    const [activeTab, setActiveTab] = useState('progreso');
    const [exercises, setExercises] = useState([]);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [exerciseStats, setExerciseStats] = useState([]);
    const [weeklyVolume, setWeeklyVolume] = useState([]);
    const [workouts, setWorkouts] = useState([]); // Para la pestaña de sesiones
    const [isLoading, setIsLoading] = useState(true);

    const token = localStorage.getItem('token');
    const API_BASE = 'http://localhost:3000/api';

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetch exercises
                const exRes = await axios.get(`${API_BASE}/exercises`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setExercises(exRes.data);
                if (exRes.data.length > 0) {
                    setSelectedExercise(exRes.data[0].id);
                }

                // Fetch weekly volume
                const volRes = await axios.get(`${API_BASE}/stats/weekly-volume`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setWeeklyVolume(volRes.data);

                // Fetch workouts for the "Sesiones" tab
                const workoutRes = await axios.get(`${API_BASE}/workouts`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setWorkouts(workoutRes.data);

            } catch (err) {
                console.error("Error al cargar datos:", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (token) fetchInitialData();
    }, [token]);

    useEffect(() => {
        const fetchExerciseStats = async () => {
            if (!selectedExercise) return;
            try {
                const res = await axios.get(`${API_BASE}/stats/exercise-progress?exerciseId=${selectedExercise}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setExerciseStats(res.data);
            } catch (err) {
                console.error("Error al cargar progreso del ejercicio:", err);
            }
        };

        if (token && selectedExercise) fetchExerciseStats();
    }, [token, selectedExercise]);

    const days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    const volumeData = weeklyVolume.map(v => ({
        name: days[v.day],
        volume: v.volume
    }));

    const progressData = exerciseStats.map(s => ({
        date: s.date.split('-').slice(1).join('/'), // MM/DD
        weight: s.weight
    }));

    if (isLoading) return <div className="min-h-screen bg-[#0a0a0e] text-white flex items-center justify-center font-['Figtree']">Cargando...</div>;

    return (
        <div className="min-h-screen bg-[#0a0a0e] text-white font-['Figtree'] pb-24 selection:bg-[#e05c2a]">
            
            {/* Header */}
            <div className="p-6 text-center">
                <h1 className="font-['Syne'] font-extrabold text-[36px] text-[#f5f0e8]">Historial</h1>
            </div>

            {/* Tabs */}
            <div className="flex justify-center gap-4 px-6 mb-8">
                <button 
                    onClick={() => setActiveTab('progreso')}
                    className={`flex-1 h-[52px] rounded-[10px] font-semibold text-[16px] transition-all
                        ${activeTab === 'progreso' ? 'bg-[#e05c2a] text-[#f5f0e8]' : 'border border-[#e05c2a] text-[#f5f0e8]'}`}
                >
                    Progreso
                </button>
                <button 
                    onClick={() => setActiveTab('sesiones')}
                    className={`flex-1 h-[52px] rounded-[10px] font-semibold text-[16px] transition-all
                        ${activeTab === 'sesiones' ? 'bg-[#e05c2a] text-[#f5f0e8]' : 'border border-[#e05c2a] text-[#f5f0e8]'}`}
                >
                    Sesiones
                </button>
            </div>

            {activeTab === 'progreso' ? (
                <div className="px-4 space-y-10">
                    
                    {/* Exercise Select */}
                    <div className="relative max-w-xs mx-auto">
                        <select 
                            value={selectedExercise || ''}
                            onChange={(e) => setSelectedExercise(e.target.value)}
                            className="w-full bg-[#e05c2a]/10 border border-[#e05c2a] text-[#f5f0e8] rounded-[10px] h-[52px] px-4 font-semibold appearance-none focus:outline-none"
                        >
                            {exercises.map(ex => (
                                <option key={ex.id} value={ex.id} className="bg-[#14141e]">{ex.nombre}</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#e05c2a]">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                            </svg>
                        </div>
                    </div>

                    {/* Exercise Progress Chart */}
                    <div className="bg-[#14141e]/50 p-4 rounded-[20px] border border-white/5">
                        <h2 className="text-center font-medium text-[24px] mb-6">Series por ejercicio</h2>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={progressData}>
                                    <XAxis 
                                        dataKey="date" 
                                        stroke="#f5f0e8" 
                                        fontSize={12} 
                                        tickLine={false} 
                                        axisLine={false}
                                    />
                                    <YAxis 
                                        stroke="#f5f0e8" 
                                        fontSize={12} 
                                        tickLine={false} 
                                        axisLine={false}
                                    />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#14141e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                        itemStyle={{ color: '#e05c2a' }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="weight" 
                                        stroke="#e05c2a" 
                                        strokeWidth={3} 
                                        dot={{ fill: '#e05c2a', strokeWidth: 2, r: 4 }} 
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Weekly Volume Chart */}
                    <div className="bg-[#14141e]/50 p-4 rounded-[20px] border border-white/5">
                        <h2 className="text-center font-medium text-[24px] mb-6">Volumen semanal</h2>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={volumeData}>
                                    <XAxis 
                                        dataKey="name" 
                                        stroke="#f5f0e8" 
                                        fontSize={12} 
                                        tickLine={false} 
                                        axisLine={false}
                                    />
                                    <YAxis 
                                        stroke="#f5f0e8" 
                                        fontSize={12} 
                                        tickLine={false} 
                                        axisLine={false}
                                    />
                                    <Tooltip 
                                        cursor={{ fill: 'rgba(224,92,42,0.1)' }}
                                        contentStyle={{ backgroundColor: '#14141e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                    />
                                    <Bar dataKey="volume" fill="#e05c2a" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            ) : (
                /* Sessions Tab Content */
                <div className="px-6 space-y-4">
                    {workouts.length === 0 ? (
                        <p className="text-center text-white/40 mt-10">No hay sesiones registradas aún.</p>
                    ) : (
                        workouts.map(workout => (
                            <div key={workout.id} className="bg-[#14141e] rounded-[16px] p-5 border border-white/5 shadow-lg">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-bold text-lg">Sesión #{workout.id}</span>
                                    <span className="text-[#e05c2a] text-sm font-medium">
                                        {new Date(workout.fecha).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {workout.exercises.map((ex, idx) => (
                                        <div key={idx} className="flex justify-between text-sm text-white/70">
                                            <span>{ex.exercise.nombre}</span>
                                            <span>{ex.series}x{ex.reps} - {ex.peso}kg</span>
                                        </div>
                                    ))}
                                </div>
                                {workout.notas && (
                                    <p className="mt-3 text-xs text-white/40 italic border-t border-white/5 pt-2">
                                        "{workout.notas}"
                                    </p>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

            <Navbar />
        </div>
    );
}