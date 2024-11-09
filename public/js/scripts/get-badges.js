// Import required modules
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Load skills
const data = require('./badges.json');

// Create the directory 'public/badges' if it doesn't exist
const downloadDir = path.join(__dirname, '..', '..', '..', 'public', 'badges');
fs.mkdirSync(downloadDir, { recursive: true });

// Function to download a single badge
async function downloadBadge(badgeName, badgePath) {

    const badgeUrl = badgePath;
    const fileName = `${badgePath}`;
    const filePath = path.join(downloadDir, fileName);

    const response = await fetch(`https://github.com/Obijuan/digital-electronics-with-open-FPGAs-tutorial/raw/master/rangos/png/${badgeUrl}`);

    // Check if the response is okay (status code 200-299)
    if (!response.ok) {
        fs.unlink(filePath, () => {}); // Clean up failed download
        throw new Error(`Error downloading badge ${badgeName}: HTTP ${response.status}`);
    }

    // Create a write stream
    const fileStream = fs.createWriteStream(filePath);

    // Pipe the response data into the file stream
    response.body.pipe(fileStream);

    return new Promise((resolve, reject) => {
        fileStream.on('finish', () => {
            resolve(`✓ badge ${badgeName} downloaded successfully`);
        });

        fileStream.on('error', (err) => {
            fs.unlink(filePath, () => {}); // Clean up failed download
            reject(`✗ Error downloading badge ${badgeName}: ${err.message}`);
        });
    });

}

// Main function to download all badges
async function downloadAllBadges() {

    console.log('Starting download of badges...\n');

    const totalBadges = data.length; // 68 badges
    const downloads = [];

    for (let i = 0; i < totalBadges; i++) {
        downloads.push(
            await downloadBadge(data[i].rango, data[i].png)
                .then(message => console.log(message))
                .catch(error => console.error(error))
        );
    }

    try {
        await Promise.all(downloads);
        console.log('\nAll badges have been downloaded');
    } catch (error) {
        console.error('\nThere were some errors during the download');
    }
}

// Run the download
downloadAllBadges();
