import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface InitOptions {
  projectName?: string;
  projectTitle?: string;
  targetDir?: string;
}

/**
 * Copy template files to target directory, replacing placeholders
 */
function copyTemplate(
  templatePath: string,
  targetPath: string,
  replacements: Record<string, string>
): void {
  const stats = fs.statSync(templatePath);

  if (stats.isDirectory()) {
    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath, { recursive: true });
    }
    const files = fs.readdirSync(templatePath);
    for (const file of files) {
      copyTemplate(
        path.join(templatePath, file),
        path.join(targetPath, file),
        replacements
      );
    }
  } else {
    let content = fs.readFileSync(templatePath, 'utf-8');
    
    // Replace placeholders
    for (const [key, value] of Object.entries(replacements)) {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    fs.writeFileSync(targetPath, content, 'utf-8');
    console.log(`Created: ${path.relative(process.cwd(), targetPath)}`);
  }
}

/**
 * Initialize a new TypeScript project with best practices
 */
export async function init(options: InitOptions = {}): Promise<void> {
  const projectName = options.projectName || path.basename(process.cwd());
  const projectTitle = options.projectTitle || projectName;
  const targetDir = options.targetDir || process.cwd();

  console.log(`\n🚀 Initializing TypeScript Bootstrap for: ${projectName}\n`);

  const templateDir = path.join(__dirname, '..', 'templates');
  
  const replacements = {
    PROJECT_NAME: projectName,
    PROJECT_TITLE: projectTitle,
  };

  try {
    copyTemplate(templateDir, targetDir, replacements);
    
    console.log('\n✅ Project initialized successfully!');
    console.log('\nNext steps:');
    console.log('  1. npm install');
    console.log('  2. npm run dev');
    console.log('\nAvailable commands:');
    console.log('  npm run dev         - Start development server');
    console.log('  npm run build       - Build for production');
    console.log('  npm test            - Run tests');
    console.log('  npm run test:ui     - Run tests with UI');
    console.log('  npm run test:coverage - Generate coverage report');
    console.log('  npm run lint        - Lint code');
    console.log('  npm run lint:fix    - Fix linting issues\n');
  } catch (error) {
    console.error('Error initializing project:', error);
    throw error;
  }
}
