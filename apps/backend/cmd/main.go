package main

import (
	"crypto/tls"
	"crypto/x509"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/SukaMajuu/hris/apps/backend/internal/repository/auth"
	"github.com/SukaMajuu/hris/apps/backend/internal/repository/checkclock_settings"
	"github.com/SukaMajuu/hris/apps/backend/internal/repository/document"
	"github.com/SukaMajuu/hris/apps/backend/internal/repository/employee"
	"github.com/SukaMajuu/hris/apps/backend/internal/repository/location"
	"github.com/SukaMajuu/hris/apps/backend/internal/repository/work_schedule"
	"github.com/SukaMajuu/hris/apps/backend/internal/repository/xendit"
	"github.com/SukaMajuu/hris/apps/backend/internal/rest"
	authUseCase "github.com/SukaMajuu/hris/apps/backend/internal/usecase/auth"
	checkclockSettingsUseCase "github.com/SukaMajuu/hris/apps/backend/internal/usecase/checkclock_settings"
	documentUseCase "github.com/SukaMajuu/hris/apps/backend/internal/usecase/document"
	employeeUseCase "github.com/SukaMajuu/hris/apps/backend/internal/usecase/employee"
	locationUseCase "github.com/SukaMajuu/hris/apps/backend/internal/usecase/location"
	subscriptionUseCase "github.com/SukaMajuu/hris/apps/backend/internal/usecase/subscription"
	workScheduleUseCase "github.com/SukaMajuu/hris/apps/backend/internal/usecase/work_schedule"
	"github.com/SukaMajuu/hris/apps/backend/pkg/config"
	"github.com/SukaMajuu/hris/apps/backend/pkg/database"
	"github.com/SukaMajuu/hris/apps/backend/pkg/jwt"
	xenditService "github.com/SukaMajuu/hris/apps/backend/pkg/xendit"
	"github.com/supabase-community/supabase-go"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func loadAzureCertificates(certPool *x509.CertPool) {
	// Common Azure Web App certificate paths
	azureCertPaths := []string{
		"/var/ssl/certs",          // Linux Azure Web App
		"D:\\home\\site\\wwwroot", // Windows Azure Web App
		"/home/site/wwwroot",      // Alternative Linux path
		"C:\\Windows\\System32\\config\\systemprofile\\AppData\\Local\\Microsoft\\Windows\\SystemCertificates", // Windows system certs
	}

	certsLoaded := 0

	// Try to load certificates from Azure paths
	for _, certPath := range azureCertPaths {
		if _, err := os.Stat(certPath); err == nil {
			log.Printf("Checking for certificates in: %s", certPath)

			err := filepath.Walk(certPath, func(path string, info os.FileInfo, err error) error {
				if err != nil {
					return nil // Continue walking
				}

				// Look for certificate files
				if strings.HasSuffix(strings.ToLower(info.Name()), ".crt") ||
					strings.HasSuffix(strings.ToLower(info.Name()), ".cer") ||
					strings.HasSuffix(strings.ToLower(info.Name()), ".pem") {

					log.Printf("Found certificate file: %s", path)

					certData, err := ioutil.ReadFile(path)
					if err != nil {
						log.Printf("Failed to read certificate %s: %v", path, err)
						return nil
					}

					if certPool.AppendCertsFromPEM(certData) {
						log.Printf("Successfully loaded certificate from: %s", path)
						certsLoaded++
					} else {
						log.Printf("Failed to parse certificate from: %s", path)
					}
				}
				return nil
			})

			if err != nil {
				log.Printf("Error walking certificate path %s: %v", certPath, err)
			}
		} else {
			log.Printf("Certificate path does not exist: %s", certPath)
		}
	}

	log.Printf("Loaded %d additional certificates from Azure paths", certsLoaded)

	// Also try to check specific Windows certificate stores if on Windows
	if os.Getenv("OS") == "Windows_NT" || strings.Contains(os.Getenv("PATH"), "Windows") {
		log.Printf("Windows environment detected, checking system certificate stores")
		// On Windows, certificates might be loaded automatically by the system
		// Log additional Windows-specific environment info
		log.Printf("COMPUTERNAME: %s", os.Getenv("COMPUTERNAME"))
		log.Printf("SystemRoot: %s", os.Getenv("SystemRoot"))
	}
}

func setupTLSConfiguration() {
	// Start with system cert pool
	systemRoots, err := x509.SystemCertPool()
	if err != nil {
		log.Printf("Warning: Failed to load system cert pool: %v", err)
		systemRoots = x509.NewCertPool()
	}

	log.Printf("Initial system cert pool contains %d certificates", len(systemRoots.Subjects()))

	// Check if we're running on Azure Web App
	websiteCerts := os.Getenv("WEBSITE_LOAD_CERTIFICATES")
	if websiteCerts != "" {
		log.Printf("Azure Web App detected with WEBSITE_LOAD_CERTIFICATES: %s", websiteCerts)

		// Try to load certificates from Azure-specific paths
		loadAzureCertificates(systemRoots)

		// Set additional environment variables that might help
		os.Setenv("SSL_CERT_DIR", "/var/ssl/certs")
		os.Setenv("SSL_CERT_FILE", "")

		log.Printf("After Azure cert loading, cert pool contains %d certificates", len(systemRoots.Subjects()))
		log.Printf("System certificates will be used for TLS verification")

		// For debugging: List some environment variables
		log.Printf("SSL_CERT_DIR: %s", os.Getenv("SSL_CERT_DIR"))
		log.Printf("WEBSITE_SITE_NAME: %s", os.Getenv("WEBSITE_SITE_NAME"))
		log.Printf("WEBSITE_RESOURCE_GROUP: %s", os.Getenv("WEBSITE_RESOURCE_GROUP"))
	}

	// Create TLS config with comprehensive certificate handling
	tlsConfig := &tls.Config{
		RootCAs:            systemRoots,
		InsecureSkipVerify: false,
		ServerName:         "", // Let Go auto-detect server name
		MinVersion:         tls.VersionTLS12,
	}

	// TEMPORARY WORKAROUND: If still failing, add a fallback option
	if websiteCerts != "" {
		// As a last resort, if certificates still don't work,
		// we can temporarily skip verification (NOT RECOMMENDED FOR PRODUCTION)
		skipVerify := os.Getenv("SKIP_TLS_VERIFY")
		if skipVerify == "true" {
			log.Printf("WARNING: TLS verification is being skipped - this should only be used for debugging!")
			tlsConfig.InsecureSkipVerify = true
		}
	}

	// Create custom transport
	transport := &http.Transport{
		TLSClientConfig: tlsConfig,
		// Additional transport settings for better reliability
		MaxIdleConns:        100,
		MaxIdleConnsPerHost: 10,
	}

	// Set the default HTTP client transport
	http.DefaultClient = &http.Client{
		Transport: transport,
	}

	// Also set the default transport globally
	http.DefaultTransport = transport

	log.Printf("TLS configuration updated to use system certificate pool with Azure support")
}

func testTLSConnection(url string) {
	log.Printf("Testing TLS connection to: %s", url)

	resp, err := http.Get(fmt.Sprintf("https://%s", url))
	if err != nil {
		log.Printf("TLS test failed: %v", err)
		return
	}
	defer resp.Body.Close()

	log.Printf("TLS test successful. Status: %s", resp.Status)
}

func main() {
	setupTLSConfiguration()

	cfg, err := config.Load()
	if err != nil {
		log.Fatal("Failed to load config:", err)
	}

	// Test TLS connection to Supabase before creating clients
	if cfg.Supabase.URL != "" {
		// Extract hostname from Supabase URL
		supabaseHost := strings.TrimPrefix(cfg.Supabase.URL, "https://")
		supabaseHost = strings.TrimPrefix(supabaseHost, "http://")
		testTLSConnection(supabaseHost)
	}

	db, err := database.NewPostgresDB(cfg)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	supabaseClient, err := supabase.NewClient(cfg.Supabase.URL, cfg.Supabase.ServiceKey, &supabase.ClientOptions{})
	if err != nil {
		log.Fatalf("Failed to initialize Supabase client: %v", err)
	}

	authRepo, err := auth.NewSupabaseRepository(db, cfg.Supabase.URL, cfg.Supabase.Key)
	if err != nil {
		log.Fatalf("Failed to initialize Supabase auth repository: %v", err)
	}

	employeeRepo := employee.NewPostgresRepository(db)
	locationRepo := location.NewLocationRepository(db)
	workScheduleRepo := work_schedule.NewWorkScheduleRepository(db)
	checkclockSettingsRepo := checkclock_settings.NewCheckclockSettingsRepository(db)
	xenditRepo := xendit.NewXenditRepository(db)
	xenditClient := xenditService.NewXenditClient(&cfg.Xendit)
	documentRepo := document.NewPostgresRepository(db)

	jwtService := jwt.NewJWTService(cfg)

	authUseCase := authUseCase.NewAuthUseCase(
		authRepo,
		employeeRepo,
		jwtService,
		cfg,
	)

	employeeUseCase := employeeUseCase.NewEmployeeUseCase(
		employeeRepo,
		authRepo,
	)

	locationUseCase := locationUseCase.NewLocationUseCase(locationRepo)

	workScheduleUseCase := workScheduleUseCase.NewWorkScheduleUseCase(
		workScheduleRepo,
		locationRepo,
	)

	checkclockSettingsUseCase := checkclockSettingsUseCase.NewCheckclockSettingsUseCase(
		checkclockSettingsRepo,
		employeeRepo,
		workScheduleRepo,
	)

	subscriptionUseCase := subscriptionUseCase.NewSubscriptionUseCase(
		xenditRepo,
		xenditClient,
	)

	documentUseCase := documentUseCase.NewDocumentUseCase(
		documentRepo,
		employeeRepo,
		supabaseClient,
	)

	router := rest.NewRouter(authUseCase, employeeUseCase, locationUseCase, workScheduleUseCase, checkclockSettingsUseCase, subscriptionUseCase, documentUseCase)

	ginRouter := router.Setup()

	ginRouter.StaticFile("/swagger.yaml", "../../docs/api/swagger.yaml")

	url := ginSwagger.URL("/swagger.yaml")
	ginRouter.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler, url))

	if err := ginRouter.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
