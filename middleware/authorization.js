const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
    const jwtToken = req.header("token");

    try {
        // if there is no JWT
        if (!jwtToken) {
            res.status(403).json({
                status: "Failed authorization: no JWT",
            });
        };

        // check if JWT is valid
        const verification = jwt.verify(jwtToken, process.env.jwtSecret);
        req.user = verification.user;

        next();
    } catch (err) {
        console.log(err);
        res.status(403).json({
            status: "Failed authorization",
        });
    };
};