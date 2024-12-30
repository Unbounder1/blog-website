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

	rows, err := db.Query("SELECT * FROM blogdigest")
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
