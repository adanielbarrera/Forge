import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // Estado para visibilidad de contraseña
    const [keepSession, setKeepSession] = useState(false); // Estado para la casilla de verificación
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:3000/auth/login', {
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
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-transparent border border-neutral-700 rounded-xl px-4 py-3 pr-12 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                                placeholder="**************"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 px-4 flex items-center text-neutral-400 hover:text-neutral-200 transition"
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    // Icono de ojo tachado (ocultar)
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228l3.95 3.95m0 0a3.002 3.002 0 004.243 4.243m-4.243-4.243 4.242-4.242" />
                                    </svg>
                                ) : (
                                    // Icono de ojo (mostrar)
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                            </button>
                        </div>
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