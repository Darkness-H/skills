// Use the function Pupperteer for Web Scraping
const puppeteer = require('puppeteer');
const fs = require('fs');

// URL of the webpage to scrape
const url = 'https://tinkererway.dev/web_skill_trees/electronics_skill_tree';

let extraer = async () => {
  try {
    // Launch a new browser instance
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate to the webpage
    await page.goto(url, { waitUntil: 'networkidle0' }); // Wait until the page is loaded

    // Extract the skill ids, competence texts and icons
    const data = await page.evaluate(() => {

      // Get all objective elements
      const ids = Array.from(document.querySelectorAll('div.svg-wrapper'));
      const texts = Array.from(document.querySelectorAll('div.svg-wrapper > svg > text'));
      const icons = Array.from(document.querySelectorAll('div.svg-wrapper > svg > image'));

      return ids.map((idc, i) => ({
        id: idc.getAttribute('data-id'),
    	text: texts[i].textContent.trim(),
    	icon: 'https://tinkererway.dev/web_skill_trees_resources/' + icons[i].href.baseVal.replace(/\.{2}\/\.{2}\/web_skill_trees_resources\//g, '') // Get the absolute path of each icon
      }));

    });

    // Save the data to a JSON file
    fs.writeFileSync('skills.json', JSON.stringify(data, null, 2));

    console.log('Data saved to skills.json');

    // Close the browser instance
    await browser.close();
  } catch (error) {
    console.error('An error occurred:', error);
  }
};

// Call the function
extraer();
