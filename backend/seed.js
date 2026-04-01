require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const exercises = [
        { nombre: 'Sentadilla Libre', categoria: 'Pierna' },
        { nombre: 'Press de Banca', categoria: 'Pecho' },
        { nombre: 'Peso Muerto', categoria: 'Espalda' },
        { nombre: 'Press Militar', categoria: 'Hombro' },
    ];

    console.log('Insertando ejercicios...');
    for (const ex of exercises) {
        const exists = await prisma.exercise.findFirst({ where: { nombre: ex.nombre } });
        if (!exists) {
            await prisma.exercise.create({ data: ex });
        }
    }
    console.log('Ejercicios listos.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
