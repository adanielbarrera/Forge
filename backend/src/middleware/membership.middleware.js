const prisma = require('../prisma');
const { checkExpirations } = require('../controllers/membership.controller');

/**
 * Middleware para verificar si el usuario tiene una membresía ACTIVA.
 * Ignora la verificación si el rol es TRAINER.
 */
const requireActiveMembership = async (req, res, next) => {
    const { userId, role } = req.user;

    // Los entrenadores no necesitan membresía
    if (role === 'TRAINER') {
        return next();
    }

    try {
        // Ejecutamos Lazy Update para asegurar que el estado es actual
        await checkExpirations();

        const membership = await prisma.membership.findUnique({
            where: { userId }
        });

        if (!membership || membership.estado !== 'ACTIVO') {
            return res.status(403).json({ 
                error: 'MEMBERSHIP_INACTIVE',
                message: 'Tu membresía no está activa o ha vencido. Por favor, renueva tu suscripción para continuar.' 
            });
        }

        // Si está activa, pasamos al siguiente controlador
        next();
    } catch (err) {
        console.error("Error en requireActiveMembership middleware:", err);
        res.status(500).json({ error: 'Error interno al verificar membresía' });
    }
};

module.exports = { requireActiveMembership };
