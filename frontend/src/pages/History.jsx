import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import Navbar from '../components/Navbar';
import ExerciseSelector from '../components/ExerciseSelector';
import ExerciseDetailModal from '../components/ExerciseDetailModal';
import { getExercises } from '../utils/exerciseCache';

export default function History() {
    const [activeTab, setActiveTab] = useState('progreso');
    const [exercises, setExercises] = useState([]);
    const [selectedExerciseId, setSelectedExerciseId] = useState(null);
    const [exerciseStats, setExerciseStats] = useState([]);
    const [weeklyVolume, setWeeklyVolume] = useState([]);
    const [workouts, setWorkouts] = useState([]);
    const [personalRecords, setPersonalRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [feedbacks, setFeedbacks] = useState({});
    const [loadingFeedback, setLoadingFeedback] = useState({});
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedExerciseForDetail, setSelectedExerciseForDetail] = useState(null);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // 1. Cargar ejercicios desde Caché o API
                const exercisesList = await getExercises(token);
                setExercises(exercisesList);
                if (exercisesList.length > 0) setSelectedExerciseId(exercisesList[0].id);

                // 2. Cargar datos dinámicos (que cambian siempre)
                const [volRes, workoutRes, prRes] = await Promise.all([
                    api.get('stats/weekly-volume'),
                    api.get('workouts'),
                    api.get('stats/personal-records')
                ]);
                
                setWeeklyVolume(volRes.data);
                setWorkouts(workoutRes.data);
                setPersonalRecords(prRes.data);

                // Pre-cargar feedbacks existentes
                const initialFeedbacks = {};
                workoutRes.data.forEach(w => {
                    if (w.feedback) initialFeedbacks[w.id] = w.feedback;
                });
                setFeedbacks(initialFeedbacks);

            } catch (err) {
                console.error("Error al cargar datos:", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (token) fetchInitialData();
    }, [token]);

    const handleGetFeedback = async (id) => {
        if (feedbacks[id]) return;
        setLoadingFeedback(prev => ({ ...prev, [id]: true }));
        try {
            const res = await api.get(`workouts/${id}/feedback`);
            setFeedbacks(prev => ({ ...prev, [id]: res.data.feedback }));
        } catch (err) {
            console.error("Error al obtener feedback:", err);
        } finally {
            setLoadingFeedback(prev => ({ ...prev, [id]: false }));
        }
    };

    const handleShowDetail = (exercise) => {
        // Encontrar la data completa del ejercicio desde la lista global
        const fullEx = exercises.find(ex => ex.id === exercise.id) || exercise;
        setSelectedExerciseForDetail(fullEx);
        setIsDetailModalOpen(true);
    };

    useEffect(() => {
        const fetchExerciseStats = async () => {
            if (!selectedExerciseId) return;
            try {
                const res = await api.get(`stats/exercise-progress?exerciseId=${selectedExerciseId}`);
                setExerciseStats(res.data);
            } catch (err) {
                console.error("Error al cargar progreso del ejercicio:", err);
            }
        };

        if (token && selectedExerciseId) fetchExerciseStats();
    }, [token, selectedExerciseId]);

    const selectedExerciseName = exercises.find(ex => ex.id === selectedExerciseId)?.nombre || 'Seleccionar ejercicio';

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

    const formatWorkoutTime = (seconds) => {
        if (!seconds) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const hasNewPR = (workout) => {
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
        <div className="min-h-screen bg-[#0a0a0e] text-white font-['Figtree'] pb-32 selection:bg-[#e05c2a] overflow-x-hidden no-scrollbar">
            
            {/* Header */}
            <div className="p-6 text-center animate-[fadeIn_0.5s_ease-out]">
                <h1 className="font-['Syne'] font-extrabold text-[36px] text-[#f5f0e8]">Historial</h1>
            </div>

            {/* Switch Tabs (Apple Style) */}
            <div className="flex justify-center px-6 mb-8 animate-[fadeIn_0.5s_ease-out]">
                <div className="relative flex w-full max-w-sm bg-[#14141e] p-1 rounded-xl border border-white/10 shadow-inner">
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

            <div className="animate-[slideUp_0.5s_ease-out_forwards] opacity-0 no-scrollbar" style={{ animationDelay: '0.1s' }}>
                {activeTab === 'progreso' ? (
                    <div className="px-4 space-y-10">
                        {/* Custom Exercise Selector Trigger */}
                        <div className="max-w-xs mx-auto">
                            <button 
                                onClick={() => setIsSelectorOpen(true)}
                                className="w-full bg-[#e05c2a]/10 border border-[#e05c2a]/30 text-[#f5f0e8] rounded-[14px] h-[56px] px-6 font-bold flex items-center justify-between hover:bg-[#e05c2a]/20 transition-all active:scale-95 shadow-lg shadow-[#e05c2a]/5"
                            >
                                <span className="truncate text-lg">{selectedExerciseName}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-[#e05c2a] flex-shrink-0 ml-2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                </svg>
                            </button>
                        </div>

                        <ExerciseSelector 
                            isOpen={isSelectorOpen}
                            onClose={() => setIsSelectorOpen(false)}
                            onSelect={(ex) => setSelectedExerciseId(ex.id)}
                            exercises={exercises}
                        />

                        {/* Exercise Progress Chart */}
                        <div className="bg-[#14141e]/50 p-6 rounded-[24px] border border-white/5 shadow-xl">
                            <h2 className="text-center font-bold text-[20px] mb-8 text-white/80 uppercase tracking-widest">Peso máximo (Kg)</h2>
                            <div className="h-[220px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={exerciseStats.map(s => ({ date: s.date.split('-').slice(1).join('/'), weight: s.weight }))}>
                                        <XAxis dataKey="date" stroke="#f5f0e8" fontSize={10} tickLine={false} axisLine={false} tick={{ opacity: 0.5 }} />
                                        <YAxis stroke="#f5f0e8" fontSize={10} tickLine={false} axisLine={false} tick={{ opacity: 0.5 }} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#14141e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }} 
                                            itemStyle={{ color: '#e05c2a', fontWeight: 'bold' }}
                                        />
                                        <Line type="monotone" dataKey="weight" stroke="#e05c2a" strokeWidth={4} dot={{ fill: '#e05c2a', r: 5, strokeWidth: 2, stroke: '#14141e' }} activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Weekly Volume Chart */}
                        <div className="bg-[#14141e]/50 p-6 rounded-[24px] border border-white/5 shadow-xl">
                            <h2 className="text-center font-bold text-[20px] mb-8 text-white/80 uppercase tracking-widest">Volumen semanal</h2>
                            <div className="h-[220px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={weeklyVolume.map(v => ({ name: ['Dom','Lun','Mar','Mie','Jue','Vie','Sab'][v.day], volume: v.volume }))}>
                                        <XAxis dataKey="name" stroke="#f5f0e8" fontSize={10} tickLine={false} axisLine={false} tick={{ opacity: 0.5 }} />
                                        <YAxis stroke="#f5f0e8" fontSize={10} tickLine={false} axisLine={false} tick={{ opacity: 0.5 }} />
                                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)', radius: 8 }} contentStyle={{ backgroundColor: '#14141e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                                        <Bar dataKey="volume" fill="#e05c2a" radius={[6, 6, 0, 0]} barSize={32} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Sessions Tab */
                    <div className="px-6 space-y-6 no-scrollbar pb-10">
                        {workouts.length === 0 ? (
                            <p className="text-center text-white/40 mt-10 italic">No hay sesiones registradas aún.</p>
                        ) : (
                            workouts.sort((a,b) => new Date(b.fecha) - new Date(a.fecha)).map(workout => (
                                <div key={workout.id} className="bg-[#14141e] rounded-[20px] p-6 shadow-xl border border-white/5 relative overflow-hidden active:scale-[0.98] transition-transform group">
                                    {hasNewPR(workout) && (
                                        <div className="absolute top-0 right-0 bg-[#c8a96e] text-[#0a0a0e] px-4 py-1.5 rounded-bl-xl font-black text-[11px] uppercase tracking-tighter shadow-lg">
                                            ¡NUEVO PR!
                                        </div>
                                    )}
                                    
                                    <div className="mb-4">
                                        <h3 className="font-['Syne'] font-extrabold text-[22px] mb-1 text-[#f5f0e8]">
                                            {workout.nombre || workout.exercises?.[0]?.exercise?.nombre || "Entrenamiento General"}
                                        </h3>
                                        <p className="font-['DM_Mono'] text-[13px] text-white/40 mb-1 font-medium">
                                            {formatDate(workout.fecha)}
                                        </p>
                                        <div className="flex flex-wrap gap-x-2 gap-y-1">
                                            {workout.exercises.map((set, idx) => (
                                                <button 
                                                    key={idx}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleShowDetail(set.exercise);
                                                    }}
                                                    className="font-['Syne'] font-extrabold text-[18px] text-[#f5f0e8] hover:text-[#e05c2a] transition-colors flex items-center gap-1"
                                                >
                                                    {set.exercise.nombre}{idx < workout.exercises.length - 1 ? ',' : ''}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-y-8 mb-4">
                                        <div className="flex flex-col items-center border-r border-white/5">
                                            <p className="font-['DM_Mono'] text-[28px] text-[#f5f0e8] leading-none mb-2 font-bold">
                                                {(workout.volumen || calculateSessionVolume(workout.exercises)).toLocaleString()}
                                                <span className="text-sm ml-1 text-white/30">Kg</span>
                                            </p>
                                            <p className="text-[12px] font-bold uppercase tracking-widest text-white/30">Volumen</p>
                                        </div>

                                        <div className="flex flex-col gap-6 pl-8">
                                            <div className="flex flex-col">
                                                <p className="font-['DM_Mono'] text-[24px] text-[#f5f0e8] leading-none mb-1 font-bold">
                                                    {formatWorkoutTime(workout.duracion) === '--:--' ? '01:15' : formatWorkoutTime(workout.duracion)}
                                                </p>
                                                <p className="text-[11px] font-bold uppercase tracking-widest text-white/30">Tiempo</p>
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="font-['DM_Mono'] text-[24px] text-[#f5f0e8] leading-none mb-1 font-bold">
                                                    {calculateSessionSeries(workout.exercises)}
                                                </p>
                                                <p className="text-[11px] font-bold uppercase tracking-widest text-white/30">Series</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* IA Feedback Section */}
                                    <div className="mt-6 pt-6 border-t border-white/5">
                                        {feedbacks[workout.id] ? (
                                            <div className="bg-[#6B7AFF]/10 border border-[#6B7AFF]/30 rounded-[14px] p-4 animate-[fadeIn_0.5s_ease-out]">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-2 h-2 rounded-full bg-[#6B7AFF] animate-pulse"></div>
                                                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7AFF]">Análisis de IA Forge</span>
                                                </div>
                                                <p className="text-[#f5f0e8]/90 text-[14px] leading-relaxed italic">
                                                    "{feedbacks[workout.id]}"
                                                </p>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleGetFeedback(workout.id);
                                                }}
                                                disabled={loadingFeedback[workout.id]}
                                                className="w-full h-[48px] bg-[#6B7AFF]/10 border border-[#6B7AFF]/30 rounded-xl text-[#6B7AFF] font-bold text-[13px] uppercase tracking-widest hover:bg-[#6B7AFF]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                {loadingFeedback[workout.id] ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-[#6B7AFF] border-t-transparent rounded-full animate-spin"></div>
                                                        Analizando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                        </svg>
                                                        Pedir análisis IA
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                        
                        {personalRecords.length > 0 && (
                            <div className="pt-8">
                                <h2 className="text-white/20 text-xs font-bold uppercase tracking-[0.2em] mb-6 px-2 text-center underline decoration-[#c8a96e]/30 underline-offset-8">Récords Recientes</h2>
                                <div className="space-y-4">
                                    {personalRecords.map(pr => (
                                        <div key={pr.id} className="bg-[#14141e]/40 rounded-[16px] p-5 flex justify-between items-center border border-[#c8a96e]/10 shadow-lg shadow-[#c8a96e]/5">
                                            <div>
                                                <h3 className="font-['Syne'] font-extrabold text-[17px] text-[#f5f0e8]">{pr.nombre}</h3>
                                                <p className="font-['DM_Mono'] text-[11px] text-white/30 mt-1">{formatDate(pr.fecha)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-['DM_Mono'] text-[28px] font-bold text-[#c8a96e] leading-none">{pr.peso}Kg</p>
                                                <span className="text-[10px] font-black text-[#c8a96e] uppercase tracking-tighter">PR Alcanzado</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Navbar />

            <ExerciseDetailModal 
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                exercise={selectedExerciseForDetail}
            />
        </div>
    );
}
