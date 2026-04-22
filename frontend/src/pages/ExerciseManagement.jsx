import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function ExerciseManagement() {
    const [exercises, setExercises] = useState([]);
    const [filteredExercises, setFilteredExercises] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [videoFilter, setVideoFilter] = useState('all'); // all, with, without
    const [muscleFilter, setMuscleFilter] = useState('all');
    const [editingExercise, setEditingExercise] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Form state for editing/creating
    const [editName, setEditName] = useState('');
    const [editCategory, setEditCategory] = useState('');
    const [editGroup, setEditGroup] = useState('');
    const [editVideoUrl, setEditVideoUrl] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editPrep, setEditPrep] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const MUSCLE_GROUPS = [
        'Pecho',
        'Espalda',
        'Piernas',
        'Hombros',
        'Brazos',
        'Core',
        'Glúteos',
        'Cardio',
        'Full Body'
    ];

    useEffect(() => {
        fetchExercises();
    }, []);

    useEffect(() => {
        filterExercises();
    }, [searchTerm, videoFilter, muscleFilter, exercises]);

    const fetchExercises = async () => {
        try {
            const response = await api.get('workouts/exercises');
            setExercises(response.data);
            setFilteredExercises(response.data);
        } catch (err) {
            setError('Error al cargar los ejercicios.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const filterExercises = () => {
        let result = exercises;

        if (searchTerm) {
            result = result.filter(ex => 
                ex.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ex.categoria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ex.grupoMuscular?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (videoFilter === 'with') {
            result = result.filter(ex => ex.videoUrl && ex.videoUrl.trim() !== '');
        } else if (videoFilter === 'without') {
            result = result.filter(ex => !ex.videoUrl || ex.videoUrl.trim() === '');
        }

        if (muscleFilter !== 'all') {
            result = result.filter(ex => ex.grupoMuscular === muscleFilter);
        }

        setFilteredExercises(result);
    };

    const handleCreateNew = () => {
        setEditingExercise({ id: 'new' });
        setEditName('');
        setEditCategory('Fuerza');
        setEditGroup('');
        setEditVideoUrl('');
        setEditDesc('');
        setEditPrep('');
    };

    const handleEdit = (ex) => {
        setEditingExercise(ex);
        setEditName(ex.nombre || '');
        setEditCategory(ex.categoria || 'Fuerza');
        setEditGroup(ex.grupoMuscular || '');
        setEditVideoUrl(ex.videoUrl || '');
        setEditDesc(ex.descripcion || '');
        setEditPrep(ex.preparacion || '');
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`¿Estás seguro de que quieres eliminar "${name}"? Esta acción no se puede deshacer.`)) return;
        
        try {
            await api.delete(`workouts/exercises/${id}`);
            setExercises(exercises.filter(ex => ex.id !== id));
        } catch (err) {
            console.error("Error deleting exercise:", err);
            alert('Error al eliminar el ejercicio');
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const data = {
                nombre: editName,
                categoria: editCategory,
                grupoMuscular: editGroup,
                videoUrl: editVideoUrl,
                descripcion: editDesc,
                preparacion: editPrep
            };

            if (editingExercise.id === 'new') {
                const res = await api.post('workouts/exercises', data);
                setExercises([...exercises, res.data]);
            } else {
                await api.patch(`workouts/exercises/${editingExercise.id}`, data);
                setExercises(exercises.map(ex => 
                    ex.id === editingExercise.id 
                    ? { ...ex, ...data } 
                    : ex
                ));
            }
            
            setEditingExercise(null);
        } catch (err) {
            console.error("Error saving exercise:", err);
            alert('Error al guardar cambios');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0e] text-white font-['Figtree'] pb-24 selection:bg-[#e05c2a]">
            {/* Header */}
            <div className="flex items-center justify-between p-6 max-w-6xl mx-auto animate-[fadeIn_0.5s_ease-out]">
                <div className="flex items-center">
                    <button 
                        onClick={() => navigate('/trainer-dashboard')}
                        className="mr-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white/60"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" className="w-6 h-6">
                            <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z" />
                        </svg>
                    </button>
                    <h1 className="font-['Syne'] font-extrabold text-[28px] sm:text-[32px] text-white truncate">
                        Catálogo de Ejercicios
                    </h1>
                </div>
                <button 
                    onClick={handleCreateNew}
                    className="bg-[#e05c2a] hover:bg-[#c84d20] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-[#e05c2a]/20 active:scale-95"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" className="w-5 h-5">
                        <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z" />
                    </svg>
                    <span className="hidden sm:inline">Nuevo Ejercicio</span>
                </button>
            </div>

            <div className="max-w-6xl mx-auto px-4 mt-4 animate-[slideUp_0.5s_ease-out_forwards] opacity-0" style={{ animationDelay: '0.1s' }}>
                
                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-xl mb-6">
                        {error}
                    </div>
                )}

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="md:col-span-2 relative">
                        <input 
                            type="text" 
                            placeholder="Buscar por nombre..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#14141e] border border-white/5 rounded-2xl px-12 py-4 focus:border-[#e05c2a] outline-none transition-all"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" className="w-6 h-6 absolute left-4 top-4 text-white/20">
                            <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
                        </svg>
                    </div>
                    <select 
                        value={muscleFilter}
                        onChange={(e) => setMuscleFilter(e.target.value)}
                        className="bg-[#14141e] border border-white/5 rounded-2xl px-4 py-4 focus:border-[#e05c2a] outline-none transition-all"
                    >
                        <option value="all">Todos los músculos</option>
                        {MUSCLE_GROUPS.map(group => (
                            <option key={group} value={group}>{group}</option>
                        ))}
                    </select>
                    <select 
                        value={videoFilter}
                        onChange={(e) => setVideoFilter(e.target.value)}
                        className="bg-[#14141e] border border-white/5 rounded-2xl px-4 py-4 focus:border-[#e05c2a] outline-none transition-all"
                    >
                        <option value="all">Todos los videos</option>
                        <option value="with">Con Video</option>
                        <option value="without">Sin Video</option>
                    </select>
                </div>

                {/* Exercises List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {isLoading ? (
                        <div className="col-span-full text-center py-20 opacity-30">Cargando catálogo...</div>
                    ) : filteredExercises.length === 0 ? (
                        <div className="col-span-full text-center py-20 opacity-30">No se encontraron ejercicios.</div>
                    ) : (
                        filteredExercises.map(ex => (
                            <div key={ex.id} className="bg-[#14141e] border border-white/5 p-5 rounded-[24px] hover:border-[#e05c2a]/30 transition-all group flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 bg-white/5 px-2 py-1 rounded">
                                            {ex.grupoMuscular || 'General'}
                                        </span>
                                        <div className="flex gap-2">
                                            {ex.videoUrl ? (
                                                <span className="bg-green-500/10 text-green-500 p-1.5 rounded-full">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                                        <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/>
                                                        <rect x="2" y="6" width="14" height="12" rx="2"/>
                                                    </svg>
                                                </span>
                                            ) : (
                                                <span className="bg-red-500/10 text-red-500 p-1.5 rounded-full" title="Sin video">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                                        <path d="M10.66 6H14a2 2 0 0 1 2 2v2.5l5.248-3.062A.5.5 0 0 1 22 7.87v8.196"/>
                                                        <path d="M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2"/>
                                                        <path d="m2 2 20 20"/>
                                                    </svg>
                                                </span>
                                            )}
                                            <button 
                                                onClick={() => handleDelete(ex.id, ex.nombre)}
                                                className="bg-white/5 text-white/20 hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded-full transition-all"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" className="w-4 h-4">
                                                    <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-lg mb-1">{ex.nombre}</h3>
                                    <p className="text-xs text-neutral-500 line-clamp-2 mb-4">
                                        {ex.descripcion || 'Sin descripción técnica.'}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => handleEdit(ex)}
                                    className="w-full py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-[#e05c2a] hover:border-[#e05c2a] transition-all text-xs font-bold uppercase tracking-wider"
                                >
                                    Editar Información
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Edit/Create Modal */}
            {editingExercise && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-[#14141e] border border-white/10 p-8 rounded-[32px] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in duration-200 no-scrollbar">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-['Syne'] font-bold text-2xl">
                                {editingExercise.id === 'new' ? 'Añadir Ejercicio' : `Editar ${editingExercise.nombre}`}
                            </h2>
                            <button onClick={() => setEditingExercise(null)} className="text-white/40 hover:text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" className="w-6 h-6">
                                    <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs uppercase font-bold text-neutral-500 mb-2 ml-1">Nombre del Ejercicio</label>
                                    <input 
                                        required
                                        type="text" 
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        placeholder="Ej: Press de Banca"
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 focus:border-[#e05c2a] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase font-bold text-neutral-500 mb-2 ml-1">Categoría</label>
                                    <select 
                                        value={editCategory}
                                        onChange={e => setEditCategory(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 focus:border-[#e05c2a] outline-none"
                                    >
                                        <option value="Fuerza">Fuerza</option>
                                        <option value="Cardio">Cardio</option>
                                        <option value="Flexibilidad">Flexibilidad</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase font-bold text-neutral-500 mb-2 ml-1">Grupo Muscular</label>
                                    <select 
                                        value={editGroup}
                                        onChange={e => setEditGroup(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 focus:border-[#e05c2a] outline-none"
                                    >
                                        <option value="">Selecciona un músculo</option>
                                        {MUSCLE_GROUPS.map(group => (
                                            <option key={group} value={group}>{group}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs uppercase font-bold text-neutral-500 mb-2 ml-1">URL del Video (YouTube / Vimeo)</label>
                                <input 
                                    type="text" 
                                    value={editVideoUrl}
                                    onChange={e => setEditVideoUrl(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 focus:border-[#e05c2a] outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase font-bold text-neutral-500 mb-2 ml-1">Descripción Técnica</label>
                                <textarea 
                                    rows="3"
                                    value={editDesc}
                                    onChange={e => setEditDesc(e.target.value)}
                                    placeholder="Explica qué es este ejercicio..."
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 focus:border-[#e05c2a] outline-none resize-none"
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-xs uppercase font-bold text-neutral-500 mb-2 ml-1">Instrucciones de Preparación</label>
                                <textarea 
                                    rows="4"
                                    value={editPrep}
                                    onChange={e => setEditPrep(e.target.value)}
                                    placeholder="Paso a paso para realizarlo correctamente..."
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 focus:border-[#e05c2a] outline-none resize-none"
                                ></textarea>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setEditingExercise(null)}
                                    className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 py-4 rounded-2xl bg-[#e05c2a] text-white font-bold hover:bg-[#c84d20] shadow-lg shadow-[#e05c2a]/20 transition-all disabled:opacity-50"
                                >
                                    {isSaving ? 'Guardando...' : editingExercise.id === 'new' ? 'Crear Ejercicio' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
