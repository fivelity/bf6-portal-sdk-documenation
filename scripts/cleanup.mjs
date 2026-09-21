const { execSync } = require('child_process');
try {
  execSync('powershell -Command "Remove-Item \'D:\\GitHub\\bf6-portal-sdk-documenation\\apps\\docs\\src\\pages\' -Recurse -Force 2>$null"', { stdio: 'inherit' });
  console.log('Done');
} catch(e) {
  console.log('Error:', e.message);
}
