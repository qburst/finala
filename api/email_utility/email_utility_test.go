package email_utility

import (
	"testing"
)

const (
	testUsername = "justinjoseph@qburst.com"
	testPassword = "gxip gpyj dcvc rdme"
	testHost     = "smtp.gmail.com"
	testPort     = 587
)

func TestSendEmail(t *testing.T) {
	sender := NewSMTPSender(testHost, testPort, testUsername, testPassword)
	err := sender.Send("justinjoseph287@gmail.com", "Test Finala Report", "<p>Test Body</p>", "")

	if err != nil {
		t.Errorf("Expected no error , got %v", err)
	}
}
