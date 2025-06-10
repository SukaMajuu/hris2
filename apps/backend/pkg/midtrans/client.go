package midtrans

import (
	"bytes"
	"context"
	"crypto/sha512"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain/interfaces"
	"github.com/SukaMajuu/hris/apps/backend/pkg/config"
)

type Client struct {
	config     *config.MidtransConfig
	httpClient *http.Client
}

func NewClient(cfg *config.MidtransConfig) interfaces.MidtransClient {
	return &Client{
		config: cfg,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (c *Client) CreateSnapTransaction(ctx context.Context, req interfaces.MidtransSnapRequest) (*interfaces.MidtransSnapResponse, error) {
	url := fmt.Sprintf("%s/transactions", c.config.BaseURL)

	reqBody, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(reqBody))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Accept", "application/json")

	// Set authorization header
	auth := base64.StdEncoding.EncodeToString([]byte(c.config.ServerKey + ":"))
	httpReq.Header.Set("Authorization", "Basic "+auth)

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}
	defer func() {
		_ = resp.Body.Close()
	}()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	if resp.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("midtrans API error [%d]: %s", resp.StatusCode, string(body))
	}

	var snapResp interfaces.MidtransSnapResponse
	if err := json.Unmarshal(body, &snapResp); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return &snapResp, nil
}

func (c *Client) GetTransactionStatus(ctx context.Context, orderID string) (*interfaces.MidtransTransactionStatus, error) {
	// Use Core API endpoint for transaction status
	coreURL := c.getCoreAPIURL()
	url := fmt.Sprintf("%s/v2/%s/status", coreURL, orderID)

	httpReq, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set authorization header
	auth := base64.StdEncoding.EncodeToString([]byte(c.config.ServerKey + ":"))
	httpReq.Header.Set("Authorization", "Basic "+auth)
	httpReq.Header.Set("Accept", "application/json")

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}
	defer func() {
		_ = resp.Body.Close()
	}()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("midtrans API error [%d]: %s", resp.StatusCode, string(body))
	}

	var status interfaces.MidtransTransactionStatus
	if err := json.Unmarshal(body, &status); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return &status, nil
}

// ValidateSignature validates Midtrans notification signature
func (c *Client) ValidateSignature(orderID, statusCode, grossAmount, serverKey, signatureKey string) bool {
	payload := orderID + statusCode + grossAmount + serverKey
	hash := sha512.Sum512([]byte(payload))
	signature := fmt.Sprintf("%x", hash)
	return signature == signatureKey
}

func (c *Client) getCoreAPIURL() string {
	if c.config.Environment == "production" {
		return "https://api.midtrans.com"
	}
	return "https://api.sandbox.midtrans.com"
}
