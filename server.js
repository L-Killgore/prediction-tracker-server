// Imports
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwtGenerator = require("./utils/jwtGenerator");
const authorization = require("./middleware/authorization");
const cors = require("cors");
const express = require("express");
const path = require('path');
// const apiRouter = require("./api");
const morgan = require("morgan");
const db = require("./db");
const validateCredentials = require("./middleware/validateCredentials");
const app = express();

// Non-imported Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
// app.use("/api", apiRouter);


// Serve React build files in production
if (process.env.NODE_ENV === 'production') {
    // Serve the frontend's index.html file at the root route
    app.get('/', (req, res) => {
        res.cookie('XSRF-TOKEN', req.csrfToken());
        res.sendFile(
            path.resolve(__dirname, '../client', 'build', 'index.html')
        );
    });
  
    // Serve the static assets in the frontend's build folder
    app.use(express.static(path.resolve("../client/build")));
  
    // Serve the frontend's index.html file at all other routes NOT starting with /api
    app.get(/^(?!\/?api).*/, (req, res) => {
        res.cookie('XSRF-TOKEN', req.csrfToken());
        res.sendFile(
            path.resolve(__dirname, '../client', 'build', 'index.html')
        );
    });
};
  
// Add a XSRF-TOKEN cookie in development
if (process.env.NODE_ENV !== 'production') {
    app.get('/api/csrf/restore', (req, res) => {
            res.cookie('XSRF-TOKEN', req.csrfToken());
            res.status(201).json({});
    });
};

module.exports = app;

// ROUTE HANDLERS

// PREDICTIONS
// get all predictions
app.get("/api/v1/predictions", async (req, res) => {
    try {
        const results = await db.query("SELECT p.prediction_id, p.user_id, a.username, p.user_prediction_status, p.claim_title, p.claim_major, p.timeframe, p.post_time, p.status, p.conc_reason, p.conc_reason_timestamp, v.plausible, v.implausible, v.correct, v.incorrect FROM predictions p INNER JOIN accounts a ON p.user_id = a.user_id INNER JOIN predictionVoteTallies v ON p.prediction_id = v.prediction_id ORDER BY p.post_time DESC");
        res.status(200).json({
            status: "success",
            message: "Successfully gathered all predictions.",
            results: results.rows.length,
            data: {
                predictions: results.rows,
            },
        });
    } catch (err) {
        console.log(err);
    };
});

// get all predictions whose timeframe date has passed
app.get("/api/v1/predictions/timeframe", async (req, res) => {
    try {
        // const results = await db.query("SELECT * FROM predictions WHERE user_prediction_status = 'Pending' AND timeframe <= NOW()");
        const results = await db.query("SELECT p.prediction_id, p.user_id, a.username, p.user_prediction_status, p.claim_title, p.claim_major, p.timeframe, p.post_time, p.status, p.conc_reason, p.conc_reason_timestamp, v.plausible, v.implausible, v.correct, v.incorrect FROM predictions p INNER JOIN accounts a ON p.user_id = a.user_id INNER JOIN predictionVoteTallies v ON p.prediction_id = v.prediction_id WHERE user_prediction_status = 'Pending' AND timeframe <= NOW()");
        res.status(200).json({
            status: "success",
            message: "Successfully gathered all predictions.",
            results: results.rows.length,
            data: {
                predictions: results.rows,
            },
        });
    } catch (err) {
        console.log(err);
    };
});

// get specific prediction
app.get("/api/v1/predictions/:id", async (req, res) => {
    try {
        const results = await db.query("SELECT p.prediction_id, p.user_id, a.username, p.user_prediction_status, p.claim_title, p.claim_major, p.timeframe, p.post_time, p.status, p.conc_reason, p.conc_reason_timestamp, v.plausible, v.implausible, v.correct, v.incorrect FROM predictions p INNER JOIN accounts a ON p.user_id = a.user_id INNER JOIN predictionVoteTallies v ON p.prediction_id = v.prediction_id WHERE p.prediction_id = $1", [req.params.id]);
        res.status(200).json({
            status: "success",
            message: `Successfully gathered prediction with id = ${results.rows[0].prediction_id}`,
            data: {
                prediction: results.rows[0],
            }
        });
    } catch (err) {
        console.log(err);
    };
});

