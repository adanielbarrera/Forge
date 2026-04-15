import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import Navbar from '../components/Navbar';

export default function History() {
    const [activeTab, setActiveTab] = useState('progreso');
    const [exercises, setExercises] = useState([]);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [exerciseStats, setExerciseStats] = useState([]);
    const [weeklyVolume, setWeeklyVolume] = useState([]);
    const [workouts, setWorkouts] = useState([]);
    const [personalRecords, setPersonalRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const token = localStorage.getItem('token');
    const API_BASE = 'http://localhost:3000/api';

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [exRes, volRes, workoutRes, prRes] = await Promise.all([
                    axios.get(`${API_BASE}/workouts/exercises`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    axios.get(`${API_BASE}/stats/weekly-volume`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    axios.get(`${API_BASE}/workouts`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    axios.get(`${API_BASE}/stats/personal-records`, { headers: { 'Authorization': `Bearer ${token}` } })
                ]);
                
                setExercises(exRes.data);
                if (exRes.data.length > 0) setSelectedExercise(exRes.data[0].id);
                setWeeklyVolume(volRes.data);
                setWorkouts(workoutRes.data);
                setPersonalRecords(prRes.data);

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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        let formatted = new Intl.DateTimeFormat('es-ES', options).format(date);
        return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    };

    const calculateSessionVolume = (exercises) => {
        return exercises.reduce((acc, ex) => acc + (ex.series * ex.reps * ex.peso), 0);
    };

    const calculateSessionSeries = (exercises) => {
        return exercises.reduce((acc, ex) => acc + ex.series, 0);
    };

    const hasNewPR = (workout) => {
        // Un entrenamiento tiene un PR si alguno de sus ejercicios coincide con los records personales actuales
        // y tiene la misma fecha y peso.
        return workout.exercises.some(ex => 
            personalRecords.some(pr => 
                pr.id === ex.exerciseId && 
                pr.peso === ex.peso && 
                new Date(pr.fecha).toDateString() === new Date(workout.fecha).toDateString()
            )
        );
    };

    if (isLoading) return <div className="min-h-screen bg-[#0a0a0e] text-white flex items-center justify-center font-['Figtree']">Cargando...</div>;

    return (
        <div className="min-h-screen bg-[#0a0a0e] text-white font-['Figtree'] pb-24 selection:bg-[#e05c2a] overflow-x-hidden">
            
            {/* Header */}
            <div className="p-6 text-center animate-[fadeIn_0.5s_ease-out]">
                <h1 className="font-['Syne'] font-extrabold text-[36px] text-[#f5f0e8]">Historial</h1>
            </div>

            {/* Switch Tabs (Apple Style) */}
            <div className="flex justify-center px-6 mb-8 animate-[fadeIn_0.5s_ease-out]">
                <div className="relative flex w-full max-w-sm bg-[#14141e] p-1 rounded-xl border border-white/10 shadow-inner">
                    {/* Background Slider */}
                    <div 
                        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#e05c2a] rounded-lg transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${activeTab === 'sesiones' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'}`}
                    />
                    
                    <button 
                        onClick={() => setActiveTab('progreso')}
                        className={`relative z-10 flex-1 h-[44px] rounded-lg font-semibold text-[16px] transition-colors duration-300 ${activeTab === 'progreso' ? 'text-white' : 'text-white/50 hover:text-white/80'}`}
                    >
                        Progreso
                    </button>
                    <button 
                        onClick={() => setActiveTab('sesiones')}
                        className={`relative z-10 flex-1 h-[44px] rounded-lg font-semibold text-[16px] transition-colors duration-300 ${activeTab === 'sesiones' ? 'text-white' : 'text-white/50 hover:text-white/80'}`}
                    >
                        Sesiones
                    </button>
                </div>
            </div>

            <div className="animate-[slideUp_0.5s_ease-out_forwards] opacity-0" style={{ animationDelay: '0.1s' }}>
                {activeTab === 'progreso' ? (
                    <div className="px-4 space-y-10">
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
                                    <LineChart data={exerciseStats.map(s => ({ date: s.date.split('-').slice(1).join('/'), weight: s.weight }))}>
                                        <XAxis dataKey="date" stroke="#f5f0e8" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#f5f0e8" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={{ backgroundColor: '#14141e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                                        <Line type="monotone" dataKey="weight" stroke="#e05c2a" strokeWidth={3} dot={{ fill: '#e05c2a', r: 4 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Weekly Volume Chart */}
                        <div className="bg-[#14141e]/50 p-4 rounded-[20px] border border-white/5">
                            <h2 className="text-center font-medium text-[24px] mb-6">Volumen semanal</h2>
                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={weeklyVolume.map(v => ({ name: ['Dom','Lun','Mar','Mie','Jue','Vie','Sab'][v.day], volume: v.volume }))}>
                                        <XAxis dataKey="name" stroke="#f5f0e8" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#f5f0e8" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip cursor={{ fill: 'rgba(224,92,42,0.1)' }} contentStyle={{ backgroundColor: '#14141e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                                        <Bar dataKey="volume" fill="#e05c2a" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Sessions Tab - NEW FIGMA DESIGN */
                    <div className="px-6 space-y-6">
                        {workouts.length === 0 ? (
                            <p className="text-center text-white/40 mt-10">No hay sesiones registradas aún.</p>
                        ) : (
                            workouts.sort((a,b) => new Date(b.fecha) - new Date(a.fecha)).map(workout => (
                                <div key={workout.id} className="bg-[#14141e] rounded-[16px] p-6 shadow-xl border border-white/5 relative overflow-hidden">
                                    {hasNewPR(workout) && (
                                        <div className="absolute top-0 right-0 bg-[#c8a96e] text-[#0a0a0e] px-3 py-1 rounded-bl-lg font-bold text-[10px] uppercase tracking-wider animate-pulse">
                                            ¡Nuevo PR!
                                        </div>
                                    )}
                                    <h3 className="font-['Syne'] font-extrabold text-[20px] mb-1">
                                        {workout.notas || "Entrenamiento General"}
                                    </h3>
                                    <p className="font-['DM_Mono'] text-[12px] opacity-60 mb-8">
                                        {formatDate(workout.fecha)}
                                    </p>

                                    <div className="grid grid-cols-2 gap-y-8">
                                        {/* Volume Column */}
                                        <div className="flex flex-col items-center border-r border-white/10">
                                            <p className="font-['DM_Mono'] text-[24px] sm:text-[28px] leading-none mb-2">
                                                {calculateSessionVolume(workout.exercises).toLocaleString()}Kg
                                            </p>
                                            <div className="text-center">
                                                <p className="text-[14px] opacity-60">Volumen</p>
                                                <p className="text-[14px] opacity-60">Total</p>
                                            </div>
                                        </div>

                                        {/* Time and Series Column */}
                                        <div className="flex flex-col gap-6 pl-6">
                                            <div className="flex flex-col">
                                                <p className="font-['DM_Mono'] text-[24px] sm:text-[28px] leading-none mb-1">
                                                    01:15
                                                </p>
                                                <p className="text-[14px] opacity-60">Tiempo</p>
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="font-['DM_Mono'] text-[24px] sm:text-[28px] leading-none mb-1">
                                                    {calculateSessionSeries(workout.exercises)}
                                                </p>
                                                <p className="text-[14px] opacity-60">Series</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        
                        {personalRecords.map(pr => (
                            <div key={pr.id} className="bg-[#14141e] rounded-[16px] p-4 flex justify-between items-center border border-white/5">
                                <div>
                                    <h3 className="font-['Syne'] font-extrabold text-[16px]">{pr.nombre}</h3>
                                    <p className="font-['DM_Mono'] text-[10px] opacity-50">{formatDate(pr.fecha)}</p>
                                    <div className="flex items-center gap-2 mt-2 text-[#c8a96e]">
                                        <span className="text-[14px] font-medium">Nuevo PR</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                            <path fillRule="evenodd" d="M5.166 2.621v.858c-1.11.044-2.025.065-2.754.072a.5.5 0 0 0-.412.225c-.213.311-.342.614-.393.937-.56 3.528.803 5.629 2.115 6.72 1.259 1.047 2.681 1.486 3.525 1.638a10.447 10.447 0 0 0 1.83.145 10.439 10.439 0 0 0 1.832-.145c.844-.152 2.266-.591 3.525-1.638 1.312-1.091 2.675-3.192 2.115-6.72a.5.5 0 0 0-.393-.937.5.5 0 0 0-.412-.225c-.73-.007-1.644-.028-2.754-.072v-.858a.75.75 0 0 0-.75-.75H5.916a.75.75 0 0 0-.75.75Zm.75 1.25s1.5.018 3.475.02c1.975 0 3.475-.02 3.475-.02V11c-.348.015-.707.024-1.075.024-3.991 0-7.147-1.044-8.47-3.078C2.546 6.732 2.133 5.352 2.345 4.027l.397.046c.267.032.553.063.858.093Zm10.586 3.193c.236 1.484-.08 2.69-.746 3.512-.547.677-1.457 1.139-2.734 1.444a11.973 11.973 0 0 1-1.023.194v2.787a.75.75 0 0 0 .75.75h.5a.75.75 0 0 0 .75-.75v-2.015h1.152a.75.75 0 0 1 .75.75v1.265a.75.75 0 0 0 .75.75h1.5a.75.75 0 0 0 .75-.75v-1.265a2.25 2.25 0 0 0-2.25-2.25h-.402V13.68c1.332-.303 2.503-.842 3.41-1.66 1.312-1.182 2.45-3.326 1.89-6.854a.5.5 0 0 0-.394-.937c-.033.007-.08.017-.144.027-.33.048-.74.08-1.233.102a28.4 28.4 0 0 1-1.432.046.75.75 0 0 0-.75.75v1.25Z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="font-['DM_Mono'] text-[32px] text-[#c8a96e]">{pr.peso}Kg</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Navbar />
        </div>
    );
}