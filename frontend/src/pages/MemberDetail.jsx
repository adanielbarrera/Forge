import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import ExerciseDetailModal from '../components/ExerciseDetailModal';

export default function MemberDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [workouts, setWorkouts] = useState([]);
    const [member, setMember] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedExerciseForDetail, setSelectedExerciseForDetail] = useState(null);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchMemberData = async () => {
            try {
                // Aquí necesitaríamos un endpoint en el backend para obtener workouts por userId
                // Por ahora, si el backend no lo soporta, filtramos o mostramos un placeholder
                const res = await api.get('workouts', {
                    params: { userId: id } // El backend debería filtrar por esto si es TRAINER
                });
                setWorkouts(res.data);

                // Mock de datos del miembro si no tenemos el endpoint de perfil de otro usuario
                setMember({ nombre: 'Alumno', email: 'alumno@ejemplo.com' });
            } catch (err) {
                console.error("Error al cargar datos del miembro:", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (token) fetchMemberData();
    }, [token, id]);

    const handleShowDetail = (exercise) => {
        setSelectedExerciseForDetail(exercise);
        setIsDetailModalOpen(true);
    };

    const formatDate = (date) => new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });

    return (
        <div className="min-h-screen bg-[#0a0a0e] text-white font-['Figtree'] pb-32">
            <div className="p-6 max-w-4xl mx-auto">
                <button onClick={() => navigate(-1)} className="text-white/40 mb-6 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    Volver
                </button>

                <div className="bg-[#14141e] p-8 rounded-3xl border border-white/5 mb-8 shadow-xl">
                    <h1 className="font-['Syne'] font-extrabold text-3xl mb-2">{member?.nombre}</h1>
                    <p className="text-[#e05c2a] font-medium">{workouts.length} Entrenamientos realizados</p>
                </div>

                <h2 className="text-xl font-bold mb-6 px-2">Historial Reciente</h2>

                <div className="space-y-4">
                    {isLoading ? (
                        <p className="text-center opacity-30 py-10">Cargando historial...</p>
                    ) : workouts.length === 0 ? (
                        <p className="text-center opacity-30 py-10 bg-[#14141e] rounded-2xl border border-white/5 italic">
                            Este alumno aún no ha registrado entrenamientos.
                        </p>
                    ) : (
                        workouts.map(w => (
                            <div key={w.id} className="bg-[#14141e] p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg">{w.nombre || w.notas || 'Entrenamiento General'}</h3>
                                        <p className="text-white/30 text-sm font-['DM_Mono']">{formatDate(w.fecha)}</p>
                                    </div>
                                    <div className="bg-white/5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#c8a96e]">
                                        Completado
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                                    {w.exercises.map((ex, idx) => (
                                        <button 
                                            key={idx} 
                                            onClick={() => handleShowDetail(ex.exercise)}
                                            className="text-left group"
                                        >
                                            <p className="text-white/60 font-semibold truncate group-hover:text-[#e05c2a] transition-colors">{ex.exercise.nombre}</p>
                                            <p className="text-white/30 text-[10px]">{ex.series} series • {ex.peso}kg</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
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
