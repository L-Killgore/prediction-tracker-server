require("dotenv").config();
const jwt = require("jsonwebtoken");

const jwtGenerator = (user_id) => {
    const payload = {user: user_id};

    return jwt.sign(payload, process.env.JWTSECRET);
    // return jwt.sign(payload, process.env.JWTSECRET, {expiresIn: "1hr"});
};

module.exports = jwtGenerator;