// create prediction
app.post("/api/v1/predictions", async (req, res) => {
    try {
        // const { timeframe, post_time } = reb.body;

        // if (timeframe < post_time) {
        //     return res.status(401).json({
        //         status: "invalid timeframe",
        //         message: "Failed to register: Please include a Username.",
        //     });
        // };

        const results = await db.query("INSERT INTO predictions (user_id, user_prediction_status, claim_title, claim_major, timeframe, post_time, status, conc_reason, conc_reason_timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *", [req.body.user_id, req.body.user_prediction_status, req.body.claim_title, req.body.claim_major, req.body.timeframe, req.body.post_time, req.body.status, req.body.conc_reason, req.body.conc_reason_timestamp]);
        res.status(200).json({
            status: "success",
            message: "Successfully created a prediction.",
            data: {
                prediction: results.rows[0],
            }
        });
    } catch (err) {
        console.log(err);
    };
});

// update prediction
app.put("/api/v1/predictions/:id", async (req, res) => {
    try {
        const results = await db.query("UPDATE predictions SET user_id = $1, user_prediction_status = $2, claim_title = $3, claim_major = $4, timeframe = $5, post_time = $6, status = $7, conc_reason = $8, conc_reason_timestamp = $9 WHERE prediction_id = $10 RETURNING *", [req.body.user_id, req.body.user_prediction_status, req.body.claim_title, req.body.claim_major, req.body.timeframe, req.body.post_time, req.body.status, req.body.conc_reason, req.body.conc_reason_timestamp, req.params.id]);
        res.status(200).json({
            status: "success",
            message: "Successfully updated prediction.",
            data: {
                prediction: results.rows[0],
            }
        });
    } catch (err) {
        console.log(err);
    };
});

// delete prediction
app.delete("/api/v1/predictions/:id", async (req, res) => {
    try {
        await db.query("DELETE FROM predictions WHERE prediction_id = $1", [req.params.id]);
        res.status(204).json({
            status: "success",
            message: 'Successfully deleted prediction.'
        });
    } catch (err) {
        console.log(err);
    };
});

// delete prediction based on loggedUsername and status incomplete
app.delete("/api/v1/predictions/incomplete/:user_id", async (req, res) => {
    try {
        await db.query("DELETE FROM predictions WHERE user_id = $1 AND status = 'incomplete'", [req.params.user_id]);
        res.status(204).json({
            status: "success",
            message: 'Successfully deleted prediction.'
        });
    } catch (err) {
        console.log(err);
    };
});



// REASONS
// get all reasons
app.get("/api/v1/reasons", async (req, res) => {
    try {
        const results = await db.query("SELECT * FROM reasons");
        res.status(200).json({
            status: "success",
            message: "Successfully gathered all reasons.",
            data: {
                reasons: results.rows,
            }
        });
    } catch (err) {
        console.log(err);
    };
});

// get all reasons for a specific prediction
app.get("/api/v1/reasons/:prediction_id", async (req, res) => {
    try {
        const results = await db.query("SELECT * FROM reasons WHERE prediction_id = $1", [req.params.prediction_id]);
        res.status(200).json({
            status: "success",
            message: `Successfully gathered reasons for prediction with id = ${results.rows[0].prediction_id}`,
            data: {
                reasons: results.rows,
            }
        });
    } catch (err) {
        console.log(err);
    };
});

