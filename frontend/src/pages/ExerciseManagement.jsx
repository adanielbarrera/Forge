import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function ExerciseManagement() {
    const [exercises, setExercises] = useState([]);
    const [filteredExercises, setFilteredExercises] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [videoFilter, setVideoFilter] = useState('all'); // all, with, without
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

    useEffect(() => {
        fetchExercises();
    }, []);

    useEffect(() => {
        filterExercises();
    }, [searchTerm, videoFilter, exercises]);

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
                        className="mr-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
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
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="md:col-span-2 relative">
                        <input 
                            type="text" 
                            placeholder="Buscar por nombre o músculo..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#14141e] border border-white/5 rounded-2xl px-12 py-4 focus:border-[#e05c2a] outline-none transition-all"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 absolute left-4 top-4 text-white/20">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                    </div>
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
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                                                    </svg>
                                                </span>
                                            ) : (
                                                <span className="bg-red-500/10 text-red-500 p-1.5 rounded-full" title="Sin video">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 0 1-2.25-2.25V9m12.845 9.75m-12.845-9.75L3 7.5m12.845 11.25 2.155 2.155m-2.155-2.155v-4.14m0 4.14-2.155-2.155m2.155 2.155L14.46 9m4.72-4.72-4.72 4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                                                    </svg>
                                                </span>
                                            )}
                                            <button 
                                                onClick={() => handleDelete(ex.id, ex.nombre)}
                                                className="bg-white/5 text-white/20 hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded-full transition-all"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.34 12m-4.74 0-.34-12m11.33 9c.3-3.97-.13-7.906-.983-11.75M21 12a42.483 42.483 0 0 0-5.384-1.093m0 0c-1.057-7.13-2.731-14.133-4.991-21.013M16.5 11.666a4.5 4.5 0 0 1-9 0m3.75 0V11.25c0-1.242.448-2.5 1.5-2.5s1.5 1.258 1.5 2.5v.416m0 0c1.057 7.13 2.731 14.133 4.991 21.013" />
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
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
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
                                    <input 
                                        type="text" 
                                        value={editGroup}
                                        onChange={e => setEditGroup(e.target.value)}
                                        placeholder="Ej: Pecho"
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 focus:border-[#e05c2a] outline-none"
                                    />
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
