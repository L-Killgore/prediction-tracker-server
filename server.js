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

// COMMENTS
// get all comments
app.get("/api/v1/comments/all", async (req, res) => {
  try {
    const results = await db.Comment.findAll({
      include: [
        { model: db.Account }
      ]
    });
    
    res.status(200).json({
      status: "success",
      message: "Successfully gathered all comments.",
      results: results.length,
      data: {
        comments: results
      }
    });

  } catch (err) {
    console.log(err);
  };
});

// get all comments for a specific prediction
app.get("/api/v1/comments/:prediction_id", async (req, res) => {
  try {
    const { prediction_id } = req.params;

    const results = await db.Comment.findAll({
      where: { prediction_id: prediction_id },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      status: "success",
      message: `Successfully gathered all comments for prediction with id = ${results.prediction_id}`,
      data: {
        comments: results,
      }
    });
  } catch (err) {
    console.log(err);
  };
});

// create comment
app.post("/api/v1/comments/create", async (req, res) => {
  try {
    const { prediction_id, user_id, username, super_parent_id, parent_id, child_value, comment } = req.body;

    const results = await db.Comment.create({
      prediction_id,
      user_id,
      username,
      super_parent_id,
      parent_id,
      child_value,
      comment,
    });

    res.status(200).json({
      status: "success",
      message: "Successfully created a comment.",
      data: {
        comment: results,
      }
    });
  } catch (err) {
    console.log(err);
  };
});

// delete comment
app.delete("/api/v1/comments/:comment_id", async (req, res) => {
  try {
    const { comment_id } = req.params;

    await db.Comment.destroy({
      where: { comment_id: comment_id }
    });

    res.status(204).json({
      status: "success",
      message: 'Successfully deleted comment.'
    });
  } catch (err) {
    console.log(err);
  };
});



// COMMENT VOTES
// get all comment votes
app.get("/api/v1/comment_votes", async (req, res) => {
  try {
    const results = await db.CommentVote.findAll();

    res.status(200).json({
      status: "success",
      message: "Successfully gathered all vote tallies.",
      results: results.length,
      data: {
        commentVotes: results
      }
    });
  } catch (err) {
    console.log(err);
  }
});

// get all single votes for a specific comment
app.get("/api/v1/comment-votes/:comment_id", async (req, res) => {
  try {
    const { comment_id } = req.params;

    const results = await db.CommentVote.findAll({
      where: { comment_id: comment_id }
    });

    res.status(200).json({
      status: "success",
      message: `Successfully gathered all votes for comment with id = ${comment_id}.`,
      results: results.length,
      data: {
        commentVotes: results
      }
    });
  } catch (err) {
    console.log(err);
  }
});

// cast vote on comment
app.post("/api/v1/comment-votes", async (req, res) => {
  try {
    const { comment_id, user_id, likes, dislikes } = req.body;

    const results = await db.CommentVote.create({
      comment_id,
      user_id,
      likes,
      dislikes
    });

    res.status(200).json({
      status: "success",
      message: "Successfully voted on comment.",
      data: {
        commentVote: results
      }
    });
  } catch (err) {
    console.log(err);
  };
});

// update comment vote for specific comment from specific user
app.put("/api/v1/comment-votes/:comment_vote_id", async (req, res) => {
  try {
    const { comment_id, user_id, likes, dislikes } = req.body;
    const { comment_vote_id } = req.params;

    const results = await db.CommentVote.update({
      comment_id,
      user_id,
      likes,
      dislikes
    }, {
      where: { comment_vote_id: comment_vote_id }
    });

    console.log(results);

    res.status(200).json({
      status: "success",
      message: "Successfully updated a vote on a comment.",
      data: {
        commentVote: results
      }
    });
  } catch (err) {
    console.log(err);
  };
});

