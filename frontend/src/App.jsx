import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import GuestRoute from './components/GuestRoute';
import LoadingScreen from './components/ui/LoadingScreen';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import WeightTracker from './pages/WeightTracker';
import DietPlan from './pages/DietPlan';
import Profile from './pages/Profile';

function SmartHome() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Dashboard />;
  return <Landing />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AnimatePresence mode="wait">
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<SmartHome />} />
              <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
              <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
              <Route path="/weight" element={<PrivateRoute><WeightTracker /></PrivateRoute>} />
              <Route path="/diet" element={<PrivateRoute><DietPlan /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            </Route>
          </Routes>
        </AnimatePresence>
      </AuthProvider>
    </BrowserRouter>
  );
}
