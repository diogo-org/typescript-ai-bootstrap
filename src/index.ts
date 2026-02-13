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
    
    // Copy .github/workflows from the main project
    const sourceWorkflowsDir = path.join(__dirname, '..', '.github', 'workflows');
    const targetWorkflowsDir = path.join(targetDir, '.github', 'workflows');
    
    if (fs.existsSync(sourceWorkflowsDir)) {
      if (!fs.existsSync(targetWorkflowsDir)) {
        fs.mkdirSync(targetWorkflowsDir, { recursive: true });
      }
      
      const workflowFiles = fs.readdirSync(sourceWorkflowsDir);
      for (const file of workflowFiles) {
        const sourcePath = path.join(sourceWorkflowsDir, file);
        const targetPath = path.join(targetWorkflowsDir, file);
        
        if (fs.statSync(sourcePath).isFile()) {
          fs.copyFileSync(sourcePath, targetPath);
          console.log(`Created: ${path.relative(process.cwd(), targetPath)}`);
        }
      }
    }
    
    // Copy .github/copilot-instructions.md from the main project
    const sourceCopilotInstructions = path.join(__dirname, '..', '.github', 'copilot-instructions.md');
    const targetCopilotInstructions = path.join(targetDir, '.github', 'copilot-instructions.md');
    
    if (fs.existsSync(sourceCopilotInstructions)) {
      const targetGithubDir = path.join(targetDir, '.github');
      if (!fs.existsSync(targetGithubDir)) {
        fs.mkdirSync(targetGithubDir, { recursive: true });
      }
      fs.copyFileSync(sourceCopilotInstructions, targetCopilotInstructions);
      console.log(`Created: ${path.relative(process.cwd(), targetCopilotInstructions)}`);
    }
        // Copy .husky directory from the main project
    const sourceHuskyDir = path.join(__dirname, '..', '.husky');
    const targetHuskyDir = path.join(targetDir, '.husky');
    
    if (fs.existsSync(sourceHuskyDir)) {
      if (!fs.existsSync(targetHuskyDir)) {
        fs.mkdirSync(targetHuskyDir, { recursive: true });
      }
      
      const huskyFiles = fs.readdirSync(sourceHuskyDir);
      for (const file of huskyFiles) {
        const sourcePath = path.join(sourceHuskyDir, file);
        const targetPath = path.join(targetHuskyDir, file);
        
        if (fs.statSync(sourcePath).isFile()) {
          fs.copyFileSync(sourcePath, targetPath);
          console.log(`Created: ${path.relative(process.cwd(), targetPath)}`);
        }
      }
    }
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
 * Files that should be updated during an update operation
 * (configuration files, not user code)
 */
const UPDATABLE_FILES = [
  'tsconfig.json',
  'tsconfig.node.json',
  'vite.config.ts',
  'vitest.config.ts',
  'eslint.config.js',
  '.gitignore',
  'index.html',
];

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

    // Copy .github/workflows from the main project
    const sourceWorkflowsDir = path.join(__dirname, '..', '.github', 'workflows');
    const targetWorkflowsDir = path.join(targetDir, '.github', 'workflows');
    
    if (fs.existsSync(sourceWorkflowsDir)) {
      if (!fs.existsSync(targetWorkflowsDir)) {
        fs.mkdirSync(targetWorkflowsDir, { recursive: true });
      }
      
      const workflowFiles = fs.readdirSync(sourceWorkflowsDir);
      for (const file of workflowFiles) {
        const sourcePath = path.join(sourceWorkflowsDir, file);
        const targetPath = path.join(targetWorkflowsDir, file);
        
        if (fs.statSync(sourcePath).isFile()) {
          fs.copyFileSync(sourcePath, targetPath);
          updatedFiles.push(`.github/workflows/${file}`);
        }
      }
    }

    // Copy .github/copilot-instructions.md from the main project
    const sourceCopilotInstructions = path.join(__dirname, '..', '.github', 'copilot-instructions.md');
    const targetCopilotInstructions = path.join(targetDir, '.github', 'copilot-instructions.md');
    
    if (fs.existsSync(sourceCopilotInstructions)) {
      const targetGithubDir = path.join(targetDir, '.github');
      if (!fs.existsSync(targetGithubDir)) {
        fs.mkdirSync(targetGithubDir, { recursive: true });
      }
      fs.copyFileSync(sourceCopilotInstructions, targetCopilotInstructions);
      updatedFiles.push('.github/copilot-instructions.md');
    }

    // Copy .husky directory from the main project
    const sourceHuskyDir = path.join(__dirname, '..', '.husky');
    const targetHuskyDir = path.join(targetDir, '.husky');
    
    if (fs.existsSync(sourceHuskyDir)) {
      if (!fs.existsSync(targetHuskyDir)) {
        fs.mkdirSync(targetHuskyDir, { recursive: true });
      }
      
      const huskyFiles = fs.readdirSync(sourceHuskyDir);
      for (const file of huskyFiles) {
        const sourcePath = path.join(sourceHuskyDir, file);
        const targetPath = path.join(targetHuskyDir, file);
        
        if (fs.statSync(sourcePath).isFile()) {
          fs.copyFileSync(sourcePath, targetPath);
          updatedFiles.push(`.husky/${file}`);
        }
      }
    }

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
