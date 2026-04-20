import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import ExerciseSelector from './ExerciseSelector';
import { getExercises } from '../utils/exerciseCache';

export default function WorkoutForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const templateId = queryParams.get('templateId');

    const [exercises, setExercises] = useState([]); // All exercises from API/Cache
    const [workoutExercises, setWorkoutExercises] = useState([]); // Selected exercises for this workout
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [timer, setTimer] = useState(0); // Timer in seconds
    const [showSummary, setShowSummary] = useState(false);
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);

    const token = localStorage.getItem('token');
    const API_BASE = 'http://localhost:3000/api';

    // Timer logic
    useEffect(() => {
        let interval = null;
        if (!showSummary) {
            interval = setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [showSummary]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Fetch exercises and template if needed
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Exercises (Using Cache)
                const exercisesList = await getExercises(token);
                setExercises(exercisesList);

                // 2. Fetch Template if provided
                if (templateId) {
                    const tempResponse = await axios.get(`${API_BASE}/workouts/templates/${templateId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    
                    const templateData = tempResponse.data;
                    // rutina is JSON: Array of { exerciseId, nombre, sets: [{ reps, weight }] }
                    const initialWorkoutExercises = templateData.rutina.map(item => ({
                        id: item.exerciseId,
                        nombre: item.nombre,
                        sets: item.sets.map((s, idx) => ({
                            id: Date.now() + idx + Math.random(),
                            reps: s.reps,
                            weight: s.weight,
                            completed: false
                        }))
                    }));
                    setWorkoutExercises(initialWorkoutExercises);
                }
            } catch (err) {
                console.error('Fetch error:', err);
                setError('No se pudieron cargar los datos.');
            }
        };

        if (token) {
            fetchData();
        } else {
            setError('Sesión no válida.');
        }
    }, [token, templateId]);

    const handleAddExercise = async (exercise) => {
        let lastReps = 10;
        let lastWeight = 20;

        try {
            const res = await axios.get(`${API_BASE}/workouts/exercises/last-values/${exercise.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            lastReps = res.data.reps;
            lastWeight = res.data.peso;
        } catch (err) {
            console.error("No se pudieron obtener los últimos valores:", err);
        }

        const newWorkoutExercise = {
            ...exercise,
            id: exercise.id,
            nombre: exercise.nombre,
            sets: [{ id: Date.now(), reps: lastReps, weight: lastWeight, completed: false }]
        };

        setWorkoutExercises(prev => [...prev, newWorkoutExercise]);
    };

    const addSet = async (exerciseIndex) => {
        const updated = [...workoutExercises];
        const lastSet = updated[exerciseIndex].sets[updated[exerciseIndex].sets.length - 1];
        
        updated[exerciseIndex].sets.push({
            id: Date.now(),
            reps: lastSet ? lastSet.reps : 10,
            weight: lastSet ? lastSet.weight : 20,
            completed: false
        });
        setWorkoutExercises(updated);
    };

    const toggleSet = (exerciseIndex, setIndex) => {
        const updated = [...workoutExercises];
        const s = updated[exerciseIndex].sets[setIndex];
        
        // Validación antes de marcar como completado
        if (!s.reps || s.reps <= 0 || !s.weight || s.weight < 0) {
            setError('Por favor ingresa valores válidos (mayores a 0) antes de marcar como completado.');
            return;
        }

        updated[exerciseIndex].sets[setIndex].completed = !updated[exerciseIndex].sets[setIndex].completed;
        setWorkoutExercises(updated);
        setError('');
    };

    const updateSet = (exerciseIndex, setIndex, field, value) => {
        const updated = [...workoutExercises];
        // Solo permitir números positivos o vacío para borrar
        if (value !== '' && Number(value) < 0) return;
        
        updated[exerciseIndex].sets[setIndex][field] = value;
        setWorkoutExercises(updated);
    };

    const handleFinishWorkout = () => {
        if (workoutExercises.length === 0) {
            setError('Agrega al menos un ejercicio.');
            return;
        }

        // Validar que todos los sets tengan valores válidos
        const allValid = workoutExercises.every(ex => 
            ex.sets.every(s => s.reps > 0 && s.weight >= 0 && s.reps !== '' && s.weight !== '')
        );

        if (!allValid) {
            setError('Todos los sets deben tener repeticiones y peso válidos.');
            return;
        }

        setShowSummary(true);
    };

    const submitWorkout = async () => {
        setIsLoading(true);
        setError('');

        try {
            const exercisesData = [];
            workoutExercises.forEach(ex => {
                ex.sets.forEach((s, index) => {
                    exercisesData.push({
                        exerciseId: Number(ex.id),
                        series: index + 1,
                        reps: Number(s.reps),
                        peso: Number(s.weight)
                    });
                });
            });

            const response = await fetch(`${API_BASE}/workouts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    exercises: exercisesData
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error al guardar el entrenamiento');
            }

            setWorkoutExercises([]);
            navigate('/dashboard');
        } catch (err) {
            console.error('Submit error:', err);
            setError(err.message);
            setShowSummary(false); // Go back to fix error if it fails
        } finally {
            setIsLoading(false);
        }
    };

    const calculateVolume = () => {
        return workoutExercises.reduce((acc, ex) => 
            acc + ex.sets.reduce((sum, s) => sum + (Number(s.reps) * Number(s.weight)), 0), 0
        );
    };

    const calculateTotalSets = () => {
        return workoutExercises.reduce((acc, ex) => acc + ex.sets.length, 0);
    };

    if (showSummary) {
        return (
            <div className="min-h-screen bg-[#0a0a0e] text-white p-6 font-['Figtree'] selection:bg-[#e05c2a] flex flex-col items-center">
                <div className="w-full max-w-md animate-[fadeIn_0.5s_ease-out]">
                    <h1 className="font-['Syne'] font-extrabold text-[36px] text-white mt-10 mb-2 animate-[slideUp_0.5s_ease-out_forwards]">
                        Felicidades
                    </h1>
                    <p className="text-[16px] text-white/60 mb-10 animate-[slideUp_0.5s_ease-out_forwards] delay-75">
                        Entrenamiento finalizado
                    </p>

                    {/* Resumen Card */}
                    <div className="bg-[#14141e] rounded-[16px] p-6 mb-6 border border-white/5 shadow-xl animate-[slideUp_0.5s_ease-out_forwards] delay-100">
                        <h2 className="font-semibold text-[24px] mb-8">Resumen</h2>
                        
                        <div className="grid grid-cols-2 gap-y-10">
                            <div className="flex flex-col">
                                <p className="font-['DM_Mono'] text-[28px] leading-none mb-1">
                                    {calculateVolume().toLocaleString()}Kg
                                </p>
                                <div className="text-[14px] opacity-60">
                                    <p>Volumen</p>
                                    <p>Total</p>
                                </div>
                            </div>

                            <div className="flex flex-col pl-6 border-l border-white/10">
                                <div className="mb-6">
                                    <p className="font-['DM_Mono'] text-[28px] leading-none mb-1">
                                        {formatTime(timer)}
                                    </p>
                                    <p className="text-[14px] opacity-60">Tiempo</p>
                                </div>
                                <div>
                                    <p className="font-['DM_Mono'] text-[28px] leading-none mb-1">
                                        {calculateTotalSets()}
                                    </p>
                                    <p className="text-[14px] opacity-60">Series</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* IA Analysis Card */}
                    <div className="bg-[#14141e] border-r border-[#6b7aff] rounded-[16px] p-6 mb-12 animate-[slideUp_0.5s_ease-out_forwards] delay-200">
                        <p className="font-['DM_Mono'] text-[13px] text-[#6b7aff] mb-4 uppercase tracking-wider">
                            Análisis de IA
                        </p>
                        <div className="font-['DM_Mono'] text-[12px] leading-relaxed space-y-2 opacity-80">
                            <p>Es una rutina sólida y equilibrada.</p>
                            <p>Has completado {workoutExercises.length} ejercicios diferentes hoy.</p>
                            <p className="mt-4 text-[#6b7aff] font-bold">Sugerencia:</p>
                            <p>Asegúrate de progresar en cargas cada semana y priorizar la técnica sobre el peso para evitar lesiones.</p>
                        </div>
                    </div>

                    <button 
                        onClick={submitWorkout}
                        disabled={isLoading}
                        className="w-full bg-[#e05c2a] hover:bg-[#c84d20] text-[#f5f0e8] font-semibold text-[24px] py-4 rounded-[10px] transition-all active:scale-95 disabled:opacity-50 animate-[slideUp_0.5s_ease-out_forwards] delay-300"
                    >
                        {isLoading ? 'Guardando...' : 'Guardar entrenamiento'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0e] text-white p-4 font-['Figtree'] selection:bg-[#e05c2a]">
            <div className="max-w-4xl mx-auto py-8">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-[36px] font-extrabold font-['Syne'] leading-tight md:text-5xl">
                            Entrenamiento
                        </h1>
                        <div className="mt-2 text-[#f5f0e8] opacity-80">
                            <span className="font-semibold text-sm uppercase tracking-wider">Tiempo</span>
                            <p className="text-2xl font-bold font-mono">{formatTime(timer)}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="bg-white/5 hover:bg-white/10 text-white border border-white/10 font-semibold px-6 py-3 rounded-[12px] transition-all duration-200 active:scale-95"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={handleFinishWorkout}
                            disabled={isLoading}
                            className="bg-[#e05c2a] hover:bg-[#c84d20] text-[#f5f0e8] font-semibold text-[20px] px-8 py-3 rounded-[12px] transition-all duration-200 active:scale-95 disabled:opacity-50 shadow-lg shadow-[#e05c2a]/20"
                        >
                            {isLoading ? 'Guardando...' : 'Finalizar'}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-xl mb-6 text-center">
                        {error}
                    </div>
                )}

                {/* Exercise Selector Trigger */}
                <div className="mb-8">
                    <button 
                        onClick={() => setIsSelectorOpen(true)}
                        className="w-full bg-[#14141e] border border-white/10 rounded-[16px] p-6 flex items-center justify-between group hover:border-[#e05c2a]/40 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#e05c2a]/10 flex items-center justify-center text-[#e05c2a] group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-lg text-[#f5f0e8]">Añadir ejercicio</p>
                                <p className="text-white/40 text-sm">Busca por grupo muscular</p>
                            </div>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white/20 group-hover:text-white transition-colors">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                        </svg>
                    </button>
                </div>

                <ExerciseSelector 
                    isOpen={isSelectorOpen}
                    onClose={() => setIsSelectorOpen(false)}
                    onSelect={handleAddExercise}
                    exercises={exercises}
                />

                {/* Exercises List */}
                <div className="grid grid-cols-1 gap-6">
                    {workoutExercises.map((exercise, exIdx) => (
                        <div key={exIdx} className="bg-[#14141e] rounded-[16px] p-4 sm:p-6 shadow-xl border border-white/5">
                            <h3 className="text-[20px] font-medium mb-6 text-white truncate">
                                {exercise.nombre}
                            </h3>

                            <div className="grid grid-cols-4 gap-4 mb-4 px-2 text-[16px] font-medium opacity-60">
                                <div>Set</div>
                                <div className="text-center">Rep</div>
                                <div className="text-center">Peso</div>
                                <div className="text-right">Ok</div>
                            </div>

                            <div className="space-y-3">
                                {exercise.sets.map((set, setIdx) => (
                                    <div key={set.id} className={`grid grid-cols-4 gap-4 items-center rounded-[10px] py-1 transition-colors ${set.completed ? 'bg-[#e05c2a]/20' : ''}`}>
                                        <div className="text-[16px] text-[#f5f0e8] font-medium pl-2">
                                            {setIdx + 1}
                                        </div>
                                        
                                        <div className="flex justify-center">
                                            <input 
                                                type="number"
                                                value={set.reps}
                                                disabled={set.completed}
                                                onChange={(e) => updateSet(exIdx, setIdx, 'reps', e.target.value)}
                                                className={`w-[50px] sm:w-[60px] text-center bg-[#f5f0e8]/10 border border-[#f5f0e8]/30 rounded-[10px] py-1.5 focus:border-[#e05c2a] ${set.completed ? 'opacity-40' : ''}`}
                                            />
                                        </div>

                                        <div className="flex justify-center">
                                            <div className="relative">
                                                <input 
                                                    type="number"
                                                    value={set.weight}
                                                    disabled={set.completed}
                                                    onChange={(e) => updateSet(exIdx, setIdx, 'weight', e.target.value)}
                                                    className={`w-[70px] sm:w-[80px] text-center bg-[#f5f0e8]/10 border border-[#f5f0e8]/30 rounded-[10px] py-1.5 focus:border-[#e05c2a] ${set.completed ? 'opacity-40' : ''}`}
                                                />
                                                <span className="absolute right-1 top-1.5 text-[10px] opacity-30">kg</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-end pr-2">
                                            <button 
                                                onClick={() => toggleSet(exIdx, setIdx)}
                                                className={`w-10 h-10 flex items-center justify-center transition-all ${set.completed ? 'text-[#e05c2a] scale-110' : 'text-[#f5f0e8]/20 hover:text-[#e05c2a]/60'}`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button 
                                onClick={() => addSet(exIdx)}
                                className="w-full mt-8 border border-[#e05c2a] rounded-[10px] py-[14px] flex items-center justify-center gap-2 text-[#f5f0e8] font-semibold hover:bg-[#e05c2a]/10 transition-colors"
                            >
                                <span className="text-xl">+</span> Añadir serie
                            </button>
                        </div>
                    ))}
                </div>

                {workoutExercises.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-white/20 border-2 border-dashed border-white/5 rounded-3xl">
                        <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p className="text-xl font-medium">Comienza seleccionando un ejercicio</p>
                    </div>
                )}
            </div>
        </div>
    );
}