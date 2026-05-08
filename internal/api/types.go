package api

type AnalyzeRequest struct {
	Documents    []string `json:"documents" validate:"required,min=1,max=100,dive,required"`
	Language     string   `json:"language,omitempty" validate:"omitempty,bcp47_language_tag|alpha"`
	Operations   []string `json:"operations" validate:"required,min=1,dive,oneof=detect tokenize pos parse ner embed cluster"`
	ClusterCount int      `json:"clusterCount,omitempty" validate:"omitempty,min=1,max=20"`
}

type AnalyzeResponse struct {
	Version    string           `json:"version"`
	Commit     string           `json:"commit"`
	Engine     EngineStatus     `json:"engine"`
	Documents  []DocumentResult `json:"documents"`
	Clusters   []Cluster        `json:"clusters"`
	Warnings   []string         `json:"warnings"`
	DurationMS float64          `json:"durationMs"`
}

type EngineStatus struct {
	Spacy                string `json:"spacy"`
	Stanza               string `json:"stanza"`
	NLTK                 string `json:"nltk"`
	SentenceTransformers string `json:"sentenceTransformers"`
	LangDetectJava       string `json:"langdetectJava"`
}

type DocumentResult struct {
	ID        string    `json:"id"`
	Language  string    `json:"language"`
	Text      string    `json:"text"`
	Tokens    []Token   `json:"tokens"`
	Entities  []Entity  `json:"entities"`
	Embedding []float64 `json:"embedding,omitempty"`
	Warnings  []string  `json:"warnings"`
}

type Token struct {
	Text  string `json:"text"`
	Lemma string `json:"lemma,omitempty"`
	POS   string `json:"pos,omitempty"`
	Tag   string `json:"tag,omitempty"`
	Dep   string `json:"dep,omitempty"`
	Head  *int   `json:"head,omitempty"`
	Start *int   `json:"start,omitempty"`
	End   *int   `json:"end,omitempty"`
}

type Entity struct {
	Text  string `json:"text"`
	Label string `json:"label"`
	Start *int   `json:"start,omitempty"`
	End   *int   `json:"end,omitempty"`
}

type Cluster struct {
	ID          int      `json:"id"`
	DocumentIDs []string `json:"documentIds"`
	Label       string   `json:"label"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}
