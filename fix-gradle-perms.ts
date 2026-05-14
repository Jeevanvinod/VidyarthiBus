import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const gradlewPath = path.join(process.cwd(), 'android', 'gradlew');
if (fs.existsSync(gradlewPath)) {
  fs.chmodSync(gradlewPath, '755');
  console.log('Successfully set executable permissions on gradlew');
  
  try {
    console.log('Starting Gradle build...');
    // Use the absolute path to gradlew to be safe
    execSync(`${gradlewPath} -p android assembleDebug`, { stdio: 'inherit' });
    console.log('Build successful!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
} else {
  console.error('gradlew not found at', gradlewPath);
  process.exit(1);
}
