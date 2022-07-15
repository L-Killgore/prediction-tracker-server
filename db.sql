CREATE TABLE accounts (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR ( 255 ) UNIQUE NOT NULL,
    password VARCHAR ( 255 ) NOT NULL,
    email VARCHAR ( 255 ) UNIQUE NOT NULL,
    prediction_score INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

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

CREATE TABLE predictions (
    prediction_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES accounts(user_id) ON DELETE CASCADE,
    user_prediction_status VARCHAR ( 7 ) NOT NULL,
    claim_title VARCHAR ( 100 ) NOT NULL,
    -- consider increasing claim_title limit to 264 as well
    claim_major VARCHAR ( 264 ) NOT NULL,
    post_time TIMESTAMPTZ NOT NULL,
    timeframe TIMESTAMPTZ NOT NULL,
    category VARCHAR ( 24 ) NOT NULL,
    status VARCHAR ( 10 ) NOT NULL,
    conc_reason TEXT,
    conc_reason_timestamp TIMESTAMPTZ,
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

CREATE TABLE reasons (
    reason_id SERIAL PRIMARY KEY,
    prediction_id INT NOT NULL REFERENCES predictions(prediction_id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE sources (
    source_id SERIAL PRIMARY KEY,
    reason_id INT NOT NULL REFERENCES reasons(reason_id) ON DELETE CASCADE,
    source_type VARCHAR ( 24 ),
    author1_last VARCHAR ( 264 ),
    author1_initial VARCHAR ( 10 ),
    author1_first VARCHAR ( 264 ),
    author2_last VARCHAR ( 264 ),
    author2_initial VARCHAR ( 10 ),
    author2_first VARCHAR ( 264 ),
    et_al BOOLEAN DEFAULT FALSE,
    publication_date DATE,
    accessed_date DATE,
    title VARCHAR ( 400 ),
    edition VARCHAR ( 15 ),
    volume VARCHAR ( 15 ),
    issue VARCHAR ( 15 ),
    pages VARCHAR ( 15 ),
    database_name VARCHAR ( 264 ),
    publisher_name VARCHAR ( 264 ),
    uploader_name VARCHAR ( 264 ),
    url TEXT,
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