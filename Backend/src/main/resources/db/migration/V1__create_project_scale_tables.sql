CREATE TYPE user_role AS ENUM (
    'ADMIN',
    'FIRST_CLASS',
    'SECOND_CLASS'
);

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE hot_items (
    id BIGSERIAL PRIMARY KEY,
    item_key VARCHAR(100) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    value JSONB,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT fk_hot_items_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
);

CREATE TABLE cold_items (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(20) NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT fk_cold_items_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
);

CREATE TABLE static_assets (
    id BIGSERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL UNIQUE,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_by BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT fk_static_assets_uploaded_by
        FOREIGN KEY (uploaded_by)
        REFERENCES users (id)
);
