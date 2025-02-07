package iface

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
)

func VerifyHMAC(data, providedHMAC string) bool {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found. Using environment variables.")
	}

	secretKey, _ := os.LookupEnv("HMAC_API_KEY")
	fmt.Println("Data received for HMAC verification:", data)

	h := hmac.New(sha256.New, []byte(secretKey))
	h.Write([]byte(data))
	expectedHMAC := hex.EncodeToString(h.Sum(nil))

	fmt.Println("Expected HMAC:", expectedHMAC)
	fmt.Println("Provided HMAC:", providedHMAC)

	return hmac.Equal([]byte(expectedHMAC), []byte(providedHMAC))
}

func GenerateHMAC(data string) string {
	secretKey, exists := os.LookupEnv("HMAC_API_KEY")
	if !exists || secretKey == "" {
		log.Fatal("HMAC_API_KEY environment variable is not set")
	}

	h := hmac.New(sha256.New, []byte(secretKey))
	h.Write([]byte(data))

	return hex.EncodeToString(h.Sum(nil))
}
