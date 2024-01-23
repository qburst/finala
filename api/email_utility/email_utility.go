package email_utility

import (
	"fmt"

	"github.com/jung-kurt/gofpdf"
	log "github.com/sirupsen/logrus"
	"gopkg.in/gomail.v2"
)

// Email sender interface for sending emails
type EmailSender interface {
	Send(to, subject, body string) error
}

//SMTPSender is the implementation of gmail.v2
type SMTPSender struct {
	Dialer *gomail.Dialer
}

func NewSMTPSender(host string, port int, username, password string) *SMTPSender {
	return &SMTPSender{
		Dialer: gomail.NewDialer(host, port, username, password),
	}
}

func (s *SMTPSender) Send(to, subject, body, attachment string) error {
	m := gomail.NewMessage()
	m.SetHeader("From", s.Dialer.Username)
	m.SetHeader("To", to)
	m.SetHeader("Subject", subject)
	m.SetBody("text/html", body)
	if attachment != "" {
		m.Attach(attachment)
	}
	d := s.Dialer
	return d.DialAndSend(m)
}

//func CreatePDF(pdfFileName, title string, data [][]string) {
func CreatePDF(pdfFileName, description string, data []map[string]interface{}) {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()

	// Set font
	pdf.SetFont("Arial", "B", 10)

	// Title
	pdf.Cell(0, 10, "Finala Report")
	pdf.Ln(15)

	// Set font
	pdf.SetFont("Arial", "", 6)

	// Title
	pdf.Cell(0, 10, description)
	pdf.Ln(15)


	var orderKeys []string
	
	for _, headerCol := range data[0] {
		if innerMap, ok := headerCol.(map[string]interface{}); ok {
			for colKeys, _ := range innerMap {
				orderKeys = append(orderKeys, colKeys)
			}
		}
	}
	
	for _, colNames := range orderKeys {
		pdf.CellFormat(25, 10, colNames, "1", 0, "", false, 0, "")
	}
	
	pdf.Ln(-1)

	for _, tableRecords := range data {
		for _, rows := range tableRecords {
			if colValues, ok := rows.(map[string]interface{}); ok {
				for _, orderKey := range orderKeys {
					pdf.CellFormat(25, 10, fmt.Sprintf("%v", colValues[orderKey]), "1", 0, "", false, 0, "")
				}
				pdf.Ln(-1)
			}
		}
	}

	// Save to file
	err := pdf.OutputFileAndClose(pdfFileName)
	if err != nil {
		fmt.Println("Error creating PDF:", err)
		log.WithFields(log.Fields{"events": len("test")}).Info("Error creating PDF:", err)
	}
	log.WithFields(log.Fields{"events": len("test")}).Info("Pdf created", pdfFileName)
}

func isInArray(target string, arr []string) bool {
	for _, value := range arr {
		if value == target {
			return true
		}
	}
	return false
}
