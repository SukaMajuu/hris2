package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Database DatabaseConfig
	Firebase FirebaseConfig
	Server   ServerConfig
	JWT      JWTConfig
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

type FirebaseConfig struct {
	CredentialsFile string
}

type ServerConfig struct {
	Port string
}

type JWTConfig struct {
	SecretKey string
	Duration  string
}

func Load() (*Config, error) {
	_ = godotenv.Load()

	return &Config{
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", ""),
			DBName:   getEnv("DB_NAME", "hris"),
			SSLMode:  getEnv("DB_SSLMODE", "disable"),
		},
		Firebase: FirebaseConfig{
			CredentialsFile: getEnv("FIREBASE_CREDENTIALS_FILE", "firebase-credentials.json"),
		},
		Server: ServerConfig{
			Port: getEnv("PORT", "8080"),
		},
		JWT: JWTConfig{
			SecretKey: getEnv("JWT_SECRET_KEY", "secret"),
			Duration:  getEnv("JWT_DURATION", "24h"),
		},
	}, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
