package admin_iface

import "database/sql"

/*
Insertion Format JSON:
blogdigest:
	id:
	title:
	summary:
	thumbnail_url:
	created_at:
	updated_at:

tags:
	id:
	name:

blog_tags: (join table)


CREATE TABLE blogdigest (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    thumbnail_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE blog_tags (
    blog_id INT REFERENCES blogs(id) ON DELETE CASCADE,
    tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (blog_id, tag_id)
);
*/

func insertBlog(db *sql.DB, blogJson string) error {

}
