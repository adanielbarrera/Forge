require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const exercises = [
        { 
            nombre: 'Sentadilla Libre', 
            categoria: 'Pierna', 
            grupoMuscular: 'Cuádriceps',
            musculoSecundario: 'Glúteos, Lumbar',
            videoUrl: 'https://www.youtube.com/embed/gcNh1P8sVp8',
            descripcion: 'Mantén la espalda recta y baja hasta que tus muslos estén paralelos al suelo.',
            preparacion: 'Coloca la barra sobre tus trapecios, no sobre el cuello.'
        },
        { 
            nombre: 'Press de Banca', 
            categoria: 'Pecho', 
            grupoMuscular: 'Pectoral Mayor',
            musculoSecundario: 'Tríceps, Hombro Frontal',
            videoUrl: 'https://www.youtube.com/embed/vthMCtgVtFw',
            descripcion: 'Baja la barra de forma controlada hasta el pecho y empuja explosivamente.',
            preparacion: 'Retrae las escápulas y mantén los pies firmes en el suelo.'
        },
        { 
            nombre: 'Peso Muerto', 
            categoria: 'Espalda', 
            grupoMuscular: 'Isquiotibiales / Lumbar',
            musculoSecundario: 'Glúteos, Antebrazos',
            videoUrl: 'https://www.youtube.com/embed/op9kVnSso6Q',
            descripcion: 'Levanta el peso manteniendo la barra pegada a tus piernas en todo momento.',
            preparacion: 'Asegura un agarre firme y respira profundo antes de iniciar el ascenso.'
        },
        { 
            nombre: 'Press Militar', 
            categoria: 'Hombro', 
            grupoMuscular: 'Deltoides',
            musculoSecundario: 'Tríceps, Core',
            videoUrl: 'https://www.youtube.com/embed/2yjwxt_Yeas',
            descripcion: 'Empuja la barra sobre tu cabeza hasta bloquear los codos.',
            preparacion: 'Mantén el core apretado para no arquear la espalda excesivamente.'
        },
    ];

    console.log('Actualizando catálogo de ejercicios...');
    for (const ex of exercises) {
        await prisma.exercise.upsert({
            where: { id: (await prisma.exercise.findFirst({ where: { nombre: ex.nombre } }))?.id || -1 },
            update: ex,
            create: ex
        });
    }
    console.log('Catálogo listo con videos y descripciones.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
