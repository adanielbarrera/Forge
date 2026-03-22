import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [keepSession, setKeepSession] = useState(false); // Estado para la casilla de verificación
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:3000/api/auth/login', {
                email,
                password
            });

            const { token, user } = response.data;

            // Guardar en localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            // Redirigir al Dashboard
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // Fondo de pantalla completa centrado
        <div className="min-h-screen flex items-center justify-center bg-black p-4">
            {/* Contenedor principal para limitar el ancho y centrar */}
            <div className="w-full max-w-md flex flex-col items-center">

                {/* Encabezado: Logo y Subtítulo */}
                <header className="mb-12 flex flex-col items-center">
                    <div className="text-5xl font-bold text-white flex items-baseline">
                        Forge
                        <span className="w-2.5 h-2.5 bg-orange-600 rounded-full ml-1"></span> {/* Punto naranja */}
                    </div>
                    <p className="text-xs font-medium text-neutral-400 tracking-wider mt-2">
                        TRAINING MANAGEMENT
                    </p>
                </header>

                {/* Mensaje de error (si existe), estilizado según el dark mode */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 px-6 py-4 rounded-xl mb-6 text-sm w-full text-center">
                        {error}
                    </div>
                )}

                {/* Panel del formulario oscuro con bordes redondeados */}
                <form onSubmit={handleLogin} className="bg-neutral-900 rounded-3xl p-8 w-full border border-neutral-800 space-y-6">

                    {/* Campo de Email */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-transparent border border-neutral-700 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                            placeholder="example@someone.com"
                            required
                        />
                    </div>

                    {/* Campo de Contraseña */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-transparent border border-neutral-700 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                            placeholder="**************" // Placeholder exacto de la imagen
                            required
                        />
                    </div>

                    {/* Casilla de verificación: Mantener sesión */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="keepSession"
                            checked={keepSession}
                            onChange={(e) => setKeepSession(e.target.checked)}
                            className="h-5 w-5 rounded border-neutral-700 text-orange-600 focus:ring-orange-500 bg-black"
                        />
                        <label htmlFor="keepSession" className="ml-3 text-sm text-neutral-300">
                            Mantener sesión iniciada
                        </label>
                    </div>
                </form>

                {/* Botón de acción naranja, fuera del panel oscuro */}
                <button
                    onClick={handleLogin} // También activamos el login aquí por accesibilidad
                    type="submit"
                    form="loginForm" // Asocia el botón al formulario
                    disabled={isLoading}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl px-4 py-4 mt-8 transition disabled:opacity-50"
                >
                    {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesion'}
                </button>

                {/* Enlace inferior centrado */}
                <div className="mt-8 flex justify-center">
                    <a href="#" className="text-sm text-neutral-400 hover:text-white transition">
                        ¿Olvidaste tu contraseña?
                    </a>
                </div>
            </div>
        </div>
    );
}