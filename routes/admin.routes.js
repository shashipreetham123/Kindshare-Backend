const express = require("express");
const { checkAdminAuth } = require("../middleware/auth");

const userRoutes = require("./admin/user.routes");
const productRoutes = require("./admin/product.routes");
const requestRoutes = require("./admin/request.routes");
const reserveRoutes = require("./admin/reserve.routes");
const historyRoutes = require("./admin/history.routes");

const router = express.Router();

router.use(checkAdminAuth);

router.get("/me", (req, res) => {
    return res.status(200).json({
        message: "Admin Profile",
        user: req.user
    });
});

router.use("/user", userRoutes);
router.use("/users", userRoutes);

router.use("/product", productRoutes);
router.use("/products", productRoutes);

router.use("/request", requestRoutes);
router.use("/requests", requestRoutes);

router.use("/reserve", reserveRoutes);
router.use("/reserves", reserveRoutes);

router.use("/history", historyRoutes);

module.exports = router;
