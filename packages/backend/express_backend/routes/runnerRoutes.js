// packages/backend/express_backend/routes/runnerRoutes.js
const express = require("express");
const router = express.Router();
const { executeTestsController } = require("../controllers/runnerController");

router.post("/run-tests", executeTestsController);

module.exports = router;
