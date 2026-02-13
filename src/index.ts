import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const UPDATABLE_FILES = [
  'tsconfig.node.json',
  'vite.config.ts',
  'index.html',
];

/**
 * Helper function to copy a directory from the main project to a target directory
 */
function copyDirectory(
  sourceRelPath: string,
  targetBaseDir: string,
  fileCallback: (relativePath: string, absolutePath: string) => void
): void {
  const sourceDir = path.join(__dirname, '..', sourceRelPath);
  const targetDir = path.join(targetBaseDir, sourceRelPath);
  
  if (fs.existsSync(sourceDir)) {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    const files = fs.readdirSync(sourceDir);
    for (const file of files) {
      const sourcePath = path.join(sourceDir, file);
      const targetPath = path.join(targetDir, file);
      
      if (fs.statSync(sourcePath).isFile()) {
        fs.copyFileSync(sourcePath, targetPath);
        fileCallback(`${sourceRelPath}/${file}`, targetPath);
      }
    }
  }
}

/**
 * Helper function to copy a file from the main project to a target directory
 */
function copyFile(
  sourceRelPath: string,
  targetBaseDir: string,
  fileCallback: (relativePath: string, absolutePath: string) => void
): void {
  const sourceFile = path.join(__dirname, '..', sourceRelPath);
  const targetFile = path.join(targetBaseDir, sourceRelPath);
  
  if (fs.existsSync(sourceFile)) {
    const targetDirPath = path.dirname(targetFile);
    if (!fs.existsSync(targetDirPath)) {
      fs.mkdirSync(targetDirPath, { recursive: true });
    }
    fs.copyFileSync(sourceFile, targetFile);
    fileCallback(sourceRelPath, targetFile);
  }
}

interface InitOptions {
  projectName?: string;
  projectTitle?: string;
  targetDir?: string;
}