// update comment vote (just for like and dislike count right now)
app.put("/api/v1/comment-votes/:parameter/:comment_id", async (req, res) => {
  try {
    const { comment_id, parameter } = req.params;

    if (parameter === "like-add") {
      await db.Comment.increment({
        likes: 1
      }, {
        where: { comment_id: comment_id },
        // returning: true,
        // plain: true
      });
    } else if (parameter === "dislike-add") {
      await db.Comment.increment({
        dislikes: 1
      }, {
        where: { comment_id: comment_id },
        // returning: true,
        // plain: true
      });
    } else if (parameter === "like-remove") {
      await db.Comment.decrement({
        likes: 1
      }, {
        where: { comment_id: comment_id },
        // returning: true,
        // plain: true
      });
    } else if (parameter === "dislike-remove") {
      await db.Comment.decrement({
        dislikes: 1
      }, {
        where: { comment_id: comment_id },
        // returning: true,
        // plain: true
      });
    };

    res.status(200).json({
      status: "success",
      message: `Successfully updated like count for comment with id = ${comment_id}.`
    });
  } catch (err) {
    console.log(err);
  };
});



// PREDICTIONS
// get all predictions
app.get("/api/v1/predictions/all", async (req, res) => {
  try {
    const results = await db.Prediction.findAll({
      include: [
        { model: db.Account },
        { model: db.Comment },
        { model: db.PredictionVoteTally }
      ],
      order: [['post_time', 'DESC']]
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
        { model: db.Comment },
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
    const results = await db.Reason.findAll({
      include: [
        { model: db.Source }
      ]
    });

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
      include: [
        { model: db.Source }
      ],
      where: { prediction_id: prediction_id },
      order: [['reason_id', 'ASC']]
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



// SOURCES
// get all sources for a specific reason
app.get("/api/v1/sources/:reason_id", async (req, res) => {
  try {
    const { reason_id } = req.params;

    const results = await db.Source.findAll({
      where: { reason_id: reason_id }
    });

    res.status(200).json({
      status: "success",
      message: `Successfully gathered sources for reason with id = ${reason_id}`,
      data: {
        sources: results
      }
    });
  } catch (err) {
    console.log(err);
  };
});

// add source to a specific reason
app.post("/api/v1/sources", async (req, res) => {
  try {
    const { reason_id, source_type, author1_last, author1_initial, author1_first, author2_last, author2_initial, author2_first, et_al, publication_date, publisher_name, title, edition, volume, issue, pages,  url, database_name, uploader_name, accessed_date } = req.body;

    const results = await db.Source.create({
      reason_id,
      source_type,
      author1_last,
      author1_initial,
      author1_first,
      author2_last,
      author2_initial,
      author2_first,
      et_al,
      publication_date,
      publisher_name,
      title,
      edition,
      volume,
      issue,
      pages,
      url,
      database_name,
      uploader_name,
      accessed_date
    },{
      returning: true,
      plain: true
    });

    res.status(200).json({
      status: "success",
      message: `Successfully added a source to reason with id = ${reason_id}`,
      data: {
        source: results
      }
    });
  } catch (err) {
    console.log(err);
  };
});

app.put("/api/v1/sources/:source_id", async (req, res) => {
  try {
    const { source_id } = req.params;
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

// delete source for a specific reason
app.delete("/api/v1/sources/:source_id", async (req, res) => {
  try {
    const { source_id } = req.params;

    await db.Source.destroy({
      where: { source_id: source_id }
    });

    res.status(204).json({
      status: `successfully deleted source with source_id = ${source_id}`,
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

    if (user || userEmail) {
      return res.status(401).json({
        status: "username and email exist",
        message: {
          username_exists: "Failed to register: Username already in use.",
          email_exists: "Failed to register: Email already in use."
        }
      });
    } else if (user) {
      return res.status(401).json({
        status: "username exists",
        message: "Failed to register: Username already exists."
      });
    } else if (userEmail) {
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

    if (!user) {
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