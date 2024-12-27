package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-resty/resty/v2"
)

func LoggerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()
		duration := time.Since(start)
		log.Printf("Request - Method: %s | Status: %d | Duration: %v", c.Request.Method, c.Writer.Status(), duration)
	}
}

func main() {

	secretKey := os.Getenv("SECRET_KEY")
	projectUrl := os.Getenv("PROJECT_URL")

	router := gin.Default()

	router.Use(LoggerMiddleware())

	router.GET("/", func(c *gin.Context) {
		c.String(200, "Hello, World!")
	})

	router.GET("/bye", func(c *gin.Context) {
		c.String(200, "Goodbye, World!")
	})

	router.GET("/users", func(c *gin.Context) {
		client := resty.New()
		resp, err := client.R().
			SetHeader("apikey", secretKey).
			SetHeader("Authorization", "Bearer "+secretKey).
			Get(projectUrl + "/rest/v1/users")

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"data": resp.String()})
	})

	router.Run(":8080")
}
