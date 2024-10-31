// Import required modules
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Load skills
const data = require('./skills.json');

// Create the directory 'public/electronics/icons' if it doesn't exist
const downloadDir = path.join(__dirname, '..', '..', '..', 'public', 'electronics', 'icons');
fs.mkdirSync(downloadDir, { recursive: true });

// Function to download a single icon
async function downloadIcon(iconNumber, iconPath) {

  const iconUrl = iconPath;
  const fileName = `icon${iconNumber}.svg`;
  const filePath = path.join(downloadDir, fileName);
    
  const response = await fetch(iconUrl);

  // Check if the response is okay (status code 200-299)
  if (!response.ok) {
    fs.unlink(filePath, () => {}); // Clean up failed download
    throw new Error(`Error downloading icon${iconNumber}: HTTP ${response.status}`);
  }

  // Create a write stream
  const fileStream = fs.createWriteStream(filePath);

  // Pipe the response data into the file stream
  response.body.pipe(fileStream);

  return new Promise((resolve, reject) => {
    fileStream.on('finish', () => {
      resolve(`✓ Icon ${iconNumber} downloaded successfully`);
    });

    fileStream.on('error', (err) => {
      fs.unlink(filePath, () => {}); // Clean up failed download
      reject(`✗ Error downloading icon${iconNumber}: ${err.message}`);
    });
  });

}

// Main function to download all icons
async function downloadAllIcons() {

  console.log('Starting download of icons...\n');
  
  const totalIcons = data.length; // 68 icons
  const downloads = [];

  for (let i = 0; i < totalIcons; i++) {
    downloads.push(
      await downloadIcon(data[i].id, data[i].icon)
        .then(message => console.log(message))
        .catch(error => console.error(error))
    );
  }

  try {
    await Promise.all(downloads);
    console.log('\nAll icons have been downloaded');
  } catch (error) {
    console.error('\nThere were some errors during the download');
  }
}

// Run the download
downloadAllIcons();