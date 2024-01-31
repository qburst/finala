package config

import (
	"io/ioutil"
	"os"
	"strings"

	"gopkg.in/yaml.v2"

	log "github.com/sirupsen/logrus"
)

// ElasticsearchConfig describe elasticsarch sotrage configuration
type ElasticsearchConfig struct {
	Username  string   `yaml:"username"`
	Password  string   `yaml:"password"`
	Endpoints []string `yaml:"endpoints"`
}

// StorageConfig describe the supported storage types
type StorageConfig struct {
	ElasticSearch ElasticsearchConfig `yaml:"elasticsearch"`
}

type EmailConfig struct {
	Username   string `yaml:"username"`
	Password   string `yaml:"password"`
	SMTPServer string `yaml:"smtpServer"`
	SMTPPort   string `yaml:"smtpPort"`
}

// APIConfig present the application config
type APIConfig struct {
	LogLevel string        `yaml:"log_level"`
	Storage  StorageConfig `yaml:"storage"`
	SMTPConf EmailConfig   `yaml:"smtp"`
}

// SendEmail struct describes the email sending parameters
type SendEmailInfo struct {
	ToEmails     string
	ExecutionID  string
	ResourceType string
	Columns      []string
	Filters      map[string]string
}

// LoadAPI will load yaml file go struct
func LoadAPI(location string) (APIConfig, error) {
	config := APIConfig{}
	data, err := ioutil.ReadFile(location)
	if err != nil {
		log.Errorf("Could not parse configuration file: %s", err)
		return config, err
	}
	err = yaml.Unmarshal(data, &config)
	if err != nil {
		return config, err
	}

	overrideStorageEndpoint := os.Getenv("OVERRIDE_STORAGE_ENDPOINT")
	if overrideStorageEndpoint != "" {
		log.WithFields(log.Fields{
			"environment_variable": "OVERRIDE_STORAGE_ENDPOINT",
			"value":                overrideStorageEndpoint,
		}).Info("override storage endpoint")
		config.Storage.ElasticSearch.Endpoints = strings.Split(overrideStorageEndpoint, ",")
	}

	return config, nil
}