// create reason
app.post("/api/v1/reasons", async (req, res) => {
    try {
        const results = await db.query("INSERT INTO reasons (prediction_id, reason) VALUES ($1, $2) RETURNING *", [req.body.prediction_id, req.body.reason]);
        res.status(200).json({
            status: "success",
            message: "Successfully added a reason for a prediction.",
            data: {
                reason: results.rows[0]
            }
        });
    } catch (err) {
        console.log(err);
    };
});

// update reason
app.put("/api/v1/reasons/:id", async (req, res) => {
    try {
        const results = await db.query("UPDATE reasons SET reason = $1 WHERE reason_id = $2 RETURNING *", [req.body.reason, req.params.id]);
        res.status(200).json({
            status: "success",
            message: "Successfully updated reason.",
            data: {
                reason: results.rows[0],
            }
        });
    } catch (err) {
        console.log(err);
    };
});

// delete reason
app.delete("/api/v1/reasons/:id", async (req, res) => {
    try {
        await db.query("DELETE FROM reasons WHERE reason_id = $1", [req.params.id]);
        res.status(204).json({
            status: "success",
            message: 'Successfully deleted reason.'
        });
    } catch (err) {
        console.log(err);
    };
});



// SINGLE VOTES (handles votes when vote buttons are clicked)
// get all votes
app.get("/api/v1/votes", async (req, res) => {
    try {
        const results = await db.query("SELECT * FROM votes");
        res.status(200).json({
            status: "success",
            message: "Successfully gathered all vote tallies.",
            results: results.rows.length,
            data: {
                votes: results.rows,
            },
        });
    } catch (err) {
        console.log(err);
    }
});

// get all single votes for a specific prediction
app.get("/api/v1/votes/:prediction_id", async (req, res) => {
    try {
        const results = await db.query("SELECT * FROM votes WHERE prediction_id = $1", [req.params.prediction_id]);
        res.status(200).json({
            status: "success",
            message: `Successfully gathered all votes for prediction with id = ${req.params.prediction_id}.`,
            results: results.rows.length,
            data: {
                votes: results.rows,
            },
        });
    } catch (err) {
        console.log(err);
    }
});

// cast vote on prediction
app.post("/api/v1/votes", async (req, res) => {
    try {
        const results = await db.query("INSERT INTO votes (prediction_id, user_id, plausible, correct) VALUES ($1, $2, $3, $4) RETURNING *", [req.body.prediction_id, req.body.user_id, req.body.plausible, req.body.correct]);
        res.status(200).json({
            status: "success",
            message: "Successfully voted on plausibilty.",
            data: {
                vote: results.rows[0]
            }
        });
    } catch (err) {
        console.log(err);
    };
});

// update vote on prediction. Only necessary to update votes.correct value
app.put("/api/v1/votes/update/:prediction_id/:user_id", async (req, res) => {
    try {
        const results = await db.query("UPDATE votes SET correct = $1 WHERE prediction_id = $2 AND user_id = $3 RETURNING *", [req.body.correct, req.params.prediction_id, req.params.user_id]);
        res.status(200).json({
            status: "success",
            message: `Successfully updated correct vote for prediction with id = ${results.rows[0].prediction_id}.`,
            data: {
                vote: results.rows[0],
            }
        });
    } catch (err) {
        console.log(err);
    };
});



// VOTES TALLY TABLE (handles aggregating the single votes for a prediction into one place)
// get all vote tallies
app.get("/api/v1/votes/tallies", async (req, res) => {
    try {
        const results = await db.query("SELECT * FROM predictionVoteTallies WHERE");
        res.status(200).json({
            status: "success",
            message: `Successfully gathered all vote tallies.`,
            results: results.rows.length,
            data: {
                tallies: results.rows,
            },
        });
    } catch (err) {
        console.log(err);
    }
});

