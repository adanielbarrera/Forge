import api from '../api/axios';

const EXERCISES_CACHE_KEY = 'forge_exercises_cache';

/**
 * Fetch exercises with local caching to improve performance and scalability.
 * It automatically invalidates the cache if the server reports a newer version.
 */
export const getExercises = async (token) => {
    const cached = localStorage.getItem(EXERCISES_CACHE_KEY);
    
    try {
        // 1. Check current version on server
        const versionRes = await api.get('workouts/exercises/version');
        const serverVersion = versionRes.data.version;

        if (cached) {
            const { data, version } = JSON.parse(cached);
            
            // 2. If versions match, use cache
            if (version === serverVersion) {
                console.log('📦 Versión coincide. Usando ejercicios desde caché');
                return data;
            } else {
                console.log('🔄 Nueva versión detectada. Invalidando caché...');
            }
        }

        // 3. Fetch full list if no cache or version mismatch
        console.log('🚀 Pidiendo ejercicios al servidor...');
        const res = await api.get('workouts/exercises');
        
        const cacheData = {
            data: res.data,
            version: serverVersion,
            timestamp: Date.now()
        };
        
        localStorage.setItem(EXERCISES_CACHE_KEY, JSON.stringify(cacheData));
        return res.data;

    } catch (err) {
        console.error('Error in getExercises (cache/version logic):', err);
        // Fallback: If network fails, try using whatever is in cache
        if (cached) {
            console.log('⚠️ Network error, using fallback cache');
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
