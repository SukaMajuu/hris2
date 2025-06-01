package xendit

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain/interfaces"
	"github.com/SukaMajuu/hris/apps/backend/pkg/config"
)

type Client struct {
	config     *config.XenditConfig
	httpClient *http.Client
}

func NewXenditClient(cfg *config.XenditConfig) interfaces.XenditClient {
	return &Client{
		config: cfg,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (c *Client) CreateInvoice(ctx context.Context, req interfaces.CreateInvoiceRequest) (*interfaces.XenditInvoice, error) {
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

	respBody, err := c.makeRequest(ctx, "POST", endpoint, reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to create invoice: %w", err)
	}

	var invoice interfaces.XenditInvoice
	if err := json.Unmarshal(respBody, &invoice); err != nil {
		return nil, fmt.Errorf("failed to unmarshal invoice response: %w", err)
	}

	return &invoice, nil
}

func (c *Client) makeRequest(ctx context.Context, method, endpoint string, body interface{}) ([]byte, error) {
	var reqBody io.Reader
	if body != nil {
		jsonBody, err := json.Marshal(body)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal request body: %w", err)
		}
		reqBody = bytes.NewReader(jsonBody)
	}

	req, err := http.NewRequestWithContext(ctx, method, c.config.BaseURL+endpoint, reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Basic "+c.config.SecretKey)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}
	defer func() {
		if closeErr := resp.Body.Close(); closeErr != nil {
			fmt.Printf("failed to close response body: %v", closeErr)
		}
	}()

	responseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("xendit API error %d: %s", resp.StatusCode, string(responseBody))
	}

	return responseBody, nil
}
