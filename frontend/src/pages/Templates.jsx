import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

export default function Templates() {
    const [templates, setTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const API_BASE = 'http://localhost:3000/api';

    const fetchTemplates = async () => {
        try {
            const res = await axios.get(`${API_BASE}/workouts/templates`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
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
            // Asumiendo que implementaremos DELETE /templates/:id en el futuro
            // Por ahora solo filtramos localmente si el backend no lo tiene
            setTemplates(templates.filter(t => t.id !== id));
            alert('Plantilla eliminada (Simulado)');
        } catch (err) {
            alert('Error al eliminar');
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
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347c-.75.412-1.667-.13-1.667-.986V5.653Z" />
                                    </svg>
                                </button>
                                <button 
                                    onClick={() => handleDelete(t.id)}
                                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 hover:bg-red-500/20 hover:text-red-500 transition-all"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
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
