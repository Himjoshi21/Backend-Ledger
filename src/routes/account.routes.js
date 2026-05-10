const express = require("express")
const authMiddleware = require("../middleware/auth.middleware")
const accountController = require("../controllers/account.controller")



const router = express.Router()


/**
 * - POST /API/ACCOUNTS
 * - Create a new account for the authenticated user 
 * - protected route cookies and headers mein hume vaild token bhejna hoga
 * 
 */

router.post("/",authMiddleware.authMiddleware,accountController.createAccountController)

/**
 * - GET /API/ACCOUNTS
 * - Get all accounts of the authenticated user 
 * - protected route cookies and headers mein hume vaild token bhejna hoga
 */

router.get("/",authMiddleware.authMiddleware,accountController.getUserAccountsController)

/**
 * -GET /API/ACCOUNTS/BALANCE/:ACCOUNTID
 * - Get balance of a specific account of the authenticated user 
 * - protected route cookies and headers mein hume vaild token bhejna hoga
 */

router.get("/balance/:accountId",authMiddleware.authMiddleware,accountController.getAccountBalanceController)

module.exports = router