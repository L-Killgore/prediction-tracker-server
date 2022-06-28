CREATE TABLE accounts (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR ( 255 ) UNIQUE NOT NULL,
    password VARCHAR ( 255 ) NOT NULL,
    email VARCHAR ( 255 ) UNIQUE NOT NULL,
    prediction_score INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE predictions (
    prediction_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES accounts(user_id) ON DELETE CASCADE,
    user_prediction_status VARCHAR ( 7 ) NOT NULL,
    claim_title VARCHAR ( 100 ) NOT NULL,
    -- consider increasing claim_title limit to 264 as well
    claim_major VARCHAR ( 264 ) NOT NULL,
    post_time TIMESTAMPTZ NOT NULL,
    timeframe TIMESTAMPTZ NOT NULL,
    status VARCHAR ( 10 ) NOT NULL,
    conc_reason TEXT,
    conc_reason_timestamp TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE reasons (
    reason_id SERIAL PRIMARY KEY,
    prediction_id INT NOT NULL REFERENCES predictions(prediction_id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE votes (
    vote_id SERIAL PRIMARY KEY,
    prediction_id INT NOT NULL REFERENCES predictions(prediction_id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES accounts(user_id) ON DELETE CASCADE,
    plausible BOOLEAN,
    correct BOOLEAN,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE prediction_vote_tallies (
    tally_id SERIAL PRIMARY KEY,
    prediction_id INT NOT NULL REFERENCES predictions(prediction_id) ON DELETE CASCADE,
    plausible INT DEFAULT 0,
    implausible INT DEFAULT 0,
    correct INT DEFAULT 0,
    incorrect INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);


-- HAVE TO ADD THESE COMMENT MODELS MANUALLY INTO APP DATABASE --
CREATE TABLE comments (
    comment_id SERIAL PRIMARY KEY,
    prediction_id INT NOT NULL REFERENCES predictions(prediction_id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES accounts(user_id) ON DELETE CASCADE,
    username VARCHAR ( 255 ) NOT NULL,
    super_parent_id INT DEFAULT 0,
    parent_id INT DEFAULT 0,
    child_count INT DEFAULT 0,
    child_value INT DEFAULT 0,
    comment TEXT NOT NULL,
    likes INT DEFAULT 0,
    dislikes INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE comment_votes (
    comment_vote_id SERIAL PRIMARY KEY,
    comment_id INT NOT NULL REFERENCES comments(comment_id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES accounts(user_id) ON DELETE CASCADE,
    likes BOOLEAN,
    dislikes BOOLEAN,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);


CREATE TABLE sources (
    source_id SERIAL PRIMARY KEY,
    reason_id INT NOT NULL REFERENCES reasons(reason_id) ON DELETE CASCADE,
    source VARCHAR ( 264 ) NOT NULL
);