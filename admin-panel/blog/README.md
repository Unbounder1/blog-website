
```sql
CREATE TABLE blog_body (
    id SERIAL PRIMARY KEY,         -- Unique identifier for each row
    blog_id INT NOT NULL,          -- Foreign key referencing a blog
    body TEXT NOT NULL            -- Column to store the blog content
);
```

