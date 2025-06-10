package tripay

// TripayCallback represents the callback payload from Tripay
type TripayCallback struct {
	Reference         string  `json:"reference"`
	MerchantRef       string  `json:"merchant_ref"`
	PaymentMethod     string  `json:"payment_method"`
	PaymentMethodCode string  `json:"payment_method_code"`
	TotalAmount       int64   `json:"total_amount"`
	FeeMerchant       int64   `json:"fee_merchant"`
	FeeCustomer       int64   `json:"fee_customer"`
	TotalFee          int64   `json:"total_fee"`
	AmountReceived    int64   `json:"amount_received"`
	IsClosedPayment   int     `json:"is_closed_payment"`
	Status            string  `json:"status"`
	PaidAt            int64   `json:"paid_at"`
	Note              *string `json:"note"`
}

// IsPaid returns true if the payment status is PAID
func (t *TripayCallback) IsPaid() bool {
	return t.Status == "PAID"
}

// IsExpired returns true if the payment status is EXPIRED
func (t *TripayCallback) IsExpired() bool {
	return t.Status == "EXPIRED"
}

// IsFailed returns true if the payment status is FAILED
func (t *TripayCallback) IsFailed() bool {
	return t.Status == "FAILED"
}
