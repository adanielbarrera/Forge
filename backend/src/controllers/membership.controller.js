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
    // Forzamos el plan único de $599
    const plan = { name: 'Membresía Mensual Forge', price: 59900, currency: 'mxn' };

    // Validamos que el FRONTEND_URL tenga el esquema correcto
    let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    if (!frontendUrl.startsWith('http')) {
        frontendUrl = `http://${frontendUrl}`;
    }

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: plan.currency,
                    product_data: {
                        name: plan.name,
                    },
                    unit_amount: plan.price,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${frontendUrl}/profile?payment=success`,
            cancel_url: `${frontendUrl}/profile?payment=cancel`,
            metadata: {
                userId: userId.toString(),
                planId: 'mensual'
            }
        });

        res.json({ id: session.id, url: session.url });
    } catch (err) {
        console.error("Stripe Error:", err);
        res.status(500).json({ error: "Error al crear la sesión de pago", detail: err.message });
    }
};

const checkExpirations = async () => {
    try {
        const now = new Date();
        const expired = await prisma.membership.updateMany({
            where: {
                estado: 'ACTIVO',
                fechaFin: {
                    lt: now
                }
            },
            data: {
                estado: 'VENCIDO'
            }
        });
        if (expired.count > 0) {
            console.log(`[LazyUpdate] ${expired.count} membresías marcadas como VENCIDAS.`);
        }
    } catch (err) {
        console.error("Error in LazyUpdate checkExpirations:", err);
    }
};

const getAllMemberships = async (req, res) => {
    const { role } = req.user;

    if (role !== 'TRAINER') {
        return res.status(403).json({ error: "No tienes permiso para ver los alumnos" });
    }

    try {
        // Ejecutamos el lazy update antes de traer los datos
        await checkExpirations();

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
        const membership = await prisma.membership.upsert({
            where: { userId: parseInt(userId) },
            update: {
                fechaFin: new Date(fechaFin),
                estado: estado || 'ACTIVO'
            },
            create: {
                userId: parseInt(userId),
                fechaFin: new Date(fechaFin),
                estado: estado || 'ACTIVO'
            }
        });
        res.status(201).json(membership);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al procesar la membresía" });
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

const handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error(`❌ Error de firma de Webhook: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Manejar el evento
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userId = parseInt(session.metadata.userId);

        console.log(`✅ Pago completado para el usuario ${userId}`);

        try {
            // Calculamos fecha de fin (1 mes por defecto para simplificar)
            const fechaFin = new Date();
            fechaFin.setMonth(fechaFin.getMonth() + 1);

            // Upsert: Crear o actualizar membresía
            await prisma.membership.upsert({
                where: { userId: userId },
                update: {
                    estado: 'ACTIVO',
                    fechaFin: fechaFin
                },
                create: {
                    userId: userId,
                    estado: 'ACTIVO',
                    fechaFin: fechaFin
                }
            });

            console.log(`💪 Membresía activada para el usuario ${userId}`);
        } catch (err) {
            console.error(`❌ Error al actualizar membresía en DB: ${err.message}`);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }

    res.json({ received: true });
};

module.exports = {
    checkExpirations,
    createCheckoutSession,
    getAllMemberships,
    createMembership,
    updateMembershipStatus,
    handleWebhook
};
