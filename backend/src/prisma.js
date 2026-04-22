const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// Configuración del Pool con más tiempo de espera y límites controlados
const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    max: 10, // Máximo de conexiones simultáneas
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // 10 segundos para conectar
});

const adapter = new PrismaPg(pool);

// Aumentamos los timeouts globales de la instancia
const prisma = new PrismaClient({ 
    adapter,
    log: ['query', 'error', 'warn'], // Útil para debug
});

module.exports = prisma;
