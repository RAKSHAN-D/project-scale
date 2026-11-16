ALTER TABLE hot_items
    DROP CONSTRAINT IF EXISTS hot_items_item_key_key;

DROP INDEX IF EXISTS idx_hot_items_item_key;

ALTER TABLE hot_items
    ADD CONSTRAINT uk_hot_items_user_item_key
    UNIQUE (user_id, item_key);
