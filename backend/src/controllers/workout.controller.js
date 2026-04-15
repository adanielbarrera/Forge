const prisma = require('../prisma');

const createWorkout = async (req, res) => {
    const { notas, exercises } = req.body;
    const userId = req.user.userId;

    if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
        return res.status(400).json({ error: "Se requiere al menos un ejercicio" });
    }

    try {
        const workout = await prisma.$transaction(async (tx) => {
            return await tx.workout.create({
                data: {
                    userId,
                    notas,
                    exercises: {
                        create: exercises.map(ex => ({
                            exerciseId: ex.exerciseId,
                            series: ex.series,
                            reps: ex.reps,
                            peso: ex.peso
                        }))
                    }
                },
                include: {
                    exercises: {
                        include: {
                            exercise: true
                        }
                    }
                }
            });
        }, {
            maxWait: 10000, // Tiempo máximo para obtener una conexión (10s)
            timeout: 15000  // Tiempo máximo de ejecución de la transacción (15s)
        });

        res.status(201).json(workout);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al crear el entrenamiento" });
    }
};

const getWorkouts = async (req, res) => {
    const userId = req.user.userId;

    try {
        const workouts = await prisma.workout.findMany({
            where: { userId },
            include: {
                exercises: {
                    include: {
                        exercise: {
                            select: { nombre: true }
                        }
                    }
                }
            },
            orderBy: { fecha: 'desc' }
        });

        res.json(workouts);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener los entrenamientos" });
    }
};

const getWorkoutById = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
        const workout = await prisma.workout.findUnique({
            where: { id: parseInt(id) },
            include: {
                exercises: {
                    include: {
                        exercise: true
                    }
                }
            }
        });

        if (!workout) {
            return res.status(404).json({ error: "Entrenamiento no encontrado" });
        }

        if (workout.userId !== userId) {
            return res.status(403).json({ error: "No tienes permiso para ver este entrenamiento" });
        }

        res.json(workout);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener el entrenamiento" });
    }
};

const getExercises = async (req, res) => {
    try {
        const exercises = await prisma.exercise.findMany();
        res.json(exercises);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener los ejercicios" });
    }
};

const getLastValues = async (req, res) => {
    const { exerciseId } = req.params;
    const userId = req.user.userId;

    try {
        const lastSet = await prisma.workoutSet.findFirst({
            where: {
                exerciseId: parseInt(exerciseId),
                workout: { userId }
            },
            orderBy: {
                workout: { fecha: 'desc' }
            },
            include: {
                workout: true
            }
        });

        if (!lastSet) {
            return res.json({ reps: 10, peso: 20 }); // Default values
        }

        res.json({ reps: lastSet.reps, peso: lastSet.peso });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener últimos valores" });
    }
};

module.exports = {
    createWorkout,
    getWorkouts,
    getWorkoutById,
    getExercises,
    getLastValues
};
