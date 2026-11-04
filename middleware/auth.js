const { getUserByUsername, toUserJSON } = require("../services/user");

async function checkAuth(req, res, next) {
    try {
        if (!req.session.username) {
            return res.status(401).json({
                message: "You are Unauthorized"
            });
        }

        const db = req.app.locals.db;
        const users = db.collection("users");

        const user = await getUserByUsername(req.session.username, users);

        if (!user) {
            return res.status(401).json({
                message: "You are Unauthenticated"
            });
        }

        req.user = toUserJSON(user);
        next();

    } catch (error) {
        res.status(500).json({
            message: "Internal Server Occurred. Authentication Failed"
        });
    }
}

async function checkAdminAuth(req, res, next) {
    try {
        if (!req.session.username) {
            return res.status(401).json({
                message: "You are Unauthorized"
            });
        }

        const db = req.app.locals.db;
        const users = db.collection("users");

        const user = await getUserByUsername(req.session.username, users);

        if (!user) {
            return res.status(401).json({
                message: "You are Unauthenticated"
            });
        }

        req.user = toUserJSON(user);

        if (!req.user.isAdmin) {
            return res.status(403).json({
                message: "Forbidden. Admin access required."
            });
        }

        next();

    } catch (error) {
        res.status(500).json({
            message: "Internal Server Occurred. Authentication Failed"
        });
    }
}

module.exports = { checkAuth, checkAdminAuth };
