CREATE INDEX idx_users_email
    ON users (email);

CREATE INDEX idx_hot_items_item_key
    ON hot_items (item_key);

CREATE INDEX idx_hot_items_user_id
    ON hot_items (user_id);

CREATE INDEX idx_cold_items_user_id
    ON cold_items (user_id);

CREATE INDEX idx_static_assets_filename
    ON static_assets (filename);

CREATE INDEX idx_static_assets_uploaded_by
    ON static_assets (uploaded_by);
