package main

import (
	"bytes"
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

	router.POST("/api/hmac", func(c *gin.Context) {
		var jsonData map[string]string

		// Bind JSON request to a map
		if err := c.ShouldBindJSON(&jsonData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload. Ensure 'data' is provided."})
			return
		}

		// Check if 'data' key exists
		data, exists := jsonData["data"]
		if !exists {
			c.JSON(http.StatusBadRequest, gin.H{"error": "'data' field is required"})
			return
		}

		// Generate HMAC hash
		hmacHash := iface.GenerateHMAC(data)

		// Respond with the generated hash
		c.JSON(http.StatusOK, gin.H{"hash": hmacHash})
	})

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
		blogID := c.Param("blogID")
		imageName := c.Param("imageName")

		objectInfo, err := minioClient.StatObject(c, "blog", blogID+"/"+imageName, minio.StatObjectOptions{})
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Image not found in MinIO"})
			return
		}

		object, err := minioClient.GetObject(c, "blog", blogID+"/"+imageName, minio.GetObjectOptions{})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve image from MinIO"})
			return
		}

		buffer := make([]byte, 512)
		_, err = object.Read(buffer)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read image data"})
			return
		}

		contentType := http.DetectContentType(buffer)

		// Set headers
		c.Header("Content-Type", contentType)
		c.Header("Content-Disposition", "inline; filename="+imageName)
		c.Header("Content-Length", fmt.Sprintf("%d", objectInfo.Size))

		// Reset the object read pointer to the beginning
		object.Seek(0, io.SeekStart)

		// Stream the object directly to the response
		_, err = io.Copy(c.Writer, object)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to stream image data"})
			return
		}
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

	// ------------------------- ADDONS ------------------------

	// Circuit-Scan Addon
	router.POST("/addon/circuit-scan/", func(c *gin.Context) {
		path := "http://" + getEnv("CIRCUIT_SCAN_HOST", "127.0.0.1") + ":" + getEnv("CIRCUIT_SCAN_PORT", "5000") + "/process_image"

		requestBody, err := io.ReadAll(c.Request.Body)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read request body"})
			return
		}

		// Forward the raw body to the external API
		resp, err := http.Post(path, c.Request.Header.Get("Content-Type"), io.NopCloser(bytes.NewReader(requestBody)))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to forward request"})
			return
		}
		defer resp.Body.Close()

		out, err := io.ReadAll(resp.Body)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read request"})
			return
		}
		// Stream the response from the external API back to the client
		c.Data(resp.StatusCode, resp.Header.Get("Content-Type"), out)

	})

	// Start the server on the specified port
	port := getEnv("BACKEND_PORT", "8080")
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
