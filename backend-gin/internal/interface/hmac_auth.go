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
	h := hmac.New(sha256.New, []byte(secretKey))
	h.Write([]byte(data))

	expectedHMAC := hex.EncodeToString(h.Sum(nil))
	fmt.Print(expectedHMAC)
	fmt.Print("--------------\n\n")
	fmt.Print(providedHMAC)

	return hmac.Equal([]byte(expectedHMAC), []byte(providedHMAC))
}
