import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Componente para proteger las rutas privadas
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

// Componente para evitar que usuarios logueados vean el login
const PublicRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (token) {
        return <Navigate to="/dashboard" replace />;
    }
    return children;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                {/* Redirección por defecto */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;