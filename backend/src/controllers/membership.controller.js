const prisma = require('../prisma');

const getAllMemberships = async (req, res) => {
    const { role } = req.user;

    if (role !== 'TRAINER') {
        return res.status(403).json({ error: "No tienes permiso para ver las membresías" });
    }

    try {
        const memberships = await prisma.membership.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        createdAt: true
                    }
                }
            }
        });

        res.json(memberships);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener las membresías" });
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
    updateMembershipStatus
};
