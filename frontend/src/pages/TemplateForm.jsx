import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ExerciseSelector from '../components/ExerciseSelector';
import ExerciseDetailModal from '../components/ExerciseDetailModal';
import { getExercises } from '../utils/exerciseCache';

export default function TemplateForm() {
    const navigate = useNavigate();
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [exercises, setExercises] = useState([]); // All exercises
    const [templateExercises, setTemplateExercises] = useState([]); // Selected for template
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [publico, setPublico] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedExerciseForDetail, setSelectedExerciseForDetail] = useState(null);

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        const fetchExercisesData = async () => {
            try {
                const data = await getExercises(token);
                setExercises(data);
            } catch {
                setError('No se pudieron cargar los ejercicios.');
            }
        };
        if (token) fetchExercisesData();
    }, [token]);

    const handleAddExercise = (exercise) => {
        setTemplateExercises(prev => [...prev, {
            exerciseId: exercise.id,
            nombre: exercise.nombre,
            sets: [{ reps: 10, weight: 0 }]
        }]);
    };

    const handleShowDetail = (ex) => {
        const fullEx = exercises.find(e => e.id === ex.exerciseId) || ex;
        setSelectedExerciseForDetail(fullEx);
        setIsDetailModalOpen(true);
    };

    const addSet = (exIdx) => {
        const updated = [...templateExercises];
        const lastSet = updated[exIdx].sets[updated[exIdx].sets.length - 1];
        updated[exIdx].sets.push({
            reps: lastSet ? lastSet.reps : 10,
            weight: lastSet ? lastSet.weight : 0
        });
        setTemplateExercises(updated);
    };

    const updateSet = (exIdx, setIdx, field, value) => {
        const updated = [...templateExercises];
        updated[exIdx].sets[setIdx][field] = Number(value);
        setTemplateExercises(updated);
    };

    const removeExercise = (exIdx) => {
        setTemplateExercises(prev => prev.filter((_, i) => i !== exIdx));
    };

    const handleSubmit = async () => {
        if (!nombre) {
            setError('El nombre de la plantilla es obligatorio.');
            return;
        }
        if (templateExercises.length === 0) {
            setError('Añade al menos un ejercicio.');
            return;
        }

        setIsLoading(true);
        try {
            await api.post('workouts/templates', {
                nombre,
                descripcion,
                rutina: templateExercises,
                publico
            });
            navigate(user.role === 'TRAINER' ? '/trainer-dashboard' : '/dashboard');
        } catch {
            setError('Error al guardar la plantilla.');
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="min-h-screen bg-[#0a0a0e] text-white p-6 font-['Figtree'] pb-24">
            <div className="max-w-md mx-auto">
                <h1 className="font-['Syne'] font-extrabold text-[32px] mb-8">Nueva Plantilla</h1>

                {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-xl mb-6">{error}</div>}

                <div className="space-y-6 mb-10">
                    <div>
                        <label className="text-white/40 text-sm font-semibold uppercase tracking-wider block mb-2">Nombre de la Rutina</label>
                        <input 
                            type="text"
                            placeholder="Ej: Empuje A - Hipertrofia"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            className="w-full bg-[#14141e] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[#e05c2a]"
                        />
                    </div>

                    <div>
                        <label className="text-white/40 text-sm font-semibold uppercase tracking-wider block mb-2">Descripción (Opcional)</label>
                        <textarea 
                            placeholder="Notas sobre la rutina..."
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            className="w-full bg-[#14141e] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[#e05c2a] h-24"
                        />
                    </div>

                    {user.role === 'TRAINER' && (
                        <div className="flex items-center justify-between bg-[#14141e] p-4 rounded-xl border border-white/10">
                            <span className="font-semibold">Hacer pública para alumnos</span>
                            <button 
                                onClick={() => setPublico(!publico)}
                                className={`w-12 h-6 rounded-full transition-colors relative ${publico ? 'bg-[#e05c2a]' : 'bg-white/10'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${publico ? 'right-1' : 'left-1'}`} />
                            </button>
                        </div>
                    )}
                </div>

                <div className="space-y-6 mb-12">
                    <h3 className="font-['Syne'] font-bold text-xl">Ejercicios</h3>
                    
                    {templateExercises.map((ex, exIdx) => (
                        <div key={exIdx} className="bg-[#14141e] border border-white/5 rounded-2xl p-5 relative overflow-hidden">
                            <button 
                                onClick={() => removeExercise(exIdx)}
                                className="absolute top-4 right-4 text-white/20 hover:text-red-500 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            
                            <button 
                                onClick={() => handleShowDetail(ex)}
                                className="font-bold text-lg mb-6 pr-8 hover:text-[#e05c2a] transition-colors"
                            >
                                {ex.nombre}
                            </button>

                            <div className="grid grid-cols-3 gap-4 mb-2 text-xs font-bold uppercase text-white/30 px-2">
                                <div>Serie</div>
                                <div className="text-center">Reps</div>
                                <div className="text-center">Peso Sug.</div>
                            </div>

                            <div className="space-y-3">
                                {ex.sets.map((s, sIdx) => (
                                    <div key={sIdx} className="grid grid-cols-3 gap-4 items-center">
                                        <div className="font-['DM_Mono'] text-lg text-white/60 pl-2">{sIdx + 1}</div>
                                        <input 
                                            type="number"
                                            value={s.reps}
                                            onChange={(e) => updateSet(exIdx, sIdx, 'reps', e.target.value)}
                                            className="bg-black/40 border border-white/10 rounded-lg py-2 text-center font-['DM_Mono'] focus:border-[#e05c2a] outline-none"
                                        />
                                        <div className="relative">
                                            <input 
                                                type="number"
                                                value={s.weight}
                                                onChange={(e) => updateSet(exIdx, sIdx, 'weight', e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg py-2 text-center font-['DM_Mono'] focus:border-[#e05c2a] outline-none"
                                            />
                                            <span className="absolute right-2 top-2 text-[10px] text-white/20">kg</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button 
                                onClick={() => addSet(exIdx)}
                                className="w-full mt-6 py-3 rounded-xl border border-dashed border-white/10 text-white/40 text-sm font-semibold hover:border-white/20 hover:text-white/60 transition-all"
                            >
                                + Añadir Serie
                            </button>
                        </div>
                    ))}

                    <button 
                        onClick={() => setIsSelectorOpen(true)}
                        className="w-full py-5 rounded-2xl border-2 border-dashed border-white/5 text-white/30 font-bold flex flex-col items-center justify-center gap-2 hover:border-[#e05c2a]/20 hover:text-[#e05c2a]/40 transition-all"
                    >
                        <span className="text-2xl">+</span>
                        <span>Añadir Ejercicio</span>
                    </button>
                </div>

                <button 
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full bg-[#e05c2a] text-[#f5f0e8] font-['Syne'] font-extrabold text-xl py-5 rounded-2xl shadow-xl shadow-[#e05c2a]/20 active:scale-95 transition-all disabled:opacity-50"
                >
                    {isLoading ? 'Guardando...' : 'Guardar Plantilla'}
                </button>
            </div>

            <ExerciseSelector 
                isOpen={isSelectorOpen}
                onClose={() => setIsSelectorOpen(false)}
                onSelect={handleAddExercise}
                exercises={exercises}
            />

            <ExerciseDetailModal 
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                exercise={selectedExerciseForDetail}
            />
        </div>
    );
}
