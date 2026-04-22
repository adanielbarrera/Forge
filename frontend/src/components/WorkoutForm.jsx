import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import ExerciseSelector from './ExerciseSelector';
import ExerciseDetailModal from './ExerciseDetailModal';
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
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedExerciseForDetail, setSelectedExerciseForDetail] = useState(null);
    const [generatedFeedback, setGeneratedFeedback] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [workoutTitle, setWorkoutTitle] = useState('');

    const token = localStorage.getItem('token');

    const getDefaultTitle = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Entrenamiento de la mañana';
        if (hour < 19) return 'Entrenamiento de la tarde';
        return 'Entrenamiento de la noche';
    };

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
                    const tempResponse = await api.get(`workouts/templates/${templateId}`);
                    
                    const templateData = tempResponse.data;
                    // rutina is JSON: Array of { exerciseId, nombre, sets: [{ reps, weight }] }
                    const initialWorkoutExercises = templateData.rutina.map(item => {
                        // Buscar el ejercicio completo en la lista de ejercicios para tener videoUrl, etc.
                        const fullExercise = exercisesList.find(ex => ex.id === item.exerciseId) || {};
                        return {
                            ...fullExercise,
                            id: item.exerciseId,
                            nombre: item.nombre,
                            sets: item.sets.map((s, idx) => ({
                                id: Date.now() + idx + Math.random(),
                                reps: s.reps,
                                weight: s.weight,
                                completed: false
                            }))
                        };
                    });
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
            const res = await api.get(`workouts/exercises/last-values/${exercise.id}`);
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

    const handleShowDetail = (exercise) => {
        // Asegurarnos de que tenemos el objeto completo del catálogo
        const fullEx = exercises.find(ex => ex.id === exercise.id) || exercise;
        setSelectedExerciseForDetail(fullEx);
        setIsDetailModalOpen(true);
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

    const handleGenerateFeedback = async () => {
        setIsAnalyzing(true);
        try {
            const exercisesForIA = workoutExercises.flatMap(ex => 
                ex.sets.map(s => ({
                    nombre: ex.nombre,
                    reps: Number(s.reps),
                    peso: Number(s.weight)
                }))
            );

            const res = await api.post('workouts/feedback-preview', {
                exercises: exercisesForIA,
                notas: `Entrenamiento de ${formatTime(timer)}`
            });
            setGeneratedFeedback(res.data.feedback);
        } catch (err) {
            console.error("Error generating feedback:", err);
            setError("No se pudo generar el análisis en este momento.");
        } finally {
            setIsAnalyzing(false);
        }
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

            await api.post('workouts', {
                nombre: workoutTitle.trim() || getDefaultTitle(),
                exercises: exercisesData,
                feedback: generatedFeedback || null,
                duracion: timer,
                volumen: calculateVolume(),
                notas: `Entrenamiento de ${formatTime(timer)}`
            });

            setWorkoutExercises([]);
            navigate('/dashboard');
        } catch (err) {
            console.error('Submit error:', err);
            setError(err.response?.data?.message || err.message);
            setShowSummary(false);
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
                        <div className="mb-8">
                            <label className="block text-[11px] text-[#e05c2a] uppercase font-black tracking-widest mb-2 ml-1">
                                Nombre de la sesión
                            </label>
                            <input 
                                type="text"
                                placeholder={getDefaultTitle()}
                                value={workoutTitle}
                                onChange={(e) => setWorkoutTitle(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-xl font-bold focus:border-[#e05c2a] outline-none transition-all placeholder:text-white/20"
                            />
                        </div>

                        <h2 className="font-semibold text-[18px] mb-8 text-white/40 uppercase tracking-widest">Resumen</h2>
                        
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

                    {/* IA Analysis Section */}
                    <div className="mb-12 animate-[slideUp_0.5s_ease-out_forwards] delay-200">
                        {!generatedFeedback ? (
                            <button 
                                onClick={handleGenerateFeedback}
                                disabled={isAnalyzing}
                                className="w-full bg-[#6b7aff]/10 border border-[#6b7aff]/30 text-[#6b7aff] py-4 rounded-[16px] font-bold flex items-center justify-center gap-3 hover:bg-[#6b7aff]/20 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.5 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Analizando...
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 15L17.5 17.625l-.75-2.625a2.25 2.25 0 00-1.545-1.545L12.583 12.693l2.625-.75a2.25 2.25 0 001.545-1.545L17.5 7.771l.75 2.625a2.25 2.25 0 001.545 1.545l2.625.75-2.625.75a2.25 2.25 0 00-1.545 1.545z" />
                                        </svg>
                                        Generar Análisis IA Forge
                                    </>
                                )}
                            </button>
                        ) : (
                            <div className="bg-[#14141e] border-l-2 border-[#6b7aff] rounded-[16px] p-6 shadow-xl animate-[fadeIn_0.5s_ease-out]">
                                <p className="font-['DM_Mono'] text-[11px] text-[#6b7aff] mb-4 uppercase tracking-[0.2em] font-black">
                                    Análisis IA Forge
                                </p>
                                <div className="text-[15px] leading-relaxed text-[#f5f0e8]/90 whitespace-pre-line">
                                    {generatedFeedback}
                                </div>
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={submitWorkout}
                        disabled={isLoading}
                        className="w-full bg-[#e05c2a] hover:bg-[#c84d20] text-[#f5f0e8] font-['Syne'] font-black text-[22px] py-5 rounded-[16px] transition-all active:scale-95 disabled:opacity-50 animate-[slideUp_0.5s_ease-out_forwards] delay-300 shadow-xl shadow-[#e05c2a]/20"
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
                            <button 
                                onClick={() => handleShowDetail(exercise)}
                                className="text-[20px] font-medium mb-6 text-white truncate hover:text-[#e05c2a] transition-colors flex items-center gap-2 group/title"
                            >
                                {exercise.nombre}
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 opacity-0 group-hover/title:opacity-100 transition-opacity">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                                </svg>
                            </button>

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

            <ExerciseDetailModal 
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                exercise={selectedExerciseForDetail}
            />
        </div>
    );
}