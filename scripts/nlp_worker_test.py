"""Tests for scripts/nlp_worker.py.

Run directly with `python3 scripts/nlp_worker_test.py` (no pytest dependency
required) or with pytest if it happens to be installed -- both work since
these are plain `test_*` functions using bare `assert`.
"""

import json
import subprocess
import sys


def run_worker(payload):
    process = subprocess.run(
        [sys.executable, "scripts/nlp_worker.py"],
        input=json.dumps(payload),
        text=True,
        capture_output=True,
        check=True,
    )
    return json.loads(process.stdout)


def test_worker_returns_tokens():
    payload = {
        "documents": ["Bucuresti este capitala Romaniei."],
        "operations": ["detect", "tokenize", "embed", "cluster"],
        "clusterCount": 1,
    }
    response = run_worker(payload)
    assert response["documents"][0]["language"] in {"ro", "und"}
    assert response["documents"][0]["tokens"]
    assert response["clusters"]


def test_chinese_tokenizes_per_character_not_per_sentence():
    """Regression test for the CJK word-count-collapse bug.

    `\\w` matches Han ideographs and Python's `re` module is greedy, so a
    naive `\\w+`-based tokenizer swallows an entire run of Chinese text with
    no ASCII whitespace into a single "token" per clause instead of splitting
    it into individual words/characters. This made token/word counts wildly
    inaccurate for languages written without inter-word spaces. Reproduces
    with and without spaCy installed: the regex fallback used TOKEN_RE
    directly, and spaCy's own blank tokenizer (used whenever no trained
    pipeline is available for the language, which is every language in this
    project's Docker image) has the exact same failure mode.
    """
    text = "这是一个测试。我们正在检查分词是否正确。"
    payload = {"documents": [text], "operations": ["tokenize"], "language": "zh"}
    response = run_worker(payload)
    tokens = response["documents"][0]["tokens"]

    # Before the fix this was 4 tokens: two multi-character CJK blobs plus the
    # two punctuation marks. Character-level segmentation should recover one
    # token per Han character (18) plus the two punctuation marks (2).
    assert len(tokens) == 20, tokens
    # No single token should ever span more than one CJK ideograph.
    assert all(len(token["text"]) == 1 for token in tokens), tokens


def test_japanese_splits_across_full_width_sentence_boundary():
    """Regression test for CJK-punctuation sentence-boundary blindness.

    spaCy's blank "xx" tokenizer (the fallback used for Japanese in this
    project's Docker image, since it does not install SudachiPy) only splits
    on ASCII whitespace. Because Japanese sentences have no whitespace at
    all, a naive fix that only special-cased "pure CJK" runs would still
    merge *across* a full-width "。" sentence terminator into one token
    spanning two sentences, hiding the sentence boundary entirely.
    """
    text = "これはテストです。日本語の分かち書きを確認します。"
    payload = {"documents": [text], "operations": ["tokenize"], "language": "ja"}
    response = run_worker(payload)
    tokens = [token["text"] for token in response["documents"][0]["tokens"]]

    assert tokens.count("。") == 2, tokens
    assert all(len(token) == 1 for token in tokens), tokens


def test_korean_word_spacing_is_not_regressed():
    """Korean (Hangul) uses spaces between words like Latin/Cyrillic/Arabic,
    so it must NOT be exploded into per-syllable tokens by the CJK fix -
    that would be a regression, not an improvement."""
    text = "이것은 테스트입니다. 한국어 토큰화를 확인합니다."
    payload = {"documents": [text], "operations": ["tokenize"], "language": "ko"}
    response = run_worker(payload)
    tokens = [token["text"] for token in response["documents"][0]["tokens"]]
    assert tokens == ["이것은", "테스트입니다", ".", "한국어", "토큰화를", "확인합니다", "."], tokens


def test_space_delimited_scripts_still_group_into_words():
    """Latin/Cyrillic/Arabic words (space-delimited) must stay grouped as
    whole-word tokens; only scripts without whitespace word boundaries should
    be split character-by-character."""
    text = "This is a test."
    payload = {"documents": [text], "operations": ["tokenize"], "language": "en"}
    response = run_worker(payload)
    tokens = [token["text"] for token in response["documents"][0]["tokens"]]
    assert tokens == ["This", "is", "a", "test", "."]


if __name__ == "__main__":
    tests = [
        (name, value)
        for name, value in sorted(globals().items())
        if name.startswith("test_") and callable(value)
    ]
    failures = []
    for name, test in tests:
        try:
            test()
        except Exception as exc:  # noqa: BLE001 - report and keep going
            failures.append((name, exc))
            print(f"FAIL {name}: {exc}")
        else:
            print(f"PASS {name}")
    print(f"{len(tests) - len(failures)}/{len(tests)} passed")
    if failures:
        raise SystemExit(1)
