import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import {
  detectPackageManager,
  findWorkspacePackages,
  mergeWorkspaceDependencies,
} from '../src/discovery/workspace.js';

describe('Workspace utilities', () => {
  let testDir: string;

  beforeEach(async () => {
    // Create a temporary directory for each test
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'nardocs-test-'));
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('detectPackageManager', () => {
    it('should detect pnpm from pnpm-lock.yaml', async () => {
      await fs.writeFile(path.join(testDir, 'pnpm-lock.yaml'), 'lockfileVersion: 6.0\n');
      const pm = await detectPackageManager(testDir);
      expect(pm).toBe('pnpm');
    });

    it('should detect pnpm from pnpm-workspace.yaml', async () => {
      await fs.writeFile(
        path.join(testDir, 'pnpm-workspace.yaml'),
        'packages:\n  - "packages/*"\n'
      );
      const pm = await detectPackageManager(testDir);
      expect(pm).toBe('pnpm');
    });

    it('should detect yarn from yarn.lock', async () => {
      await fs.writeFile(path.join(testDir, 'yarn.lock'), '# yarn lockfile v1\n');
      const pm = await detectPackageManager(testDir);
      expect(pm).toBe('yarn');
    });

    it('should detect npm from package-lock.json', async () => {
      await fs.writeFile(path.join(testDir, 'package-lock.json'), '{"lockfileVersion": 3}');
      const pm = await detectPackageManager(testDir);
      expect(pm).toBe('npm');
    });

    it('should default to npm when no lock files found', async () => {
      const pm = await detectPackageManager(testDir);
      expect(pm).toBe('npm');
    });

    it('should prioritize pnpm-lock.yaml over other files', async () => {
      await fs.writeFile(path.join(testDir, 'pnpm-lock.yaml'), 'lockfileVersion: 6.0\n');
      await fs.writeFile(path.join(testDir, 'yarn.lock'), '# yarn lockfile v1\n');
      await fs.writeFile(path.join(testDir, 'package-lock.json'), '{"lockfileVersion": 3}');
      const pm = await detectPackageManager(testDir);
      expect(pm).toBe('pnpm');
    });
  });

  describe('findWorkspacePackages', () => {
    it('should find root package only when no workspace config', async () => {
      const packageJson = {
        name: 'test-project',
        version: '1.0.0',
        dependencies: { lodash: '^4.0.0' },
      };
      await fs.writeFile(path.join(testDir, 'package.json'), JSON.stringify(packageJson, null, 2));

      const packages = await findWorkspacePackages(testDir);
      expect(packages).toHaveLength(1);
      expect(packages[0].name).toBe('test-project');
      expect(packages[0].path).toBe('.');
    });

    it('should find packages in pnpm workspace', async () => {
      // Create root package.json
      const rootPackageJson = {
        name: 'root',
        version: '1.0.0',
      };
      await fs.writeFile(
        path.join(testDir, 'package.json'),
        JSON.stringify(rootPackageJson, null, 2)
      );

      // Create pnpm-workspace.yaml
      await fs.writeFile(
        path.join(testDir, 'pnpm-workspace.yaml'),
        'packages:\n  - "packages/*"\n'
      );

      // Create workspace packages
      const packagesDir = path.join(testDir, 'packages');
      await fs.mkdir(packagesDir, { recursive: true });

      const pkg1Dir = path.join(packagesDir, 'pkg1');
      await fs.mkdir(pkg1Dir, { recursive: true });
      await fs.writeFile(
        path.join(pkg1Dir, 'package.json'),
        JSON.stringify(
          {
            name: 'pkg1',
            version: '1.0.0',
            dependencies: { axios: '^1.0.0' },
          },
          null,
          2
        )
      );

      const pkg2Dir = path.join(packagesDir, 'pkg2');
      await fs.mkdir(pkg2Dir, { recursive: true });
      await fs.writeFile(
        path.join(pkg2Dir, 'package.json'),
        JSON.stringify(
          {
            name: 'pkg2',
            version: '1.0.0',
            dependencies: { lodash: '^4.0.0' },
          },
          null,
          2
        )
      );

      const packages = await findWorkspacePackages(testDir);
      expect(packages.length).toBeGreaterThanOrEqual(3); // Root + at least 2 workspace packages
      const packageNames = packages.map((p) => p.name);
      expect(packageNames).toContain('root');
      expect(packageNames).toContain('pkg1');
      expect(packageNames).toContain('pkg2');
    });

    it('should find packages in npm workspace', async () => {
      // Create root package.json with workspaces
      const rootPackageJson = {
        name: 'root',
        version: '1.0.0',
        workspaces: ['packages/*'],
      };
      await fs.writeFile(
        path.join(testDir, 'package.json'),
        JSON.stringify(rootPackageJson, null, 2)
      );

      // Create workspace packages
      const packagesDir = path.join(testDir, 'packages');
      await fs.mkdir(packagesDir, { recursive: true });

      const pkg1Dir = path.join(packagesDir, 'pkg1');
      await fs.mkdir(pkg1Dir, { recursive: true });
      await fs.writeFile(
        path.join(pkg1Dir, 'package.json'),
        JSON.stringify(
          {
            name: 'pkg1',
            version: '1.0.0',
          },
          null,
          2
        )
      );

      const packages = await findWorkspacePackages(testDir);
      expect(packages.length).toBeGreaterThanOrEqual(2); // Root + workspace package
      const packageNames = packages.map((p) => p.name);
      expect(packageNames).toContain('root');
      expect(packageNames).toContain('pkg1');
    });

    it('should skip directories without package.json', async () => {
      const packageJson = {
        name: 'test-project',
        version: '1.0.0',
      };
      await fs.writeFile(path.join(testDir, 'package.json'), JSON.stringify(packageJson, null, 2));

      // Create a directory without package.json
      const emptyDir = path.join(testDir, 'empty-dir');
      await fs.mkdir(emptyDir, { recursive: true });

      const packages = await findWorkspacePackages(testDir);
      expect(packages).toHaveLength(1);
      expect(packages[0].name).toBe('test-project');
    });

    it('should skip node_modules directory', async () => {
      const packageJson = {
        name: 'test-project',
        version: '1.0.0',
        workspaces: ['packages/*'],
      };
      await fs.writeFile(path.join(testDir, 'package.json'), JSON.stringify(packageJson, null, 2));

      // Create a package in node_modules (should be skipped)
      const nodeModulesDir = path.join(testDir, 'packages', 'node_modules', 'some-pkg');
      await fs.mkdir(nodeModulesDir, { recursive: true });
      await fs.writeFile(
        path.join(nodeModulesDir, 'package.json'),
        JSON.stringify(
          {
            name: 'some-pkg',
            version: '1.0.0',
          },
          null,
          2
        )
      );

      const packages = await findWorkspacePackages(testDir);
      const packageNames = packages.map((p) => p.name);
      expect(packageNames).not.toContain('some-pkg');
    });
  });

  describe('mergeWorkspaceDependencies', () => {
    it('should merge dependencies from multiple packages', () => {
      const packages = [
        {
          path: '.',
          name: 'root',
          version: '1.0.0',
          dependencies: { lodash: '^4.0.0', axios: '^1.0.0' },
          devDependencies: { typescript: '^5.0.0' },
        },
        {
          path: 'packages/pkg1',
          name: 'pkg1',
          version: '1.0.0',
          dependencies: { express: '^4.0.0' },
          devDependencies: { vitest: '^1.0.0' },
        },
        {
          path: 'packages/pkg2',
          name: 'pkg2',
          version: '1.0.0',
          dependencies: { vue: '^3.0.0' },
          devDependencies: {},
        },
      ];

      const merged = mergeWorkspaceDependencies(packages);

      expect(merged.dependencies).toEqual({
        lodash: '^4.0.0',
        axios: '^1.0.0',
        express: '^4.0.0',
        vue: '^3.0.0',
      });

      expect(merged.devDependencies).toEqual({
        typescript: '^5.0.0',
        vitest: '^1.0.0',
      });
    });

    it('should handle empty dependencies', () => {
      const packages = [
        {
          path: '.',
          name: 'root',
          version: '1.0.0',
          dependencies: {},
          devDependencies: {},
        },
      ];

      const merged = mergeWorkspaceDependencies(packages);
      expect(merged.dependencies).toEqual({});
      expect(merged.devDependencies).toEqual({});
    });

    it('should handle workspace packages overriding root dependencies', () => {
      const packages = [
        {
          path: '.',
          name: 'root',
          version: '1.0.0',
          dependencies: { lodash: '^4.0.0' },
          devDependencies: {},
        },
        {
          path: 'packages/pkg1',
          name: 'pkg1',
          version: '1.0.0',
          dependencies: { lodash: '^4.17.0' }, // Different version
          devDependencies: {},
        },
      ];

      const merged = mergeWorkspaceDependencies(packages);
      // Workspace packages should take precedence (processed later)
      expect(merged.dependencies.lodash).toBe('^4.17.0');
    });
  });
});
