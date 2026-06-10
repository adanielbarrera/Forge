require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('--- Iniciando Poblamiento de Datos Demo ---');

    // 1. Limpiar datos previos (Orden inverso de dependencias)
    console.log('Limpiando base de datos...');
    await prisma.workoutSet.deleteMany();
    await prisma.workout.deleteMany();
    await prisma.membership.deleteMany();
    await prisma.template.deleteMany();
    await prisma.user.deleteMany();
    await prisma.exercise.deleteMany();

    // 2. Crear Ejercicios
    console.log('Creando catálogo de ejercicios...');
    const exercisesData = [
        { 
            nombre: 'Sentadilla Libre', 
            categoria: 'Pierna', 
            grupoMuscular: 'Cuádriceps',
            musculoSecundario: 'Glúteos, Lumbar',
            videoUrl: 'https://www.youtube.com/embed/gcNh1P8sVp8',
            descripcion: 'Mantén la espalda recta y baja hasta que tus muslos estén paralelos al suelo.'
        },
        { 
            nombre: 'Press de Banca', 
            categoria: 'Pecho', 
            grupoMuscular: 'Pectoral Mayor',
            musculoSecundario: 'Tríceps, Hombro Frontal',
            videoUrl: 'https://www.youtube.com/embed/vthMCtgVtFw',
            descripcion: 'Baja la barra de forma controlada hasta el pecho.'
        },
        { 
            nombre: 'Peso Muerto', 
            categoria: 'Espalda', 
            grupoMuscular: 'Isquiotibiales',
            musculoSecundario: 'Glúteos, Lumbar',
            videoUrl: 'https://www.youtube.com/embed/op9kVnSso6Q',
            descripcion: 'Levanta el peso manteniendo la barra pegada a tus piernas.'
        },
        { 
            nombre: 'Press Militar', 
            categoria: 'Hombro', 
            grupoMuscular: 'Deltoides',
            musculoSecundario: 'Tríceps',
            videoUrl: 'https://www.youtube.com/embed/2yjwxt_Yeas',
            descripcion: 'Empuja la barra sobre tu cabeza.'
        },
        { 
            nombre: 'Curl de Bíceps', 
            categoria: 'Brazo', 
            grupoMuscular: 'Bíceps',
            musculoSecundario: 'Braquial',
            videoUrl: '',
            descripcion: 'Flexiona los codos manteniendo los brazos pegados al torso.'
        }
    ];

    const exercises = [];
    for (const ex of exercisesData) {
        const created = await prisma.exercise.create({ data: ex });
        exercises.push(created);
    }

    // 3. Crear Usuarios
    console.log('Creando usuarios (Entrenador y Alumnos)...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const trainer = await prisma.user.create({
        data: {
            email: 'trainer@forge.com',
            password: hashedPassword,
            role: 'TRAINER',
            nombre: 'Carlos Trainer'
        }
    });

    const member1 = await prisma.user.create({
        data: {
            email: 'juan@gmail.com',
            password: hashedPassword,
            role: 'MEMBER',
            nombre: 'Juan Pérez',
            peso: 75.5,
            altura: 178
        }
    });

    const member2 = await prisma.user.create({
        data: {
            email: 'maria@gmail.com',
            password: hashedPassword,
            role: 'MEMBER',
            nombre: 'Maria García',
            peso: 62.0,
            altura: 165
        }
    });

    // 4. Crear Membresías
    console.log('Asignando membresías...');
    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(now.getMonth() + 1);

    const lastMonth = new Date();
    lastMonth.setMonth(now.getMonth() - 1);
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    await prisma.membership.create({
        data: {
            userId: member1.id,
            estado: 'ACTIVO',
            fechaInicio: now,
            fechaFin: nextMonth,
            metodoPago: 'STRIPE'
        }
    });

    await prisma.membership.create({
        data: {
            userId: member2.id,
            estado: 'VENCIDO',
            fechaInicio: lastMonth,
            fechaFin: yesterday,
            metodoPago: 'EFECTIVO'
        }
    });

    // 5. Crear Historial de Entrenamientos
    console.log('Generando historial de entrenamientos...');

    // Entrenamiento 1 para Juan (ayer)
    const workout1 = await prisma.workout.create({
        data: {
            userId: member1.id,
            nombre: 'Empuje - Lunes',
            fecha: yesterday,
            duracion: 3600,
            volumen: 2500,
            notas: 'Me sentí con mucha energía hoy.',
            feedback: 'Excelente progresión en el press de banca. Mantén esa intensidad.'
        }
    });

    await prisma.workoutSet.createMany({
        data: [
            { workoutId: workout1.id, exerciseId: exercises[1].id, series: 1, reps: 10, peso: 60 },
            { workoutId: workout1.id, exerciseId: exercises[1].id, series: 2, reps: 10, peso: 60 },
            { workoutId: workout1.id, exerciseId: exercises[1].id, series: 3, reps: 8, peso: 65 },
            { workoutId: workout1.id, exerciseId: exercises[3].id, series: 1, reps: 12, peso: 30 },
            { workoutId: workout1.id, exerciseId: exercises[3].id, series: 2, reps: 12, peso: 30 }
        ]
    });

    // Entrenamiento 2 para Juan (hace 3 días)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(now.getDate() - 3);

    const workout2 = await prisma.workout.create({
        data: {
            userId: member1.id,
            nombre: 'Pierna Pesada',
            fecha: threeDaysAgo,
            duracion: 4500,
            volumen: 4200,
            feedback: 'Buen trabajo en las sentadillas. Cuidado con la profundidad en la última serie.'
        }
    });

    await prisma.workoutSet.createMany({
        data: [
            { workoutId: workout2.id, exerciseId: exercises[0].id, series: 1, reps: 5, peso: 80 },
            { workoutId: workout2.id, exerciseId: exercises[0].id, series: 2, reps: 5, peso: 90 },
            { workoutId: workout2.id, exerciseId: exercises[0].id, series: 3, reps: 5, peso: 100 },
            { workoutId: workout2.id, exerciseId: exercises[2].id, series: 1, reps: 8, peso: 70 }
        ]
    });

    // Entrenamiento para Maria (hace una semana)
    const lastWeek = new Date();
    lastWeek.setDate(now.getDate() - 7);

    const workout3 = await prisma.workout.create({
        data: {
            userId: member2.id,
            nombre: 'Full Body Inicio',
            fecha: lastWeek,
            duracion: 3000,
            volumen: 1200
        }
    });

    await prisma.workoutSet.createMany({
        data: [
            { workoutId: workout3.id, exerciseId: exercises[0].id, series: 1, reps: 15, peso: 20 },
            { workoutId: workout3.id, exerciseId: exercises[1].id, series: 1, reps: 12, peso: 15 },
            { workoutId: workout3.id, exerciseId: exercises[4].id, series: 1, reps: 15, peso: 10 }
        ]
    });

    // 6. Crear Plantillas
    console.log('Creando plantillas de entrenamiento...');
    await prisma.template.create({
        data: {
            nombre: 'Rutina de Fuerza 5x5',
            descripcion: 'Ideal para principiantes e intermedios buscando ganar fuerza base.',
            creadorId: trainer.id,
            publico: true,
            rutina: [
                { exerciseId: exercises[0].id, series: 5, reps: 5 },
                { exerciseId: exercises[1].id, series: 5, reps: 5 },
                { exerciseId: exercises[2].id, series: 1, reps: 5 }
            ]
        }
    });

    console.log('--- Poblamiento Completado con Éxito ---');
}

main()
    .catch(e => {
        console.error('Error durante el poblamiento:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
