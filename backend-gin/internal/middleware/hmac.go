package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	iface "github.com/unbounder1/blog-website/internal/interface"
)

func HMACMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		providedHMAC := c.GetHeader("X-HMAC-Signature")
		if providedHMAC == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing HMAC signature"})
			c.Abort()
			return
		}

		data := c.Request.URL.String()

		// Verify the HMAC
		if !iface.VerifyHMAC(data, providedHMAC) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid HMAC signature"})
			c.Abort()
			return
		}

		c.Next()
	}
}