interface UpdateOptions {
  targetDir?: string;
  force?: boolean;
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
      // Rename _gitignore to .gitignore during copy
      const targetFile = file === '_gitignore' ? '.gitignore' : file;
      copyTemplate(
        path.join(templatePath, file),
        path.join(targetPath, targetFile),
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
    
    // Helper callback for init (logs "Created: ...")
    const logCreated = (_relPath: string, absPath: string) => {
      console.log(`Created: ${path.relative(process.cwd(), absPath)}`);
    };
    
    // Copy .github/workflows from the main project
    copyDirectory('.github/workflows', targetDir, logCreated);
    
    // Copy .github/copilot-instructions.md from the main project
    copyFile('.github/copilot-instructions.md', targetDir, logCreated);
    
    // Copy .husky directory from the main project
    copyDirectory('.husky', targetDir, logCreated);

    // Copy eslint.config.js from the main project
    copyFile('eslint.config.js', targetDir, logCreated);

    // Copy vitest.config.ts from the main project
    copyFile('vitest.config.ts', targetDir, logCreated);

    // Copy tsconfig.json from the main project
    copyFile('tsconfig.json', targetDir, logCreated);

    // Copy src/test.setup.ts from the main project
    copyFile('src/test.setup.ts', targetDir, logCreated);

    // Copy .gitignore from the main project
    copyFile('.gitignore', targetDir, logCreated);
    
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

/**
 * Selectively copy only updatable files from template
 */
function updateTemplate(
  templatePath: string,
  targetPath: string,
  replacements: Record<string, string>,
  relativePath = ''
): string[] {
  const updatedFiles: string[] = [];
  const stats = fs.statSync(templatePath);
  const currentRelativePath = relativePath || path.basename(templatePath);

  if (stats.isDirectory()) {
    const files = fs.readdirSync(templatePath);
    for (const file of files) {
      // Skip user code directories
      if (file === 'src' && relativePath === '') {
        continue;
      }

      const targetFile = file === '_gitignore' ? '.gitignore' : file;
      const newRelativePath = relativePath ? path.join(relativePath, targetFile) : targetFile;
      
      const updated = updateTemplate(
        path.join(templatePath, file),
        path.join(targetPath, targetFile),
        replacements,
        newRelativePath
      );
      updatedFiles.push(...updated);
    }
  } else {
    // Check if this file should be updated
    const shouldUpdate = UPDATABLE_FILES.some(pattern => 
      currentRelativePath === pattern || currentRelativePath.endsWith(`/${pattern}`)
    );

    if (shouldUpdate) {
      let content = fs.readFileSync(templatePath, 'utf-8');
      
      // Replace placeholders
      for (const [key, value] of Object.entries(replacements)) {
        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }

      fs.writeFileSync(targetPath, content, 'utf-8');
      updatedFiles.push(currentRelativePath);
    }
  }

  return updatedFiles;
}

/**
 * Merge package.json scripts from template while preserving user customizations
 */
function updatePackageJson(
  templatePath: string,
  targetPath: string,
  replacements: Record<string, string>
): void {
  const templatePkg = JSON.parse(fs.readFileSync(templatePath, 'utf-8'));
  const targetPkg = JSON.parse(fs.readFileSync(targetPath, 'utf-8'));

  // Replace placeholders in template package.json
  let templateContent = JSON.stringify(templatePkg, null, 2);
  for (const [key, value] of Object.entries(replacements)) {
    templateContent = templateContent.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  const processedTemplatePkg = JSON.parse(templateContent);

  // Update scripts from template
  targetPkg.scripts = {
    ...targetPkg.scripts,
    ...processedTemplatePkg.scripts,
  };

  // Update devDependencies (merge, preferring template versions)
  targetPkg.devDependencies = {
    ...targetPkg.devDependencies,
    ...processedTemplatePkg.devDependencies,
  };

  fs.writeFileSync(targetPath, JSON.stringify(targetPkg, null, 2) + '\n', 'utf-8');
}

/**
 * Update an existing project with latest template changes
 */
export async function update(options: UpdateOptions = {}): Promise<void> {
  const targetDir = options.targetDir || process.cwd();
  const packageJsonPath = path.join(targetDir, 'package.json');

  // Check if this is a valid project
  if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ No package.json found. This doesn\'t appear to be a valid project.');
    process.exit(1);
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const projectName = packageJson.name || path.basename(targetDir);
  const projectTitle = packageJson.description || projectName;

  console.log(`\n🔄 Updating TypeScript Bootstrap project: ${projectName}\n`);

  const templateDir = path.join(__dirname, '..', 'templates');
  
  const replacements = {
    PROJECT_NAME: projectName,
    PROJECT_TITLE: projectTitle,
  };

  try {
    // Update configuration files
    const updatedFiles = updateTemplate(templateDir, targetDir, replacements);

    // Update package.json separately (merge strategy)
    const templatePackageJson = path.join(templateDir, 'package.json');
    if (fs.existsSync(templatePackageJson)) {
      updatePackageJson(templatePackageJson, packageJsonPath, replacements);
      updatedFiles.push('package.json');
    }

    // Helper callback for update (adds to updatedFiles array)
    const trackUpdated = (relPath: string, _absPath: string) => {
      updatedFiles.push(relPath);
    };
    
    // Copy .github/workflows from the main project
    copyDirectory('.github/workflows', targetDir, trackUpdated);

    // Copy .github/copilot-instructions.md from the main project
    copyFile('.github/copilot-instructions.md', targetDir, trackUpdated);

    // Copy .husky directory from the main project
    copyDirectory('.husky', targetDir, trackUpdated);

    // Copy eslint.config.js from the main project
    copyFile('eslint.config.js', targetDir, trackUpdated);

    // Copy vitest.config.ts from the main project
    copyFile('vitest.config.ts', targetDir, trackUpdated);

    // Copy tsconfig.json from the main project
    copyFile('tsconfig.json', targetDir, trackUpdated);

    // Copy .gitignore from the main project
    copyFile('.gitignore', targetDir, trackUpdated);

    console.log('✅ Updated files:');
    updatedFiles.forEach(file => console.log(`   - ${file}`));

    console.log('\n✅ Project updated successfully!');
    console.log('\nNext steps:');
    console.log('  1. npm install  (to update dependencies)');
    console.log('  2. Review changes and test your project\n');
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
}
