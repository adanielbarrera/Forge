import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const navigate = useNavigate();

    // Recuperar los datos del usuario del localStorage de forma segura
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-zinc-900 pb-20"> {/* pb-20 para dar espacio al navbar inferior */}
            {/* Header Superior */}
            <header className="bg-zinc-800 p-4 shadow-sm flex justify-between items-center">
                <h1 className="text-xl font-bold text-white">Forge</h1>
                <button
                    onClick={handleLogout}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors font-medium"
                >
                    Cerrar Sesión
                </button>
            </header>

            {/* Contenido Principal */}
            <main className="p-6">
                <h2 className="text-2xl font-semibold text-white mb-2">
                    Hola, {user?.email || 'Usuario'}
                </h2>
                <p className="text-zinc-400 mb-8">
                    Rol actual: <span className="text-blue-400 font-medium">{user?.role}</span>
                </p>

                <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
                    <p className="text-zinc-300">
                        Tu panel de entrenamiento está listo. Aquí se mostrará el feedback de la IA próximamente.
                    </p>
                </div>
            </main>

            {/* Navbar Mobile Inferior */}
            <nav className="fixed bottom-0 w-full bg-zinc-800 border-t border-zinc-700 pb-safe">
                <div className="flex justify-around items-center p-4">
                    <button className="flex flex-col items-center text-blue-500">
                        <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                        <span className="text-xs font-medium">Inicio</span>
                    </button>
                    <button className="flex flex-col items-center text-zinc-400 hover:text-zinc-200 transition-colors">
                        <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        <span className="text-xs font-medium">Rutinas</span>
                    </button>
                    <button className="flex flex-col items-center text-zinc-400 hover:text-zinc-200 transition-colors">
                        <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        <span className="text-xs font-medium">Perfil</span>
                    </button>
                </div>
            </nav>
        </div>
    );
}