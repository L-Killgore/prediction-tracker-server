CREATE TABLE accounts (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR ( 255 ) UNIQUE NOT NULL,
    password VARCHAR ( 255 ) NOT NULL,
    email VARCHAR ( 255 ) UNIQUE NOT NULL,
    prediction_score INT DEFAULT 0
);

CREATE TABLE predictions (
    prediction_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES accounts(user_id) ON DELETE CASCADE,
    user_prediction_status VARCHAR ( 7 ) NOT NULL,
    claim_title VARCHAR ( 100 ) NOT NULL,
    claim_major VARCHAR ( 264 ) NOT NULL,
    post_time TIMESTAMPTZ NOT NULL,
    timeframe DATE NOT NULL,
    status VARCHAR ( 10 ) NOT NULL,
    conc_reason TEXT,
    conc_reason_timestamp TIMESTAMPTZ
);

CREATE TABLE reasons (
    reason_id SERIAL PRIMARY KEY,
    prediction_id INT NOT NULL REFERENCES predictions(prediction_id) ON DELETE CASCADE,
    reason TEXT NOT NULL
);

CREATE TABLE votes (
    vote_id SERIAL PRIMARY KEY,
    prediction_id INT NOT NULL REFERENCES predictions(prediction_id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES accounts(user_id) ON DELETE CASCADE,
    plausible BOOLEAN,
    correct BOOLEAN
);

CREATE TABLE predictionVoteTallies (
    tally_id SERIAL PRIMARY KEY,
    prediction_id INT NOT NULL REFERENCES predictions(prediction_id) ON DELETE CASCADE,
    plausible INT DEFAULT 0,
    implausible INT DEFAULT 0,
    correct INT DEFAULT 0,
    incorrect INT DEFAULT 0
);


CREATE TABLE sources (
    source_id SERIAL PRIMARY KEY,
    reason_id INT NOT NULL REFERENCES reasons(reason_id) ON DELETE CASCADE,
    source VARCHAR ( 264 ) NOT NULL
);

CREATE TABLE discussion_nodes

CREATE TABLE comments



SELECT
	p.prediction_id,
	pl.plausible,
	co.correct
FROM
	predictions p
INNER JOIN is_plausible pl
	ON pl.prediction_id = p.prediction_id
INNER JOIN is_correct co
	ON co.prediction_id = p.prediction_id
ORDER BY p.prediction_id;