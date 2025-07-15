import { config } from 'dotenv';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
config();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set up environment variables
const env = {
  ...process.env,
  SUPABASE_URL: process.env.VITE_SUPABASE_URL,
  SUPABASE_SERVICE_KEY: process.env.VITE_SUPABASE_ANON_KEY
};

// Run the fetch script
const scriptPath = join(__dirname, 'fetch-daily-news.mjs');
const child = spawn('node', [scriptPath], { env, stdio: 'inherit' });

child.on('error', (error) => {
  console.error('Failed to start script:', error);
});

child.on('exit', (code) => {
  if (code !== 0) {
    console.error(`Script exited with code ${code}`);
  }
});