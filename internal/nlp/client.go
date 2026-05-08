package nlp

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"time"

	"github.com/baditaflorin/polyglot-nlp-toolkit/internal/api"
)

type WorkerConfig struct {
	ScriptPath     string
	Timeout        time.Duration
	JavaCommand    string
	ModelCacheDir  string
	StanzaDataDir  string
	Transformer    string
	SpacyPolicy    string
	ApplicationEnv string
}

type WorkerClient struct {
	config WorkerConfig
}

func NewWorkerClient(config WorkerConfig) *WorkerClient {
	if config.Timeout == 0 {
		config.Timeout = 120 * time.Second
	}
	return &WorkerClient{config: config}
}

func (c *WorkerClient) Ready(_ context.Context) error {
	if _, err := os.Stat(c.config.ScriptPath); err != nil {
		return fmt.Errorf("nlp worker unavailable: %w", err)
	}
	return nil
}

func (c *WorkerClient) Analyze(ctx context.Context, request api.AnalyzeRequest) (api.AnalyzeResponse, error) {
	if len(request.Documents) == 0 {
		return api.AnalyzeResponse{}, errors.New("at least one document is required")
	}

	ctx, cancel := context.WithTimeout(ctx, c.config.Timeout)
	defer cancel()

	payload, err := json.Marshal(request)
	if err != nil {
		return api.AnalyzeResponse{}, fmt.Errorf("marshal request: %w", err)
	}

	// #nosec G204 -- worker path is deployment configuration, not user input.
	cmd := exec.CommandContext(ctx, "python3", c.config.ScriptPath)
	cmd.Env = append(os.Environ(),
		"LANGDETECT_JAVA_CMD="+c.config.JavaCommand,
		"MODEL_CACHE_DIR="+c.config.ModelCacheDir,
		"STANZA_RESOURCES_DIR="+c.config.StanzaDataDir,
		"SENTENCE_TRANSFORMER_MODEL="+c.config.Transformer,
		"SPACY_MODEL_POLICY="+c.config.SpacyPolicy,
		"APP_ENV="+c.config.ApplicationEnv,
	)
	cmd.Stdin = bytes.NewReader(payload)

	var stdout bytes.Buffer
	var stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	if err := cmd.Run(); err != nil {
		if ctx.Err() != nil {
			return api.AnalyzeResponse{}, ctx.Err()
		}
		return api.AnalyzeResponse{}, fmt.Errorf("nlp worker failed: %w: %s", err, stderr.String())
	}

	var response api.AnalyzeResponse
	if err := json.Unmarshal(stdout.Bytes(), &response); err != nil {
		return api.AnalyzeResponse{}, fmt.Errorf("decode worker response: %w: %s", err, stdout.String())
	}
	return response, nil
}
