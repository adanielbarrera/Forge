const prisma = require('../prisma');

// Inicializamos Stripe de forma segura (no arroja error si la clave es nula aquí, 
// pero fallará al intentar usar los métodos si no se provee una válida)
const stripe = process.env.STRIPE_SECRET_KEY 
    ? require('stripe')(process.env.STRIPE_SECRET_KEY)
    : null;

const createCheckoutSession = async (req, res) => {
    if (!stripe) {
        return res.status(500).json({ 
            error: "La pasarela de pagos no está configurada (Falta STRIPE_SECRET_KEY en .env)" 
        });
    }

    const userId = req.user.userId;
    const { planId } = req.body; // 'standard' o 'premium'

    // Definición de planes (hardcoded por ahora, idealmente en DB o Stripe Dashboard)
    const plans = {
        'standard': { name: 'Forge Standard', price: 49900, currency: 'mxn' }, // $499.00
        'premium': { name: 'Forge Premium', price: 89900, currency: 'mxn' }    // $899.00
    };

    const selectedPlan = plans[planId];
    if (!selectedPlan) {
        return res.status(400).json({ error: "Plan inválido" });
    }

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: selectedPlan.currency,
                    product_data: {
                        name: selectedPlan.name,
                    },
                    unit_amount: selectedPlan.price,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/profile?payment=success`,
            cancel_url: `${process.env.FRONTEND_URL}/profile?payment=cancel`,
            metadata: {
                userId: userId.toString(),
                planId: planId
            }
        });

        res.json({ id: session.id, url: session.url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al crear la sesión de pago" });
    }
};

const getAllMemberships = async (req, res) => {
    const { role } = req.user;

    if (role !== 'TRAINER') {
        return res.status(403).json({ error: "No tienes permiso para ver los alumnos" });
    }

    try {
        // Buscamos todos los usuarios que sean alumnos
        const students = await prisma.user.findMany({
            where: {
                role: 'MEMBER'
            },
            include: {
                membership: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Formateamos la respuesta para que el frontend siga funcionando igual
        // pero incluimos a los que no tienen membresía aún
        const formattedData = students.map(student => ({
            id: student.membership?.id || `temp-${student.id}`,
            estado: student.membership?.estado || 'SIN MEMBRESÍA',
            fechaFin: student.membership?.fechaFin || null,
            user: {
                id: student.id,
                email: student.email,
                nombre: student.nombre,
                role: student.role
            }
        }));

        res.json(formattedData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener la lista de alumnos" });
    }
};

const createMembership = async (req, res) => {
    const { role } = req.user;
    const { userId, fechaFin, estado } = req.body;

    if (role !== 'TRAINER') {
        return res.status(403).json({ error: "No tienes permiso para crear membresías" });
    }

    try {
        const newMembership = await prisma.membership.create({
            data: {
                userId,
                fechaFin: new Date(fechaFin),
                estado: estado || 'ACTIVO'
            }
        });
        res.status(201).json(newMembership);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al crear la membresía" });
    }
};

const updateMembershipStatus = async (req, res) => {
    const { role } = req.user;
    const { id } = req.params;
    const { estado } = req.body;

    if (role !== 'TRAINER') {
        return res.status(403).json({ error: "No tienes permiso para actualizar membresías" });
    }

    const estadosValidos = ['ACTIVO', 'VENCIDO', 'PENDIENTE'];
    if (!estado || !estadosValidos.includes(estado)) {
        return res.status(400).json({ error: "Estado inválido. Debe ser ACTIVO, VENCIDO o PENDIENTE" });
    }

    try {
        const updated = await prisma.membership.update({
            where: { id: parseInt(id) },
            data: { estado }
        });

        res.json(updated);
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({ error: "Membresía no encontrada" });
        }
        res.status(500).json({ error: "Error al actualizar la membresía" });
    }
};

module.exports = {
    createCheckoutSession,
    getAllMemberships,
    createMembership,
    updateMembershipStatus
};
