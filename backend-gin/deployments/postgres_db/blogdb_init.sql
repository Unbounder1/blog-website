-- Create blogdigestdb DATABASE
CREATE DATABASE blogdigestdb;

-- Create the blog_body table
CREATE TABLE public.blog_body (
    id SERIAL PRIMARY KEY,
    blog_id INTEGER NOT NULL,
    body TEXT NOT NULL
);

-- Create the blog_tags table
CREATE TABLE public.blog_tags (
    blog_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (blog_id, tag_id)
);

-- Create the blogdigest table
CREATE TABLE public.blogdigest (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT,
    thumbnail_url TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    slug TEXT UNIQUE
);

-- Create the tags table
CREATE TABLE public.tags (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Add Foreign Key Constraints
ALTER TABLE public.blog_body
ADD CONSTRAINT fk_blog_body_blog_id FOREIGN KEY (blog_id) REFERENCES public.blogdigest(id) ON DELETE CASCADE;

ALTER TABLE public.blog_tags
ADD CONSTRAINT fk_blog_tags_blog_id FOREIGN KEY (blog_id) REFERENCES public.blogdigest(id) ON DELETE CASCADE;

ALTER TABLE public.blog_tags
ADD CONSTRAINT fk_blog_tags_tag_id FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;