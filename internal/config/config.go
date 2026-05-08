package config

import (
	"strings"

	"github.com/kelseyhightower/envconfig"
	"github.com/spf13/viper"
)

type Config struct {
	AppEnv                   string `envconfig:"APP_ENV"`
	AppVersion               string `envconfig:"APP_VERSION"`
	AppCommit                string `envconfig:"APP_COMMIT"`
	HTTPAddr                 string `envconfig:"HTTP_ADDR"`
	PagesOrigin              string `envconfig:"PAGES_ORIGIN"`
	NLPWorkerPath            string `envconfig:"NLP_WORKER_PATH"`
	NLPWorkerTimeoutSeconds  int    `envconfig:"NLP_WORKER_TIMEOUT_SECONDS"`
	LangDetectJavaCommand    string `envconfig:"LANGDETECT_JAVA_CMD"`
	ModelCacheDir            string `envconfig:"MODEL_CACHE_DIR"`
	SpacyModelPolicy         string `envconfig:"SPACY_MODEL_POLICY"`
	StanzaResourcesDir       string `envconfig:"STANZA_RESOURCES_DIR"`
	SentenceTransformerModel string `envconfig:"SENTENCE_TRANSFORMER_MODEL"`
}

func Load() (Config, error) {
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	viper.AutomaticEnv()
	viper.SetDefault("APP_ENV", "development")
	viper.SetDefault("APP_VERSION", "0.1.0")
	viper.SetDefault("APP_COMMIT", "dev")
	viper.SetDefault("HTTP_ADDR", ":8080")
	viper.SetDefault("PAGES_ORIGIN", "https://baditaflorin.github.io")
	viper.SetDefault("NLP_WORKER_PATH", "scripts/nlp_worker.py")
	viper.SetDefault("NLP_WORKER_TIMEOUT_SECONDS", 120)
	viper.SetDefault("LANGDETECT_JAVA_CMD", "java -jar /opt/langdetect/langdetect-cli.jar")
	viper.SetDefault("MODEL_CACHE_DIR", "/models")
	viper.SetDefault("SPACY_MODEL_POLICY", "prefer_installed")
	viper.SetDefault("STANZA_RESOURCES_DIR", "/models/stanza")
	viper.SetDefault("SENTENCE_TRANSFORMER_MODEL", "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")

	cfg := Config{
		AppEnv:                   viper.GetString("APP_ENV"),
		AppVersion:               viper.GetString("APP_VERSION"),
		AppCommit:                viper.GetString("APP_COMMIT"),
		HTTPAddr:                 viper.GetString("HTTP_ADDR"),
		PagesOrigin:              viper.GetString("PAGES_ORIGIN"),
		NLPWorkerPath:            viper.GetString("NLP_WORKER_PATH"),
		NLPWorkerTimeoutSeconds:  viper.GetInt("NLP_WORKER_TIMEOUT_SECONDS"),
		LangDetectJavaCommand:    viper.GetString("LANGDETECT_JAVA_CMD"),
		ModelCacheDir:            viper.GetString("MODEL_CACHE_DIR"),
		SpacyModelPolicy:         viper.GetString("SPACY_MODEL_POLICY"),
		StanzaResourcesDir:       viper.GetString("STANZA_RESOURCES_DIR"),
		SentenceTransformerModel: viper.GetString("SENTENCE_TRANSFORMER_MODEL"),
	}

	return cfg, envconfig.Process("", &cfg)
}
