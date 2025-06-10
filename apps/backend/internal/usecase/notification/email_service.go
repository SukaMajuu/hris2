package notification

import (
	"context"
	"fmt"
	"log"
	"net/smtp"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/pkg/config"
	"github.com/resend/resend-go/v2"
)

type EmailService struct {
	resendClient *resend.Client
	config       config.EmailConfig
	useResend    bool
}

func NewEmailService(cfg config.Config) *EmailService {
	useResend := cfg.Email.ResendAPIKey != ""
	var resendClient *resend.Client

	if useResend {
		resendClient = resend.NewClient(cfg.Email.ResendAPIKey)
		log.Println("✅ Email service initialized with Resend API")
	} else {
		log.Println("⚠️ Email service initialized with SMTP fallback")
	}

	return &EmailService{
		resendClient: resendClient,
		config:       cfg.Email,
		useResend:    useResend,
	}
}

func (es *EmailService) SendTrialActivated(ctx context.Context, user *domain.User, subscription *domain.Subscription) error {
	subject := "🎉 Your HRIS Trial is Now Active!"

	htmlContent := fmt.Sprintf(`
	<!DOCTYPE html>
	<html>
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Trial Activated</title>
	</head>
	<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
		<div style="background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
			<h1 style="margin: 0; font-size: 28px;">🎉 Welcome to HRIS!</h1>
			<p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your trial is now active</p>
		</div>

		<div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
			<p>Hello <strong>%s</strong>,</p>

			<p>Great news! Your HRIS trial subscription is now active and ready to use.</p>

			<div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
				<h3 style="margin-top: 0; color: #28a745;">Trial Details</h3>
				<p><strong>Plan:</strong> %s</p>
				<p><strong>Trial Period:</strong> 14 days</p>
				<p><strong>Expires:</strong> %s</p>
				<p><strong>Max Employees:</strong> %d</p>
			</div>

			<div style="text-align: center; margin: 30px 0;">
				<a href="https://hrispblfrontend.agreeablecoast-95647c57.southeastasia.azurecontainerapps.io/dashboard"
				   style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
					Start Using HRIS
				</a>
			</div>

			<h3>What you can do now:</h3>
			<ul>
				<li>✅ Add employees to your organization</li>
				<li>✅ Create departments and manage roles</li>
				<li>✅ Track attendance and performance</li>
				<li>✅ Generate reports and analytics</li>
			</ul>

			<p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px;">
				Need help getting started? Reply to this email or contact our support team.
			</p>
		</div>
	</body>
	</html>`,
		user.Email,
		subscription.SubscriptionPlan.Name,
		subscription.TrialEndDate.Format("January 2, 2006"),
		subscription.SeatPlan.MaxEmployees,
	)

	return es.sendEmail(ctx, user.Email, subject, htmlContent, "")
}

func (es *EmailService) SendTrialWarning(ctx context.Context, user *domain.User, subscription *domain.Subscription, daysLeft int) error {
	subject := fmt.Sprintf("⚠️ Your HRIS Trial Expires in %d Days", daysLeft)

	urgencyColor := "#ffc107" // yellow
	if daysLeft <= 3 {
		urgencyColor = "#dc3545" // red
	}

	htmlContent := fmt.Sprintf(`
	<!DOCTYPE html>
	<html>
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Trial Warning</title>
	</head>
	<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
		<div style="background: %s; color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
			<h1 style="margin: 0; font-size: 28px;">⚠️ Trial Expiring Soon</h1>
			<p style="margin: 10px 0 0 0; font-size: 18px; font-weight: bold;">%d days remaining</p>
		</div>

		<div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
			<p>Hello <strong>%s</strong>,</p>

			<p>Your HRIS trial will expire in <strong>%d days</strong> on <strong>%s</strong>.</p>

			<div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid %s;">
				<h3 style="margin-top: 0; color: %s;">Don't Lose Access!</h3>
				<p>Upgrade now to continue using all HRIS features without interruption.</p>
			</div>

			<div style="text-align: center; margin: 30px 0;">
				<a href="https://hrispblfrontend.agreeablecoast-95647c57.southeastasia.azurecontainerapps.io/subscription/checkout"
				   style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-right: 10px;">
					Upgrade Now
				</a>
				<a href="https://hrispblfrontend.agreeablecoast-95647c57.southeastasia.azurecontainerapps.io/subscription"
				   style="background: #6c757d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
					View Plans
				</a>
			</div>
		</div>
	</body>
	</html>`,
		urgencyColor,
		daysLeft,
		user.Email,
		daysLeft,
		subscription.TrialEndDate.Format("January 2, 2006"),
		urgencyColor,
		urgencyColor,
	)

	return es.sendEmail(ctx, user.Email, subject, htmlContent, "")
}

