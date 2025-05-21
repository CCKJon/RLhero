#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\x1b[36m%s\x1b[0m', '🎮 RL Hero - Setup Wizard');
console.log('\x1b[36m%s\x1b[0m', '-----------------------');
console.log('This script will help you set up your RL Hero application.\n');

// Check if .env.local exists, if not create it
const envPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), '.env.local.example');

if (!fs.existsSync(envPath)) {
  console.log('Creating .env.local file...');
  
  // If example exists, copy from it
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('Created .env.local from example file. Please update it with your Firebase credentials.');
  } else {
    // Create empty .env.local file with instructions
    const envContent = `# Firebase Configuration
# Please fill in your Firebase credentials
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
`;
    fs.writeFileSync(envPath, envContent);
    console.log('Created empty .env.local file. Please update it with your Firebase credentials.');
  }
}

// Ask if they want to create a public/images directory structure
rl.question('Would you like to create the recommended directory structure for images? (Y/n) ', (answer) => {
  if (answer.toLowerCase() !== 'n') {
    console.log('Creating image directories...');
    
    const directories = [
      'public/images',
      'public/images/avatars',
      'public/images/tutorial',
      'public/images/items',
    ];
    
    directories.forEach(dir => {
      const dirPath = path.join(process.cwd(), dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
    
    console.log('Created image directories.');
  }
  
  // Ask if they want to install dependencies
  rl.question('Would you like to install dependencies now? (Y/n) ', (answer) => {
    if (answer.toLowerCase() !== 'n') {
      console.log('Installing dependencies...');
      
      try {
        execSync('npm install', { stdio: 'inherit' });
        console.log('Dependencies installed successfully.');
      } catch (error) {
        console.error('Error installing dependencies:', error.message);
      }
    }
    
    console.log('\n\x1b[32m%s\x1b[0m', '✅ Setup complete!');
    console.log('\nTo start the development server, run:');
    console.log('\x1b[33m%s\x1b[0m', 'npm run dev');
    console.log('\nMake sure to update your .env.local file with your Firebase credentials before running the app.');
    
    rl.close();
  });
}); 