// get all vote tallies for a specific prediction
app.get("/api/v1/votes/tallies/:prediction_id", async (req, res) => {
    try {
        const results = await db.query("SELECT * FROM predictionVoteTallies WHERE prediction_id = $1", [req.params.prediction_id]);
        res.status(200).json({
            status: "success",
            message: `Successfully gathered all vote tallies for prediction with id = ${req.params.prediction_id}.`,
            results: results.rows.length,
            data: {
                tallies: results.rows[0],
            },
        });
    } catch (err) {
        console.log(err);
    }
});

// create vote tally table
app.post("/api/v1/votes/tallies", async (req, res) => {
    try {
        const results = await db.query("INSERT INTO predictionVoteTallies (prediction_id) VALUES ($1) RETURNING *", [req.body.prediction_id]);
        res.status(200).json({
            status: "success",
            message: `Successfully created tally table for prediction with id = ${results.rows[0].prediction_id}.`,
            data: {
                tallies: results.rows[0]
            }
        });
    } catch (err) {
        console.log(err);
    };
});

// update tally table
app.put("/api/v1/votes/tallies/:tally_value/:prediction_id", async (req, res) => {
    try {
        if (req.params.tally_value === "plausible") {
            const results = await db.query("UPDATE predictionVoteTallies SET plausible = plausible + 1 WHERE prediction_id = $1 RETURNING *", [req.params.prediction_id]);
            res.status(200).json({
                status: "success",
                message: `Successfully updated plausible tally for prediction with id = ${results.rows[0].prediction_id}.`,
                data: {
                    tally: results.rows[0],
                }
            });
        } else if (req.params.tally_value === "implausible") {
            const results = await db.query("UPDATE predictionVoteTallies SET implausible = implausible + 1 WHERE prediction_id = $1 RETURNING *", [req.params.prediction_id]);
            res.status(200).json({
                status: "success",
                message: `Successfully updated implausible tally for prediction with id = ${results.rows[0].prediction_id}.`,
                data: {
                    tally: results.rows[0],
                }
            });
        } else if (req.params.tally_value === "correct") {
            const results = await db.query("UPDATE predictionVoteTallies SET correct = correct + 1 WHERE prediction_id = $1 RETURNING *", [req.params.prediction_id]);
            res.status(200).json({
                status: "success",
                message: `Successfully updated correct tally for prediction with id = ${results.rows[0].prediction_id}.`,
                data: {
                    tally: results.rows[0],
                }
            });
        } else if (req.params.tally_value === "incorrect") {
            const results = await db.query("UPDATE predictionVoteTallies SET incorrect = incorrect + 1 WHERE prediction_id = $1 RETURNING *", [req.params.prediction_id]);
            res.status(200).json({
                status: "success",
                message: `Successfully updated incorrect tally for prediction with id = ${results.rows[0].prediction_id}.`,
                data: {
                    tally: results.rows[0],
                }
            });
        };
    } catch (err) {
        console.log(err);
    };
});



// SOURCES
// get all sources for a specific minor claim
app.get("/api/v1/sources/:minor_claim_id", async (req, res) => {
    try {
        const results = await db.query("SELECT * FROM sources WHERE minor_claim_id = $1", [req.params.minor_claim_id]);
        res.status(200).json({
            status: "success",
            message: `Successfully gathered sources for minor claim with id = ${results.rows[0].minor_claim_id}`,
            data: {
                sources: results.rows,
            }
        });
    } catch (err) {
        console.log(err);
    };
});

// add source to a specific minor claim
app.post("/api/v1/sources", async (req, res) => {
    try {
        const results = await db.query("INSERT INTO sources (minor_claim_id, source) VALUES ($1, $2) RETURNING *", [req.body.minor_claim_id, req.body.source]);
        res.status(200).json({
            status: "success",
            message: `Successfully added a source to minor claim with id = ${results.rows[0].minor_claim_id}`,
            data: {
                source: results.rows[0],
            }
        });
    } catch (err) {
        console.log(err);
    };
});

