// Use the function Pupperteer for Web Scraping
const puppeteer = require('puppeteer');
const fs = require('fs');

// URL of the webpage to scrape
const url = 'https://github.com/Obijuan/digital-electronics-with-open-FPGAs-tutorial/wiki#listado-de-rangos';

let extract = async () => {
    try {
        // Launch a new browser instance
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Navigate to the webpage
        await page.goto(url, { waitUntil: 'networkidle0' }); // Wait until the page is loaded

        // Extract the badges
        const data = await page.evaluate(() => {
            // Get all objective elements
            const ids = [];
            const badges = [];
            const range = [];
            const points_min = [];
            const points_max = [];


            let table = Array.from(document.querySelector('div.markdown-body').querySelectorAll('table')).slice(6, 11);
            table.forEach(t => {
                let trs = Array.from(t.querySelectorAll('tbody > tr'));
                trs.forEach(tr =>{
                    let tds = Array.from(tr.querySelectorAll('td'));
                    ids.push(tds[0]);

                    const img = tds[1].querySelector('img');
                    if (img) {
                        const imgUrl = img.getAttribute('src');
                        const imageName = imgUrl.split('/').pop(); // Obtener solo el nombre de la imagen
                        badges.push(imageName); // Guardar el nombre de la imagen
                    } else {
                        console.error(`No se encontró una imagen`);
                    }

                    range.push(tds[2]);
                    points_min.push(tds[0]*10);
                    points_max.push(tds[0]*10+9);
                })
            });

            return ids.map(i => ({
                rango: range[i],
                bitpoints_min: points_min[i],
                bitpoints_max: points_max[i],
                badge: badges[i] // Get the absolute path of each badge
            }));

        });

        // Save the data to a JSON file
        fs.writeFileSync('badges.json', JSON.stringify(data, null, 2));

        console.log('Data saved to badges.json');

        // Close the browser instance
        await browser.close();
    } catch (error) {
        console.error('An error occurred:', error);
    }
};

// Call the function
extract();
