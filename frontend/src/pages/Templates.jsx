import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';

export default function Templates() {
    const [templates, setTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const fetchTemplates = async () => {
        try {
            const res = await api.get('workouts/templates');
            setTemplates(res.data);
        } catch (err) {
            console.error("Error al cargar plantillas:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchTemplates();
    }, [token]);

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta plantilla?')) return;
        try {
            await api.delete(`workouts/templates/${id}`);
            setTemplates(templates.filter(t => t.id !== id));
        } catch (err) {
            console.error(err);
            alert('Error al eliminar la plantilla');
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0e] text-white font-['Figtree'] pb-32">
            <div className="p-6 flex justify-between items-center max-w-4xl mx-auto">
                <h1 className="font-['Syne'] font-extrabold text-3xl">Mis Plantillas</h1>
                <button 
                    onClick={() => navigate('/template/new')}
                    className="bg-[#e05c2a] text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-[#e05c2a]/20 active:scale-95 transition-all"
                >
                    + Crear Nueva
                </button>
            </div>

            <div className="px-6 max-w-4xl mx-auto space-y-4">
                {isLoading ? (
                    <p className="text-center opacity-40 py-20">Cargando rutinas...</p>
                ) : templates.length === 0 ? (
                    <div className="text-center py-20 bg-[#14141e] rounded-3xl border border-dashed border-white/5">
                        <p className="text-white/30 mb-6">No tienes plantillas guardadas</p>
                        <button 
                            onClick={() => navigate('/template/new')}
                            className="text-[#e05c2a] font-bold"
                        >
                            Comienza a crear tu primera rutina
                        </button>
                    </div>
                ) : (
                    templates.map(t => (
                        <div key={t.id} className="bg-[#14141e] p-6 rounded-2xl border border-white/5 flex justify-between items-center group hover:border-[#e05c2a]/30 transition-all">
                            <div>
                                <h3 className="text-xl font-bold text-[#f5f0e8] mb-1">{t.nombre}</h3>
                                <p className="text-white/40 text-sm mb-3">{t.descripcion || 'Sin descripción'}</p>
                                <div className="flex gap-2">
                                    <span className="bg-white/5 text-white/60 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                        {t.rutina.length} Ejercicios
                                    </span>
                                    {t.publico && (
                                        <span className="bg-[#6b7aff]/10 text-[#6b7aff] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                            Pública
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => navigate(`/workout?templateId=${t.id}`)}
                                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:bg-[#e05c2a]/20 hover:text-[#e05c2a] transition-all"
                                    title="Iniciar entrenamiento"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" className="w-5 h-5">
                                        <path d="M240,128a15.89,15.89,0,0,1-8.12,13.9l-144,80A15.86,15.86,0,0,1,80,224a16.1,16.1,0,0,1-8-2.11A15.85,15.85,0,0,1,64,208V48a15.85,15.85,0,0,1,8-13.89,15.86,15.86,0,0,1,16.12.11l144,80A15.89,15.89,0,0,1,240,128Z" />
                                    </svg>
                                </button>
                                <button 
                                    onClick={() => handleDelete(t.id)}
                                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 hover:bg-red-500/20 hover:text-red-500 transition-all"
                                    title="Eliminar plantilla"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" className="w-5 h-5">
                                        <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Navbar />
        </div>
    );
}
