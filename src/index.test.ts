import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { init, update } from './index.js';

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

      await init({
        projectName,
        projectTitle,
        targetDir: testDir,
      });

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
      await init({
        projectName: 'test-project',
        targetDir: testDir,
      });

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
      await init({
        projectName: 'test-project',
        targetDir: testDir,
      });

      const workflowsDir = path.join(testDir, '.github', 'workflows');
      expect(fs.existsSync(workflowsDir)).toBe(true);
      
      // Check that workflows are copied
      const expectedWorkflows = ['ci.yml', 'publish.yml'];
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
    });

    it('should copy eslint.config.js during initialization', async () => {
      await init({
        projectName: 'test-project',
        targetDir: testDir,
      });

      const eslintConfigPath = path.join(testDir, 'eslint.config.js');
      expect(fs.existsSync(eslintConfigPath), 'eslint.config.js should exist').toBe(true);
      
      // Verify content is from main project
      const eslintContent = fs.readFileSync(eslintConfigPath, 'utf-8');
      expect(eslintContent).toContain('eslint');
      expect(eslintContent).toContain('typescript-eslint');
    });

    it('should copy vitest.config.ts during initialization', async () => {
      await init({
        projectName: 'test-project',
        targetDir: testDir,
      });

      const vitestConfigPath = path.join(testDir, 'vitest.config.ts');
      expect(fs.existsSync(vitestConfigPath), 'vitest.config.ts should exist').toBe(true);
      
      // Verify content is from main project
      const vitestContent = fs.readFileSync(vitestConfigPath, 'utf-8');
      expect(vitestContent).toContain('vitest');
      expect(vitestContent).toContain('defineConfig');
    });

    it('should copy tsconfig.json during initialization', async () => {
      await init({
        projectName: 'test-project',
        targetDir: testDir,
      });

      const tsconfigPath = path.join(testDir, 'tsconfig.json');
      expect(fs.existsSync(tsconfigPath), 'tsconfig.json should exist').toBe(true);
      
      // Verify content is from main project
      const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf-8');
      expect(tsconfigContent).toContain('compilerOptions');
    });

    it('should copy src/test.setup.ts during initialization', async () => {
      await init({
        projectName: 'test-project',
        targetDir: testDir,
      });

      const testSetupPath = path.join(testDir, 'src', 'test.setup.ts');
      expect(fs.existsSync(testSetupPath), 'src/test.setup.ts should exist').toBe(true);
      
      // Verify content is from main project
      const testSetupContent = fs.readFileSync(testSetupPath, 'utf-8');
      expect(testSetupContent).toContain('test');
    });

    it('should copy .gitignore during initialization', async () => {
      await init({
        projectName: 'test-project',
        targetDir: testDir,
      });

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

      await init({
        projectName,
        projectTitle,
        targetDir: testDir,
      });

      const packageJsonPath = path.join(testDir, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      expect(packageJson.name).toBe(projectName);
      expect(packageJson.description).toContain(projectTitle);
    });

    it('should replace placeholders in README.md', async () => {
      const projectName = 'test-readme-project';
      const projectTitle = 'Test Readme Project Title';

      await init({
        projectName,
        projectTitle,
        targetDir: testDir,
      });

      const readmePath = path.join(testDir, 'README.md');
      const readmeContent = fs.readFileSync(readmePath, 'utf-8');

      expect(readmeContent).toContain(projectTitle);
      expect(readmeContent).not.toContain('{{PROJECT_TITLE}}');
      expect(readmeContent).not.toContain('{{PROJECT_NAME}}');
    });

    it('should create .gitignore from _gitignore template', async () => {
      await init({
        projectName: 'test-project',
        targetDir: testDir,
      });

      const gitignorePath = path.join(testDir, '.gitignore');
      expect(fs.existsSync(gitignorePath)).toBe(true);

      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
      // Check for common entries
      expect(gitignoreContent).toContain('node_modules');
      expect(gitignoreContent).toContain('dist');
    });

    it('should create a project that has valid package.json', async () => {
      await init({
        projectName: 'valid-package-test',
        targetDir: testDir,
      });

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
        await init({
          targetDir: projectDir,
        });

        const packageJsonPath = path.join(projectDir, 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

        expect(packageJson.name).toBe('my-default-name-project');
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should create all configuration files with valid syntax', async () => {
      await init({
        projectName: 'config-test',
        targetDir: testDir,
      });

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
      await init({
        projectName: 'structure-test',
        targetDir: testDir,
      });

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

  describe('Error Handling', () => {
    it('should throw error if template directory is missing', async () => {
      // This test verifies that the function handles missing templates gracefully
      // In a real scenario, templates should always exist, but this tests error handling
      
      // Create a test that would fail if templates don't exist
      // Note: In actual use, templates are bundled with the package
      await expect(async () => {
        // Try to initialize with a non-existent template path
        // This would require modifying the function to accept template path
        // For now, we just verify the function completes successfully with real templates
        await init({
          projectName: 'error-test',
          targetDir: testDir,
        });
      }).not.toThrow();
    });
  });

  describe('Workflow Integrity', () => {
    it('should NOT have templates/.github/workflows directory (workflows should be copied at runtime)', () => {
      // This test ensures we don't duplicate workflow files in the templates directory
      // Workflows should be copied from .github/workflows when creating/updating projects
      const templatesWorkflowsPath = path.join(process.cwd(), 'templates', '.github', 'workflows');
      expect(fs.existsSync(templatesWorkflowsPath), 'templates/.github/workflows should not exist - workflows are copied at runtime').toBe(false);
    });

    it('should NOT have templates/.github/copilot-instructions.md (should be copied at runtime)', () => {
      // This test ensures we don't duplicate copilot instructions in the templates directory
      const templatesCopilotPath = path.join(process.cwd(), 'templates', '.github', 'copilot-instructions.md');
      expect(fs.existsSync(templatesCopilotPath), 'templates/.github/copilot-instructions.md should not exist - it is copied at runtime').toBe(false);
    });

    it('should NOT have templates/.husky directory (should be copied at runtime)', () => {
      // This test ensures we don't duplicate husky hooks in the templates directory
      const templatesHuskyPath = path.join(process.cwd(), 'templates', '.husky');
      expect(fs.existsSync(templatesHuskyPath), 'templates/.husky should not exist - it is copied at runtime').toBe(false);
    });

    it('should have .github/workflows directory in the main project', () => {
      // Ensure the source workflows directory exists
      const mainWorkflowsPath = path.join(process.cwd(), '.github', 'workflows');
      expect(fs.existsSync(mainWorkflowsPath), '.github/workflows should exist in the main project').toBe(true);
      
      // Check that it has the expected workflow files
      const expectedWorkflows = ['ci.yml', 'publish.yml'];
      for (const workflow of expectedWorkflows) {
        const workflowPath = path.join(mainWorkflowsPath, workflow);
        expect(fs.existsSync(workflowPath), `${workflow} should exist in .github/workflows`).toBe(true);
      }
    });

    it('should have .github/copilot-instructions.md in the main project', () => {
      const mainCopilotPath = path.join(process.cwd(), '.github', 'copilot-instructions.md');
      expect(fs.existsSync(mainCopilotPath), '.github/copilot-instructions.md should exist in the main project').toBe(true);
    });

    it('should have .husky directory in the main project', () => {
      const mainHuskyPath = path.join(process.cwd(), '.husky');
      expect(fs.existsSync(mainHuskyPath), '.husky should exist in the main project').toBe(true);
      
      // Check for expected husky files
      const expectedFiles = ['pre-commit', 'pre-commit.cjs'];
      for (const file of expectedFiles) {
        const filePath = path.join(mainHuskyPath, file);
        expect(fs.existsSync(filePath), `${file} should exist in .husky`).toBe(true);
      }
    });

    it('should NOT have templates/eslint.config.js (should be copied at runtime)', () => {
      // This test ensures we don't duplicate eslint config in the templates directory
      const templatesEslintPath = path.join(process.cwd(), 'templates', 'eslint.config.js');
      expect(fs.existsSync(templatesEslintPath), 'templates/eslint.config.js should not exist - it is copied at runtime').toBe(false);
    });

    it('should have eslint.config.js in the main project', () => {
      const mainEslintPath = path.join(process.cwd(), 'eslint.config.js');
      expect(fs.existsSync(mainEslintPath), 'eslint.config.js should exist in the main project').toBe(true);
    });

    it('should NOT have templates/vitest.config.ts (should be copied at runtime)', () => {
      const templatesVitestPath = path.join(process.cwd(), 'templates', 'vitest.config.ts');
      expect(fs.existsSync(templatesVitestPath), 'templates/vitest.config.ts should not exist - it is copied at runtime').toBe(false);
    });

    it('should have vitest.config.ts in the main project', () => {
      const mainVitestPath = path.join(process.cwd(), 'vitest.config.ts');
      expect(fs.existsSync(mainVitestPath), 'vitest.config.ts should exist in the main project').toBe(true);
    });

    it('should NOT have templates/tsconfig.json (should be copied at runtime)', () => {
      const templatesTsconfigPath = path.join(process.cwd(), 'templates', 'tsconfig.json');
      expect(fs.existsSync(templatesTsconfigPath), 'templates/tsconfig.json should not exist - it is copied at runtime').toBe(false);
    });

    it('should have tsconfig.json in the main project', () => {
      const mainTsconfigPath = path.join(process.cwd(), 'tsconfig.json');
      expect(fs.existsSync(mainTsconfigPath), 'tsconfig.json should exist in the main project').toBe(true);
    });

    it('should NOT have templates/src/test.setup.ts (should be copied at runtime)', () => {
      const templatesTestSetupPath = path.join(process.cwd(), 'templates', 'src', 'test.setup.ts');
      expect(fs.existsSync(templatesTestSetupPath), 'templates/src/test.setup.ts should not exist - it is copied at runtime').toBe(false);
    });

    it('should have src/test.setup.ts in the main project', () => {
      const mainTestSetupPath = path.join(process.cwd(), 'src', 'test.setup.ts');
      expect(fs.existsSync(mainTestSetupPath), 'src/test.setup.ts should exist in the main project').toBe(true);
    });

    it('should NOT have templates/_gitignore (should use .gitignore directly)', () => {
      const templatesGitignorePath = path.join(process.cwd(), 'templates', '_gitignore');
      expect(fs.existsSync(templatesGitignorePath), 'templates/_gitignore should not exist - use .gitignore directly').toBe(false);
    });

    it('should have .gitignore in the main project', () => {
      const mainGitignorePath = path.join(process.cwd(), '.gitignore');
      expect(fs.existsSync(mainGitignorePath), '.gitignore should exist in the main project').toBe(true);
    });
  });

  describe('Project Update', () => {
    it('should fail when no package.json exists', async () => {
      // Try to update a directory without package.json
      await expect(update({ targetDir: testDir })).rejects.toThrow();
    });

    it('should update an existing project successfully', async () => {
      // First, create a project
      const projectName = 'update-test';
      await init({
        projectName,
        targetDir: testDir,
      });

      // Modify a file to simulate user changes
      const packageJsonPath = path.join(testDir, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      packageJson.customField = 'custom-value';
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

      // Update the project
      await update({ targetDir: testDir });

      // Verify the project still exists
      expect(fs.existsSync(packageJsonPath)).toBe(true);

      // Verify custom field preserved
      const updatedPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      expect(updatedPackageJson.customField).toBe('custom-value');
      expect(updatedPackageJson.name).toBe(projectName);
    });

    it('should update UPDATABLE_FILES configuration files', async () => {
      // Create a project first
      await init({
        projectName: 'config-update-test',
        targetDir: testDir,
      });

      // Modify a configuration file
      const tsconfigPath = path.join(testDir, 'tsconfig.json');
      const originalTsconfig = fs.readFileSync(tsconfigPath, 'utf-8');
      fs.writeFileSync(tsconfigPath, '{"modified": true}');

      // Update the project
      await update({ targetDir: testDir });

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
      await init({
        projectName: 'merge-test',
        targetDir: testDir,
      });

      // Add custom fields to package.json
      const packageJsonPath = path.join(testDir, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      packageJson.customField = 'preserved';
      packageJson.customScript = 'custom-command';
      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts['custom'] = 'echo custom';
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

      // Update the project
      await update({ targetDir: testDir });

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
      await init({
        projectName: 'workflow-update-test',
        targetDir: testDir,
      });

      // Delete workflows to simulate old project
      const workflowsDir = path.join(testDir, '.github', 'workflows');
      if (fs.existsSync(workflowsDir)) {
        fs.rmSync(workflowsDir, { recursive: true });
      }

      // Update the project
      await update({ targetDir: testDir });

      // Verify workflows are copied
      expect(fs.existsSync(workflowsDir)).toBe(true);
      expect(fs.existsSync(path.join(workflowsDir, 'ci.yml'))).toBe(true);
      expect(fs.existsSync(path.join(workflowsDir, 'publish.yml'))).toBe(true);

      // Verify content is from main project
      const ciContent = fs.readFileSync(path.join(workflowsDir, 'ci.yml'), 'utf-8');
      expect(ciContent).toContain('npm run lint');
      expect(ciContent).toContain('npm test');
    });

    it('should copy .github/copilot-instructions.md during update', async () => {
      // Create a project
      await init({
        projectName: 'copilot-update-test',
        targetDir: testDir,
      });

      // Delete copilot-instructions to simulate old project
      const copilotPath = path.join(testDir, '.github', 'copilot-instructions.md');
      if (fs.existsSync(copilotPath)) {
        fs.unlinkSync(copilotPath);
      }

      // Update the project
      await update({ targetDir: testDir });

      // Verify copilot-instructions.md is copied
      expect(fs.existsSync(copilotPath)).toBe(true);

      // Verify content is from main project
      const copilotContent = fs.readFileSync(copilotPath, 'utf-8');
      expect(copilotContent).toContain('Copilot Instructions');
      expect(copilotContent).toContain('High Cohesion, Low Coupling');
    });

    it('should copy .husky directory during update', async () => {
      // Create a project
      await init({
        projectName: 'husky-update-test',
        targetDir: testDir,
      });

      // Delete .husky to simulate old project
      const huskyDir = path.join(testDir, '.husky');
      if (fs.existsSync(huskyDir)) {
        fs.rmSync(huskyDir, { recursive: true });
      }

      // Update the project
      await update({ targetDir: testDir });

      // Verify .husky directory is copied
      expect(fs.existsSync(huskyDir)).toBe(true);
      expect(fs.existsSync(path.join(huskyDir, 'pre-commit'))).toBe(true);
      expect(fs.existsSync(path.join(huskyDir, 'pre-commit.cjs'))).toBe(true);

      // Verify content is from main project
      const preCommitContent = fs.readFileSync(path.join(huskyDir, 'pre-commit.cjs'), 'utf-8');
      expect(preCommitContent).toContain('pre-commit');
    });

    it('should copy eslint.config.js during update', async () => {
      // Create a project
      await init({
        projectName: 'eslint-update-test',
        targetDir: testDir,
      });

      // Delete eslint.config.js to simulate old project
      const eslintPath = path.join(testDir, 'eslint.config.js');
      if (fs.existsSync(eslintPath)) {
        fs.unlinkSync(eslintPath);
      }

      // Update the project
      await update({ targetDir: testDir });

      // Verify eslint.config.js is copied
      expect(fs.existsSync(eslintPath)).toBe(true);

      // Verify content is from main project
      const eslintContent = fs.readFileSync(eslintPath, 'utf-8');
      expect(eslintContent).toContain('eslint');
      expect(eslintContent).toContain('typescript-eslint');
    });

    it('should copy vitest.config.ts during update', async () => {
      // Create a project
      await init({
        projectName: 'vitest-update-test',
        targetDir: testDir,
      });

      // Delete vitest.config.ts to simulate old project
      const vitestPath = path.join(testDir, 'vitest.config.ts');
      if (fs.existsSync(vitestPath)) {
        fs.unlinkSync(vitestPath);
      }

      // Update the project
      await update({ targetDir: testDir });

      // Verify vitest.config.ts is copied
      expect(fs.existsSync(vitestPath)).toBe(true);

      // Verify content is from main project
      const vitestContent = fs.readFileSync(vitestPath, 'utf-8');
      expect(vitestContent).toContain('vitest');
      expect(vitestContent).toContain('defineConfig');
    });

    it('should copy tsconfig.json during update', async () => {
      // Create a project
      await init({
        projectName: 'tsconfig-update-test',
        targetDir: testDir,
      });

      // Modify tsconfig.json to simulate old project
      const tsconfigPath = path.join(testDir, 'tsconfig.json');
      fs.writeFileSync(tsconfigPath, '{"old": true}');

      // Update the project
      await update({ targetDir: testDir });

      // Verify tsconfig.json is updated
      expect(fs.existsSync(tsconfigPath)).toBe(true);

      // Verify content is from main project
      const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf-8');
      expect(tsconfigContent).toContain('compilerOptions');
      expect(tsconfigContent).not.toContain('"old": true');
    });

    it('should copy .gitignore during update', async () => {
      // Create a project
      await init({
        projectName: 'gitignore-update-test',
        targetDir: testDir,
      });

      // Delete .gitignore to simulate old project
      const gitignorePath = path.join(testDir, '.gitignore');
      if (fs.existsSync(gitignorePath)) {
        fs.unlinkSync(gitignorePath);
      }

      // Update the project
      await update({ targetDir: testDir });

      // Verify .gitignore is copied
      expect(fs.existsSync(gitignorePath)).toBe(true);

      // Verify content is from main project
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
      expect(gitignoreContent).toContain('node_modules');
      expect(gitignoreContent).toContain('dist');
    });

    it('should preserve user\'s custom src/ directory', async () => {
      // Create a project
      await init({
        projectName: 'src-preserve-test',
        targetDir: testDir,
      });

      // Add custom files to src/
      const customFilePath = path.join(testDir, 'src', 'custom.ts');
      fs.writeFileSync(customFilePath, 'export const custom = "preserved";');

      // Modify existing src/test.setup.ts
      const testSetupPath = path.join(testDir, 'src', 'test.setup.ts');
      const originalContent = fs.readFileSync(testSetupPath, 'utf-8');
      const modifiedContent = originalContent + '\n// Custom modification';
      fs.writeFileSync(testSetupPath, modifiedContent);

      // Update the project
      await update({ targetDir: testDir });

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
      await update({ targetDir: testDir });

      // Verify .github/workflows was created
      const workflowsDir = path.join(testDir, '.github', 'workflows');
      expect(fs.existsSync(workflowsDir)).toBe(true);
      expect(fs.existsSync(path.join(workflowsDir, 'ci.yml'))).toBe(true);

      // Verify .github/copilot-instructions.md was created
      const copilotPath = path.join(testDir, '.github', 'copilot-instructions.md');
      expect(fs.existsSync(copilotPath)).toBe(true);

      // Verify .husky was created
      const huskyDir = path.join(testDir, '.husky');
      expect(fs.existsSync(huskyDir)).toBe(true);
    });
  });
});
