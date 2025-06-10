package tripay

// import (
// 	"bytes"
// 	"context"
// 	"crypto/hmac"
// 	"crypto/sha256"
// 	"encoding/hex"
// 	"encoding/json"
// 	"fmt"
// 	"io"
// 	"net/http"
// 	"time"

// 	"github.com/SukaMajuu/hris/apps/backend/domain/interfaces"
// 	"github.com/SukaMajuu/hris/apps/backend/pkg/config"
// 	"github.com/shopspring/decimal"
// )

// type Client struct {
// 	config     *config.TripayConfig
// 	httpClient *http.Client
// }

// func NewTripayClient(cfg *config.TripayConfig) interfaces.TripayClient {
// 	return &Client{
// 		config: cfg,
// 		httpClient: &http.Client{
// 			Timeout: 30 * time.Second,
// 		},
// 	}
// }

// func (c *Client) CreateInvoice(ctx context.Context, req interfaces.CreatePaymentInvoiceRequest) (*interfaces.PaymentInvoice, error) {
// 	endpoint := "/merchant/payment/create"

// 	// Buat signature untuk Tripay
// 	signature := c.generateSignature(req.MerchantRef, req.Amount)

// 	tripayReq := map[string]interface{}{
// 		"method":         "BCAVA", // Default payment method, bisa disesuaikan
// 		"merchant_ref":   req.MerchantRef,
// 		"amount":         req.Amount.IntPart(),
// 		"customer_name":  req.CustomerName,
// 		"customer_email": req.CustomerEmail,
// 		"order_items":    c.convertOrderItems(req.OrderItems),
// 		"callback_url":   req.CallbackURL,
// 		"return_url":     req.ReturnURL,
// 		"expired_time":   time.Now().Add(time.Duration(req.ExpiredTime) * time.Second).Unix(),
// 		"signature":      signature,
// 	}

// 	if req.CustomerPhone != nil {
// 		tripayReq["customer_phone"] = *req.CustomerPhone
// 	}

// 	respBody, err := c.makeRequest(ctx, "POST", endpoint, tripayReq)
// 	if err != nil {
// 		return nil, fmt.Errorf("failed to create tripay invoice: %w", err)
// 	}

// 	var response TripayCreateInvoiceResponse
// 	if err := json.Unmarshal(respBody, &response); err != nil {
// 		return nil, fmt.Errorf("failed to unmarshal tripay response: %w", err)
// 	}

// 	if !response.Success {
// 		return nil, fmt.Errorf("tripay error: %s", response.Message)
// 	}

// 	return &interfaces.PaymentInvoice{
// 		Reference:   response.Data.Reference,
// 		MerchantRef: response.Data.MerchantRef,
// 		PaymentURL:  response.Data.CheckoutURL,
// 		QRString:    response.Data.QRString,
// 		Amount:      decimal.NewFromInt(int64(response.Data.Amount)),
// 		Status:      response.Data.Status,
// 		ExpiredTime: response.Data.ExpiredTime,
// 		CreatedAt:   response.Data.CreatedAt,
// 		UpdatedAt:   response.Data.UpdatedAt,
// 	}, nil
// }

// func (c *Client) GetPaymentChannels(ctx context.Context) ([]interfaces.PaymentChannel, error) {
// 	endpoint := "/merchant/payment-channel"

// 	respBody, err := c.makeRequest(ctx, "GET", endpoint, nil)
// 	if err != nil {
// 		return nil, fmt.Errorf("failed to get payment channels: %w", err)
// 	}

// 	var response TripayChannelsResponse
// 	if err := json.Unmarshal(respBody, &response); err != nil {
// 		return nil, fmt.Errorf("failed to unmarshal channels response: %w", err)
// 	}

// 	if !response.Success {
// 		return nil, fmt.Errorf("tripay error: %s", response.Message)
// 	}

// 	channels := make([]interfaces.PaymentChannel, len(response.Data))
// 	for i, ch := range response.Data {
// 		channels[i] = interfaces.PaymentChannel{
// 			Code:     ch.Code,
// 			Name:     ch.Name,
// 			Type:     ch.Type,
// 			IsActive: ch.Active,
// 		}

// 		if ch.MinimumFee != nil {
// 			minAmount := decimal.NewFromFloat(*ch.MinimumFee)
// 			channels[i].MinAmount = &minAmount
// 		}

// 		if ch.MaximumFee != nil {
// 			maxAmount := decimal.NewFromFloat(*ch.MaximumFee)
// 			channels[i].MaxAmount = &maxAmount
// 		}

// 		if ch.FlatFee != nil || ch.PercentFee != nil {
// 			fee := &interfaces.PaymentFee{}
// 			if ch.FlatFee != nil {
// 				flat := decimal.NewFromFloat(*ch.FlatFee)
// 				fee.Flat = &flat
// 			}
// 			if ch.PercentFee != nil {
// 				percent := decimal.NewFromFloat(*ch.PercentFee)
// 				fee.Percent = &percent
// 			}
// 			channels[i].Fee = fee
// 		}
// 	}

// 	return channels, nil
// }

// func (c *Client) GetFeeCalculator(ctx context.Context, code string, amount decimal.Decimal) (*interfaces.TripayFeeCalculation, error) {
// 	endpoint := fmt.Sprintf("/merchant/fee-calculator?code=%s&amount=%d", code, amount.IntPart())

