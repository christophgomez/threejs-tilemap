const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Define the path to the file you want to delete
const fileToDelete = path.join(__dirname, 'build', 'electron.js');

// Replace 'npm run build' with your specific build command if it's different
const buildCommand = 'npm run build-react';

console.log('Starting build process...');
exec(buildCommand, (error, stdout, stderr) => {
  // Log any build output
  if (stdout) process.stdout.write(stdout);
  if (stderr) process.stderr.write(stderr);

  // If there was an error during build, log it and exit
  if (error) {
    console.error(`Build failed: ${error.message}`);
    process.exit(1);
  }

  // Check if the file exists before trying to delete it
  if (fs.existsSync(fileToDelete)) {
    fs.unlink(fileToDelete, (unlinkError) => {
      if (unlinkError) {
        console.error(`Failed to delete ${fileToDelete}: ${unlinkError.message}`);
        process.exit(1);
      }
      console.log(`Successfully deleted ${fileToDelete}`);
    });
  } else {
    console.log(`File ${fileToDelete} does not exist, no need to delete.`);
  }
});
