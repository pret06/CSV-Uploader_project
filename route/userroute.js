const express = require("express");
const { normalAuth } = require('../utils/auth.utils')

const router = express.Router();

router.get("/profile", normalAuth, (req, res) => {
    res.json({ success: true, message: "Access granted!", user: req.user });
});

module.exports = router;
