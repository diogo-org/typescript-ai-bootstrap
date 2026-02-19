import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as readline from 'readline';
import { createHash } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HASH_ALGORITHM = 'sha256';
const HASH_MANIFEST_RELATIVE_PATH = '.github/typescript-bootstrap-hashes.json';
const PUBLISH_WORKFLOW_FILE = 'publish.yml';

function toPosixPath(filePath: string): string {
  return filePath.split(path.sep).join('/');
}

function collectFilesRecursively(baseDir: string, relativePrefix = ''): string[] {
  if (!fs.existsSync(baseDir)) {
    return [];
  }

  const entries = fs.readdirSync(baseDir);
  const files: string[] = [];

  for (const entry of entries) {
    const absolutePath = path.join(baseDir, entry);
    const relativePath = relativePrefix ? `${relativePrefix}/${entry}` : entry;
    const stats = fs.statSync(absolutePath);

    if (stats.isDirectory()) {
      files.push(...collectFilesRecursively(absolutePath, relativePath));
    } else if (stats.isFile()) {
      files.push(relativePath);
    }
  }

  return files;
}

function listManagedFiles(template: 'typescript' | 'react'): string[] {
  const sourceRoot = path.join(__dirname, '..');
  const templateRoot = path.join(sourceRoot, 'templates', template);
  const workflowRoot = path.join(sourceRoot, '.github', 'workflows');

  const templateFiles = collectFilesRecursively(templateRoot);
  const workflowFiles = collectFilesRecursively(workflowRoot, '.github/workflows')
    .filter((relativePath) => path.basename(relativePath) !== PUBLISH_WORKFLOW_FILE);

  const managedFiles = [
    ...templateFiles,
    ...workflowFiles,
    ...collectFilesRecursively(path.join(sourceRoot, '.husky'), '.husky'),
    ...collectFilesRecursively(path.join(sourceRoot, 'scripts'), 'scripts'),
    '.github/copilot-instructions.md',
    '.github/PULL_REQUEST_TEMPLATE.md',
    'eslint.config.js',
    'src/test.setup.ts',
    '.gitignore',
  ];

  return Array.from(new Set(managedFiles.map((filePath) => toPosixPath(filePath))))
    .sort((left, right) => left.localeCompare(right));
}

function createFileHash(filePath: string): string {
  const content = fs.readFileSync(filePath);
  return createHash(HASH_ALGORITHM).update(content).digest('hex');
}

function writeScaffoldHashManifest(targetDir: string, template: 'typescript' | 'react'): string {
  const manifestPath = path.join(targetDir, HASH_MANIFEST_RELATIVE_PATH);
  const manifestDir = path.dirname(manifestPath);

  if (!fs.existsSync(manifestDir)) {
    fs.mkdirSync(manifestDir, { recursive: true });
  }

  const managedFiles = listManagedFiles(template)
    .filter((relativePath) => relativePath !== HASH_MANIFEST_RELATIVE_PATH)
    .filter((relativePath) => fs.existsSync(path.join(targetDir, relativePath)));

  const hashes = Object.fromEntries(
    managedFiles.map((relativePath) => {
      const absolutePath = path.join(targetDir, relativePath);
      return [relativePath, createFileHash(absolutePath)];
    })
  );

  const manifest = {
    version: 1,
    algorithm: HASH_ALGORITHM,
    generatedAt: new Date().toISOString(),
    managedFiles,
    hashes,
  };

  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf-8');
  return HASH_MANIFEST_RELATIVE_PATH;
}

/**
 * Helper to prompt user for input
 */
type CreateInterface = typeof readline.createInterface;

function prompt(
  question: string,
  createInterface: CreateInterface = readline.createInterface
): Promise<string> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Helper to prompt user for yes/no confirmation
 */
async function confirm(
  question: string,
  promptInput: (input: string) => Promise<string> = prompt
): Promise<boolean> {
  const answer = await promptInput(`${question} (y/n): `);
  return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
}

