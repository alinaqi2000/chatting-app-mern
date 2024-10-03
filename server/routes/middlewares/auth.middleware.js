const jwt = require('jsonwebtoken');
const routes = require("./config")

const checkRouteRole = (routes, currentRoute, role, expectedRole) => {
    let isAllowed = true;

    routes.forEach((route) => {
        if (currentRoute === route) {
            if (role !== expectedRole) {
                isAllowed = false;
            }
        }
    })

    return isAllowed;
}

const authMiddleware = (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'Access denied, no token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        for (role in routes) {
            const allowedRoutes = routes[role]
            const isAllowed = checkRouteRole(allowedRoutes, req.baseUrl + req.path, decoded.role, role)
            if (!isAllowed) {
                return res.status(401).json({ error: 'Access denied' });
            }
        }

        req.user = decoded;
        next();
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};



module.exports = authMiddleware;
