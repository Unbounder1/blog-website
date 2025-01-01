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
	fmt.Print(secretKey)
	h := hmac.New(sha256.New, []byte(secretKey))
	h.Write([]byte(data))
	fmt.Print("--------------\n\n")
	expectedHMAC := hex.EncodeToString(h.Sum(nil))
	fmt.Print(expectedHMAC)

	return hmac.Equal([]byte(expectedHMAC), []byte(providedHMAC))
}
