package iface

import (
	"database/sql"
	"errors"

	"github.com/lib/pq"
)

type blogFull struct {
	ID         int      `json:"id"`
	Title      string   `json:"title"`
	Created_at string   `json:"created_at"`
	Updated_at string   `json:"updated_at"`
	Tags       []string `json:"tags"`
	Body       string   `json:"body"`
}

func GetBlogPage(db *sql.DB, slug string) (*blogFull, error) {
	query := `
	SELECT
		b.id AS id,
		b.title AS title,
		b.created_at AS created_at,
		b.updated_at AS updated_at,
		ARRAY_AGG(t.name) AS tags,
		bb.body AS body
	FROM
		blogdigest b
	LEFT JOIN
		blog_tags bt ON b.id = bt.blog_id
	LEFT JOIN
		tags t ON bt.tag_id = t.id
	LEFT JOIN
		blog_body bb ON b.id = bb.blog_id
	WHERE
		b.slug = $1
	GROUP BY
		b.id, bb.body;
	`

	row := db.QueryRow(query, slug)

	var blog blogFull
	var tags pq.StringArray
	var body sql.NullString

	err := row.Scan(
		&blog.ID,
		&blog.Title,
		&blog.Created_at,
		&blog.Updated_at,
		&tags,
		&body,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("blog not found")
		}
		return nil, err
	}

	blog.Tags = tags
	if body.Valid {
		blog.Body = body.String
	} else {
		blog.Body = ""
	}

	return &blog, nil
}
