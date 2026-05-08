package api

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/baditaflorin/polyglot-nlp-toolkit/internal/config"
)

type fakeAnalyzer struct{}

func (fakeAnalyzer) Analyze(_ context.Context, request AnalyzeRequest) (AnalyzeResponse, error) {
	return AnalyzeResponse{
		Engine: EngineStatus{Spacy: "test", Stanza: "test", NLTK: "test", SentenceTransformers: "test", LangDetectJava: "test"},
		Documents: []DocumentResult{{
			ID:       "doc-1",
			Language: request.Language,
			Text:     request.Documents[0],
			Tokens:   []Token{{Text: "Bucuresti", POS: "PROPN"}},
		}},
	}, nil
}

func (fakeAnalyzer) Ready(context.Context) error {
	return nil
}

func TestAnalyze(t *testing.T) {
	router := NewRouter(RouterConfig{
		Config:   config.Config{PagesOrigin: "http://localhost:5173"},
		Analyzer: fakeAnalyzer{},
		Version:  "test",
		Commit:   "abc123",
	})

	body := `{"documents":["Bucuresti este capitala Romaniei."],"language":"ro","operations":["detect","tokenize"]}`
	req := httptest.NewRequest(http.MethodPost, "/api/v1/analyze", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rec.Code, rec.Body.String())
	}

	var response AnalyzeResponse
	if err := json.NewDecoder(rec.Body).Decode(&response); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if response.Version != "test" || response.Commit != "abc123" {
		t.Fatalf("version metadata missing: %+v", response)
	}
	if len(response.Documents) != 1 {
		t.Fatalf("expected one document, got %d", len(response.Documents))
	}
}
