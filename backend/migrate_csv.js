require('dotenv').config();
const prisma = require('./src/prisma');
const fs = require('fs');
const path = require('path');

const USER_ID = 14;
const EXERCISES_CSV = path.join(__dirname, '../docs/ejercicios_convertidos.csv');
const WORKOUTS_CSV = path.join(__dirname, '../docs/workouts.csv');

function parseCSVLine(line) {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(cur.trim());
            cur = '';
        } else {
            cur += char;
        }
    }
    result.push(cur.trim());
    return result;
}

async function migrate() {
    console.log('🚀 Reiniciando migración corregida...');

    try {
        // 1. Sincronizar Ejercicios
        console.log('--- Sincronizando Catálogo de Ejercicios ---');
        const exercisesData = fs.readFileSync(EXERCISES_CSV, 'utf8').split('\n');
        for (let i = 1; i < exercisesData.length; i++) {
            const line = exercisesData[i];
            if (!line.trim()) continue;
            const parts = parseCSVLine(line);
            if (parts.length < 2) continue;
            const nombre = parts[0];
            const grupoMuscular = parts[1];
            const musculoSecundario = parts[2] || null;

            const existing = await prisma.exercise.findFirst({ where: { nombre } });
            if (existing) {
                await prisma.exercise.update({ where: { id: existing.id }, data: { grupoMuscular, musculoSecundario } });
            } else {
                await prisma.exercise.create({ data: { nombre, grupoMuscular, musculoSecundario } });
            }
        }

        // 2. Procesar Workouts
        console.log('--- Procesando Historial de Workouts ---');
        const workoutsRaw = fs.readFileSync(WORKOUTS_CSV, 'utf8').split('\n');
        const exerciseMap = {};
        const dbExercises = await prisma.exercise.findMany();
        dbExercises.forEach(ex => exerciseMap[ex.nombre] = ex.id);

        const sessions = {};

        for (let i = 1; i < workoutsRaw.length; i++) {
            const line = workoutsRaw[i];
            if (!line.trim()) continue;
            const parts = parseCSVLine(line);
            if (parts.length < 11) continue;

            const title = parts[0];
            const startTimeStr = parts[1];
            const description = parts[3];
            const exerciseTitle = parts[4];
            const weight = parseFloat(parts[9]) || 0;
            const reps = parseInt(parts[10]) || 0;

            const fecha = new Date(startTimeStr);
            if (isNaN(fecha.getTime())) {
                console.warn(`⚠️ Fecha inválida ignorada en línea ${i + 1}: ${startTimeStr}`);
                continue;
            }

            if (!exerciseMap[exerciseTitle]) {
                const newEx = await prisma.exercise.create({ data: { nombre: exerciseTitle, grupoMuscular: 'Otros' } });
                exerciseMap[exerciseTitle] = newEx.id;
            }

            const sessionKey = `${title}|${startTimeStr}`;
            if (!sessions[sessionKey]) {
                sessions[sessionKey] = {
                    nombre: title || 'Entrenamiento',
                    fecha: fecha,
                    notas: description,
                    exercisesData: {} // Agrupar sets por ejercicio dentro de la sesión
                };
            }

            const exId = exerciseMap[exerciseTitle];
            if (!sessions[sessionKey].exercisesData[exId]) {
                sessions[sessionKey].exercisesData[exId] = [];
            }

            sessions[sessionKey].exercisesData[exId].push({
                reps,
                peso: weight,
                series: sessions[sessionKey].exercisesData[exId].length + 1
            });
        }

        console.log('--- Insertando sesiones en base de datos ---');
        let workoutCount = 0;
        const sortedKeys = Object.keys(sessions).sort((a, b) => sessions[a].fecha - sessions[b].fecha);

        for (const key of sortedKeys) {
            const s = sessions[key];
            
            // Aplanar los sets para Prisma
            const allSets = [];
            for (const exId in s.exercisesData) {
                allSets.push(...s.exercisesData[exId].map(set => ({
                    exerciseId: parseInt(exId),
                    series: set.series,
                    reps: set.reps,
                    peso: set.peso
                })));
            }

            const volumen = allSets.reduce((acc, curr) => acc + (curr.peso * curr.reps), 0);

            await prisma.workout.create({
                data: {
                    userId: USER_ID,
                    nombre: s.nombre,
                    fecha: s.fecha,
                    notas: s.notas,
                    volumen,
                    exercises: {
                        create: allSets
                    }
                }
            });
            workoutCount++;
            if (workoutCount % 10 === 0) console.log(`  > ${workoutCount} sesiones importadas...`);
        }

        console.log(`✅ Éxito: ${workoutCount} sesiones importadas para el usuario 14.`);
    } catch (error) {
        console.error('❌ Error crítico:', error);
    } finally {
        await prisma.$disconnect();
    }
}

migrate();
