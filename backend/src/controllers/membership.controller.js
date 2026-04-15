const prisma = require('../prisma');

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
    getAllMemberships,
    createMembership,
    updateMembershipStatus
};
