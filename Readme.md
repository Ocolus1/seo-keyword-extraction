# Web Scraping and Keyword Extraction Tool

This tool performs web scraping on a list of given URLs and extracts keywords from different sections of the web pages, such as the search engine title, page title, subheadings, and main content. It then generates a CSV file with the extracted keywords, along with their counts for each section.

## Table of Contents

1. [Requirements](#requirements)
2. [Functionality Overview](#functionality-overview)
3. [Usage](#usage)
4. [Code Overview](#code-overview)

## Requirements

- **Node.js:** Ensure you have Node.js installed.
- **Packages:** The script utilizes the following npm packages:
  - `puppeteer`
  - `csv-writer`
  - `natural`

You can install them using npm:

```bash
npm install puppeteer csv-writer natural @tootallnate/quickjs-emscripten
```

## Functionality Overview

1. The script starts by defining a set of common stopwords that will be excluded from the keyword extraction.
2. It uses the `natural` library for tokenizing and stemming the webpage content.
3. The `puppeteer` library is used to navigate and scrape content from the provided list of URLs.
4. Extracted keywords along with their counts are saved in a CSV file named `output.csv`.

## Usage

1. Provide the URLs you wish to extract keywords from in the urls array in the script.
2. Run the script:

```bash
node index.js
```

3. After execution, check the generated `output.csv` for the extracted keywords.

## Code Overview

- **Tokenization and Keyword Extraction:** The script tokenizes the content of the webpage, filters out stopwords and numbers, stems the words, and then counts the occurrence of each keyword.

```
function extractKeywordsFromText(text) { ... }
```

- **Web Scraping:** The script navigates to each URL, extracts specific parts of the content, and then processes this content to identify and count keywords.

```
for (const url of urls) { ... }
```

- **CSV Generation:** All identified keywords, their counts, and associated sections are saved in a CSV file.

```
const csvWriter = createCsvWriter({ ... });
csvWriter.writeRecords(records);
```

## Future Improvements

Enhance the keyword extraction algorithm for better accuracy.
Implement error handling for more specific scenarios.
Allow configurable output file name and path.
