// This script helps you add shadcn/ui components
// Run with: node setup-shadcn.js

import { execSync } from 'child_process';

console.log('Setting up shadcn/ui components...');

// Function to run a command and log output
function runCommand(command) {
  console.log(`Running: ${command}`);
  try {
    execSync(command, { stdio: 'inherit', cwd: __dirname });
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error);
    process.exit(1);
  }
}

// Add more components as needed
const components = [
  'button',
  'card',
  'input',
  'separator',
  // Add more components here as needed
];

// Install components
components.forEach(component => {
  console.log(`\nAdding ${component} component...`);
  runCommand(`pnpm dlx shadcn-ui@latest add ${component} --yes`);
});

console.log('\nSetup complete! shadcn/ui components have been added.');