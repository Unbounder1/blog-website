package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	iface "github.com/unbounder1/blog-website/internal/interface"
)

/*
id: Unique identifier for the blog post (Primary Key).
	•	title: Title of the blog post.
	•	summary: Short summary or description of the blog.
	•	thumbnail_url: URL or path for the thumbnail image.
	•	created_at: Timestamp for when the blog was created.
	•	updated_at: Timestamp for the last update.
	•	author_id: Foreign key referencing the Users table.

*/

var db *sql.DB

// InitializeDatabase sets up the database connection.
func InitializeDatabase() {
	// Load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found. Using environment variables.")
	}

	dbHost := getEnv("DB_HOST", "localhost")
	dbPort := getEnv("DB_PORT", "5432")
	dbUser := getEnv("DB_USER", "postgres")
	dbPassword := getEnv("DB_PASSWORD", "")
	dbName := getEnv("DB_NAME", "postgres")
	dbSSLMode := getEnv("DB_SSLMODE", "disable")

	psqlInfo := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		dbHost, dbPort, dbUser, dbPassword, dbName, dbSSLMode)

	db, err = sql.Open("postgres", psqlInfo)
	if err != nil {
		log.Fatalf("Error opening database: %v", err)
	}

	// Verify the connection
	err = db.Ping()
	if err != nil {
		log.Fatalf("Error connecting to the database: %v", err)
	}

	log.Println("Successfully connected to the database!")
}

// getEnv retrieves environment variables or returns a default value.
func getEnv(key, defaultVal string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultVal
}

func main() {
	// Initialize the database connection
	InitializeDatabase()
	defer db.Close()

	// Create a new Gin router
	router := gin.Default()

	router.GET("/digest", func(c *gin.Context) {
		blogs, err := iface.GetBlogs(db)
		if err != nil {
			log.Printf("Error fetching blogs: %v", err)
			c.JSON(500, gin.H{"error": "Failed to fetch blogs"})
			return
		}
		c.JSON(200, blogs)
	})

	router.GET("/tags", func(c *gin.Context) {
		blogs, err := iface.GetTags(db)
		if err != nil {
			log.Printf("Error fetching blogs: %v", err)
			c.JSON(500, gin.H{"error": "Failed to fetch tags"})
			return
		}
		c.JSON(200, blogs)
	})

	// Start the server on the specified port
	port := getEnv("PORT", "8080")
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
