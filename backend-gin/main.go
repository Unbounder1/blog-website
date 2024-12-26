package main

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
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
	router := gin.Default()

	router.Use(LoggerMiddleware())

	router.GET("/", func(c *gin.Context) {
		c.String(200, "Hello, World!")
	})

	router.GET("/bye", func(c *gin.Context) {
		c.String(200, "Goodbye, World!")
	})

	router.Run(":8080")
}
