const {Router} = require('express');
const { authMiddleware, authSystemUserMiddleware } = require('../middleware/auth.middleware');
const transactionController = require("../controllers/transaction.controller")


const transactionRoutes = Router();
 /**
  * - POST /api/transactions : create a new transaction
  * - cREATE A NEW TRANSACTION
  */


transactionRoutes.post("/", authMiddleware, transactionController.createTransaction)

/**
 * - POST /api/transaction/system/inital-funds
 * - Create initial funds transaction from systme user
 */

transactionRoutes.post("/system/inital-funds",authSystemUserMiddleware,transactionController.createInitialFundsTransaction)
module.exports = transactionRoutes