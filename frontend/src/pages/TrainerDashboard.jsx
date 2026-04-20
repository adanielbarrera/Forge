import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function TrainerDashboard() {
    const [memberships, setMemberships] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showRegister, setShowRegister] = useState(false);
    const navigate = useNavigate();

    // Register form state
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPass, setRegPass] = useState('');
    const [regMonths, setRegMonths] = useState(1);
    const [isRegistering, setIsRegistering] = useState(false);

    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    const userName = user?.nombre || user?.email?.split('@')[0] || 'Entrenador';
    const token = localStorage.getItem('token');

    const fetchMemberships = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/memberships', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMemberships(response.data);
        } catch (err) {
            setError('No se pudieron cargar los alumnos.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchMemberships();
    }, [token]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsRegistering(true);
        setError('');
        try {
            // 1. Register User
            const regRes = await axios.post('http://localhost:3000/auth/register', {
                email: regEmail,
                password: regPass,
                nombre: regName,
                role: 'MEMBER'
            });

            const newUserId = regRes.data.id;

            // 2. Create Membership
            const now = new Date();
            const fechaFin = new Date(now.setMonth(now.getMonth() + parseInt(regMonths)));

            await axios.post('http://localhost:3000/api/memberships', {
                userId: newUserId,
                fechaFin: fechaFin.toISOString(),
                estado: 'ACTIVO'
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            alert('Alumno registrado con éxito');
            setShowRegister(false);
            setRegName('');
            setRegEmail('');
            setRegPass('');
            fetchMemberships();
        } catch (err) {
            console.error("Registration error:", err);
            setError(err.response?.data?.error || 'Error al registrar alumno');
        } finally {
            setIsRegistering(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'ACTIVO': return 'text-green-500 bg-green-500/10';
            case 'VENCIDO': return 'text-red-500 bg-red-500/10';
            case 'PENDIENTE': return 'text-yellow-500 bg-yellow-500/10';
            case 'SIN MEMBRESÍA': return 'text-white/30 bg-white/5';
            default: return 'text-gray-500 bg-gray-500/10';
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0e] text-white font-['Figtree'] pb-24 selection:bg-[#e05c2a]">
            
            {/* Header */}
            <div className="flex justify-between items-center p-6 max-w-6xl mx-auto animate-[fadeIn_0.5s_ease-out]">
                <h1 className="font-['Syne'] font-extrabold text-[28px] sm:text-[32px] text-white truncate">
                    Panel de Control
                </h1>
                <div className="flex gap-4">
                    <button 
                        onClick={() => setShowRegister(!showRegister)}
                        className="bg-[#e05c2a] hover:bg-[#c84d20] text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Nuevo Alumno
                    </button>
                    <button 
                        onClick={() => navigate('/templates')}
                        className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                        </svg>
                        Plantillas
                    </button>
                    <button 
                        onClick={handleLogout}
                        className="w-10 h-10 rounded-full bg-[#14141e] flex items-center justify-center text-[#f5f0e8] hover:bg-red-500/20 hover:text-red-500 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 mt-4 animate-[slideUp_0.5s_ease-out_forwards] opacity-0" style={{ animationDelay: '0.1s' }}>
                <div className="mb-8">
                    <h2 className="text-xl font-semibold opacity-70">Hola, {userName}</h2>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-xl mb-6">
                        {error}
                    </div>
                )}

                {/* Registration Form Overlay */}
                {showRegister && (
                    <div className="bg-[#14141e] p-6 rounded-[20px] border border-[#e05c2a]/30 mb-8 shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold font-['Syne'] text-[#e05c2a]">Registrar Alumno</h3>
                            <button onClick={() => setShowRegister(false)} className="text-white/40 hover:text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs uppercase font-bold text-neutral-500 mb-1 ml-1">Nombre Completo</label>
                                    <input required type="text" value={regName} onChange={e => setRegName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-[#e05c2a] outline-none" placeholder="Juan Pérez" />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase font-bold text-neutral-500 mb-1 ml-1">Email</label>
                                    <input required type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-[#e05c2a] outline-none" placeholder="juan@ejemplo.com" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs uppercase font-bold text-neutral-500 mb-1 ml-1">Contraseña Temporal</label>
                                    <input required type="password" value={regPass} onChange={e => setRegPass(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-[#e05c2a] outline-none" placeholder="••••••••" />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase font-bold text-neutral-500 mb-1 ml-1">Meses de Membresía</label>
                                    <select value={regMonths} onChange={e => setRegMonths(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-[#e05c2a] outline-none">
                                        <option value="1">1 Mes</option>
                                        <option value="3">3 Meses</option>
                                        <option value="6">6 Meses</option>
                                        <option value="12">1 Año</option>
                                    </select>
                                </div>
                            </div>
                            <div className="md:col-span-2 flex justify-end mt-4">
                                <button disabled={isRegistering} type="submit" className="bg-[#e05c2a] hover:bg-[#c84d20] disabled:opacity-50 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-[#e05c2a]/20 transition-all">
                                    {isRegistering ? 'Registrando...' : 'Confirmar Registro'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Students Table */}
                <div className="bg-[#14141e] rounded-[20px] border border-white/5 overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5 text-neutral-400 text-sm uppercase tracking-wider">
                                    <th className="px-6 py-4 font-medium">Alumno</th>
                                    <th className="px-6 py-4 font-medium">Estado</th>
                                    <th className="px-6 py-4 font-medium">Vence el</th>
                                    <th className="px-6 py-4 font-medium text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-10 text-center opacity-30">Cargando alumnos...</td>
                                    </tr>
                                ) : memberships.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-10 text-center opacity-30">No hay alumnos registrados.</td>
                                    </tr>
                                ) : (
                                    memberships.map((m) => (
                                        <tr key={m.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-white">{m.user.nombre || m.user.email.split('@')[0]}</span>
                                                    <span className="text-xs text-neutral-500">{m.user.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(m.estado)}`}>
                                                    {m.estado}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-neutral-300 text-sm font-['DM_Mono']">
                                                {new Date(m.fechaFin).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    className="text-[#e05c2a] opacity-0 group-hover:opacity-100 transition-opacity hover:underline text-sm font-semibold"
                                                    onClick={() => navigate(`/member/${m.userId}`)}
                                                >
                                                    Gestionar
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Bottom Navigation Navbar */}
            <div className="fixed bottom-0 w-full bg-[#14141e] rounded-t-[20px] h-[80px] flex justify-around items-center px-6 border-t border-white/5 z-50">
                <button className="flex flex-col items-center justify-center w-12 h-12 text-[#e05c2a]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                        <path d="M15 13a3 3 0 1 0-6 0"/>
                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/>
                        <circle cx="12" cy="8" r="2"/>
                    </svg>
                    <span className="text-[10px] mt-1 font-medium text-[#e05c2a]">Alumnos</span>
                </button>
                <button 
                    onClick={() => navigate('/templates')}
                    className="flex flex-col items-center justify-center w-12 h-12 text-[#f5f0e8] opacity-40 hover:opacity-100 transition-opacity"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span className="text-[10px] mt-1 font-medium">Rutinas</span>
                </button>
                <button className="flex flex-col items-center justify-center w-12 h-12 text-[#f5f0e8] opacity-40 hover:opacity-100 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                    <span className="text-[10px] mt-1 font-medium">Perfil</span>
                </button>
            </div>
        </div>
    );
}