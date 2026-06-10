const prisma = require('../prisma');

const getWeeklyVolume = async (req, res) => {
    const userId = req.user.userId;
    const offset = parseInt(req.query.offset) || 0; // 0 = actual, -1 = semana pasada, etc.

    // Calcular el rango de la semana basada en el offset
    // Una semana siempre son 7 días. El offset se multiplica por 7.
    const startOfRange = new Date();
    startOfRange.setHours(0, 0, 0, 0);
    startOfRange.setDate(startOfRange.getDate() - (7 * Math.abs(offset)) - 7);
    
    const endOfRange = new Date();
    endOfRange.setHours(23, 59, 59, 999);
    endOfRange.setDate(endOfRange.getDate() - (7 * Math.abs(offset)));

    try {
        const workouts = await prisma.workout.findMany({
            where: {
                userId,
                fecha: { 
                    gte: startOfRange,
                    lte: endOfRange
                }
            },
            include: {
                exercises: true
            }
        });

        // Preparar array de 7 días basado en el rango calculado
        const dailyVolume = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfRange);
            date.setDate(date.getDate() + i + 1);
            dailyVolume.push({ 
                day: date.getDay(), 
                date: date.toISOString().split('T')[0],
                volume: 0 
            });
        }

        workouts.forEach(workout => {
            const dateStr = workout.fecha.toISOString().split('T')[0];
            const dayData = dailyVolume.find(d => d.date === dateStr);
            if (dayData) {
                const volume = workout.exercises.reduce((sum, set) => sum + (set.series * set.reps * set.peso), 0);
                dayData.volume += volume;
            }
        });

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