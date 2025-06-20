package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Database DatabaseConfig
	Supabase SupabaseConfig
	Server   ServerConfig
	JWT      JWTConfig
	Xendit   XenditConfig
	Midtrans MidtransConfig
	Email    EmailConfig
	App      AppConfig
}

type DatabaseConfig struct {
	DatabaseURL string
	Host        string
	Port        string
	User        string
	Password    string
	DBName      string
	SSLMode     string
}

type SupabaseConfig struct {
	URL        string
	Key        string
	ServiceKey string
}

type ServerConfig struct {
	Port string
}

type JWTConfig struct {
	SecretKey          string
	AccessDuration     string
	RefreshDuration    string
	RememberMeDuration string
}

type XenditConfig struct {
	SecretKey   string
	PublicKey   string
	CallbackKey string
	BaseURL     string
	Environment string
	WebhookURL  string
}

type MidtransConfig struct {
	ServerKey       string
	ClientKey       string
	Environment     string
	BaseURL         string
	NotificationURL string
}

type EmailConfig struct {
	// Resend API configuration (preferred)
	ResendAPIKey string `json:"resend_api_key"`
	FromEmail    string `json:"from_email"`
	FromName     string `json:"from_name"`

	// Legacy SMTP configuration (fallback)
	SMTPHost     string `json:"smtp_host"`
	SMTPPort     string `json:"smtp_port"`
	SMTPUsername string `json:"smtp_username"`
	SMTPPassword string `json:"smtp_password"`
}

type AppConfig struct {
	URL string
}

func Load() (*Config, error) {
	_ = godotenv.Load()

	return &Config{
		Database: DatabaseConfig{
			DatabaseURL: getEnv("DATABASE_URL", ""),
			Host:        getEnv("DB_HOST", "localhost"),
			Port:        getEnv("DB_PORT", "5432"),
			User:        getEnv("DB_USER", "postgres"),
			Password:    getEnv("DB_PASSWORD", ""),
			DBName:      getEnv("DB_NAME", "hris"),
			SSLMode:     getEnv("DB_SSLMODE", "disable"),
		},
		Supabase: SupabaseConfig{
			URL:        getEnv("SUPABASE_URL", ""),
			Key:        getEnv("SUPABASE_KEY", ""),
			ServiceKey: getEnv("SUPABASE_SERVICE_KEY", ""),
		},
		Server: ServerConfig{
			Port: getEnv("PORT", "8080"),
		},
		JWT: JWTConfig{
			SecretKey:          getEnv("JWT_SECRET_KEY", "secret"),
			AccessDuration:     getEnv("JWT_ACCESS_DURATION", "15m"),
			RefreshDuration:    getEnv("JWT_REFRESH_DURATION", "168h"),
			RememberMeDuration: getEnv("JWT_REMEMBER_ME_DURATION", "720h"), // 30 days
		},
		Xendit: XenditConfig{
			SecretKey:   getEnv("XENDIT_SECRET_KEY", ""),
			PublicKey:   getEnv("XENDIT_PUBLIC_KEY", ""),
			CallbackKey: getEnv("XENDIT_CALLBACK_TOKEN", ""),
			BaseURL:     getEnv("XENDIT_BASE_URL", "https://api.xendit.co"),
			Environment: getEnv("XENDIT_ENVIRONMENT", "test"),
			WebhookURL:  getEnv("XENDIT_WEBHOOK_URL", ""),
		},
		Midtrans: MidtransConfig{
			ServerKey:       getEnv("MIDTRANS_SERVER_KEY", ""),
			ClientKey:       getEnv("MIDTRANS_CLIENT_KEY", ""),
			Environment:     getEnv("MIDTRANS_ENVIRONMENT", "sandbox"),
			BaseURL:         getEnv("MIDTRANS_BASE_URL", "https://app.sandbox.midtrans.com/snap/v1"),
			NotificationURL: getEnv("MIDTRANS_NOTIFICATION_URL", ""),
		},
		Email: EmailConfig{
			ResendAPIKey: getEnv("EMAIL_RESEND_API_KEY", ""),
			FromEmail:    getEnv("EMAIL_FROM_EMAIL", "onboarding@resend.dev"),
			FromName:     getEnv("EMAIL_FROM_NAME", "HRIS System"),
			SMTPHost:     getEnv("EMAIL_SMTP_HOST", ""),
			SMTPPort:     getEnv("EMAIL_SMTP_PORT", ""),
			SMTPUsername: getEnv("EMAIL_SMTP_USERNAME", ""),
			SMTPPassword: getEnv("EMAIL_SMTP_PASSWORD", ""),
		},
		App: AppConfig{
			URL: getEnv("APP_URL", "https://hris.sukajaya.id"),
		},
	}, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
