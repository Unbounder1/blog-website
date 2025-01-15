-- Create blogdigestdb DATABASE
CREATE DATABASE blogdigestdb;

-- Switch to the new database
\c blogdigestdb;

-- Create the blog_body table
CREATE TABLE blog_body (
    id SERIAL PRIMARY KEY,
    blog_id INTEGER NOT NULL UNIQUE, -- Enforce one-to-one relationship
    body TEXT NOT NULL
);

-- Create the blog_tags table
CREATE TABLE blog_tags (
    blog_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (blog_id, tag_id) -- Prevent duplicate tag assignments
);

-- Create the blogdigest table
CREATE TABLE blogdigest (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT,
    thumbnail_url TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    slug TEXT UNIQUE -- Unique slug for filtering
);

-- Create the tags table
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Foreign Key Constraints
ALTER TABLE blog_body
ADD CONSTRAINT fk_blog_body_blog_id FOREIGN KEY (blog_id) REFERENCES blogdigest(id) ON DELETE CASCADE;

ALTER TABLE blog_tags
ADD CONSTRAINT fk_blog_tags_blog_id FOREIGN KEY (blog_id) REFERENCES blogdigest(id) ON DELETE CASCADE;

ALTER TABLE blog_tags
ADD CONSTRAINT fk_blog_tags_tag_id FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE;

-- Indexes for Performance
CREATE INDEX idx_blogdigest_slug ON blogdigest(slug);
CREATE INDEX idx_blog_body_blog_id ON blog_body(blog_id);
CREATE INDEX idx_blog_tags_blog_id ON blog_tags(blog_id);
CREATE INDEX idx_blog_tags_tag_id ON blog_tags(tag_id);

-- Insert sample blog posts into blogdigest
INSERT INTO blogdigest (title, summary, thumbnail_url, slug)
VALUES 
('First Blog Post', 'This is the summary of the first blog post.', 'http://example.com/thumbnail1.jpg', 'first-blog-post'),
('Second Blog Post', 'Summary for the second blog post goes here.', 'http://example.com/thumbnail2.jpg', 'second-blog-post');

-- Insert blog bodies for each post
INSERT INTO blog_body (blog_id, body)
VALUES 
(1, 'This is the full body content of the first blog post.'),
(2, 'Detailed content for the second blog post.');

-- Insert sample tags
INSERT INTO tags (name)
VALUES 
('Technology'),
('Programming'),
('Lifestyle'),
('Travel');

-- Assign tags to blogs using blog_tags
INSERT INTO blog_tags (blog_id, tag_id) VALUES 
(1, 1),  -- First blog tagged with Technology
(1, 2),  -- First blog tagged with Programming
(2, 3),  -- Second blog tagged with Lifestyle
(2, 4);  -- Second blog tagged with Travel
