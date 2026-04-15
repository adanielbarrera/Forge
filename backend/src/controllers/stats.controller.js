const prisma = require('../prisma');

const getWeeklyVolume = async (req, res) => {
    const userId = req.user.userId;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    try {
        const workouts = await prisma.workout.findMany({
            where: {
                userId,
                fecha: { gte: sevenDaysAgo }
            },
            include: {
                exercises: true
            }
        });

        // Group by day of week (0-6)
        const dailyVolume = Array(7).fill(0).map((_, i) => ({ day: i, volume: 0 }));

        workouts.forEach(workout => {
            const day = workout.fecha.getDay(); // 0 (Sun) - 6 (Sat)
            const volume = workout.exercises.reduce((sum, set) => sum + (set.series * set.reps * set.peso), 0);
            dailyVolume[day].volume += volume;
        });

        // Reorder to start from 7 days ago until today if needed, or keep it sorted by day of week.
        // Figma seems to show a sequence (0-6 or 0-9).
        res.json(dailyVolume);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener el volumen semanal" });
    }
};

const getExerciseProgress = async (req, res) => {
    const userId = req.user.userId;
    const { exerciseId } = req.query;

    if (!exerciseId) {
        return res.status(400).json({ error: "Se requiere exerciseId" });
    }

    try {
        const sets = await prisma.workoutSet.findMany({
            where: {
                exerciseId: parseInt(exerciseId),
                workout: { userId }
            },
            include: {
                workout: { select: { fecha: true } }
            },
            orderBy: { workout: { fecha: 'asc' } }
        });

        // Group by workout date and get max weight per session
        const progress = sets.reduce((acc, set) => {
            const dateStr = set.workout.fecha.toISOString().split('T')[0];
            if (!acc[dateStr] || set.peso > acc[dateStr]) {
                acc[dateStr] = set.peso;
            }
            return acc;
        }, {});

        const result = Object.entries(progress).map(([date, weight]) => ({ date, weight }));

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener el progreso del ejercicio" });
    }
};

const getPersonalRecords = async (req, res) => {
    const userId = req.user.userId;

    try {
        // Obtenemos todos los sets del usuario, incluyendo el nombre del ejercicio
        const sets = await prisma.workoutSet.findMany({
            where: {
                workout: { userId }
            },
            include: {
                exercise: true,
                workout: { select: { fecha: true } }
            }
        });

        // Agrupamos por ejercicio y encontramos el peso máximo
        const prsMap = sets.reduce((acc, set) => {
            const exId = set.exerciseId;
            if (!acc[exId] || set.peso > acc[exId].peso) {
                acc[exId] = {
                    id: exId,
                    nombre: set.exercise.nombre,
                    peso: set.peso,
                    fecha: set.workout.fecha
                };
            }
            return acc;
        }, {});

        const prs = Object.values(prsMap);
        res.json(prs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener los PRs" });
    }
};

module.exports = {
    getWeeklyVolume,
    getExerciseProgress,
    getPersonalRecords
};