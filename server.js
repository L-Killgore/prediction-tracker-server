// Imports
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwtGenerator = require("./utils/jwtGenerator");
const authorization = require("./middleware/authorization");
const cors = require("cors");
const express = require("express");
const path = require('path');
const morgan = require("morgan");
const db = require("./db");
const { Op, sequelize } = require("sequelize");
const validateCredentials = require("./middleware/validateCredentials");
const app = express();
const now = Date.now();

// Non-imported Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// ROUTE HANDLERS

// PREDICTIONS
// get all predictions
app.get("/api/v1/predictions", async (req, res) => {
  try {
    const results = await db.Prediction.findAll({
      include: [
        { model: db.Account },
        { model: db.PredictionVoteTally }
      ]
    });

    res.status(200).json({
      status: "success",
      message: "Successfully gathered all predictions.",
      results: results.length,
      data: {
        predictions: results
      }
    });

  } catch (err) {
    console.log(err);
  };
});

// get all predictions whose timeframe date has passed
app.get("/api/v1/predictions/timeframe", async (req, res) => {
  try {
    const results = await db.Prediction.findAll({
      include: [
        { model: db.Account },
        { model: db.PredictionVoteTally }
      ],
      where: {
        user_prediction_status: 'Pending',
        timeframe: { [Op.lte]: now }
      }
    });

    res.status(200).json({
      status: "success",
      message: "Successfully gathered all predictions.",
      results: results.length,
      data: {
        predictions: results,
      },
    });
  } catch (err) {
    console.log(err);
  };
});

// get specific prediction
app.get("/api/v1/predictions/:id", async (req, res) => {
  try {
    const results = await db.Prediction.findOne({
      include: [
        { model: db.Account },
        { model: db.PredictionVoteTally }
      ],
      where: { prediction_id: req.params.id }
    });

    res.status(200).json({
      status: "success",
      message: `Successfully gathered prediction with id = ${results.prediction_id}`,
      data: {
        prediction: results,
      }
    });
  } catch (err) {
    console.log(err);
  };
});

// create prediction
app.post("/api/v1/predictions", async (req, res) => {
  try {
    const { user_id, user_prediction_status, claim_title, claim_major, timeframe, post_time, status, conc_reason, conc_reason_timestamp } = req.body;

    const results = await db.Prediction.create({
      user_id,
      user_prediction_status,
      claim_title,
      claim_major,
      timeframe,
      post_time,
      status,
      conc_reason,
      conc_reason_timestamp
    });

    res.status(200).json({
      status: "success",
      message: "Successfully created a prediction.",
      data: {
        prediction: results,
      }
    });
  } catch (err) {
    console.log(err);
  };
});

// update prediction
app.put("/api/v1/predictions/:id", async (req, res) => {
  try {
    const { user_id, user_prediction_status, claim_title, claim_major, timeframe, post_time, status, conc_reason, conc_reason_timestamp } = req.body;
    const { id } = req.params;

    const results = await db.Prediction.update({
      user_id,
      user_prediction_status,
      claim_title,
      claim_major,
      timeframe,
      post_time,
      status,
      conc_reason,
      conc_reason_timestamp
    }, {
      where: { prediction_id: id }
    });

    res.status(200).json({
      status: "success",
      message: "Successfully updated prediction.",
      data: {
        prediction: results,
      }
    });
  } catch (err) {
    console.log(err);
  };
});

// delete prediction
app.delete("/api/v1/predictions/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.Prediction.destroy({
      where: { prediction_id: id }
    });

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
    const { user_id } = req.params;

    await db.Prediction.destroy({
      where: {
        user_id: user_id,
        status: 'incomplete'
      }
    });

    console.log('deleted shit')

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
    const results = await db.Reason.findAll();

    res.status(200).json({
      status: "success",
      message: "Successfully gathered all reasons.",
      data: {
        reasons: results,
      }
    });
  } catch (err) {
    console.log(err);
  };
});

// get all reasons for a specific prediction
app.get("/api/v1/reasons/:prediction_id", async (req, res) => {
  try {
    const { prediction_id } = req.params;
    const results = await db.Reason.findAll({
      where: { prediction_id: prediction_id }
    });

    res.status(200).json({
      status: "success",
      message: `Successfully gathered reasons for prediction with id = ${results.prediction_id}`,
      data: {
        reasons: results,
      }
    });
  } catch (err) {
    console.log(err);
  };
});

