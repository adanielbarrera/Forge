import axios from 'axios';

const EXERCISES_CACHE_KEY = 'forge_exercises_cache';
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 horas

/**
 * Fetch exercises with local caching to improve performance and scalability.
 */
export const getExercises = async (token) => {
    const cached = localStorage.getItem(EXERCISES_CACHE_KEY);
    
    if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const isExpired = Date.now() - timestamp > CACHE_DURATION;
        
        if (!isExpired) {
            console.log('📦 Usando ejercicios desde caché');
            return data;
        }
    }

    console.log('🚀 Pidiendo ejercicios al servidor...');
    try {
        const res = await axios.get('http://localhost:3000/api/workouts/exercises', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const cacheData = {
            data: res.data,
            timestamp: Date.now()
        };
        
        localStorage.setItem(EXERCISES_CACHE_KEY, JSON.stringify(cacheData));
        return res.data;
    } catch (err) {
        console.error('Error fetching exercises:', err);
        // Si falla la red pero tenemos caché (aunque esté expirada), la devolvemos como fallback
        if (cached) {
            return JSON.parse(cached).data;
        }
        throw err;
    }
};

/**
 * Clear cache if needed (e.g., manual refresh or after adding new exercises)
 */
export const clearExercisesCache = () => {
    localStorage.removeItem(EXERCISES_CACHE_KEY);
};
