const express = require("express")
const { checkAuth } = require("../middleware/auth")
const { getUserByUsername, verifyPassword, hashPassword } = require("../services/user")
const { addHistory } = require("../services/history")
const { handleServerError } = require("../services/common")
const productRoutes = require("./user/product.routes")
const requestRoutes = require("./user/request.routes")
const reserveRoutes = require("./user/reserve.routes")
const completedRoutes = require("./user/completed.routes")
const historyRoutes = require("./user/history.routes")

const router = express.Router()

router.use(checkAuth)

router.get("/me", (req, res) => {
    res.status(200).json({
        message: "User Profile",
        user: req.user
    })
})

router.put("/change-password", async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body

        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                message: "Old password, new password, and confirm new password are all required."
            })
        }

        if (newPassword.length < 4) {
            return res.status(400).json({
                message: "New password must be at least 4 characters long."
            })
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: "New password and Confirm New password do not match."
            })
        }

        const username = req.user.username
        const db = req.app.locals.db
        const usersCollection = db.collection("users")
        const historyCollection = db.collection("history")

        const userDoc = await usersCollection.findOne({ username: username.toLowerCase().trim() })
        if (!userDoc) {
            return res.status(404).json({
                message: "User account not found."
            })
        }

        const isOldValid = await verifyPassword(userDoc.password, oldPassword)
        if (!isOldValid) {
            return res.status(400).json({
                message: "The current (old) password you entered is incorrect."
            })
        }

        const hashedNewPassword = await hashPassword(newPassword)
        await usersCollection.updateOne(
            { username: userDoc.username },
            { $set: { password: hashedNewPassword } }
        )

        await addHistory({
            username: userDoc.username,
            event: "user change password",
            summaryShort: "Account password changed",
            summaryLong: `User "${userDoc.username}" successfully updated their account password.`
        }, historyCollection)

        return res.status(200).json({
            message: "Password changed successfully."
        })
    } catch (error) {
        return handleServerError(res, error, "Failed to change password.")
    }
})

router.use("/product", productRoutes)
router.use("/request", requestRoutes)
router.use("/reserve", reserveRoutes)
router.use("/completed", completedRoutes)
router.use("/history", historyRoutes)

module.exports = router
