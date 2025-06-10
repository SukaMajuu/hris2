package tripay

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
)

// ValidateCallbackSignature validates Tripay callback signature
func ValidateCallbackSignature(privateKey, signature, rawBody string) bool {
	h := hmac.New(sha256.New, []byte(privateKey))
	h.Write([]byte(rawBody))
	expectedSignature := hex.EncodeToString(h.Sum(nil))

	return signature == expectedSignature
}

// GenerateSignature generates signature for Tripay requests
func GenerateSignature(merchantCode, merchantRef string, amount int64, privateKey string) string {
	data := merchantCode + merchantRef + string(rune(amount))
	h := hmac.New(sha256.New, []byte(privateKey))
	h.Write([]byte(data))
	return hex.EncodeToString(h.Sum(nil))
}
