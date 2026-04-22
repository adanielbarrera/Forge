const prisma = require('../prisma');
const { genAI } = require('../config/ai.config');

const createWorkout = async (req, res) => {
    const { nombre, notas, exercises, feedback, duracion, volumen } = req.body;
    const userId = req.user.userId;

    if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
        return res.status(400).json({ error: "Se requiere al menos un ejercicio" });
    }

    try {
        const workout = await prisma.$transaction(async (tx) => {
            return await tx.workout.create({
                data: {
                    userId,
                    nombre,
                    notas,
                    feedback,
                    duracion,
                    volumen,
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
        console.error("❌ Error en createWorkout:", err);
        // Enviamos el mensaje de error específico para debuggear
        res.status(500).json({ 
            error: "Error al crear el entrenamiento", 
            details: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};

const getWorkouts = async (req, res) => {
    const { userId: queryUserId } = req.query;
    const { userId: currentUserId, role } = req.user;

    // Si es TRAINER y pide un userId, lo permitimos
    // Si es MEMBER, solo permitimos su propio ID
    const targetUserId = (role === 'TRAINER' && queryUserId) 
        ? parseInt(queryUserId) 
        : currentUserId;

    try {
        const workouts = await prisma.workout.findMany({
            where: { userId: targetUserId },
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
        console.error(err);
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
        const exercises = await prisma.exercise.findMany({
            orderBy: { nombre: 'asc' }
        });
        res.json(exercises);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener los ejercicios" });
    }
};

const getTemplates = async (req, res) => {
    const userId = req.user.userId;

    try {
        const templates = await prisma.template.findMany({
            where: {
                OR: [
                    { creadorId: userId },
                    { publico: true }
                ]
            },
            include: {
                creador: {
                    select: { nombre: true, role: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(templates);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener las plantillas" });
    }
};

const createTemplate = async (req, res) => {
    const { nombre, descripcion, rutina, publico } = req.body;
    const userId = req.user.userId;

    if (!nombre || !rutina) {
        return res.status(400).json({ error: "Nombre y rutina son obligatorios" });
    }

    try {
        const template = await prisma.template.create({
            data: {
                nombre,
                descripcion,
                rutina, // JSON
                publico: publico || false,
                creadorId: userId
            }
        });

        res.status(201).json(template);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al crear la plantilla" });
    }
};

const getTemplateById = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
        const template = await prisma.template.findUnique({
            where: { id: parseInt(id) },
            include: {
                creador: {
                    select: { nombre: true, role: true }
                }
            }
        });

        if (!template) {
            return res.status(404).json({ error: "Plantilla no encontrada" });
        }

        // Si no es pública y no es el creador, no puede verla
        if (!template.publico && template.creadorId !== userId) {
            return res.status(403).json({ error: "No tienes permiso para ver esta plantilla" });
        }

        res.json(template);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener la plantilla" });
    }
};

const deleteTemplate = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
        const template = await prisma.template.findUnique({
            where: { id: parseInt(id) }
        });

        if (!template) {
            return res.status(404).json({ error: "Plantilla no encontrada" });
        }

        if (template.creadorId !== userId) {
            return res.status(403).json({ error: "No tienes permiso para eliminar esta plantilla" });
        }

        await prisma.template.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: "Plantilla eliminada correctamente" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al eliminar la plantilla" });
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

const getWorkoutFeedback = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    if (!genAI) {
        return res.status(503).json({ error: "Servicio de IA no configurado (Falta GEMINI_API_KEY)" });
    }

    try {
        const workout = await prisma.workout.findUnique({
            where: { id: parseInt(id) },
            include: {
                exercises: { include: { exercise: true } },
                user: { select: { nombre: true, peso: true, altura: true } }
            }
        });

        if (!workout) return res.status(404).json({ error: "Entrenamiento no encontrado" });
        if (workout.userId !== userId) return res.status(403).json({ error: "No tienes permiso para ver este entrenamiento" });

        if (workout.feedback) {
            return res.json({ feedback: workout.feedback });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `Eres un entrenador personal experto de la app "Forge". 
        Analiza el entrenamiento de ${workout.user.nombre || 'el usuario'} y dale feedback breve, motivador y técnico.
        Datos del usuario: Peso ${workout.user.peso || 'N/A'}kg, Altura ${workout.user.altura || 'N/A'}cm.
        Entrenamiento realizado:
        ${workout.exercises.map(e => `- ${e.exercise.nombre}: ${e.series} series x ${e.reps} reps con ${e.peso}kg`).join('\n')}
        Notas del usuario: ${workout.notas || 'Ninguna'}.
        
        Instrucciones:
        1. Responde en español.
        2. Sé breve (máximo 3 párrafos cortos).
        3. Identifica si hubo un buen volumen de entrenamiento o si puede mejorar la intensidad.
        4. Usa un tono motivador pero profesional.
        5. No uses Markdown complejo, solo negritas para resaltar puntos clave.`;

        const result = await model.generateContent(prompt);
        const feedback = result.response.text();

        console.log(`Raw Gemini Text: ${feedback}`);

        await prisma.workout.update({
            where: { id: parseInt(id) },
            data: { feedback }
        });

        res.json({ feedback });
    } catch (err) {
        console.error("❌ Gemini Error:", err.message);
        res.status(500).json({ error: "Error al generar feedback con la IA" });
    }
};

const getFeedbackPreview = async (req, res) => {
    const { exercises, notas } = req.body;
    const userId = req.user.userId;

    if (!genAI) {
        return res.status(503).json({ error: "Servicio de IA no configurado" });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { nombre: true, peso: true, altura: true }
        });

        // Agrupar sets por nombre de ejercicio para el prompt
        // req.body.exercises viene como [{exerciseId, reps, peso, nombre}, ...]
        const exercisesSummary = {};
        exercises.forEach(ex => {
            if (!exercisesSummary[ex.nombre]) {
                exercisesSummary[ex.nombre] = { series: 0, reps: ex.reps, peso: ex.peso };
            }
            exercisesSummary[ex.nombre].series += 1;
        });

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `Eres un entrenador personal experto de la app "Forge". 
        Analiza el entrenamiento de ${user.nombre || 'el usuario'} y dale feedback breve, motivador y técnico.
        Datos del usuario: Peso ${user.peso || 'N/A'}kg, Altura ${user.altura || 'N/A'}cm.
        Entrenamiento realizado:
        ${Object.entries(exercisesSummary).map(([nombre, data]) => `- ${nombre}: ${data.series} series x ${data.reps} reps con ${data.peso}kg`).join('\n')}
        Notas del usuario: ${notas || 'Ninguna'}.
        
        Instrucciones:
        1. Responde en español.
        2. Sé breve (máximo 3 párrafos cortos).
        3. Identifica si hubo un buen volumen de entrenamiento o si puede mejorar la intensidad.
        4. Usa un tono motivador pero profesional.
        5. No uses Markdown complejo, solo negritas para resaltar puntos clave.`;

        const result = await model.generateContent(prompt);
        const feedback = result.response.text();

        console.log(`Raw Gemini Preview Text: ${feedback}`);
        res.json({ feedback });
    } catch (err) {
        console.error("❌ Gemini Preview Error:", err.message);
        res.status(500).json({ error: "Error al generar feedback" });
    }
};

module.exports = {
    createWorkout,
    getWorkouts,
    getWorkoutById,
    getExercises,
    getLastValues,
    getTemplates,
    createTemplate,
    getTemplateById,
    deleteTemplate,
    getWorkoutFeedback,
    getFeedbackPreview
};
