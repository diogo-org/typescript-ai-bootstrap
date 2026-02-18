import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { init, update, createOrUpdate } from './index.js';

/**
 * Helper to read package.json from test directory
 */
function readPackageJson(testDir: string) {
  const packageJsonPath = path.join(testDir, 'package.json');
  return JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
}

describe('TypeScript Bootstrap - Feature Tests', () => {
  let testDir: string;

  beforeEach(() => {
    // Create a unique temporary directory for each test
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ts-bootstrap-test-'));
  });

  afterEach(() => {
    // Clean up the test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('Project Initialization', () => {
    it('should create a new project with all required files', async () => {
      const projectName = 'test-project';
      const projectTitle = 'Test Project';

      await init({ projectName,
        projectTitle,
        targetDir: testDir, skipPrompts: true });

      // Check that essential files are created
      const expectedFiles = [
        'package.json',
        'tsconfig.json',
        'tsconfig.node.json',
        'vite.config.ts',
        'vitest.config.ts',
        'eslint.config.js',
        '.gitignore',
        'index.html',
        'README.md',
      ];

      for (const file of expectedFiles) {
        const filePath = path.join(testDir, file);
        expect(fs.existsSync(filePath), `${file} should exist`).toBe(true);
      }
    });

    it('should create src directory with template files', async () => {
      await init({ projectName: 'test-project',
        targetDir: testDir, skipPrompts: true });

      // Check that src directory exists
      const srcDir = path.join(testDir, 'src');
      expect(fs.existsSync(srcDir)).toBe(true);

      // Check for expected src files
      const expectedSrcFiles = ['test.setup.ts', 'vite-env.d.ts'];
      for (const file of expectedSrcFiles) {
        const filePath = path.join(srcDir, file);
        expect(fs.existsSync(filePath), `src/${file} should exist`).toBe(true);
      }
    });

    it('should create .github workflows directory', async () => {
      await init({ projectName: 'test-project',
        targetDir: testDir, skipPrompts: true });

      const workflowsDir = path.join(testDir, '.github', 'workflows');
      expect(fs.existsSync(workflowsDir)).toBe(true);
      
      // Check that workflows are copied (excluding publish.yml which is bootstrap-specific)
      const expectedWorkflows = ['ci.yml', 'build.yml'];
      for (const workflow of expectedWorkflows) {
        const workflowPath = path.join(workflowsDir, workflow);
        expect(fs.existsSync(workflowPath), `${workflow} should exist in .github/workflows`).toBe(true);
      }
      
      // Check that copilot-instructions.md is copied
      const copilotInstructionsPath = path.join(testDir, '.github', 'copilot-instructions.md');
      expect(fs.existsSync(copilotInstructionsPath), 'copilot-instructions.md should exist in .github').toBe(true);
      
      // Check that .husky directory and files are copied
      const huskyDir = path.join(testDir, '.husky');
      expect(fs.existsSync(huskyDir), '.husky should exist').toBe(true);
      
      const expectedHuskyFiles = ['pre-commit', 'pre-commit.cjs'];
      for (const file of expectedHuskyFiles) {
        const filePath = path.join(huskyDir, file);
        expect(fs.existsSync(filePath), `${file} should exist in .husky`).toBe(true);
      }

      // Check that scripts directory and files are copied
      const scriptsDir = path.join(testDir, 'scripts');
      expect(fs.existsSync(scriptsDir), 'scripts directory should exist').toBe(true);
      
      const preparePath = path.join(scriptsDir, 'prepare.cjs');
      expect(fs.existsSync(preparePath), 'prepare.cjs should exist in scripts').toBe(true);

      // Check that package.json has the correct prepare script
      const packageJsonPath = path.join(testDir, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      expect(packageJson.scripts.prepare).toBe('node scripts/prepare.cjs');
    });

    it('should copy eslint.config.js during initialization', async () => {
      await init({ projectName: 'test-project',
        targetDir: testDir, skipPrompts: true });

      const eslintConfigPath = path.join(testDir, 'eslint.config.js');
      expect(fs.existsSync(eslintConfigPath), 'eslint.config.js should exist').toBe(true);
      
      // Verify content is from main project
      const eslintContent = fs.readFileSync(eslintConfigPath, 'utf-8');
      expect(eslintContent).toContain('eslint');
      expect(eslintContent).toContain('typescript-eslint');
    });

    it('should copy vitest.config.ts during initialization', async () => {
      await init({ projectName: 'test-project',
        targetDir: testDir, skipPrompts: true });

      const vitestConfigPath = path.join(testDir, 'vitest.config.ts');
      expect(fs.existsSync(vitestConfigPath), 'vitest.config.ts should exist').toBe(true);
      
      // Verify content is from main project
      const vitestContent = fs.readFileSync(vitestConfigPath, 'utf-8');
      expect(vitestContent).toContain('vitest');
      expect(vitestContent).toContain('defineConfig');
    });

    it('should register test.setup.ts in vitest config', async () => {
      await init({ projectName: 'test-project',
        targetDir: testDir, skipPrompts: true });

      const vitestConfigPath = path.join(testDir, 'vitest.config.ts');
      const vitestContent = fs.readFileSync(vitestConfigPath, 'utf-8');

      expect(vitestContent).toContain("setupFiles: ['./src/test.setup.ts']");
    });

    it('should copy tsconfig.json during initialization', async () => {
      await init({ projectName: 'test-project',
        targetDir: testDir, skipPrompts: true });

      const tsconfigPath = path.join(testDir, 'tsconfig.json');
      expect(fs.existsSync(tsconfigPath), 'tsconfig.json should exist').toBe(true);
      
      // Verify content is from main project
      const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf-8');
      expect(tsconfigContent).toContain('compilerOptions');
    });

    it('should copy src/test.setup.ts during initialization', async () => {
      await init({ projectName: 'test-project',
        targetDir: testDir, skipPrompts: true });

      const testSetupPath = path.join(testDir, 'src', 'test.setup.ts');
      expect(fs.existsSync(testSetupPath), 'src/test.setup.ts should exist').toBe(true);
      
      // Verify content is from main project
      const testSetupContent = fs.readFileSync(testSetupPath, 'utf-8');
      expect(testSetupContent).toContain('test');
    });

    it('should copy .gitignore during initialization', async () => {
      await init({ projectName: 'test-project',
        targetDir: testDir, skipPrompts: true });

      const gitignorePath = path.join(testDir, '.gitignore');
      expect(fs.existsSync(gitignorePath), '.gitignore should exist').toBe(true);
      
      // Verify content includes common patterns
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
      expect(gitignoreContent).toContain('node_modules');
      expect(gitignoreContent).toContain('dist');
    });

    it('should replace placeholders in package.json with correct project name and title', async () => {
      const projectName = 'my-awesome-project';
      const projectTitle = 'My Awesome Project Title';

      await init({ projectName,
        projectTitle,
        targetDir: testDir, skipPrompts: true });

      const packageJsonPath = path.join(testDir, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      expect(packageJson.name).toBe(projectName);
      expect(packageJson.description).toContain(projectTitle);
    });

    it('should replace placeholders in README.md', async () => {
      const projectName = 'test-readme-project';
      const projectTitle = 'Test Readme Project Title';

      await init({ projectName,
        projectTitle,
        targetDir: testDir, skipPrompts: true });

      const readmePath = path.join(testDir, 'README.md');
      const readmeContent = fs.readFileSync(readmePath, 'utf-8');

      expect(readmeContent).toContain(projectTitle);
      expect(readmeContent).not.toContain('{{PROJECT_TITLE}}');
      expect(readmeContent).not.toContain('{{PROJECT_NAME}}');
    });

    it('should copy .gitignore from root during initialization', async () => {
      await init({ projectName: 'test-project',
        targetDir: testDir, skipPrompts: true });

      const gitignorePath = path.join(testDir, '.gitignore');
      expect(fs.existsSync(gitignorePath)).toBe(true);

      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
      // Check for common entries
      expect(gitignoreContent).toContain('node_modules');
      expect(gitignoreContent).toContain('dist');
    });

    it('should create a project that has valid package.json', async () => {
      await init({ projectName: 'valid-package-test',
        targetDir: testDir, skipPrompts: true });

      const packageJsonPath = path.join(testDir, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      // Verify required package.json fields
      expect(packageJson).toHaveProperty('name');
      expect(packageJson).toHaveProperty('version');
      expect(packageJson).toHaveProperty('scripts');
      expect(packageJson.scripts).toHaveProperty('dev');
      expect(packageJson.scripts).toHaveProperty('build');
      expect(packageJson.scripts).toHaveProperty('test');
    });

    it('should use current directory name as default project name', async () => {
      // Create a subdirectory with a specific name
      const projectDir = path.join(testDir, 'my-default-name-project');
      fs.mkdirSync(projectDir, { recursive: true });

      // Change to that directory for the init
      const originalCwd = process.cwd();
      process.chdir(projectDir);

      try {
        await init({ targetDir: projectDir, skipPrompts: true });

        const packageJsonPath = path.join(projectDir, 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

        expect(packageJson.name).toBe('my-default-name-project');
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should create all configuration files with valid syntax', async () => {
      await init({ projectName: 'config-test',
        targetDir: testDir, skipPrompts: true });

      // Test that tsconfig.json is valid JSON
      const tsconfigPath = path.join(testDir, 'tsconfig.json');
      expect(() => JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'))).not.toThrow();

      // Test that package.json is valid JSON
      const packageJsonPath = path.join(testDir, 'package.json');
      expect(() => JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))).not.toThrow();

      // Test that vite.config.ts exists and has content
      const viteConfigPath = path.join(testDir, 'vite.config.ts');
      const viteConfig = fs.readFileSync(viteConfigPath, 'utf-8');
      expect(viteConfig.length).toBeGreaterThan(0);
      expect(viteConfig).toContain('defineConfig');
    });
  });

  describe('Project Structure', () => {
    it('should create proper directory structure', async () => {
      await init({ projectName: 'structure-test',
        targetDir: testDir, skipPrompts: true });

      const expectedDirs = [
        'src',
        '.github',
        path.join('.github', 'workflows'),
      ];

      for (const dir of expectedDirs) {
        const dirPath = path.join(testDir, dir);
        expect(fs.existsSync(dirPath), `${dir} should exist`).toBe(true);
        expect(fs.statSync(dirPath).isDirectory(), `${dir} should be a directory`).toBe(true);
      }
    });
  });

  describe('Template Types', () => {
    it('should initialize with react template by default', async () => {
      await init({ projectName: 'default-template-test',
        targetDir: testDir, skipPrompts: true });

      const packageJson = readPackageJson(testDir);

      // React template should have React dependencies
      expect(packageJson.dependencies).toHaveProperty('react');
      expect(packageJson.dependencies).toHaveProperty('react-dom');
      expect(packageJson.devDependencies).toHaveProperty('@vitejs/plugin-react');
    });

    it('should initialize with typescript template when specified', async () => {
      await init({ projectName: 'typescript-template-test',
        targetDir: testDir,
        template: 'typescript', skipPrompts: true });

      const packageJson = readPackageJson(testDir);

      // TypeScript template should NOT have React dependencies
      expect(packageJson.dependencies).toBeUndefined();
      expect(packageJson.devDependencies).not.toHaveProperty('@vitejs/plugin-react');
      
      // Should have TypeScript essentials
      expect(packageJson.devDependencies).toHaveProperty('typescript');
      expect(packageJson.devDependencies).toHaveProperty('vite');
      expect(packageJson.devDependencies).toHaveProperty('vitest');
    });

    it('should initialize with react template when specified', async () => {
      await init({ projectName: 'react-template-test',
        targetDir: testDir,
        template: 'react', skipPrompts: true });

      const packageJson = readPackageJson(testDir);

      // React template should have React dependencies
      expect(packageJson.dependencies).toHaveProperty('react');
      expect(packageJson.dependencies).toHaveProperty('react-dom');
      expect(packageJson.devDependencies).toHaveProperty('@vitejs/plugin-react');
      expect(packageJson.devDependencies).toHaveProperty('@testing-library/react');
    });

    it('should create main.ts for typescript template', async () => {
      await init({ projectName: 'typescript-entry-test',
        targetDir: testDir,
        template: 'typescript', skipPrompts: true });

      const mainTsPath = path.join(testDir, 'src', 'main.ts');

      expect(fs.existsSync(mainTsPath), 'main.ts should exist for typescript template').toBe(true);
      
      // TypeScript template is not a web app, so no index.html
      const indexHtmlPath = path.join(testDir, 'index.html');
      expect(fs.existsSync(indexHtmlPath), 'index.html should not exist for typescript template').toBe(false);
    });

    it('should create main.tsx for react template', async () => {
      await init({ projectName: 'react-entry-test',
        targetDir: testDir,
        template: 'react', skipPrompts: true });

      const mainTsxPath = path.join(testDir, 'src', 'main.tsx');
      const indexHtmlPath = path.join(testDir, 'index.html');

      expect(fs.existsSync(mainTsxPath), 'main.tsx should exist for react template').toBe(true);
      
      const indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
      expect(indexHtml).toContain('src="/src/main.tsx"');
      expect(indexHtml).not.toContain('main.ts"');
    });

    it('should throw error for invalid template type', async () => {
      await expect(init({ projectName: 'invalid-template-test',
        targetDir: testDir,
        template: 'invalid-template' as any, skipPrompts: true })).rejects.toThrow();
    });

    it('should have templates/typescript directory structure', () => {
      const typescriptTemplatePath = path.join(process.cwd(), 'templates', 'typescript');
      expect(fs.existsSync(typescriptTemplatePath), 'templates/typescript should exist').toBe(true);
      expect(fs.statSync(typescriptTemplatePath).isDirectory()).toBe(true);
    });

    it('should have templates/react directory structure', () => {
      const reactTemplatePath = path.join(process.cwd(), 'templates', 'react');
      expect(fs.existsSync(reactTemplatePath), 'templates/react should exist').toBe(true);
      expect(fs.statSync(reactTemplatePath).isDirectory()).toBe(true);
    });

    it('should create typescript template with tsx dependency', async () => {
      await init({ projectName: 'tsx-test',
        targetDir: testDir,
        template: 'typescript', skipPrompts: true });

      const packageJson = readPackageJson(testDir);

      // TypeScript template should have tsx for development
      expect(packageJson.devDependencies).toHaveProperty('tsx');
      expect(packageJson.devDependencies.tsx).toMatch(/^\^?\d+\.\d+\.\d+/);
    });

    it('should create typescript template with correct dev script', async () => {
      await init({ projectName: 'dev-script-test',
        targetDir: testDir,
        template: 'typescript', skipPrompts: true });

      const packageJson = readPackageJson(testDir);

      // TypeScript template uses tsx watch, not vite
      expect(packageJson.scripts.dev).toContain('tsx watch');
      expect(packageJson.scripts.dev).toContain('src/main.ts');
    });

    it('should have different scripts between react and typescript templates', async () => {
      // Create React project
      const reactDir = path.join(testDir, 'react-project');
      fs.mkdirSync(reactDir, { recursive: true });
      await init({ projectName: 'react-scripts-test',
        targetDir: reactDir,
        template: 'react', skipPrompts: true });

      // Create TypeScript project
      const tsDir = path.join(testDir, 'ts-project');
      fs.mkdirSync(tsDir, { recursive: true });
      await init({ projectName: 'ts-scripts-test',
        targetDir: tsDir,
        template: 'typescript', skipPrompts: true });

      const reactPkg = JSON.parse(fs.readFileSync(path.join(reactDir, 'package.json'), 'utf-8'));
      const tsPkg = JSON.parse(fs.readFileSync(path.join(tsDir, 'package.json'), 'utf-8'));

      // React uses vite dev server
      expect(reactPkg.scripts.dev).toBe('vite');

      // TypeScript uses tsx watch
      expect(tsPkg.scripts.dev).toBe('tsx watch src/main.ts');

      // React preview uses vite preview
      expect(reactPkg.scripts.preview).toBe('vite preview');

      // TypeScript preview runs the built file
      expect(tsPkg.scripts.preview).toBe('node dist/main.js');
    });

    it('should create typescript template with Node.js-style main.ts', async () => {
      await init({ projectName: 'node-main-test',
        targetDir: testDir,
        template: 'typescript', skipPrompts: true });

      const mainTsPath = path.join(testDir, 'src', 'main.ts');
      const mainContent = fs.readFileSync(mainTsPath, 'utf-8');

      // TypeScript template should use console.log
      expect(mainContent).toContain('console.log');
      expect(mainContent).not.toContain('document.');
      expect(mainContent).not.toContain('innerHTML');
    });

    it('should create react template with DOM-based main.tsx', async () => {
      await init({ projectName: 'dom-main-test',
        targetDir: testDir,
        template: 'react', skipPrompts: true });

      const mainTsxPath = path.join(testDir, 'src', 'main.tsx');
      const mainContent = fs.readFileSync(mainTsxPath, 'utf-8');

      // React template should use React DOM APIs
      expect(mainContent).toContain('ReactDOM');
      expect(mainContent).toContain('createRoot');
      expect(mainContent).not.toContain('console.log');
    });

    it('should store correct template metadata in package.json', async () => {
      // TypeScript template
      const tsDir = path.join(testDir, 'ts-metadata');
      fs.mkdirSync(tsDir, { recursive: true });
      await init({ projectName: 'ts-metadata-test',
        targetDir: tsDir,
        template: 'typescript', skipPrompts: true });

      const tsPkg = JSON.parse(fs.readFileSync(path.join(tsDir, 'package.json'), 'utf-8'));
      expect(tsPkg.typescriptBootstrap).toBeDefined();
      expect(tsPkg.typescriptBootstrap.template).toBe('typescript');

      // React template
      const reactDir = path.join(testDir, 'react-metadata');
      fs.mkdirSync(reactDir, { recursive: true });
      await init({ projectName: 'react-metadata-test',
        targetDir: reactDir,
        template: 'react', skipPrompts: true });

      const reactPkg = JSON.parse(fs.readFileSync(path.join(reactDir, 'package.json'), 'utf-8'));
      expect(reactPkg.typescriptBootstrap).toBeDefined();
      expect(reactPkg.typescriptBootstrap.template).toBe('react');
    });
  });

  describe('Project Update', () => {
    it('should fail when no package.json exists', async () => {
      // Try to update a directory without package.json
      await expect(update({ targetDir: testDir, skipPrompts: true })).rejects.toThrow();
    });

    it('should update an existing project successfully', async () => {
      // First, create a project
      const projectName = 'update-test';
      await init({ projectName,
        targetDir: testDir, skipPrompts: true });

      // Modify a file to simulate user changes
      const packageJsonPath = path.join(testDir, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      packageJson.customField = 'custom-value';
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

      // Update the project
      await update({ targetDir: testDir, skipPrompts: true });

      // Verify the project still exists
      expect(fs.existsSync(packageJsonPath)).toBe(true);

      // Verify custom field preserved
      const updatedPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      expect(updatedPackageJson.customField).toBe('custom-value');
      expect(updatedPackageJson.name).toBe(projectName);
    });

    it('should update UPDATABLE_FILES configuration files', async () => {
      // Create a project first
      await init({ projectName: 'config-update-test',
        targetDir: testDir, skipPrompts: true });

      // Modify a configuration file
      const tsconfigPath = path.join(testDir, 'tsconfig.json');
      fs.writeFileSync(tsconfigPath, '{"modified": true}');

      // Update the project
      await update({ targetDir: testDir, skipPrompts: true });

      // Verify configuration files are updated from template
      const updatedTsconfig = fs.readFileSync(tsconfigPath, 'utf-8');
      expect(updatedTsconfig).not.toBe('{"modified": true}');
      expect(updatedTsconfig).toContain('compilerOptions');

      // Verify other UPDATABLE_FILES exist and are updated
      const updatableFiles = [
        'tsconfig.json',
        'tsconfig.node.json',
        'vite.config.ts',
        'vitest.config.ts',
        '.gitignore',
        'index.html',
      ];

      for (const file of updatableFiles) {
        const filePath = path.join(testDir, file);
        expect(fs.existsSync(filePath), `${file} should exist after update`).toBe(true);
      }
    });

    it('should merge package.json without overwriting custom fields', async () => {
      // Create a project
      await init({ projectName: 'merge-test',
        targetDir: testDir, skipPrompts: true });

      // Add custom fields to package.json
      const packageJsonPath = path.join(testDir, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      packageJson.customField = 'preserved';
      packageJson.customScript = 'custom-command';
      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts['custom'] = 'echo custom';
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

      // Update the project
      await update({ targetDir: testDir, skipPrompts: true });

      // Verify custom fields are preserved
      const updatedPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      expect(updatedPackageJson.customField).toBe('preserved');
      expect(updatedPackageJson.customScript).toBe('custom-command');
      expect(updatedPackageJson.scripts.custom).toBe('echo custom');

      // Verify template scripts are still present
      expect(updatedPackageJson.scripts.dev).toBeDefined();
      expect(updatedPackageJson.scripts.build).toBeDefined();
      expect(updatedPackageJson.scripts.test).toBeDefined();
    });

    it('should copy .github/workflows during update', async () => {
      // Create a project
      await init({ projectName: 'workflow-update-test',
        targetDir: testDir, skipPrompts: true });

      // Delete workflows to simulate old project
      const workflowsDir = path.join(testDir, '.github', 'workflows');
      if (fs.existsSync(workflowsDir)) {
        fs.rmSync(workflowsDir, { recursive: true });
      }

      // Update the project
      await update({ targetDir: testDir, skipPrompts: true });

      // Verify workflows are copied (excluding publish.yml)
      expect(fs.existsSync(workflowsDir)).toBe(true);
      expect(fs.existsSync(path.join(workflowsDir, 'ci.yml'))).toBe(true);
      expect(fs.existsSync(path.join(workflowsDir, 'build.yml'))).toBe(true);
      expect(fs.existsSync(path.join(workflowsDir, 'publish.yml'))).toBe(false);

      // Verify content is from main project
      const ciContent = fs.readFileSync(path.join(workflowsDir, 'ci.yml'), 'utf-8');
      expect(ciContent).toContain('npm run lint');
      expect(ciContent).toContain('npm test');
    });

    it('should copy .github/copilot-instructions.md during update', async () => {
      // Create a project
      await init({ projectName: 'copilot-update-test',
        targetDir: testDir, skipPrompts: true });

      // Delete copilot-instructions to simulate old project
      const copilotPath = path.join(testDir, '.github', 'copilot-instructions.md');
      if (fs.existsSync(copilotPath)) {
        fs.unlinkSync(copilotPath);
      }

      // Update the project
      await update({ targetDir: testDir, skipPrompts: true });

      // Verify copilot-instructions.md is copied
      expect(fs.existsSync(copilotPath)).toBe(true);

      // Verify content is from main project
      const copilotContent = fs.readFileSync(copilotPath, 'utf-8');
      expect(copilotContent).toContain('Copilot Instructions');
      expect(copilotContent).toContain('High Cohesion, Low Coupling');
    });

    it('should copy .husky directory during update', async () => {
      // Create a project
      await init({ projectName: 'husky-update-test',
        targetDir: testDir, skipPrompts: true });

      // Delete .husky to simulate old project
      const huskyDir = path.join(testDir, '.husky');
      if (fs.existsSync(huskyDir)) {
        fs.rmSync(huskyDir, { recursive: true });
      }

      // Update the project
      await update({ targetDir: testDir, skipPrompts: true });

      // Verify .husky directory is copied
      expect(fs.existsSync(huskyDir)).toBe(true);
      expect(fs.existsSync(path.join(huskyDir, 'pre-commit'))).toBe(true);
      expect(fs.existsSync(path.join(huskyDir, 'pre-commit.cjs'))).toBe(true);

      // Verify content is from main project
      const preCommitContent = fs.readFileSync(path.join(huskyDir, 'pre-commit.cjs'), 'utf-8');
      expect(preCommitContent).toContain('pre-commit');
    });

    it('should copy scripts directory during update', async () => {
      // Create a project
      await init({ projectName: 'scripts-update-test',
        targetDir: testDir, skipPrompts: true });

      // Delete scripts to simulate old project
      const scriptsDir = path.join(testDir, 'scripts');
      if (fs.existsSync(scriptsDir)) {
        fs.rmSync(scriptsDir, { recursive: true });
      }

      // Update the project
      await update({ targetDir: testDir, skipPrompts: true });

      // Verify scripts directory is copied
      expect(fs.existsSync(scriptsDir)).toBe(true);
      expect(fs.existsSync(path.join(scriptsDir, 'prepare.cjs'))).toBe(true);
      expect(fs.existsSync(path.join(scriptsDir, 'prepare.test.ts'))).toBe(true);

      // Verify content is from main project
      const prepareContent = fs.readFileSync(path.join(scriptsDir, 'prepare.cjs'), 'utf-8');
      expect(prepareContent).toContain('prepareHusky');
      expect(prepareContent).toContain('npx --no-install husky install');
    });

    it('should copy eslint.config.js during update', async () => {
      // Create a project
      await init({ projectName: 'eslint-update-test',
        targetDir: testDir, skipPrompts: true });

      // Delete eslint.config.js to simulate old project
      const eslintPath = path.join(testDir, 'eslint.config.js');
      if (fs.existsSync(eslintPath)) {
        fs.unlinkSync(eslintPath);
      }

      // Update the project
      await update({ targetDir: testDir, skipPrompts: true });

      // Verify eslint.config.js is copied
      expect(fs.existsSync(eslintPath)).toBe(true);

      // Verify content is from main project
      const eslintContent = fs.readFileSync(eslintPath, 'utf-8');
      expect(eslintContent).toContain('eslint');
      expect(eslintContent).toContain('typescript-eslint');
    });

    it('should copy vitest.config.ts during update', async () => {
      // Create a project
      await init({ projectName: 'vitest-update-test',
        targetDir: testDir, skipPrompts: true });

      // Delete vitest.config.ts to simulate old project
      const vitestPath = path.join(testDir, 'vitest.config.ts');
      if (fs.existsSync(vitestPath)) {
        fs.unlinkSync(vitestPath);
      }

      // Update the project
      await update({ targetDir: testDir, skipPrompts: true });

      // Verify vitest.config.ts is copied
      expect(fs.existsSync(vitestPath)).toBe(true);

      // Verify content is from main project
      const vitestContent = fs.readFileSync(vitestPath, 'utf-8');
      expect(vitestContent).toContain('vitest');
      expect(vitestContent).toContain('defineConfig');
    });

    it('should copy tsconfig.json during update', async () => {
      // Create a project
      await init({ projectName: 'tsconfig-update-test',
        targetDir: testDir, skipPrompts: true });

      // Modify tsconfig.json to simulate old project
      const tsconfigPath = path.join(testDir, 'tsconfig.json');
      fs.writeFileSync(tsconfigPath, '{"old": true}');

      // Update the project
      await update({ targetDir: testDir, skipPrompts: true });

      // Verify tsconfig.json is updated
      expect(fs.existsSync(tsconfigPath)).toBe(true);

      // Verify content is from main project
      const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf-8');
      expect(tsconfigContent).toContain('compilerOptions');
      expect(tsconfigContent).not.toContain('"old": true');
    });

    it('should copy .gitignore during update', async () => {
      // Create a project
      await init({ projectName: 'gitignore-update-test',
        targetDir: testDir, skipPrompts: true });

      // Delete .gitignore to simulate old project
      const gitignorePath = path.join(testDir, '.gitignore');
      if (fs.existsSync(gitignorePath)) {
        fs.unlinkSync(gitignorePath);
      }

      // Update the project
      await update({ targetDir: testDir, skipPrompts: true });

      // Verify .gitignore is copied
      expect(fs.existsSync(gitignorePath)).toBe(true);

      // Verify content is from main project
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
      expect(gitignoreContent).toContain('node_modules');
      expect(gitignoreContent).toContain('dist');
    });

    it('should preserve user\'s custom src/ directory', async () => {
      // Create a project
      await init({ projectName: 'src-preserve-test',
        targetDir: testDir, skipPrompts: true });

      // Add custom files to src/
      const customFilePath = path.join(testDir, 'src', 'custom.ts');
      fs.writeFileSync(customFilePath, 'export const custom = "preserved";');

      // Modify existing src/test.setup.ts
      const testSetupPath = path.join(testDir, 'src', 'test.setup.ts');
      const originalContent = fs.readFileSync(testSetupPath, 'utf-8');
      const modifiedContent = originalContent + '\n// Custom modification';
      fs.writeFileSync(testSetupPath, modifiedContent);

      // Update the project
      await update({ targetDir: testDir, skipPrompts: true });

      // Verify custom file is preserved
      expect(fs.existsSync(customFilePath)).toBe(true);
      const customContent = fs.readFileSync(customFilePath, 'utf-8');
      expect(customContent).toContain('preserved');

      // Verify modifications to src/test.setup.ts are preserved (src files not updated)
      const updatedContent = fs.readFileSync(testSetupPath, 'utf-8');
      expect(updatedContent).toContain('Custom modification');
    });

    it('should handle update when project was created without .github/workflows', async () => {
      // Manually create a minimal project without .github
      const packageJson = {
        name: 'minimal-project',
        version: '1.0.0',
        description: 'Minimal test project',
      };
      fs.writeFileSync(
        path.join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      // Update should work and create .github directory
      await update({ targetDir: testDir, skipPrompts: true });

      // Verify .github/workflows was created (excluding publish.yml)
      const workflowsDir = path.join(testDir, '.github', 'workflows');
      expect(fs.existsSync(workflowsDir)).toBe(true);
      expect(fs.existsSync(path.join(workflowsDir, 'ci.yml'))).toBe(true);
      expect(fs.existsSync(path.join(workflowsDir, 'build.yml'))).toBe(true);
      expect(fs.existsSync(path.join(workflowsDir, 'publish.yml'))).toBe(false);

      // Verify .github/copilot-instructions.md was created
      const copilotPath = path.join(testDir, '.github', 'copilot-instructions.md');
      expect(fs.existsSync(copilotPath)).toBe(true);

      // Verify .husky was created
      const huskyDir = path.join(testDir, '.husky');
      expect(fs.existsSync(huskyDir)).toBe(true);
    });

    it('should preserve template type in package.json during init', async () => {
      await init({ projectName: 'template-metadata-test',
        targetDir: testDir,
        template: 'typescript', skipPrompts: true });

      const packageJsonPath = path.join(testDir, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      // Template type should be stored in package.json
      expect(packageJson.typescriptBootstrap).toBeDefined();
      expect(packageJson.typescriptBootstrap.template).toBe('typescript');
    });

    it('should use correct template during update based on stored metadata', async () => {
      // Create TypeScript template project
      await init({ projectName: 'typescript-update-test',
        targetDir: testDir,
        template: 'typescript', skipPrompts: true });

      const packageJsonPath = path.join(testDir, 'package.json');
      let packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      // Verify it's TypeScript template (no React deps)
      expect(packageJson.dependencies).toBeUndefined();
      expect(packageJson.typescriptBootstrap.template).toBe('typescript');

      // Modify package.json to add custom field
      packageJson.customField = 'custom-value';
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

      // Update the project
      await update({ targetDir: testDir, skipPrompts: true });

      // Read updated package.json
      packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      // Should still be TypeScript template (no React deps added)
      expect(packageJson.dependencies).toBeUndefined();
      expect(packageJson.typescriptBootstrap.template).toBe('typescript');
      expect(packageJson.customField).toBe('custom-value');
    });

    it('should use correct template during update for React projects', async () => {
      // Create React template project
      await init({ projectName: 'react-update-test',
        targetDir: testDir,
        template: 'react', skipPrompts: true });

      const packageJsonPath = path.join(testDir, 'package.json');
      let packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      // Verify it's React template
      expect(packageJson.dependencies).toHaveProperty('react');
      expect(packageJson.typescriptBootstrap.template).toBe('react');

      // Remove a devDependency to simulate outdated project
      delete packageJson.devDependencies['@vitejs/plugin-react'];
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

      // Update the project
      await update({ targetDir: testDir, skipPrompts: true });

      // Read updated package.json
      packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      // React deps should be restored
      expect(packageJson.dependencies).toHaveProperty('react');
      expect(packageJson.devDependencies).toHaveProperty('@vitejs/plugin-react');
      expect(packageJson.typescriptBootstrap.template).toBe('react');
    });

    it('should update ALL relevant files when update command runs', async () => {
      // Create a React project
      await init({ projectName: 'comprehensive-update-test',
        targetDir: testDir,
        template: 'react', skipPrompts: true });

      // Simulate old/modified versions of ALL updatable files
      const filesToModify = [
        // UPDATABLE_FILES from template
        { path: 'tsconfig.node.json', content: '{"old": "node-config"}' },
        { path: 'tsconfig.json', content: '{"old": "tsconfig"}' },
        { path: 'vite.config.ts', content: '// old vite config' },
        { path: 'vitest.config.ts', content: '// old vitest config' },
        { path: 'index.html', content: '<html><body>old</body></html>' },
        // Files copied from main project
        { path: 'eslint.config.js', content: '// old eslint config' },
        { path: '.gitignore', content: '# old gitignore' },
        { path: '.github/copilot-instructions.md', content: '# old copilot instructions' },
        { path: '.github/workflows/ci.yml', content: '# old ci workflow' },
        { path: '.github/workflows/build.yml', content: '# old build workflow' },
        { path: '.husky/pre-commit', content: '# old pre-commit hook' },
        { path: '.husky/pre-commit.cjs', content: '// old pre-commit script' },
      ];

      // Modify all files
      for (const file of filesToModify) {
        const filePath = path.join(testDir, file.path);
        fs.writeFileSync(filePath, file.content, 'utf-8');
      }

      // Also modify package.json to add custom field
      const packageJsonPath = path.join(testDir, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      packageJson.customField = 'should-be-preserved';
      packageJson.scripts['custom-script'] = 'echo custom';
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

      // Run update
      await update({ targetDir: testDir, skipPrompts: true });

      // Verify ALL files are updated
      // 1. tsconfig.node.json should be updated
      const tsconfigNodeContent = fs.readFileSync(path.join(testDir, 'tsconfig.node.json'), 'utf-8');
      expect(tsconfigNodeContent).not.toContain('"old": "node-config"');
      expect(tsconfigNodeContent).toContain('compilerOptions');

      // 2. tsconfig.json should be updated
      const tsconfigContent = fs.readFileSync(path.join(testDir, 'tsconfig.json'), 'utf-8');
      expect(tsconfigContent).not.toContain('"old": "tsconfig"');
      expect(tsconfigContent).toContain('compilerOptions');

      // 3. vite.config.ts should be updated
      const viteConfigContent = fs.readFileSync(path.join(testDir, 'vite.config.ts'), 'utf-8');
      expect(viteConfigContent).not.toBe('// old vite config');
      expect(viteConfigContent).toContain('defineConfig');

      // 4. vitest.config.ts should be updated
      const vitestConfigContent = fs.readFileSync(path.join(testDir, 'vitest.config.ts'), 'utf-8');
      expect(vitestConfigContent).not.toBe('// old vitest config');
      expect(vitestConfigContent).toContain('vitest');

      // 5. index.html should be updated
      const indexHtmlContent = fs.readFileSync(path.join(testDir, 'index.html'), 'utf-8');
      expect(indexHtmlContent).not.toBe('<html><body>old</body></html>');
      expect(indexHtmlContent).toContain('comprehensive-update-test');

      // 6. eslint.config.js should be updated
      const eslintContent = fs.readFileSync(path.join(testDir, 'eslint.config.js'), 'utf-8');
      expect(eslintContent).not.toBe('// old eslint config');
      expect(eslintContent).toContain('eslint');

      // 7. .gitignore should be updated
      const gitignoreContent = fs.readFileSync(path.join(testDir, '.gitignore'), 'utf-8');
      expect(gitignoreContent).not.toBe('# old gitignore');
      expect(gitignoreContent).toContain('node_modules');

      // 8. .github/copilot-instructions.md should be updated
      const copilotContent = fs.readFileSync(path.join(testDir, '.github/copilot-instructions.md'), 'utf-8');
      expect(copilotContent).not.toBe('# old copilot instructions');
      expect(copilotContent).toContain('Copilot Instructions');

      // 9. .github/workflows/ci.yml should be updated
      const ciContent = fs.readFileSync(path.join(testDir, '.github/workflows/ci.yml'), 'utf-8');
      expect(ciContent).not.toBe('# old ci workflow');
      expect(ciContent).toContain('npm run lint');

      // 10. .github/workflows/build.yml should be updated
      const buildContent = fs.readFileSync(path.join(testDir, '.github/workflows/build.yml'), 'utf-8');
      expect(buildContent).not.toBe('# old build workflow');
      expect(buildContent).toContain('npm run build');

      // 11. .husky/pre-commit should be updated
      const preCommitContent = fs.readFileSync(path.join(testDir, '.husky/pre-commit'), 'utf-8');
      expect(preCommitContent).not.toBe('# old pre-commit hook');
      expect(preCommitContent).toContain('pre-commit');

      // 12. .husky/pre-commit.cjs should be updated
      const preCommitCjsContent = fs.readFileSync(path.join(testDir, '.husky/pre-commit.cjs'), 'utf-8');
      expect(preCommitCjsContent).not.toBe('// old pre-commit script');
      expect(preCommitCjsContent).toContain('lint');

      // 13. package.json should be updated BUT preserve custom fields
      const updatedPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      expect(updatedPackageJson.customField).toBe('should-be-preserved');
      expect(updatedPackageJson.scripts['custom-script']).toBe('echo custom');
      expect(updatedPackageJson.scripts.dev).toBeDefined();
      expect(updatedPackageJson.scripts.build).toBeDefined();
      expect(updatedPackageJson.scripts.test).toBeDefined();

      // 14. Verify publish.yml is NOT copied (bootstrap-specific)
      const publishYmlPath = path.join(testDir, '.github/workflows/publish.yml');
      expect(fs.existsSync(publishYmlPath)).toBe(false);

      // 15. Verify src/test.setup.ts is NOT updated (to preserve user customizations)
      // Add a custom modification to test.setup.ts first
      const testSetupPath = path.join(testDir, 'src/test.setup.ts');
      const originalTestSetup = fs.readFileSync(testSetupPath, 'utf-8');
      const modifiedTestSetup = originalTestSetup + '\n// Custom user modification';
      fs.writeFileSync(testSetupPath, modifiedTestSetup);

      // Run update again
      await update({ targetDir: testDir, skipPrompts: true });

      // Verify custom modification is still there
      const finalTestSetup = fs.readFileSync(testSetupPath, 'utf-8');
      expect(finalTestSetup).toContain('// Custom user modification');
    });

    it('should update ALL relevant files for TypeScript template project', async () => {
      // Create a TypeScript project (not React)
      await init({ projectName: 'comprehensive-typescript-update-test',
        targetDir: testDir,
        template: 'typescript', skipPrompts: true });

      // Simulate old/modified versions of ALL updatable files
      const filesToModify = [
        { path: 'tsconfig.node.json', content: '{"old": "node-config"}' },
        { path: 'tsconfig.json', content: '{"old": "tsconfig"}' },
        { path: 'vite.config.ts', content: '// old vite config' },
        { path: 'vitest.config.ts', content: '// old vitest config' },
        { path: 'eslint.config.js', content: '// old eslint config' },
        { path: '.gitignore', content: '# old gitignore' },
      ];

      // Modify all files
      for (const file of filesToModify) {
        const filePath = path.join(testDir, file.path);
        fs.writeFileSync(filePath, file.content, 'utf-8');
      }

      // Run update
      await update({ targetDir: testDir, skipPrompts: true });

      // Verify ALL files are updated
      const tsconfigNodeContent = fs.readFileSync(path.join(testDir, 'tsconfig.node.json'), 'utf-8');
      expect(tsconfigNodeContent).toContain('compilerOptions');

      const tsconfigContent = fs.readFileSync(path.join(testDir, 'tsconfig.json'), 'utf-8');
      expect(tsconfigContent).toContain('compilerOptions');

      const viteConfigContent = fs.readFileSync(path.join(testDir, 'vite.config.ts'), 'utf-8');
      expect(viteConfigContent).toContain('defineConfig');

      const vitestConfigContent = fs.readFileSync(path.join(testDir, 'vitest.config.ts'), 'utf-8');
      expect(vitestConfigContent).toContain('vitest');

      const eslintContent = fs.readFileSync(path.join(testDir, 'eslint.config.js'), 'utf-8');
      expect(eslintContent).toContain('eslint');

      const gitignoreContent = fs.readFileSync(path.join(testDir, '.gitignore'), 'utf-8');
      expect(gitignoreContent).toContain('node_modules');

      // Verify TypeScript template does NOT have index.html
      const indexHtmlPath = path.join(testDir, 'index.html');
      expect(fs.existsSync(indexHtmlPath)).toBe(false);

      // Verify package.json still identifies as TypeScript template
      const packageJson = JSON.parse(fs.readFileSync(path.join(testDir, 'package.json'), 'utf-8'));
      expect(packageJson.typescriptBootstrap.template).toBe('typescript');
      expect(packageJson.dependencies).toBeUndefined(); // No React deps
    });

    it('should verify UPDATABLE_FILES constant matches actual update behavior', async () => {
      // This test ensures documentation matches implementation
      const expectedUpdatableFiles = [
        'tsconfig.node.json',
        'tsconfig.json',
        'vite.config.ts',
        'vitest.config.ts',
        'index.html',
      ];

      // Create a project
      await init({ projectName: 'updatable-files-test',
        targetDir: testDir,
        template: 'react', skipPrompts: true });

      // Modify all expected updatable files
      for (const file of expectedUpdatableFiles) {
        const filePath = path.join(testDir, file);
        if (fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, `// MODIFIED: ${file}`, 'utf-8');
        }
      }

      // Modify a file that should NOT be updatable
      const mainTsxPath = path.join(testDir, 'src/main.tsx');
      const originalMainTsx = fs.readFileSync(mainTsxPath, 'utf-8');
      fs.writeFileSync(mainTsxPath, originalMainTsx + '\n// USER MODIFICATION');

      // Run update
      await update({ targetDir: testDir, skipPrompts: true });

      // Verify all UPDATABLE_FILES were updated
      for (const file of expectedUpdatableFiles) {
        const filePath = path.join(testDir, file);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8');
          expect(content).not.toContain(`// MODIFIED: ${file}`);
        }
      }

      // Verify user code was NOT updated
      const finalMainTsx = fs.readFileSync(mainTsxPath, 'utf-8');
      expect(finalMainTsx).toContain('// USER MODIFICATION');
    });

    it('should throw error when updating project with corrupted template directory', async () => {
      // Create a project first
      await init({ projectName: 'corrupted-template-test',
        targetDir: testDir,
        template: 'react', skipPrompts: true });

      // Modify package.json to reference a non-existent template
      const packageJsonPath = path.join(testDir, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      packageJson.typescriptBootstrap = { template: 'non-existent-template' };
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

      // Update should throw error about missing template
      await expect(update({ targetDir: testDir, skipPrompts: true })).rejects.toThrow(/Template "non-existent-template" not found/);
    });

    it('should handle error during init gracefully', async () => {
      // Try to initialize with an invalid template that will cause an error
      await expect(init({ projectName: 'error-test',
        targetDir: testDir,
        template: 'invalid' as any, skipPrompts: true })).rejects.toThrow(/Invalid template/);
    });

    it('should throw error when copying files fails during init', async () => {
      // Create a file where a directory needs to be created (this will cause an error)  
      const srcPath = path.join(testDir, 'src');
      fs.writeFileSync(srcPath, 'this is a file, not a directory', 'utf-8');

      // Init should fail when trying to create src directory
      await expect(init({ projectName: 'copy-error-test',
        targetDir: testDir,
        template: 'react', skipPrompts: true })).rejects.toThrow();
    });

    it('should create nested directories during update if they don\'t exist', async () => {
      // Create a minimal project
      await init({ projectName: 'nested-dir-test',
        targetDir: testDir,
        template: 'react', skipPrompts: true });

      // Remove husky files to force directory recreation during update
      const huskyDir = path.join(testDir, '.husky');
      if (fs.existsSync(huskyDir)) {
        fs.rmSync(huskyDir, { recursive: true, force: true });
      }

      // Update should recreate the directory structure
      await update({ targetDir: testDir, skipPrompts: true });

      // Verify .husky directory and files were recreated (Husky v9 structure)
      expect(fs.existsSync(huskyDir)).toBe(true);
      expect(fs.existsSync(path.join(huskyDir, 'pre-commit'))).toBe(true);
      expect(fs.existsSync(path.join(huskyDir, 'pre-commit.cjs'))).toBe(true);
    });

    it('should maintain typescript template with tsx dependency after update', async () => {
      // Create TypeScript project
      await init({ projectName: 'tsx-update-test',
        targetDir: testDir,
        template: 'typescript', skipPrompts: true });

      // Verify initial state
      let packageJson = readPackageJson(testDir);
      expect(packageJson.devDependencies).toHaveProperty('tsx');

      // Remove tsx to simulate outdated project
      delete packageJson.devDependencies.tsx;
      fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify(packageJson, null, 2));

      // Update project
      await update({ targetDir: testDir, skipPrompts: true });

      // Verify tsx is restored
      packageJson = readPackageJson(testDir);
      expect(packageJson.devDependencies).toHaveProperty('tsx');
      expect(packageJson.typescriptBootstrap.template).toBe('typescript');
    });

    it('should maintain typescript template scripts after update', async () => {
      // Create TypeScript project
      await init({ projectName: 'ts-scripts-update-test',
        targetDir: testDir,
        template: 'typescript', skipPrompts: true });

      // Verify initial scripts
      let packageJson = readPackageJson(testDir);
      expect(packageJson.scripts.dev).toBe('tsx watch src/main.ts');
      expect(packageJson.scripts.preview).toBe('node dist/main.js');

      // Corrupt scripts to simulate manual changes
      packageJson.scripts.dev = 'vite'; // Wrong for TypeScript template
      packageJson.scripts.preview = 'vite preview'; // Wrong for TypeScript template
      fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify(packageJson, null, 2));

      // Update project
      await update({ targetDir: testDir, skipPrompts: true });

      // Verify scripts are restored correctly
      packageJson = readPackageJson(testDir);
      expect(packageJson.scripts.dev).toBe('tsx watch src/main.ts');
      expect(packageJson.scripts.preview).toBe('node dist/main.js');
      expect(packageJson.typescriptBootstrap.template).toBe('typescript');
    });

    it('should maintain react template dependencies after update', async () => {
      // Create React project
      await init({ projectName: 'react-deps-update-test',
        targetDir: testDir,
        template: 'react', skipPrompts: true });

      // Verify initial state
      let packageJson = readPackageJson(testDir);
      expect(packageJson.dependencies).toHaveProperty('react');
      expect(packageJson.dependencies).toHaveProperty('react-dom');
      expect(packageJson.devDependencies).toHaveProperty('@vitejs/plugin-react');

      // Remove React deps to simulate outdated project
      delete packageJson.dependencies.react;
      delete packageJson.devDependencies['@vitejs/plugin-react'];
      fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify(packageJson, null, 2));

      // Update project
      await update({ targetDir: testDir, skipPrompts: true });

      // Verify React deps are restored
      packageJson = readPackageJson(testDir);
      expect(packageJson.dependencies).toHaveProperty('react');
      expect(packageJson.dependencies).toHaveProperty('react-dom');
      expect(packageJson.devDependencies).toHaveProperty('@vitejs/plugin-react');
      expect(packageJson.typescriptBootstrap.template).toBe('react');
    });

    it('should not add React dependencies to typescript template during update', async () => {
      // Create TypeScript project
      await init({ projectName: 'no-react-contamination-test',
        targetDir: testDir,
        template: 'typescript', skipPrompts: true });

      // Verify no React deps initially
      let packageJson = readPackageJson(testDir);
      expect(packageJson.dependencies).toBeUndefined();
      expect(packageJson.devDependencies).not.toHaveProperty('@vitejs/plugin-react');

      // Update project
      await update({ targetDir: testDir, skipPrompts: true });

      // Verify still no React deps after update
      packageJson = readPackageJson(testDir);
      expect(packageJson.dependencies).toBeUndefined();
      expect(packageJson.devDependencies).not.toHaveProperty('@vitejs/plugin-react');
      expect(packageJson.devDependencies).not.toHaveProperty('@testing-library/react');
      expect(packageJson.typescriptBootstrap.template).toBe('typescript');
    });

    it('should not add tsx to react template during update', async () => {
      // Create React project
      await init({ projectName: 'no-tsx-contamination-test',
        targetDir: testDir,
        template: 'react', skipPrompts: true });

      // Verify tsx not present initially (React doesn't need it)
      let packageJson = readPackageJson(testDir);
      expect(packageJson.devDependencies).not.toHaveProperty('tsx');

      // Update project
      await update({ targetDir: testDir, skipPrompts: true });

      // Verify tsx still not present after update
      packageJson = readPackageJson(testDir);
      expect(packageJson.devDependencies).not.toHaveProperty('tsx');
      expect(packageJson.typescriptBootstrap.template).toBe('react');
    });

    it('should preserve index.html for react template during update', async () => {
      // Create React project
      await init({ projectName: 'react-html-update-test',
        targetDir: testDir,
        template: 'react', skipPrompts: true });

      // Verify index.html exists
      const indexHtmlPath = path.join(testDir, 'index.html');
      expect(fs.existsSync(indexHtmlPath)).toBe(true);

      // Modify index.html
      fs.writeFileSync(indexHtmlPath, '<html><body>old</body></html>');

      // Update project
      await update({ targetDir: testDir, skipPrompts: true });

      // Verify index.html is updated
      expect(fs.existsSync(indexHtmlPath)).toBe(true);
      const indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
      expect(indexHtml).not.toBe('<html><body>old</body></html>');
      expect(indexHtml).toContain('main.tsx');
    });

    it('should not create index.html for typescript template during update', async () => {
      // Create TypeScript project
      await init({ projectName: 'ts-no-html-update-test',
        targetDir: testDir,
        template: 'typescript', skipPrompts: true });

      // Verify index.html doesn't exist
      const indexHtmlPath = path.join(testDir, 'index.html');
      expect(fs.existsSync(indexHtmlPath)).toBe(false);

      // Update project
      await update({ targetDir: testDir, skipPrompts: true });

      // Verify index.html still doesn't exist
      expect(fs.existsSync(indexHtmlPath)).toBe(false);
    });

    it('should throw error when target package.json is corrupted during update', async () => {
      // Create a valid project first
      await init({ projectName: 'corrupted-pkg-test',
        targetDir: testDir,
        template: 'react', skipPrompts: true });

      // Corrupt the package.json
      const packageJsonPath = path.join(testDir, 'package.json');
      fs.writeFileSync(packageJsonPath, '{ invalid json content', 'utf-8');

      // Update should throw error about invalid  JSON
      await expect(update({ targetDir: testDir, skipPrompts: true })).rejects.toThrow(/Failed to parse package\.json/);
      await expect(update({ targetDir: testDir, skipPrompts: true })).rejects.toThrow(/valid JSON format/);
    });

    it('should add typescriptBootstrap metadata when updating old project without it', async () => {
      // Create a project
      await init({ projectName: 'old-project-test',
        targetDir: testDir,
        template: 'react', skipPrompts: true });

      // Remove typescriptBootstrap metadata to simulate old project
      const packageJsonPath = path.join(testDir, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      delete packageJson.typescriptBootstrap;
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

      // Update should add metadata
      await update({ targetDir: testDir, skipPrompts: true });

      // Verify metadata was added
      const updatedPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      expect(updatedPackageJson.typescriptBootstrap).toBeDefined();
      expect(updatedPackageJson.typescriptBootstrap.template).toBe('react');
    });

    it('should update project created without dependencies field', async () => {
      // Create TypeScript project (has no dependencies)
      await init({ projectName: 'no-deps-test',
        targetDir: testDir,
        template: 'typescript', skipPrompts: true });

      // Remove dependencies field entirely
      const packageJsonPath = path.join(testDir, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      delete packageJson.dependencies;
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

      // Update should handle missing dependencies gracefully
      await update({ targetDir: testDir, skipPrompts: true });

      // Verify update succeeded
      const updatedPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      expect(updatedPackageJson.scripts).toBeDefined();
    });

    it('should handle error that is not Error instanceof during package.json parse', async () => {
      // Create a valid project first
      await init({ projectName: 'non-error-test',
        targetDir: testDir,
        template: 'react', skipPrompts: true });

      // Corrupt the package.json with invalid JSON that will throw a non-Error object
      const packageJsonPath = path.join(testDir, 'package.json');
      fs.writeFileSync(packageJsonPath, '{ "name": undefined }', 'utf-8');

      // Update should throw error
      await expect(update({ targetDir: testDir, skipPrompts: true })).rejects.toThrow(/Failed to parse package\.json/);
    });

    it('should handle update failure and rethrow error', async () => {
      // Create an invalid target directory that will cause update to fail
      const invalidDir = path.join(testDir, 'invalid-update-test');
      fs.mkdirSync(invalidDir, { recursive: true });
      
      // Create a minimal package.json to pass initial check
      const packageJsonPath = path.join(invalidDir, 'package.json');
      fs.writeFileSync(packageJsonPath, JSON.stringify({
        name: 'test',
        typescriptBootstrap: { template: 'nonexistent-template' }
      }), 'utf-8');

      // Update should fail and catch block should execute
      await expect(update({ targetDir: invalidDir, skipPrompts: true })).rejects.toThrow();
    });

    it('should create nested directory structure when copying files during init', async () => {
      // Use a deeply nested directory that doesn't exist
      const deepDir = path.join(testDir, 'level1', 'level2', 'level3', 'project');
      
      await init({ projectName: 'deep-dir-test',
        targetDir: deepDir,
        template: 'react', skipPrompts: true });

      // Verify the deep directory structure was created
      expect(fs.existsSync(deepDir)).toBe(true);
      expect(fs.existsSync(path.join(deepDir, 'package.json'))).toBe(true);
      expect(fs.existsSync(path.join(deepDir, '.github', 'copilot-instructions.md'))).toBe(true);
      expect(fs.existsSync(path.join(deepDir, '.husky', 'pre-commit.cjs'))).toBe(true);
    });

    it('should create missing subdirectories during update', async () => {
      // Create a project first
      await init({ projectName: 'missing-subdirs-test',
        targetDir: testDir,
        template: 'react', skipPrompts: true });

      // Delete .github directory completely
      const githubDir = path.join(testDir, '.github');
      if (fs.existsSync(githubDir)) {
        fs.rmSync(githubDir, { recursive: true, force: true });
      }

      // Verify directory is deleted
      expect(fs.existsSync(githubDir)).toBe(false);

      // Update should recreate .github and its subdirectories
      await update({ targetDir: testDir, skipPrompts: true });

      // Verify directories were recreated
      expect(fs.existsSync(path.join(testDir, '.github', 'workflows'))).toBe(true);
      expect(fs.existsSync(path.join(testDir, '.github', 'copilot-instructions.md'))).toBe(true);
    });

    it('should handle init into bare directory requiring all directory creation', async () => {
      // Create a completely empty directory
      const bareDir = path.join(testDir, 'bare-dir-test');
      fs.mkdirSync(bareDir, { recursive: true });

      // Verify it's empty
      const files = fs.readdirSync(bareDir);
      expect(files.length).toBe(0);

      // Initialize should create all subdirectories
      await init({ projectName: 'bare-init-test',
        targetDir: bareDir,
        template: 'typescript', skipPrompts: true });

      // Verify all expected directories and files were created
      expect(fs.existsSync(path.join(bareDir, 'package.json'))).toBe(true);
      expect(fs.existsSync(path.join(bareDir, 'src'))).toBe(true);
      expect(fs.existsSync(path.join(bareDir, '.github', 'workflows'))).toBe(true);
      expect(fs.existsSync(path.join(bareDir, '.github', 'copilot-instructions.md'))).toBe(true);
      expect(fs.existsSync(path.join(bareDir, '.husky'))).toBe(true);
      expect(fs.existsSync(path.join(bareDir, '.gitignore'))).toBe(true);
      expect(fs.existsSync(path.join(bareDir, 'eslint.config.js'))).toBe(true);
    });
  });

  describe('Create Or Update', () => {
    it('should create a project when package.json does not exist', async () => {
      await createOrUpdate({ projectName: 'create-or-update-new',
        targetDir: testDir, skipPrompts: true });

      const packageJsonPath = path.join(testDir, 'package.json');
      expect(fs.existsSync(packageJsonPath)).toBe(true);
    });

    it('should update a project when package.json exists', async () => {
      await init({ projectName: 'create-or-update-existing',
        targetDir: testDir, skipPrompts: true });

      const packageJsonPath = path.join(testDir, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      packageJson.customField = 'custom-value';
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

      await createOrUpdate({ targetDir: testDir, skipPrompts: true });

      const updatedPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      expect(updatedPackageJson.customField).toBe('custom-value');
    });
  });

  describe('Error Handling', () => {
    it('should throw error when invalid template is specified', async () => {
      await expect(
        init({ projectName: 'test-project',
          targetDir: testDir,
          template: 'nonexistent-template' as any, skipPrompts: true })
      ).rejects.toThrow('Invalid template: nonexistent-template');
    });

    it('should throw error when target package.json is invalid', async () => {
      // Initialize a valid project first
      await init({ projectName: 'test-project',
        targetDir: testDir,
        template: 'typescript', skipPrompts: true });

      // Corrupt the package.json
      const packagePath = path.join(testDir, 'package.json');
      fs.writeFileSync(packagePath, '{ invalid json }', 'utf-8');

      await expect(
        update({ targetDir: testDir, skipPrompts: true })
      ).rejects.toThrow('Failed to parse package.json');
    });

    it('should handle update errors gracefully', async () => {
      // Try to update a non-existent directory
      const nonExistentDir = path.join(testDir, 'does-not-exist');

      await expect(
        update({ targetDir: nonExistentDir, skipPrompts: true })
      ).rejects.toThrow();
    });

    it('should handle missing package.json gracefully during update', async () => {
      // Create a directory without package.json
      const bareDir = path.join(testDir, 'no-package');
      fs.mkdirSync(bareDir, { recursive: true });

      await expect(
        update({ targetDir: bareDir, skipPrompts: true })
      ).rejects.toThrow();
    });

    it('should handle deeply nested directory creation during init', async () => {
      // Create a deeply nested target that doesn't exist yet
      const deepDir = path.join(testDir, 'level1', 'level2', 'level3', 'project');
      
      // Don't create it - let init create all levels
      await init({ projectName: 'deep-project',
        targetDir: deepDir,
        template: 'typescript', skipPrompts: true });

      // Verify project was created successfully
      expect(fs.existsSync(path.join(deepDir, 'package.json'))).toBe(true);
      expect(fs.existsSync(path.join(deepDir, 'src'))).toBe(true);
    });

    it('should handle init then update cycle with file cleanup', async () => {
      // Initialize project
      await init({ projectName: 'cycle-test',
        targetDir: testDir,
        template: 'react', skipPrompts: true });

      // Remove a config file that should be restored by update
      const vitePath = path.join(testDir, 'vite.config.ts');
      fs.unlinkSync(vitePath);

      expect(fs.existsSync(vitePath)).toBe(false);

      // Update should restore it
      await update({ targetDir: testDir, skipPrompts: true });

      expect(fs.existsSync(vitePath)).toBe(true);
    });

    it('should handle project names with special characters like $', async () => {
      // Test that $ in project name is treated literally, not as replacement pattern
      const projectName = 'test-$1-project';
      const projectTitle = 'Test $& Title';

      await init({ projectName,
        projectTitle,
        targetDir: testDir,
        template: 'typescript', skipPrompts: true });

      const packageJson = readPackageJson(testDir);
      expect(packageJson.name).toBe('test-$1-project');
      
      // Verify README contains the literal title with $
      const readmePath = path.join(testDir, 'README.md');
      const readmeContent = fs.readFileSync(readmePath, 'utf-8');
      expect(readmeContent).toContain('Test $& Title');
    });
  });
});
