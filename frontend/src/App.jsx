import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TrainerDashboard from './pages/TrainerDashboard';
import Profile from './pages/Profile';
import History from './pages/History';
import WorkoutForm from './components/WorkoutForm';
import TemplateForm from './pages/TemplateForm';
import Templates from './pages/Templates';
import MemberDetail from './pages/MemberDetail';
import ExerciseManagement from './pages/ExerciseManagement';

// Componente para proteger las rutas privadas
const ProtectedRoute = ({ children, allowedRole, allowedRoles }) => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles) {
        if (!allowedRoles.includes(user?.role)) {
            return <Navigate to={user?.role === 'TRAINER' ? "/trainer-dashboard" : "/dashboard"} replace />;
        }
    } else if (allowedRole && user?.role !== allowedRole) {
        return <Navigate to={user?.role === 'TRAINER' ? "/trainer-dashboard" : "/dashboard"} replace />;
    }

    return children;
};

// Componente para evitar que usuarios logueados vean el login
const PublicRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    if (token) {
        return <Navigate to={user?.role === 'TRAINER' ? "/trainer-dashboard" : "/dashboard"} replace />;
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
                        <ProtectedRoute allowedRole="MEMBER">
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/trainer-dashboard"
                    element={
                        <ProtectedRoute allowedRole="TRAINER">
                            <TrainerDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/workout"
                    element={
                        <ProtectedRoute allowedRole="MEMBER">
                            <WorkoutForm />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/history"
                    element={
                        <ProtectedRoute allowedRole="MEMBER">
                            <History />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute allowedRole="MEMBER">
                            <Profile />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/template/new"
                    element={
                        <ProtectedRoute allowedRoles={['MEMBER', 'TRAINER']}>
                            <TemplateForm />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/templates"
                    element={
                        <ProtectedRoute allowedRoles={['MEMBER', 'TRAINER']}>
                            <Templates />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/member/:id"
                    element={
                        <ProtectedRoute allowedRole="TRAINER">
                            <MemberDetail />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/exercises"
                    element={
                        <ProtectedRoute allowedRole="TRAINER">
                            <ExerciseManagement />
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