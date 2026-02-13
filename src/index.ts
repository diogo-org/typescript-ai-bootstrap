import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const UPDATABLE_FILES = [
  // Template-specific configuration files (copied from templates/)
  'tsconfig.node.json',
  'tsconfig.json',
  'vite.config.ts',
  'vitest.config.ts',
  'index.html',
  // Note: src/test.setup.ts is intentionally NOT updatable to preserve user customizations
  // Note: .gitignore and eslint.config.js are copied separately from root via copyFile()
];

/**
 * Helper function to copy workflows from the main project, excluding publish.yml
 */
function copyWorkflows(
  targetBaseDir: string,
  fileCallback: (relativePath: string, absolutePath: string) => void
): void {
  const sourceDir = path.join(__dirname, '..', '.github', 'workflows');
  const targetDir = path.join(targetBaseDir, '.github', 'workflows');
  
  if (!fs.existsSync(sourceDir)) {
    return;
  }
  
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  const files = fs.readdirSync(sourceDir);
  for (const file of files) {
    // Skip publish.yml as it's specific to the bootstrap package
    if (file === 'publish.yml') continue;
    
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);
    const relPath = `.github/workflows/${file}`;
    
    const stat = fs.statSync(sourcePath);
    if (stat.isFile()) {
      fs.copyFileSync(sourcePath, targetPath);
      fileCallback(relPath, targetPath);
    }
  }
}

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
      const relPath = `${sourceRelPath}/${file}`;
      
      const stat = fs.statSync(sourcePath);
      if (stat.isDirectory()) {
        // Recursively copy subdirectories
        copyDirectory(relPath, targetBaseDir, fileCallback);
      } else if (stat.isFile()) {
        fs.copyFileSync(sourcePath, targetPath);
        fileCallback(relPath, targetPath);
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
  template?: 'typescript' | 'react';
}

interface UpdateOptions {
  targetDir?: string;
}

/**
 * Helper to process file content with placeholder replacements
 */
function processFileContent(
  templatePath: string,
  targetPath: string,
  replacements: Record<string, string>,
  ensureDir = false
): void {
  let content = fs.readFileSync(templatePath, 'utf-8');
  
  // Replace placeholders using function to avoid $ being treated as replacement pattern
  for (const [key, value] of Object.entries(replacements)) {
    content = content.replace(new RegExp(`{{${key}}}`, 'g'), () => value);
  }

  // Ensure target directory exists if requested
  if (ensureDir) {
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
  }

  fs.writeFileSync(targetPath, content, 'utf-8');
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
    processFileContent(templatePath, targetPath, replacements);
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
  const template = options.template || 'react';

  // Validate template type
  const validTemplates = ['typescript', 'react'];
  if (!validTemplates.includes(template)) {
    throw new Error(`Invalid template: ${template}. Valid options: ${validTemplates.join(', ')}`);
  }

  console.log(`\n🚀 Initializing TypeScript Bootstrap for: ${projectName}\n`);

  const templateDir = path.join(__dirname, '..', 'templates', template);
  
  // Verify template directory exists
  if (!fs.existsSync(templateDir)) {
    throw new Error(`Template directory not found: ${templateDir}`);
  }
  
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
    
    // Copy .github/workflows from the main project (excluding publish.yml)
    copyWorkflows(targetDir, logCreated);
    
    // Copy .github/copilot-instructions.md from the main project
    copyFile('.github/copilot-instructions.md', targetDir, logCreated);
    
    // Copy .husky directory from the main project
    copyDirectory('.husky', targetDir, logCreated);

    // Copy eslint.config.js from the main project
    copyFile('eslint.config.js', targetDir, logCreated);

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

      const newRelativePath = relativePath ? path.join(relativePath, file) : file;
      
      const updated = updateTemplate(
        path.join(templatePath, file),
        path.join(targetPath, file),
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
      processFileContent(templatePath, targetPath, replacements, true);
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
  let templatePkg;
  let targetPkg;

  try {
    templatePkg = JSON.parse(fs.readFileSync(templatePath, 'utf-8'));
  } catch {
    throw new Error(
      `Failed to parse template package.json at ${templatePath}`
    );
  }

  try {
    targetPkg = JSON.parse(fs.readFileSync(targetPath, 'utf-8'));
  } catch {
    throw new Error(
      `Failed to parse package.json at ${targetPath}. Please ensure package.json is valid JSON format.`
    );
  }

  // Replace placeholders in template package.json using function to avoid $ being treated as replacement pattern
  let templateContent = JSON.stringify(templatePkg, null, 2);
  for (const [key, value] of Object.entries(replacements)) {
    templateContent = templateContent.replace(new RegExp(`{{${key}}}`, 'g'), () => value);
  }
  const processedTemplatePkg = JSON.parse(templateContent);

  // Update scripts from template
  targetPkg.scripts = {
    ...targetPkg.scripts,
    ...processedTemplatePkg.scripts,
  };

  // Update devDependencies (merge, preferring template versions)
  if (processedTemplatePkg.devDependencies) {
    targetPkg.devDependencies = {
      ...(targetPkg.devDependencies || {}),
      ...processedTemplatePkg.devDependencies,
    };
  }

  // Update dependencies (merge, preferring template versions)
  // This is important for React templates that have dependencies like react and react-dom
  if (processedTemplatePkg.dependencies) {
    targetPkg.dependencies = {
      ...(targetPkg.dependencies || {}),
      ...processedTemplatePkg.dependencies,
    };
  }

  // Preserve/update typescriptBootstrap metadata
  // Prefer existing target metadata if present, otherwise use template metadata
  if (processedTemplatePkg.typescriptBootstrap) {
    targetPkg.typescriptBootstrap = targetPkg.typescriptBootstrap ?? processedTemplatePkg.typescriptBootstrap;
  }

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
    throw new Error('No package.json found. This doesn\'t appear to be a valid project.');
  }

  let packageJson;
  try {
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  } catch (error) {
    throw new Error(
      `Failed to parse package.json: ${error instanceof Error ? error.message : 'Invalid JSON'}. ` +
      'Please ensure package.json is valid JSON format.'
    );
  }

  const projectName = packageJson.name || path.basename(targetDir);
  const projectTitle = packageJson.description || projectName;
  const template = packageJson.typescriptBootstrap?.template || 'react'; // Default to react for backwards compatibility

  console.log(`\n🔄 Updating TypeScript Bootstrap project: ${projectName}\n`);
  console.log('⚠️  Warning: This will overwrite configuration files and template-provided scripts/dependencies.');
  console.log('   Only custom additions (new scripts/dependencies not in the template) will be preserved.\n');

  const templateDir = path.join(__dirname, '..', 'templates', template);
  
  // Verify template directory exists
  if (!fs.existsSync(templateDir)) {
    throw new Error(
      `Template "${template}" not found in ${path.join(__dirname, '..', 'templates')}. ` +
      'Please verify your project configuration or reinstall TypeScript Bootstrap.'
    );
  }
  
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
    
    // Copy .github/workflows from the main project (excluding publish.yml)
    copyWorkflows(targetDir, trackUpdated);

    // Copy .github/copilot-instructions.md from the main project
    copyFile('.github/copilot-instructions.md', targetDir, trackUpdated);

    // Copy .husky directory from the main project
    copyDirectory('.husky', targetDir, trackUpdated);

    // Copy eslint.config.js from the main project
    copyFile('eslint.config.js', targetDir, trackUpdated);

    // Note: src/test.setup.ts is NOT copied during update to preserve user customizations
    // It is only created during init and users can modify it as needed

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
