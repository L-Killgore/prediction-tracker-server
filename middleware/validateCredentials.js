module.exports = (req, res, next) => {
    const { username, password, email } = req.body;

    // check if email is valid
    const validEmail = (userEmail) => {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userEmail);
    };

    if (req.path === "/api/v1/accounts/register") {
        if (![username, password, email].every(Boolean)) {
            return res.status(401).json({
                status: "Missing Credentials",
            });
        } else if (!validEmail(email)) {
            return res.status(401).json({
                status: "Invalid Email Adress",
            });
        };
    };

    if (req.path === "/api/v1/accounts/login") {
        if (![username, password].every(Boolean)) {
            return res.status(401).json({
                status: "Missing Credentials",
            });
        };
    };
    next();
};