// 	respBody, err := c.makeRequest(ctx, "GET", endpoint, nil)
// 	if err != nil {
// 		return nil, fmt.Errorf("failed to calculate fee: %w", err)
// 	}

// 	var response TripayFeeResponse
// 	if err := json.Unmarshal(respBody, &response); err != nil {
// 		return nil, fmt.Errorf("failed to unmarshal fee response: %w", err)
// 	}

// 	if !response.Success {
// 		return nil, fmt.Errorf("tripay error: %s", response.Message)
// 	}

// 	return &interfaces.TripayFeeCalculation{
// 		Code:     response.Data.Code,
// 		Name:     response.Data.Name,
// 		Fee:      decimal.NewFromFloat(response.Data.Fee),
// 		TotalFee: decimal.NewFromFloat(response.Data.TotalFee),
// 	}, nil
// }

// func (c *Client) generateSignature(merchantRef string, amount decimal.Decimal) string {
// 	data := fmt.Sprintf("%s%s%d", c.config.MerchantCode, merchantRef, amount.IntPart())
// 	h := hmac.New(sha256.New, []byte(c.config.PrivateKey))
// 	h.Write([]byte(data))
// 	return hex.EncodeToString(h.Sum(nil))
// }

// func (c *Client) convertOrderItems(items []interfaces.PaymentOrderItem) []map[string]interface{} {
// 	tripayItems := make([]map[string]interface{}, len(items))
// 	for i, item := range items {
// 		tripayItems[i] = map[string]interface{}{
// 			"sku":      item.SKU,
// 			"name":     item.Name,
// 			"price":    item.Price.IntPart(),
// 			"quantity": item.Quantity,
// 		}
// 		if item.ProductURL != nil {
// 			tripayItems[i]["product_url"] = *item.ProductURL
// 		}
// 		if item.ImageURL != nil {
// 			tripayItems[i]["image_url"] = *item.ImageURL
// 		}
// 	}
// 	return tripayItems
// }

// func (c *Client) makeRequest(ctx context.Context, method, endpoint string, body interface{}) ([]byte, error) {
// 	var reqBody io.Reader
// 	if body != nil {
// 		jsonBody, err := json.Marshal(body)
// 		if err != nil {
// 			return nil, fmt.Errorf("failed to marshal request body: %w", err)
// 		}
// 		reqBody = bytes.NewReader(jsonBody)
// 	}

// 	req, err := http.NewRequestWithContext(ctx, method, c.config.BaseURL+endpoint, reqBody)
// 	if err != nil {
// 		return nil, fmt.Errorf("failed to create request: %w", err)
// 	}

// 	req.Header.Set("Content-Type", "application/json")
// 	req.Header.Set("Authorization", "Bearer "+c.config.APIKey)

// 	resp, err := c.httpClient.Do(req)
// 	if err != nil {
// 		return nil, fmt.Errorf("failed to make request: %w", err)
// 	}
// 	defer func() {
// 		if closeErr := resp.Body.Close(); closeErr != nil {
// 			fmt.Printf("failed to close response body: %v", closeErr)
// 		}
// 	}()

// 	responseBody, err := io.ReadAll(resp.Body)
// 	if err != nil {
// 		return nil, fmt.Errorf("failed to read response body: %w", err)
// 	}

// 	if resp.StatusCode >= 400 {
// 		return nil, fmt.Errorf("tripay API error %d: %s", resp.StatusCode, string(responseBody))
// 	}

// 	return responseBody, nil
// }

// // Response structs for Tripay API
// type TripayCreateInvoiceResponse struct {
// 	Success bool   `json:"success"`
// 	Message string `json:"message"`
// 	Data    struct {
// 		Reference   string  `json:"reference"`
// 		MerchantRef string  `json:"merchant_ref"`
// 		CheckoutURL string  `json:"checkout_url"`
// 		QRString    *string `json:"qr_string"`
// 		Amount      int     `json:"amount"`
// 		Status      string  `json:"status"`
// 		ExpiredTime string  `json:"expired_time"`
// 		CreatedAt   string  `json:"created_at"`
// 		UpdatedAt   string  `json:"updated_at"`
// 	} `json:"data"`
// }

// type TripayChannelsResponse struct {
// 	Success bool   `json:"success"`
// 	Message string `json:"message"`
// 	Data    []struct {
// 		Code       string   `json:"code"`
// 		Name       string   `json:"name"`
// 		Type       string   `json:"type"`
// 		Active     bool     `json:"active"`
// 		MinimumFee *float64 `json:"minimum_fee"`
// 		MaximumFee *float64 `json:"maximum_fee"`
// 		FlatFee    *float64 `json:"flat_fee"`
// 		PercentFee *float64 `json:"percent_fee"`
// 	} `json:"data"`
// }

// type TripayFeeResponse struct {
// 	Success bool   `json:"success"`
// 	Message string `json:"message"`
// 	Data    struct {
// 		Code     string  `json:"code"`
// 		Name     string  `json:"name"`
// 		Fee      float64 `json:"fee"`
// 		TotalFee float64 `json:"total_fee"`
// 	} `json:"data"`
// }