// delete source for a specific minor claim
app.delete("/api/v1/sources/:source_id", async (req, res) => {
    try {
        const results = await db.query("DELETE FROM sources WHERE source_id = $1", [req.params.source_id]);
        res.status(204).json({
            status: `successfully deleted source with source_id = ${req.params.source_id}`,
        });
    } catch (err) {
        console.log(err);
    };
});



// ACCOUNT RELATED
// get all users
app.get("/api/v1/accounts", async (req, res) => {
    try {
        const results = await db.query("SELECT user_id, username FROM accounts");
        res.status(200).json({
            status: "success",
            message: "Successfully retrieved all users' information.",
            data: {
                users: results.rows,
            }
        });
    } catch (err) {
        console.log(err);
    };
});
   
// Registration
app.post("/api/v1/accounts/register", validateCredentials, async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (username === "") {
            return res.status(401).json({
                status: "username missing",
                message: "Failed to register: Please include a Username.",
            });
        };
        if (email === "") {
            return res.status(401).json({
                status: "email missing",
                message: "Failed to register: Please include an Email Address.",
            });
        };
        if (password === "") {
            return res.status(401).json({
                status: "password missing",
                message: "Failed to register: Please include a Password.",
            });
        };
        
        const user = await db.query("SELECT * FROM accounts WHERE username = $1", [username]);
        const userEmail = await db.query("SELECT * FROM accounts WHERE email = $1", [email]);
        if (user.rows.length !== 0 && userEmail.rows.length !== 0) {
            return res.status(401).json({
                status: "username and email exist",
                message: {
                    username_exists: "Failed to register: Username already in use.",
                    email_exists: "Failed to register: Email already in use."
                }
            });
        } else if (user.rows.length !== 0) {
            return res.status(401).json({
                status: "username exists",
                message: "Failed to register: Username already exists.",
            });
        } else if (userEmail.rows.length !== 0) {
            return res.status(401).json({
                status: "email exists",
                message: "Failed to register: Email already in use.",
            });
        };

        const saltRound = 10;
        const salt = await bcrypt.genSalt(saltRound);
        const bcryptPassword = await bcrypt.hash(password, salt);

        const results = await db.query("INSERT INTO accounts (username, password, email) VALUES ($1, $2, $3) RETURNING *", [username, bcryptPassword, email]);

        const token = jwtGenerator(results.rows[0].user_id);
        res.status(201).json({
            status: "success",
            message: "Successfully registered new user account.",
            token
        });

    } catch (err) {
        console.log(err);
    };
});

// Login
app.post("/api/v1/accounts/login", validateCredentials, async (req, res) => {
    try {
        const { username, password } = req.body;

        // check if user does not exist
        const user = await db.query("SELECT * FROM accounts WHERE username = $1", [username]);
        if (user.rows.length === 0) {
            return res.status(401).json({
                status: "username failure",
                message: "Failed to log in: Username is incorrect."
            });
        };

        // check if input password is identical to password in database
        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            res.status(401).json({
                status: "password failure",
                message: "Failed to log in: Password is incorrect.",
            });
        };

        const token = jwtGenerator(user.rows[0].user_id);
        res.status(201).json({
            status: "success",
            message: "Successfully logged in.",
            token
        });
    } catch (err) {
        console.log(err);
    };
});

// JWT Verification
app.get("/api/v1/accounts/verification", authorization, async (req, res) => {
    try {
        res.json(true);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "failure",
            message: "Server error.",
        });
    };
});

// Dashboard
app.get("/api/v1/accounts/dashboard", authorization, async (req, res) => {
    try {
        const user = await db.query("SELECT user_id, username, prediction_score FROM accounts WHERE user_id = $1", [req.user]);
        res.json({
            status: "success",
            message: `Successfully gathered user information for ${user.rows[0].username}`,
            user: user.rows[0],
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "failure",
            message: "Server error.",
        });
    };
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server is up and listening on port ${port}`);
});