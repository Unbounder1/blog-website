package main

import (
	"database/sql"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	iface "github.com/unbounder1/blog-website/internal/interface"
	"github.com/unbounder1/blog-website/internal/middleware"
)

var db *sql.DB
var minioClient *minio.Client

// InitializeDatabase sets up the database connection.
func InitializeDatabase() {
	// Load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found. Using environment variables.")
	}

	dbHost := getEnv("POSTGRES_HOST", "localhost")
	dbPort := getEnv("POSTGRES_PORT", "5432")
	dbUser := getEnv("POSTGRES_USER", "postgres")
	dbPassword := getEnv("POSTGRES_PASSWORD", "")
	dbName := getEnv("POSTGRES_NAME", "postgres")
	dbSSLMode := getEnv("POSTGRES_SSLMODE", "disable")

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

func InitializeMinio() {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found. Using environment variables.")
	}

	dbHost := getEnv("MINIO_HOST", "localhost")
	dbPort := getEnv("MINIO_PORT", "9000")
	dbUser := getEnv("MINIO_USER", "minioadmin")
	dbPass := getEnv("MINIO_PASS", "minioadmin")
	useSSL := getEnv("MINIO_USE_SSL", "false") == "true"

	// Construct endpoint
	endpoint := dbHost + ":" + dbPort

	// Initialize MinIO client
	minioClient, err = minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(dbUser, dbPass, ""),
		Secure: useSSL,
	})
	if err != nil {
		log.Fatalf("Failed to initialize MinIO client: %v", err)
	}

	log.Println("MinIO client successfully initialized!")

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
	InitializeMinio()
	defer db.Close()

	// Create a new Gin router
	router := gin.Default()

	router.GET("/digest", middleware.HMACMiddleware(), func(c *gin.Context) {
		blogs, err := iface.GetBlogs(db)
		if err != nil {
			log.Printf("Error fetching blogs: %v", err)
			c.JSON(500, gin.H{"error": "Failed to fetch blogs"})
			return
		}
		c.JSON(200, blogs)
	})

	router.GET("/tags", middleware.HMACMiddleware(), func(c *gin.Context) {
		blogs, err := iface.GetTags(db)
		if err != nil {
			log.Printf("Error fetching blogs: %v", err)
			c.JSON(500, gin.H{"error": "Failed to fetch tags"})
			return
		}
		c.JSON(200, blogs)
	})

	router.GET("/image/blog/:blogID/:imageName", func(c *gin.Context) {
		blog_id := c.Param("blogID")
		imageName := c.Param("imageName")

		object, err := minioClient.GetObject(c, "blog", blog_id+"/"+imageName, minio.GetObjectOptions{})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve image from MinIO"})
			return
		}
		defer object.Close()

		c.Header("Content-Type", "image/png")
		c.Header("Content-Disposition", "inline; filename="+imageName)

		// Stream the object directly to the response
		c.Stream(func(w io.Writer) bool {
			_, copyErr := io.Copy(w, object)
			return copyErr == nil
		})
	})

	router.GET("/blog/:blogTitle", middleware.HMACMiddleware(), func(c *gin.Context) {
		title := c.Param("blogTitle")
		blogs, err := iface.GetBlogPage(db, title)
		if err != nil {
			log.Printf("Error fetching blogs: %v", err)
			c.JSON(500, gin.H{"error": "Failed to fetch blog"})
			return
		}
		c.JSON(200, blogs)
	})

	router.GET("/blog-titles", middleware.HMACMiddleware(), func(c *gin.Context) {
		titles, err := iface.GetTitles(db)
		if err != nil {
			log.Printf("Error fetching blogs: %v", err)
			c.JSON(500, gin.H{"error": "Failed to fetch blog"})
			return
		}
		c.JSON(200, titles)
	})

	// Start the server on the specified port
	port := getEnv("BACKEND_PORT", "8080")
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
