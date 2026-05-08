# Privacy

The GitHub Pages frontend does not include analytics in v1.

The frontend sends corpus text only to the API base URL configured in the UI.
By default during development this is:

http://localhost:8080

Do not point the UI at a backend you do not trust with your corpus data.

The project does not store corpora in browser storage by default. The frontend
may store non-sensitive UI preferences such as API base URL and selected tasks.
