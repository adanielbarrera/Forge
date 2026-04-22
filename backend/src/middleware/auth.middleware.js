const jwt = require('jsonwebtoken');

/**
 * Middleware para autenticar usuarios mediante JWT.
 * Extrae el token del header Authorization y lo verifica.
 */
const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { userId, email, role }
        next();
    } catch (err) {
        console.error("JWT Verification Error:", err.message);
        res.status(403).json({ error: 'Token inválido o expirado.' });
    }
};

module.exports = { authenticate };
