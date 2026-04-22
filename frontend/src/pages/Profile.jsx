import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

import Navbar from '../components/Navbar';

export default function Profile() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [newWeight, setNewWeight] = useState('');
    const [newHeight, setNewHeight] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [isSubscribing, setIsSubscribing] = useState(false);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('auth/profile');
                setProfile(response.data);
                setNewWeight(response.data.peso || '');
                setNewHeight(response.data.altura || '');
            } catch (err) {
                setError('No se pudo cargar el perfil.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        if (token) fetchProfile();
    }, [token]);

    const handleSubscribe = async (planId) => {
        setIsSubscribing(true);
        try {
            const response = await api.post('memberships/checkout-session', { planId });
            if (response.data.url) {
                window.location.href = response.data.url;
            }
        } catch (err) {
            setError('Error al iniciar el proceso de pago.');
            console.error(err);
        } finally {
            setIsSubscribing(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');

        try {
            const response = await api.patch('auth/profile', 
                { peso: newWeight, altura: newHeight }
            );
            setProfile(prev => ({ ...prev, ...response.data }));
            alert('¡Perfil actualizado con éxito!');
        } catch (err) {
            setError('Error al actualizar los datos.');
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (isLoading) return <div className="min-h-screen bg-[#0a0a0e] text-white flex items-center justify-center font-['Figtree']">Cargando...</div>;

    return (
        <div className="min-h-screen bg-[#0a0a0e] text-white font-['Figtree'] pb-24 selection:bg-[#e05c2a]">
            
            {/* Header */}
            <div className="p-6 max-w-md mx-auto flex justify-between items-center">
                <h1 className="font-['Syne'] font-extrabold text-[32px] text-white">Mi Perfil</h1>
                <button 
                    onClick={handleLogout}
                    className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all"
                    title="Cerrar sesión"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                    </svg>
                </button>
            </div>

            <div className="max-w-md mx-auto px-4 mt-4">
                
                {/* User Info Card */}
                <div className="bg-[#14141e] rounded-[24px] p-6 mb-8 border border-white/5 shadow-xl">
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-24 h-24 rounded-full bg-[#e05c2a]/10 flex items-center justify-center text-[#e05c2a] mb-4 border-2 border-[#e05c2a]/20">
                            <span className="text-4xl font-extrabold font-['Syne']">
                                {profile?.email?.[0].toUpperCase()}
                            </span>
                        </div>
                        <h2 className="text-xl font-bold">{profile?.email}</h2>
                        <span className="text-neutral-500 text-sm">{profile?.role}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/40 p-4 rounded-2xl border border-white/5 text-center">
                            <p className="text-neutral-500 text-xs uppercase font-semibold mb-1">Peso Actual</p>
                            <p className="text-2xl font-['DM_Mono'] text-white">
                                {profile?.peso || '--'} <span className="text-sm opacity-40">kg</span>
                            </p>
                        </div>
                        <div className="bg-black/40 p-4 rounded-2xl border border-white/5 text-center">
                            <p className="text-neutral-500 text-xs uppercase font-semibold mb-1">Altura</p>
                            <p className="text-2xl font-['DM_Mono'] text-white">
                                {profile?.altura || '--'} <span className="text-sm opacity-40">cm</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Membership Section */}
                <div className="bg-[#14141e] rounded-[24px] p-6 mb-8 border border-white/5 shadow-xl">
                    <h3 className="text-lg font-bold mb-4 font-['Syne'] text-[#6b7aff]">Membresía</h3>
                    
                    {profile?.membership && profile.membership.estado === 'ACTIVO' ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-green-500/10 p-4 rounded-2xl border border-green-500/20">
                                <div>
                                    <p className="text-green-500 font-bold text-sm uppercase tracking-wider">Estado: ACTIVO</p>
                                    <p className="text-neutral-400 text-xs mt-1">Vence el {new Date(profile.membership.fechaFin).toLocaleDateString()}</p>
                                </div>
                                <div className="text-green-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-neutral-400 text-sm mb-4">No tienes una membresía activa. Suscríbete para empezar a entrenar.</p>
                            
                            <button 
                                onClick={() => handleSubscribe('mensual')}
                                disabled={isSubscribing}
                                className="w-full flex justify-between items-center bg-[#6b7aff]/10 p-5 rounded-2xl border border-[#6b7aff]/30 hover:bg-[#6b7aff]/20 transition-all group"
                            >
                                <div className="text-left">
                                    <p className="font-bold text-[#6b7aff] text-lg">Plan Mensual Forge</p>
                                    <p className="text-xs text-neutral-400">Acceso total al gimnasio y seguimiento IA</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-['DM_Mono'] font-bold text-[#6b7aff] text-xl">$599</p>
                                    <p className="text-[10px] text-[#6b7aff]/60 uppercase font-bold">MXN / MES</p>
                                </div>
                            </button>
                        </div>
                    )}
                </div>

                {error && <div className="text-red-500 text-sm mb-4 text-center">{error}</div>}

                {/* Edit Form */}
                <form onSubmit={handleUpdate} className="space-y-6">
                    <div className="bg-[#14141e] rounded-[24px] p-6 border border-white/5">
                        <h3 className="text-lg font-bold mb-6 font-['Syne'] text-[#e05c2a]">Actualizar Medidas</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-neutral-500 text-xs font-semibold uppercase mb-2 ml-1">Nuevo Peso (kg)</label>
                                <input 
                                    type="number"
                                    step="0.1"
                                    value={newWeight}
                                    onChange={(e) => setNewWeight(e.target.value)}
                                    placeholder="85.5"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#e05c2a] transition-all"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-neutral-500 text-xs font-semibold uppercase mb-2 ml-1">Altura (cm)</label>
                                <input 
                                    type="number"
                                    value={newHeight}
                                    onChange={(e) => setNewHeight(e.target.value)}
                                    placeholder="180"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#e05c2a] transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={isSaving}
                        className="w-full bg-[#e05c2a] hover:bg-[#c84d20] disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#e05c2a]/10 transition-all active:scale-95"
                    >
                        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </form>
            </div>

            <Navbar />
        </div>
    );
}