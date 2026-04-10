import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * WorkoutForm Component
 * Senior Frontend Task - Sprint 2 GymFit Pro
 * Implements Exercise selection, Sets management, and API submission.
 */
export default function WorkoutForm() {
    const navigate = useNavigate();
    const [exercises, setExercises] = useState([]); // All exercises from API
    const [workoutExercises, setWorkoutExercises] = useState([]); // Selected exercises for this workout
    const [selectedExerciseId, setSelectedExerciseId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const token = localStorage.getItem('token');
    const API_BASE = 'http://localhost:3000/api';

    // Fetch exercises on mount
    useEffect(() => {
        const fetchExercisesList = async () => {
            try {
                const response = await fetch(`${API_BASE}/exercises`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Error ${response.status}: No se pudieron cargar los ejercicios`);
                }

                const data = await response.json();
                const exercisesList = Array.isArray(data) ? data : (data.exercises || []);
                setExercises(exercisesList);
            } catch (err) {
                console.error('Fetch error:', err);
                setError(err.message || 'Error de conexión con el servidor.');
            }
        };

        if (token) {
            fetchExercisesList();
        } else {
            setError('Sesión no válida. Por favor, inicia sesión de nuevo.');
        }
    }, [token]);

    const handleAddExercise = () => {
        if (!selectedExerciseId) return;
        
        const exercise = exercises.find(ex => 
            String(ex.id) === String(selectedExerciseId) || 
            String(ex._id) === String(selectedExerciseId)
        );
        
        if (!exercise) return;

        const newWorkoutExercise = {
            ...exercise,
            id: exercise.id || exercise._id,
            nombre: exercise.nombre,
            sets: [{ id: Date.now(), reps: 15, weight: 50, completed: false }]
        };

        setWorkoutExercises(prev => [...prev, newWorkoutExercise]);
        setSelectedExerciseId('');
    };

    const addSet = (exerciseIndex) => {
        const updated = [...workoutExercises];
        updated[exerciseIndex].sets.push({
            id: Date.now(),
            reps: '',
            weight: '',
            completed: false
        });
        setWorkoutExercises(updated);
    };

    const toggleSet = (exerciseIndex, setIndex) => {
        const updated = [...workoutExercises];
        updated[exerciseIndex].sets[setIndex].completed = !updated[exerciseIndex].sets[setIndex].completed;
        setWorkoutExercises(updated);
    };

    const updateSet = (exerciseIndex, setIndex, field, value) => {
        const updated = [...workoutExercises];
        updated[exerciseIndex].sets[setIndex][field] = value;
        setWorkoutExercises(updated);
    };

    const handleFinishWorkout = async () => {
        if (workoutExercises.length === 0) {
            setError('Agrega al menos un ejercicio.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Mapeamos los ejercicios y sus series al formato que espera el backend/Prisma
            const exercisesData = [];
            
            workoutExercises.forEach(ex => {
                ex.sets.forEach((s, index) => {
                    exercisesData.push({
                        exerciseId: Number(ex.id),
                        series: index + 1, // Campo obligatorio según el error de Prisma
                        reps: Number(s.reps),
                        peso: Number(s.weight) // Traducido a 'peso' como pide el backend
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

            alert('¡Entrenamiento finalizado con éxito!');
            setWorkoutExercises([]);
            navigate('/dashboard');
        } catch (err) {
            console.error('Submit error:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

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
                            <p className="text-2xl font-bold font-mono">00:00</p>
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

                {/* Exercise Selector */}
                <div className="bg-[#14141e] border border-white/5 p-6 rounded-[16px] mb-8 flex flex-col sm:flex-row gap-4">
                    <select 
                        value={selectedExerciseId}
                        onChange={(e) => setSelectedExerciseId(e.target.value)}
                        className="flex-1 bg-black/40 border border-[#f5f0e8]/20 rounded-[10px] px-4 py-3 focus:outline-none focus:border-[#e05c2a]"
                    >
                        <option value="">Selecciona un ejercicio...</option>
                        {exercises.map(ex => (
                            <option key={ex.id || ex._id} value={ex.id || ex._id}>{ex.nombre}</option>
                        ))}
                    </select>
                    <button 
                        onClick={handleAddExercise}
                        className="bg-transparent border border-[#e05c2a] text-[#e05c2a] font-semibold px-6 py-3 rounded-[10px] hover:bg-[#e05c2a] hover:text-white transition-all"
                    >
                        Añadir Ejercicio
                    </button>
                </div>

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