func (es *EmailService) SendTrialExpired(ctx context.Context, user *domain.User, subscription *domain.Subscription) error {
	subject := "❌ Your HRIS Trial Has Expired"

	htmlContent := fmt.Sprintf(`
	<!DOCTYPE html>
	<html>
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Trial Expired</title>
	</head>
	<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
		<div style="background: #dc3545; color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
			<h1 style="margin: 0; font-size: 28px;">❌ Trial Expired</h1>
			<p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">But you can still upgrade!</p>
		</div>

		<div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
			<p>Hello <strong>%s</strong>,</p>

			<p>Your HRIS trial period has ended. We hope you enjoyed exploring all the features!</p>

			<div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
				<h3 style="margin-top: 0; color: #007bff;">Ready to Continue?</h3>
				<p>Upgrade to a paid plan to restore access to your data and continue using HRIS.</p>
				<ul>
					<li>✅ Restore full access to your employee data</li>
					<li>✅ Continue using all premium features</li>
					<li>✅ Get priority customer support</li>
					<li>✅ Regular feature updates</li>
				</ul>
			</div>

			<div style="text-align: center; margin: 30px 0;">
				<a href="https://hrispblfrontend.agreeablecoast-95647c57.southeastasia.azurecontainerapps.io/subscription/checkout"
				   style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
					Upgrade Now
				</a>
			</div>
		</div>
	</body>
	</html>`,
		user.Email,
	)

	return es.sendEmail(ctx, user.Email, subject, htmlContent, "")
}

func (es *EmailService) SendPaymentSuccess(ctx context.Context, user *domain.User, subscription *domain.Subscription) error {
	subject := "✅ Payment Successful - HRIS Subscription Activated"

	htmlContent := fmt.Sprintf(`
	<!DOCTYPE html>
	<html>
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Payment Success</title>
	</head>
	<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
		<div style="background: #28a745; color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
			<h1 style="margin: 0; font-size: 28px;">✅ Payment Successful!</h1>
			<p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your subscription is now active</p>
		</div>

		<div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
			<p>Hello <strong>%s</strong>,</p>

			<p>Thank you for your payment! Your HRIS subscription has been successfully activated.</p>

			<div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
				<h3 style="margin-top: 0; color: #28a745;">Subscription Details</h3>
				<p><strong>Plan:</strong> %s</p>
				<p><strong>Status:</strong> Active</p>
				<p><strong>Next Billing:</strong> %s</p>
				<p><strong>Max Employees:</strong> %d</p>
			</div>

			<div style="text-align: center; margin: 30px 0;">
				<a href="https://hrispblfrontend.agreeablecoast-95647c57.southeastasia.azurecontainerapps.io/dashboard"
				   style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
					Access Dashboard
				</a>
			</div>
		</div>
	</body>
	</html>`,
		user.Email,
		subscription.SubscriptionPlan.Name,
		subscription.EndDate.Format("January 2, 2006"),
		subscription.SeatPlan.MaxEmployees,
	)

	return es.sendEmail(ctx, user.Email, subject, htmlContent, "")
}

// Core email sending method
func (es *EmailService) sendEmail(ctx context.Context, to, subject, htmlContent, textContent string) error {
	if es.useResend {
		return es.sendWithResend(ctx, to, subject, htmlContent, textContent)
	}
	return es.sendWithSMTP(to, subject, htmlContent)
}

// Send email using Resend API (preferred method)
func (es *EmailService) sendWithResend(ctx context.Context, to, subject, htmlContent, textContent string) error {
	params := &resend.SendEmailRequest{
		From:    fmt.Sprintf("%s <%s>", es.config.FromName, es.config.FromEmail),
		To:      []string{to},
		Subject: subject,
		Html:    htmlContent,
	}

	if textContent != "" {
		params.Text = textContent
	}

	sent, err := es.resendClient.Emails.Send(params)
	if err != nil {
		return fmt.Errorf("failed to send email via Resend: %w", err)
	}

	log.Printf("✅ Email sent successfully via Resend (ID: %s) to %s", sent.Id, to)
	return nil
}

// Fallback SMTP method (legacy)
func (es *EmailService) sendWithSMTP(to, subject, htmlContent string) error {
	// SMTP implementation as fallback
	auth := smtp.PlainAuth("", es.config.SMTPUsername, es.config.SMTPPassword, es.config.SMTPHost)

	from := es.config.FromEmail
	message := fmt.Sprintf("To: %s\r\nSubject: %s\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n%s\r\n", to, subject, htmlContent)

	err := smtp.SendMail(es.config.SMTPHost+":"+es.config.SMTPPort, auth, from, []string{to}, []byte(message))
	if err != nil {
		return fmt.Errorf("failed to send email via SMTP: %w", err)
	}

	log.Printf("✅ Email sent successfully via SMTP to %s", to)
	return nil
}
