const puppeteer = require('puppeteer');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const natural = require('natural');

// Initializing a tokenizer from the 'natural' library
const tokenizer = new natural.WordTokenizer();

// Predefined list of common stopwords
const stopwords = [
	'a',
	'about',
	'above',
	'after',
	'again',
	'against',
	'all',
	'am',
	'an',
	'and',
	'any',
	'are',
	'as',
	'at',
	'be',
	'because',
	'been',
	'before',
	'being',
	'below',
	'between',
	'both',
	'but',
	'by',
	'could',
	'did',
	'do',
	'does',
	'doing',
	'down',
	'during',
	'each',
	'few',
	'for',
	'from',
	'further',
	'had',
	'has',
	'have',
	'having',
	'he',
	"he'd",
	"he'll",
	"he's",
	'her',
	'here',
	"here's",
	'hers',
	'herself',
	'him',
	'himself',
	'his',
	'how',
	"how's",
	'i',
	"i'd",
	"i'll",
	"i'm",
	"i've",
	'if',
	'in',
	'into',
	'is',
	'it',
	"it's",
	'its',
	'itself',
	"let's",
	'me',
	'more',
	'most',
	'my',
	'myself',
	'nor',
	'of',
	'on',
	'once',
	'only',
	'or',
	'other',
	'ought',
	'our',
	'ours',
	'ourselves',
	'out',
	'over',
	'own',
	'same',
	'she',
	"she'd",
	"she'll",
	"she's",
	'should',
	'so',
	'some',
	'such',
	'than',
	'that',
	"that's",
	'the',
	'their',
	'theirs',
	'them',
	'themselves',
	'then',
	'there',
	"there's",
	'these',
	'they',
	"they'd",
	"they'll",
	"they're",
	"they've",
	'this',
	'those',
	'through',
	'to',
	'too',
	'under',
	'until',
	'up',
	'very',
	'was',
	'we',
	"we'd",
	"we'll",
	"we're",
	"we've",
	'were',
	'what',
	"what's",
	'when',
	"when's",
	'where',
	"where's",
	'which',
	'while',
	'who',
	"who's",
	'whom',
	'why',
	"why's",
	'with',
	'would',
	'you',
	"you'd",
	"you'll",
	"you're",
	"you've",
	'your',
	'yours',
	'yourself',
	'yourselves',
];

// This function extracts keywords from given text by:
// 1. Tokenizing the text
// 2. Filtering out numbers and stopwords
// 3. Stemming the words to reduce them to their base form
// 4. Counting the occurrence of each stemmed word
async function extractKeywordsFromText(text) {
	// Tokenize the text
	let tokens = tokenizer.tokenize(text);

	// Filter out numbers, stopwords, and stem the words
	tokens = tokens
		.filter((token) => isNaN(token))
		.filter((token) => !stopwords.includes(token.toLowerCase()))
		.map((token) => natural.PorterStemmer.stem(token));

	// Count the occurrence of each word
	const frequency = {};
	tokens.forEach((token) => {
		frequency[token] = (frequency[token] || 0) + 1;
	});

	return frequency;
}

// Self-invoking async function
(async () => {
	// List of URLs to extract data from
	const urls = [
		'https://www.runnersworld.com/gear/a19663621/best-running-shoes/',
		'https://www.fleetfeet.com/running-shoe-buyers-guide',
		'https://nymag.com/strategist/article/best-running-shoes-men-women.html',
	];

	// Launch puppeteer browser instance
	const browser = await puppeteer.launch({
		headless: false,
		args: ['--no-sandbox', '--disable-setuid-sandbox'],
	});

	// Array to store extracted records
	const records = [];

	// Loop through each URL to extract data
	for (const url of urls) {
		const page = await browser.newPage();
		await page.goto(url, { timeout: 60000 });

		try {
			// Extract various parts of the webpage
			const searchEngineTitle = await page.title();
			const pageTitle = await page.$eval(
				'h1',
				(element) => element.textContent
			);
			const subheadings = await page.$$eval('h2, h3', (elements) =>
				elements.map((el) => el.textContent)
			);
			const mainContent = await page.$$eval('p, li, table', (elements) =>
				elements.map((el) => el.textContent)
			);

			// Organize the extracted data into sections
			const sections = [
				{ name: 'Search Engine Title', data: [searchEngineTitle] },
				{ name: 'Page Title', data: [pageTitle] },
				{ name: 'SubHeadings', data: subheadings },
				{ name: 'Main Content', data: mainContent },
			];

			// Loop through each section and extract keywords
			for (const section of sections) {
				const allText = section.data.join(' ');
				const keywords = await extractKeywordsFromText(allText);

				// Push the extracted keywords along with their count into the records array
				for (const [keyword, count] of Object.entries(keywords)) {
					records.push({
						section: section.name,
						url,
						keyword,
						count,
					});
				}
			}
		} catch (error) {
			console.error(`Failed to extract data from ${url}:`, error.message);
		}

		// Close the current page and proceed to the next URL
		await page.close();
	}

	// Close the browser once all data extraction is done
	await browser.close();

	// Define a CSV writer with required headers
	const csvWriter = createCsvWriter({
		path: 'output.csv',
		header: [
			{ id: 'section', title: 'Section' },
			{ id: 'url', title: 'URL' },
			{ id: 'keyword', title: 'Keyword' },
			{ id: 'count', title: 'Count' },
		],
	});

	// Write the records to the CSV file
	await csvWriter.writeRecords(records);
	console.log('CSV file created successfully!');
})();
