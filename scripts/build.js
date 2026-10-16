const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Running ExpiryBox production client build...');
try {
  execSync('npm run build --workspace=client', { stdio: 'inherit' });
  console.log('✓ Vite client built successfully in client/dist');

  const clientDist = path.join(__dirname, '..', 'client', 'dist');
  const rootDist = path.join(__dirname, '..', 'dist');

  if (fs.existsSync(clientDist)) {
    fs.cpSync(clientDist, rootDist, { recursive: true });
    console.log(`✓ Synchronized build output to root dist directory`);
  }
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