// create reason
app.post("/api/v1/reasons", async (req, res) => {
  try {
    const { prediction_id, reason } = req.body;

    const results = await db.Reason.create({
      prediction_id,
      reason
    });

    res.status(200).json({
      status: "success",
      message: "Successfully added a reason for a prediction.",
      data: {
        reason: results
      }
    });
  } catch (err) {
    console.log(err);
  };
});

// update reason
app.put("/api/v1/reasons/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const results = await db.Reason.update({
      reason
    }, {
      where: { reason_id: id }
    });

    res.status(200).json({
      status: "success",
      message: "Successfully updated reason.",
      data: {
        reason: results
      }
    });
  } catch (err) {
    console.log(err);
  };
});

// delete reason
app.delete("/api/v1/reasons/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.Reason.destroy({
      where: { reason_id: id }
    });

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
    const results = await db.Vote.findAll();

    res.status(200).json({
      status: "success",
      message: "Successfully gathered all vote tallies.",
      results: results.length,
      data: {
        votes: results
      }
    });
  } catch (err) {
    console.log(err);
  }
});

// get all single votes for a specific prediction
app.get("/api/v1/votes/:prediction_id", async (req, res) => {
  try {
    const { prediction_id } = req.params;

    const results = await db.Vote.findAll({
      where: { prediction_id: prediction_id }
    });

    res.status(200).json({
      status: "success",
      message: `Successfully gathered all votes for prediction with id = ${prediction_id}.`,
      results: results.length,
      data: {
        votes: results
      }
    });
  } catch (err) {
    console.log(err);
  }
});

// cast vote on prediction
app.post("/api/v1/votes", async (req, res) => {
  try {
    const { prediction_id, user_id, plausible, correct } = req.body;

    const results = await db.Vote.create({
      prediction_id,
      user_id,
      plausible,
      correct
    });

    res.status(200).json({
      status: "success",
      message: "Successfully voted on plausibilty.",
      data: {
        vote: results
      }
    });
  } catch (err) {
    console.log(err);
  };
});

