package xendit

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain/interfaces"
	"github.com/SukaMajuu/hris/apps/backend/pkg/config"
	"github.com/shopspring/decimal"
)

type Service struct {
	config     *config.XenditConfig
	httpClient *http.Client
}

func NewXenditService(cfg *config.XenditConfig) interfaces.XenditService {
	return &Service{
		config: cfg,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (s *Service) makeRequest(ctx context.Context, method, endpoint string, body interface{}) ([]byte, error) {
	var reqBody io.Reader
	if body != nil {
		jsonBody, err := json.Marshal(body)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal request body: %w", err)
		}
		reqBody = bytes.NewReader(jsonBody)
	}

	req, err := http.NewRequestWithContext(ctx, method, s.config.BaseURL+endpoint, reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Basic "+s.config.SecretKey)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()

	responseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("xendit API error %d: %s", resp.StatusCode, string(responseBody))
	}

	return responseBody, nil
}

// Customer Management
func (s *Service) CreateCustomer(ctx context.Context, req interfaces.CreateCustomerRequest) (*interfaces.XenditCustomer, error) {
	endpoint := "/customers"

	reqBody := map[string]interface{}{
		"reference_id":   req.ReferenceID,
		"email":          req.Email,
		"given_names":    req.GivenNames,
		"mobile_number":  req.MobileNumber,
		"addresses":      req.Addresses,
	}

	if req.Surname != nil {
		reqBody["surname"] = *req.Surname
	}

	respBody, err := s.makeRequest(ctx, "POST", endpoint, reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to create customer: %w", err)
	}

	var customer interfaces.XenditCustomer
	if err := json.Unmarshal(respBody, &customer); err != nil {
		return nil, fmt.Errorf("failed to unmarshal customer response: %w", err)
	}

	return &customer, nil
}

func (s *Service) GetCustomer(ctx context.Context, customerID string) (*interfaces.XenditCustomer, error) {
	endpoint := fmt.Sprintf("/customers/%s", customerID)

	respBody, err := s.makeRequest(ctx, "GET", endpoint, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to get customer: %w", err)
	}

	var customer interfaces.XenditCustomer
	if err := json.Unmarshal(respBody, &customer); err != nil {
		return nil, fmt.Errorf("failed to unmarshal customer response: %w", err)
	}

	return &customer, nil
}

// Invoice Management
func (s *Service) CreateInvoice(ctx context.Context, req interfaces.CreateInvoiceRequest) (*interfaces.XenditInvoice, error) {
	endpoint := "/v2/invoices"

	reqBody := map[string]interface{}{
		"external_id":       req.ExternalID,
		"payer_email":       req.PayerEmail,
		"description":       req.Description,
		"amount":            req.Amount.IntPart(),
		"currency":          req.Currency,
		"invoice_duration":  req.InvoiceDuration,
		"payment_methods":   req.PaymentMethods,
	}

	if req.SuccessRedirectURL != nil {
		reqBody["success_redirect_url"] = *req.SuccessRedirectURL
	}

	if req.FailureRedirectURL != nil {
		reqBody["failure_redirect_url"] = *req.FailureRedirectURL
	}

	if req.CustomerID != nil {
		reqBody["customer_id"] = *req.CustomerID
	}

	if req.Customer != nil {
		reqBody["customer"] = req.Customer
	}

	if len(req.Items) > 0 {
		items := make([]map[string]interface{}, len(req.Items))
		for i, item := range req.Items {
			items[i] = map[string]interface{}{
				"name":     item.Name,
				"quantity": item.Quantity,
				"price":    item.Price.IntPart(),
				"category": item.Category,
			}
		}
		reqBody["items"] = items
	}

	respBody, err := s.makeRequest(ctx, "POST", endpoint, reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to create invoice: %w", err)
	}

	var invoice interfaces.XenditInvoice
	if err := json.Unmarshal(respBody, &invoice); err != nil {
		return nil, fmt.Errorf("failed to unmarshal invoice response: %w", err)
	}

	return &invoice, nil
}

func (s *Service) GetInvoice(ctx context.Context, invoiceID string) (*interfaces.XenditInvoice, error) {
	endpoint := fmt.Sprintf("/v2/invoices/%s", invoiceID)

	respBody, err := s.makeRequest(ctx, "GET", endpoint, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to get invoice: %w", err)
	}

	var invoice interfaces.XenditInvoice
	if err := json.Unmarshal(respBody, &invoice); err != nil {
		return nil, fmt.Errorf("failed to unmarshal invoice response: %w", err)
	}

	return &invoice, nil
}

func (s *Service) ExpireInvoice(ctx context.Context, invoiceID string) (*interfaces.XenditInvoice, error) {
	endpoint := fmt.Sprintf("/invoices/%s/expire!", invoiceID)

	respBody, err := s.makeRequest(ctx, "POST", endpoint, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to expire invoice: %w", err)
	}

	var invoice interfaces.XenditInvoice
	if err := json.Unmarshal(respBody, &invoice); err != nil {
		return nil, fmt.Errorf("failed to unmarshal invoice response: %w", err)
	}

	return &invoice, nil
}

// Payment Methods
func (s *Service) GetAvailablePaymentMethods(ctx context.Context) ([]interfaces.XenditPaymentMethod, error) {
	endpoint := "/payment_methods"

	respBody, err := s.makeRequest(ctx, "GET", endpoint, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to get payment methods: %w", err)
	}

	var methods []interfaces.XenditPaymentMethod
	if err := json.Unmarshal(respBody, &methods); err != nil {
		return nil, fmt.Errorf("failed to unmarshal payment methods response: %w", err)
	}

	return methods, nil
}

// Webhook Verification
func (s *Service) VerifyWebhookSignature(webhookToken, payload string) bool {
	if s.config.CallbackKey == "" {
		return false
	}

	// Create HMAC signature
	h := hmac.New(sha256.New, []byte(s.config.CallbackKey))
	h.Write([]byte(payload))
	expectedSignature := hex.EncodeToString(h.Sum(nil))

	return hmac.Equal([]byte(webhookToken), []byte(expectedSignature))
}

// Webhook Processing
func (s *Service) ProcessWebhook(ctx context.Context, webhookData map[string]interface{}) error {
	// Extract webhook type and process accordingly
	webhookType, ok := webhookData["webhook_type"].(string)
	if !ok {
		return fmt.Errorf("missing or invalid webhook_type")
	}

	switch webhookType {
	case "invoice.paid":
		return s.processInvoicePaidWebhook(ctx, webhookData)
	case "invoice.expired":
		return s.processInvoiceExpiredWebhook(ctx, webhookData)
	case "invoice.failed":
		return s.processInvoiceFailedWebhook(ctx, webhookData)
	default:
		return fmt.Errorf("unsupported webhook type: %s", webhookType)
	}
}

func (s *Service) processInvoicePaidWebhook(ctx context.Context, data map[string]interface{}) error {
	// Extract invoice data
	invoiceID, ok := data["id"].(string)
	if !ok {
		return fmt.Errorf("missing invoice ID in webhook")
	}

	externalID, ok := data["external_id"].(string)
	if !ok {
		return fmt.Errorf("missing external ID in webhook")
	}

	paidAt, ok := data["paid_at"].(string)
	if !ok {
		return fmt.Errorf("missing paid_at in webhook")
	}

	paymentMethod, _ := data["payment_method"].(string)
	paymentChannel, _ := data["payment_channel"].(string)

	// Here you would update your payment transaction in the database
	// This is just a placeholder - you'd implement the actual database update logic
	fmt.Printf("Invoice paid: ID=%s, ExternalID=%s, PaidAt=%s, Method=%s, Channel=%s\n",
		invoiceID, externalID, paidAt, paymentMethod, paymentChannel)

	return nil
}

func (s *Service) processInvoiceExpiredWebhook(ctx context.Context, data map[string]interface{}) error {
	invoiceID, ok := data["id"].(string)
	if !ok {
		return fmt.Errorf("missing invoice ID in webhook")
	}

	externalID, ok := data["external_id"].(string)
	if !ok {
		return fmt.Errorf("missing external ID in webhook")
	}

	fmt.Printf("Invoice expired: ID=%s, ExternalID=%s\n", invoiceID, externalID)
	return nil
}

func (s *Service) processInvoiceFailedWebhook(ctx context.Context, data map[string]interface{}) error {
	invoiceID, ok := data["id"].(string)
	if !ok {
		return fmt.Errorf("missing invoice ID in webhook")
	}

	externalID, ok := data["external_id"].(string)
	if !ok {
		return fmt.Errorf("missing external ID in webhook")
	}

	failureReason, _ := data["failure_reason"].(string)

	fmt.Printf("Invoice failed: ID=%s, ExternalID=%s, Reason=%s\n", invoiceID, externalID, failureReason)
	return nil
}

// Helper function to convert amount to Xendit format (in cents/smallest unit)
func (s *Service) ConvertAmount(amount decimal.Decimal) int64 {
	// Xendit expects amount in the smallest currency unit (e.g., cents for USD, sen for IDR)
	return amount.Mul(decimal.NewFromInt(100)).IntPart()
}

// Helper function to convert amount from Xendit format
func (s *Service) ConvertAmountFromXendit(amount interface{}) decimal.Decimal {
	var amountInt int64
	switch v := amount.(type) {
	case float64:
		amountInt = int64(v)
	case int64:
		amountInt = v
	case string:
		if parsed, err := strconv.ParseInt(v, 10, 64); err == nil {
			amountInt = parsed
		}
	}
	return decimal.NewFromInt(amountInt).Div(decimal.NewFromInt(100))
}
