-- Create viewed_posts table to track which posts users have viewed
CREATE TABLE IF NOT EXISTS viewed_posts (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    post_id TEXT NOT NULL,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_viewed_posts_user_id ON viewed_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_viewed_posts_post_id ON viewed_posts(post_id);
CREATE INDEX IF NOT EXISTS idx_viewed_posts_viewed_at ON viewed_posts(viewed_at);

-- Add foreign key constraints if the referenced tables exist
-- Note: Uncomment these if you want to enforce referential integrity
-- ALTER TABLE viewed_posts ADD CONSTRAINT fk_viewed_posts_user_id 
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
-- ALTER TABLE viewed_posts ADD CONSTRAINT fk_viewed_posts_post_id 
--     FOREIGN KEY (post_id) REFERENCES posts(postId) ON DELETE CASCADE;
