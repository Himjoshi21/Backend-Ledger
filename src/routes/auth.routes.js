const express = require("express")
const authController = require ("../controllers/auth.controller")


const router = express.Router()


router.post("/register",authController.userRegisterController)

/** POST /API/AUTH/LOGIN */

router.post("/login",authController.userLoginController)

/**
 * - POST /API/AUTH/LOGOUT
 * - Logout user by blacklisting the token
 * - protected route cookies and headers mein hume vaild token bhejna hoga
 */

router.post("/logout",authController.userLogoutController)

module.exports = router

