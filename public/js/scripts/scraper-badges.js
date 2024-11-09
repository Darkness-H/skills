const puppeteer = require('puppeteer');
const fs = require('fs');

const url = 'https://github.com/Obijuan/digital-electronics-with-open-FPGAs-tutorial/wiki#listado-de-rangos';

let extract = async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle0' });

        console.log('Page loaded successfully');

        const data = await page.evaluate(() => {
            const ids = [];
            const badges = [];
            const ranges = [];
            const points_min = [];
            const points_max = [];

            const tables = Array.from(document.querySelectorAll("#wiki-body .markdown-body table")).slice(6, 11);
            tables.forEach(table => {
                const rows = Array.from(table.querySelectorAll('tbody > tr'));
                rows.forEach(row => {
                    const cells = Array.from(row.querySelectorAll('td'));
                    ids.push(cells[0] ? cells[0].innerText.trim() : null);

                    const img = cells[1]?.querySelector('img');
                    const imageName = img ? img.getAttribute('src').split('/').pop() : null;
                    badges.push(imageName ? imageName.replace('.png', '-min.png') : null);

                    ranges.push(cells[2] ? cells[2].innerText.trim() : null);
                    const idNum = parseInt(cells[0]?.innerText.trim() || '0');
                    points_min.push(idNum * 10);
                    points_max.push(idNum * 10 + 9);
                });
            });

            return ids.map((id, i) => ({
                rango: ranges[i],
                bitpoints_min: points_min[i],
                bitpoints_max: points_max[i],
                png: badges[i]
            }));
        });

        fs.writeFileSync('badges.json', JSON.stringify(data, null, 2));
        console.log('Data saved to badges.json');

        await browser.close();
    } catch (error) {
        console.error('An error occurred:', error);
    }
};

extract();
