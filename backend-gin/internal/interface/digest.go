package iface

import (
	"database/sql"
	"fmt"
	"log"

	"github.com/lib/pq"
)

type blogDigest struct {
	ID            int      `json:"id"`
	Title         string   `json:"title"`
	Summary       string   `json:"summary"`
	Thumbnail_url string   `json:"thumbnail_url"`
	Created_at    string   `json:"created_at"`
	Updated_at    string   `json:"updated_at"`
	Tags          []string `json:"tags"`
}

// TODO: Implement sharded querying (10 at a time ie)
func GetBlogs(db *sql.DB) ([]blogDigest, error) {
	var digests []blogDigest

	rows, err := db.Query(`
	SET search_path TO public;
	
	SELECT
		b.id AS id,
		b.title AS title,
		b.summary AS summary,
		b.thumbnail_url AS thumbnail_url,
		b.created_at AS created_at,
		b.updated_at AS updated_at,
		ARRAY_AGG(t.name) AS tags
	FROM
		blogdigest b
	LEFT JOIN
		blog_tags bt ON b.id = bt.blog_id
	LEFT JOIN
		tags t ON bt.tag_id = t.id
	GROUP BY
		b.id
	`)
	if err != nil {
		return nil, fmt.Errorf("invalid query: %v", err)
	}
	defer rows.Close()
	for rows.Next() {
		var dig blogDigest
		err := rows.Scan(&dig.ID, &dig.Title, &dig.Summary, &dig.Thumbnail_url, &dig.Created_at, &dig.Updated_at, pq.Array(&dig.Tags))
		if err != nil {
			log.Fatalf("Error scanning row: %v", err)
		}
		digests = append(digests, dig)
	}
	return digests, err
}

func GetTags(db *sql.DB) ([]string, error) {
	var tagList []string
	rows, err := db.Query("SELECT name FROM tags")
	if err != nil {
		return nil, fmt.Errorf("invalid query: %v", err)
	}
	defer rows.Close()
	for rows.Next() {
		var tag string
		err := rows.Scan(&tag)
		if err != nil {
			log.Fatalf("Error scanning row: %v", err)
		}
		tagList = append(tagList, tag)
	}
	return tagList, err
}

func GetTitles(db *sql.DB) ([]string, error) {
	var titles []string

	// Query only the titles from the database
	rows, err := db.Query(`
	SELECT
		slug
	FROM
		blogdigest
	`)
	if err != nil {
		return nil, fmt.Errorf("invalid query: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var title string
		err := rows.Scan(&title)
		if err != nil {
			log.Fatalf("Error scanning row: %v", err)
		}
		titles = append(titles, title)
	}

	// Check for errors encountered during iteration
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error during row iteration: %v", err)
	}

	return titles, nil
}