// update vote on prediction. Only necessary to update votes.correct value
app.put("/api/v1/votes/update/:prediction_id/:user_id", async (req, res) => {
  try {
    const { prediction_id, user_id } = req.params;
    const { correct } = req.body;

    const results = await db.Vote.update({
      correct
    }, {
      where: {
        prediction_id: prediction_id,
        user_id: user_id
      }
    });

    res.status(200).json({
      status: "success",
      message: `Successfully updated correct vote for prediction with id = ${prediction_id}.`,
      data: {
        vote: results
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
    const results = await db.PredictionVoteTally.findAll();

    res.status(200).json({
      status: "success",
      message: `Successfully gathered all vote tallies.`,
      results: results.length,
      data: {
        tallies: results
      }
    });
  } catch (err) {
    console.log(err);
  }
});

// get all vote tallies for a specific prediction
app.get("/api/v1/votes/tallies/:prediction_id", async (req, res) => {
  try {
    const { prediction_id } = req.params;

    const results = await db.PredictionVoteTally.findOne({
      where: { prediction_id: prediction_id }
    });

    res.status(200).json({
      status: "success",
      message: `Successfully gathered all vote tallies for prediction with id = ${prediction_id}.`,
      results: results.length,
      data: {
        tallies: results
      }
    });
  } catch (err) {
    console.log(err);
  }
});

// create vote tally table
app.post("/api/v1/votes/tallies", async (req, res) => {
  try {
    const { prediction_id } = req.body;

    const results = await db.PredictionVoteTally.create({
      prediction_id
    });

    res.status(200).json({
      status: "success",
      message: `Successfully created tally table for prediction with id = ${prediction_id}.`,
      data: {
        tallies: results
      }
    });
  } catch (err) {
    console.log(err);
  };
});

// update tally table
app.put("/api/v1/votes/tallies/:tally_value/:prediction_id", async (req, res) => {
  try {
    const { tally_value, prediction_id } = req.params;

    if (tally_value === "plausible") {
      const results = await db.PredictionVoteTally.increment({
        plausible: 1
      }, {
        where: { prediction_id: prediction_id }
      });

      res.status(200).json({
        status: "success",
        message: `Successfully updated plausible tally for prediction with id = ${prediction_id}.`,
        data: {
          tally: results
        }
      });
    } else if (tally_value === "implausible") {
      const results = await db.PredictionVoteTally.increment({
        implausible: 1
      }, {
        where: { prediction_id: prediction_id }
      });

      res.status(200).json({
        status: "success",
        message: `Successfully updated implausible tally for prediction with id = ${prediction_id}.`,
        data: {
          tally: results
        }
      });
    } else if (tally_value === "correct") {
      const results = await db.PredictionVoteTally.increment({
        correct: 1
      }, {
        where: { prediction_id: prediction_id }
      });

      res.status(200).json({
        status: "success",
        message: `Successfully updated correct tally for prediction with id = ${prediction_id}.`,
        data: {
          tally: results
        }
      });
    } else if (tally_value === "incorrect") {
      const results = await db.PredictionVoteTally.increment({
        incorrect: 1
      }, {
        where: { prediction_id: prediction_id }
      });

      res.status(200).json({
        status: "success",
        message: `Successfully updated incorrect tally for prediction with id = ${prediction_id}.`,
        data: {
          tally: results
        }
      });
    };
  } catch (err) {
    console.log(err);
  };
});



// SOURCES not yet implemented
// get all sources for a specific minor claim
app.get("/api/v1/sources/:minor_claim_id", async (req, res) => {
  try {
    const { minor_claim_id } = req.params;

    const results = await db.Source.findAll({
      where: { minor_claim_id: minor_claim_id }
    });

    res.status(200).json({
      status: "success",
      message: `Successfully gathered sources for minor claim with id = ${minor_claim_id}`,
      data: {
        sources: results
      }
    });
  } catch (err) {
    console.log(err);
  };
});

// add source to a specific minor claim
app.post("/api/v1/sources", async (req, res) => {
  try {
    const { minor_claim_id, source } = req.body;

    const results = await db.Source.create({
      minor_claim_id,
      source
    });

    res.status(200).json({
      status: "success",
      message: `Successfully added a source to minor claim with id = ${minor_claim_id}`,
      data: {
        source: results
      }
    });
  } catch (err) {
    console.log(err);
  };
});

// delete source for a specific minor claim
app.delete("/api/v1/sources/:source_id", async (req, res) => {
  try {
    const { source_id } = req.params;

    const results = await db.Source.destroy({
      where: { source_id: source_id }
    });

    res.status(204).json({
      status: `successfully deleted source with source_id = ${source_id}`,
    });
  } catch (err) {
    console.log(err);
  };
});



// ACCOUNT RELATED
// get all users
app.get("/api/v1/accounts", async (req, res) => {
  try {
    const results = await db.Account.findAll({
      attributes: ['user_id', 'username']
    });

    res.status(200).json({
      status: "success",
      message: "Successfully retrieved all users' information.",
      data: {
        users: results
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
        message: "Failed to register: Please include a Username."
      });
    };
    if (email === "") {
      return res.status(401).json({
        status: "email missing",
        message: "Failed to register: Please include an Email Address."
      });
    };
    if (password === "") {
      return res.status(401).json({
        status: "password missing",
        message: "Failed to register: Please include a Password."
      });
    };
        
    const user = await db.Account.findOne({
      where: { username: username }
    });
    const userEmail = await db.Account.findOne({
      where: { email: email }
    });

    if (user.length !== 0 && userEmail.length !== 0) {
      return res.status(401).json({
        status: "username and email exist",
        message: {
          username_exists: "Failed to register: Username already in use.",
          email_exists: "Failed to register: Email already in use."
        }
      });
    } else if (user.length !== 0) {
      return res.status(401).json({
        status: "username exists",
        message: "Failed to register: Username already exists."
      });
    } else if (userEmail.length !== 0) {
      return res.status(401).json({
        status: "email exists",
        message: "Failed to register: Email already in use."
      });
    };

    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const bcryptPassword = await bcrypt.hash(password, salt);

    const results = await db.Account.create({
      username: username,
      password: bcryptPassword,
      email: email
    });

    const token = jwtGenerator(results.user_id);
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
    const user = await db.Account.findOne({
      where: { username: username }
    });

    if (user.length === 0) {
      return res.status(401).json({
        status: "username failure",
        message: "Failed to log in: Username is incorrect."
      });
    };

    // check if input password is identical to password in database
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(401).json({
        status: "password failure",
        message: "Failed to log in: Password is incorrect."
      });
    };

    const token = jwtGenerator(user.user_id);
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
      message: "Server error."
    });
  };
});

// Dashboard
app.get("/api/v1/accounts/dashboard", authorization, async (req, res) => {
  try {
    const user = await db.Account.findOne({
      attributes: ['user_id', 'username', 'prediction_score'],
      where: { user_id: req.user }
    });

    res.json({
      status: "success",
      message: `Successfully gathered user information for ${user.username}`,
      user: user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: "failure",
      message: "Server error."
    });
  };
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server is up and listening on port ${port}`);
});