const UPDATABLE_FILES = [
  // Template-specific configuration files (copied from templates/)
  'tsconfig.node.json',
  'tsconfig.json',
  'vite.config.ts',
  'vitest.config.ts',
  'index.html',
  '.vscode/settings.json',
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
    if (file === 'publish.yml') {
      continue;
    }
    
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
  skipPrompts?: boolean; // For AI/programmatic use
  prompt?: (question: string) => Promise<string>;
}

interface UpdateOptions {
  targetDir?: string;
  skipPrompts?: boolean; // For AI/programmatic use
  confirm?: (question: string) => Promise<boolean>;
  prompt?: (question: string) => Promise<string>;
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
 * Prompt user to select a template
 * @internal
 */
async function promptTemplateChoice(
  promptInput: (question: string) => Promise<string>,
  message?: string
): Promise<'typescript' | 'react'> {
  if (message) {
    console.log(message);
  }
  console.log('   1. typescript');
  console.log('   2. react\n');

  const choice = await promptInput('Choose a template (1 or 2): ');

  if (choice === '1') {
    return 'typescript';
  }
  if (choice === '2') {
    return 'react';
  }
  throw new Error('Invalid choice. Please select 1 or 2.');
}

/**
 * Initialize a new TypeScript project with best practices
 */
export async function init(options: InitOptions = {}): Promise<void> {
  const projectName = options.projectName || path.basename(process.cwd());
  const projectTitle = options.projectTitle || projectName;
  const targetDir = options.targetDir || process.cwd();
  
  // Prompt for template if not provided (AI-friendly: skip prompt if option is set or skipPrompts is true)
  let template = options.template;
  if (!template && !options.skipPrompts) {
    console.log('\n📋 Available templates:');
    console.log('  1. typescript - Pure TypeScript project');
    console.log('  2. react - React + TypeScript project\n');
    
    const promptInput = options.prompt ?? __internal.prompt;
    template = await promptTemplateChoice(promptInput);
  } else if (!template && options.skipPrompts) {
    // Default to react when skipPrompts is true and no template specified
    template = 'react';
  }

  // Validate template type
  const validTemplates: Array<'typescript' | 'react'> = ['typescript', 'react'];
  if (!template || !validTemplates.includes(template)) {
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

    // Copy .github/PULL_REQUEST_TEMPLATE.md from the main project
    copyFile('.github/PULL_REQUEST_TEMPLATE.md', targetDir, logCreated);
    
    // Copy .husky directory from the main project
    copyDirectory('.husky', targetDir, logCreated);

    // Copy scripts directory from the main project
    copyDirectory('scripts', targetDir, logCreated);

    // Copy eslint.config.js from the main project
    copyFile('eslint.config.js', targetDir, logCreated);

    // Copy src/test.setup.ts from the main project
    copyFile('src/test.setup.ts', targetDir, logCreated);

    // Copy .gitignore from the main project
    copyFile('.gitignore', targetDir, logCreated);

    const hashManifestPath = writeScaffoldHashManifest(targetDir, template);
    console.log(`Created: ${path.relative(process.cwd(), path.join(targetDir, hashManifestPath))}`);
    
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
    // Normalize to POSIX separators for cross-platform compatibility
    const normalizedPath = currentRelativePath.split(path.sep).join('/');
    const shouldUpdate = UPDATABLE_FILES.some(pattern => 
      normalizedPath === pattern || normalizedPath.endsWith(`/${pattern}`)
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

  // Update scripts from template - overwrite with template versions, preserve only custom additions
  // Standard scripts (dev, build, test, etc.) are updated to maintain template consistency
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

  fs.writeFileSync(targetPath, `${JSON.stringify(targetPkg, null, 2)}\n`, 'utf-8');
}

/**
 * Create a project or update it if it already exists
 */
export async function createOrUpdate(options: InitOptions & UpdateOptions = {}): Promise<void> {
  const targetDir = options.targetDir || process.cwd();
  const packageJsonPath = path.join(targetDir, 'package.json');

  if (fs.existsSync(packageJsonPath)) {
    let packageJsonContent: string;
    let packageJson: Record<string, unknown>;

    try {
      packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
      packageJson = JSON.parse(packageJsonContent);
    } catch {
      throw new Error(
        `Found existing package.json at ${packageJsonPath}, but it could not be parsed. ` +
          'Aborting update to avoid corrupting an existing project. Please ensure package.json is valid JSON.'
      );
    }

    // Only auto-update when this is a recognized TypeScript Bootstrap project
    if (packageJson && packageJson.typescriptBootstrap) {
      console.log('\n🔎 Existing TypeScript Bootstrap project detected. Running update...\n');
      await update({ ...options, targetDir });
      return;
    }

    // Non-bootstrap project detected. Require explicit opt-in to proceed.
    if (options.skipPrompts) {
      throw new Error(
        'Existing package.json found, but no TypeScript Bootstrap metadata was detected.\n' +
          'Refusing to update a non-bootstrap project when prompts are disabled, to avoid overwriting configuration.\n' +
          'If you really want to apply the TypeScript Bootstrap template here, re-run without --skip-prompts ' +
          'and explicitly confirm the update, or run init in an empty/new directory.'
      );
    }

    const promptInput = options.prompt ?? __internal.prompt;
    const answer = (await promptInput(
      'An existing project (without TypeScript Bootstrap metadata) was found in this directory.\n' +
        'Running an update here may overwrite configuration files (tsconfig, Vite config, ESLint, etc.).\n' +
        'Do you still want to run the update using the selected template? (y/N) '
    ))
      .trim()
      .toLowerCase();

    if (answer === 'y' || answer === 'yes') {
      console.log('\n⚠️  Proceeding to update existing non-bootstrap project...\n');
      await update({ ...options, targetDir });
      return;
    }

    console.log('\nAborting update. No changes were made to the existing project.\n');
    return;
  }

  await init(options);
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

  let template = packageJson.typescriptBootstrap?.template;
  if (!template) {
    if (options.skipPrompts) {
      throw new Error(
        'TypeScript Bootstrap metadata is missing and template cannot be determined when prompts are disabled. ' +
        'Re-run without --skip-prompts and choose the template to continue.'
      );
    }

    const promptInput = options.prompt ?? __internal.prompt;
    template = await promptTemplateChoice(
      promptInput,
      'ℹ️  This project is missing template metadata. Choose the template to continue:'
    );
  }

  console.log(`\n🔄 Update available for: ${projectName}\n`);
  console.log('⚠️  This will update your project with the latest template changes:');
  console.log('   • Configuration files (tsconfig.json, vite.config.ts, etc.) will be overwritten');
  console.log('   • Dependencies will be updated to template versions');
  console.log('   • Template scripts (dev, build, test, etc.) will be overwritten');
  console.log('   • Custom scripts (not in template) will be preserved');
  console.log('   • Source code (src/) and custom files remain untouched');
  console.log('   💡 Tip: Use custom script names (e.g., "dev:custom") for your modifications\n');

  // Prompt for confirmation before proceeding (AI-friendly: skip if skipPrompts is true)
  if (!options.skipPrompts) {
    const confirmPrompt = options.confirm ?? __internal.confirm;
    const shouldProceed = await confirmPrompt('Do you want to proceed with the update?');
    
    if (!shouldProceed) {
      console.log('\n❌ Update cancelled.\n');
      return;
    }
  }

  console.log(`\n🔄 Updating TypeScript Bootstrap project: ${projectName}\n`);

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

    // Copy .github/PULL_REQUEST_TEMPLATE.md from the main project
    copyFile('.github/PULL_REQUEST_TEMPLATE.md', targetDir, trackUpdated);

    // Copy .husky directory from the main project
    copyDirectory('.husky', targetDir, trackUpdated);

    // Copy scripts directory from the main project
    copyDirectory('scripts', targetDir, trackUpdated);

    // Copy eslint.config.js from the main project
    copyFile('eslint.config.js', targetDir, trackUpdated);

    // Note: src/test.setup.ts is NOT copied during update to preserve user customizations
    // It is only created during init and users can modify it as needed

    // Copy .gitignore from the main project
    copyFile('.gitignore', targetDir, trackUpdated);

    const hashManifestPath = writeScaffoldHashManifest(targetDir, template);
    updatedFiles.push(hashManifestPath);

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

export const __internal = {
  confirm,
  copyFile,
  copyWorkflows,
  prompt,
  promptTemplateChoice,
};
