/**
 * Workspace utilities - Detect package manager and find workspace packages
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export type PackageManager = 'npm' | 'yarn' | 'pnpm';

export interface WorkspacePackage {
  path: string;
  name: string;
  version: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

/**
 * Detect which package manager is being used
 */
export async function detectPackageManager(projectPath: string): Promise<PackageManager> {
  try {
    // Check for lock files (most reliable indicator)
    const pnpmLockPath = path.join(projectPath, 'pnpm-lock.yaml');
    const yarnLockPath = path.join(projectPath, 'yarn.lock');
    const packageLockPath = path.join(projectPath, 'package-lock.json');

    const [hasPnpmLock, hasYarnLock, hasPackageLock] = await Promise.all([
      fs
        .access(pnpmLockPath)
        .then(() => true)
        .catch(() => false),
      fs
        .access(yarnLockPath)
        .then(() => true)
        .catch(() => false),
      fs
        .access(packageLockPath)
        .then(() => true)
        .catch(() => false),
    ]);

    if (hasPnpmLock) return 'pnpm';
    if (hasYarnLock) return 'yarn';
    if (hasPackageLock) return 'npm';

    // Check for workspace config files
    const pnpmWorkspacePath = path.join(projectPath, 'pnpm-workspace.yaml');
    const hasPnpmWorkspace = await fs
      .access(pnpmWorkspacePath)
      .then(() => true)
      .catch(() => false);
    if (hasPnpmWorkspace) return 'pnpm';

    // Default to npm if nothing found
    return 'npm';
  } catch {
    return 'npm';
  }
}

/**
 * Read pnpm workspace configuration
 */
async function readPnpmWorkspace(projectPath: string): Promise<string[]> {
  try {
    const workspacePath = path.join(projectPath, 'pnpm-workspace.yaml');
    const content = await fs.readFile(workspacePath, 'utf-8');

    // Parse YAML-like format (simple parser for common cases)
    const packages: string[] = [];
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      // Skip comments and empty lines
      if (!trimmed || trimmed.startsWith('#')) continue;

      // Match patterns like "packages:" or "- 'packages/*'"
      if (trimmed.startsWith('packages:')) continue;
      if (trimmed.startsWith('-')) {
        const match = trimmed.match(/['"]([^'"]+)['"]/);
        if (match) {
          packages.push(match[1]);
        }
      } else if (trimmed.includes('*')) {
        // Direct pattern like "packages/*"
        packages.push(trimmed);
      }
    }

    return packages.length > 0 ? packages : ['packages/*'];
  } catch {
    // Default pnpm workspace pattern
    return ['packages/*'];
  }
}

/**
 * Read npm/yarn workspace configuration from package.json
 */
function readNpmWorkspaces(packageJson: {
  workspaces?: string[] | { packages?: string[] };
}): string[] {
  // npm/yarn workspaces can be an array or an object with packages array
  if (Array.isArray(packageJson.workspaces)) {
    return packageJson.workspaces;
  }
  if (
    packageJson.workspaces &&
    typeof packageJson.workspaces === 'object' &&
    'packages' in packageJson.workspaces
  ) {
    return packageJson.workspaces.packages || [];
  }
  return [];
}

/**
 * Recursively find package.json files matching a pattern
 */
async function findPackagesInDirectory(
  dirPath: string,
  relativePath: string = ''
): Promise<string[]> {
  const packagePaths: string[] = [];

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      // Skip node_modules
      if (entry.name === 'node_modules') continue;

      const fullPath = path.join(dirPath, entry.name);
      const relPath = path.join(relativePath, entry.name);

      if (entry.isDirectory()) {
        // Check if this directory has a package.json
        const packageJsonPath = path.join(fullPath, 'package.json');
        try {
          await fs.access(packageJsonPath);
          packagePaths.push(relPath);
        } catch {
          // No package.json, recurse into subdirectories
          const subPackages = await findPackagesInDirectory(fullPath, relPath);
          packagePaths.push(...subPackages);
        }
      }
    }
  } catch {
    // Directory doesn't exist or can't be read
  }

  return packagePaths;
}

/**
 * Expand glob patterns to actual package paths
 */
async function expandWorkspacePatterns(projectPath: string, patterns: string[]): Promise<string[]> {
  const packagePaths: string[] = [];

  for (const pattern of patterns) {
    try {
      // Normalize pattern (remove trailing slashes, handle wildcards)
      let normalizedPattern = pattern.trim();
      if (normalizedPattern.endsWith('/*')) {
        normalizedPattern = normalizedPattern.slice(0, -2);
      } else if (normalizedPattern.endsWith('/**')) {
        normalizedPattern = normalizedPattern.slice(0, -3);
      } else if (normalizedPattern.endsWith('/')) {
        normalizedPattern = normalizedPattern.slice(0, -1);
      }

      const fullPatternPath = path.join(projectPath, normalizedPattern);

      // Check if pattern path exists
      try {
        const stat = await fs.stat(fullPatternPath);
        if (stat.isDirectory()) {
          // Find all packages in this directory
          const packages = await findPackagesInDirectory(fullPatternPath, normalizedPattern);
          packagePaths.push(...packages);
        }
      } catch {
        // Pattern path doesn't exist, try to find matching directories
        const parentDir = path.dirname(fullPatternPath);
        const patternName = path.basename(normalizedPattern);

        if (patternName.includes('*')) {
          // Wildcard pattern - search parent directory
          try {
            const entries = await fs.readdir(parentDir, { withFileTypes: true });
            const wildcardPattern = patternName.replace(/\*/g, '.*');
            const regex = new RegExp(`^${wildcardPattern}$`);

            for (const entry of entries) {
              if (entry.isDirectory() && regex.test(entry.name)) {
                const fullPath = path.join(parentDir, entry.name);
                const packages = await findPackagesInDirectory(
                  fullPath,
                  path.join(path.dirname(normalizedPattern), entry.name)
                );
                packagePaths.push(...packages);
              }
            }
          } catch {
            // Can't read parent directory
          }
        }
      }
    } catch (error) {
      console.error(`Failed to expand workspace pattern ${pattern}:`, error);
    }
  }

  return [...new Set(packagePaths)]; // Remove duplicates
}

/**
 * Read a package.json file and return its info
 */
async function readPackageJson(packagePath: string): Promise<WorkspacePackage | null> {
  try {
    const packageJsonPath = path.join(packagePath, 'package.json');
    const content = await fs.readFile(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(content);

    // Skip if no name (not a valid package)
    if (!packageJson.name) return null;

    return {
      path: packagePath,
      name: packageJson.name,
      version: packageJson.version || '0.0.0',
      dependencies: packageJson.dependencies || {},
      devDependencies: packageJson.devDependencies || {},
    };
  } catch {
    return null;
  }
}

/**
 * Find all workspace packages
 */
export async function findWorkspacePackages(projectPath: string): Promise<WorkspacePackage[]> {
  const packages: WorkspacePackage[] = [];

  // Always include root package
  const rootPackage = await readPackageJson(projectPath);
  if (rootPackage) {
    // Normalize root path to '.' for consistency
    rootPackage.path = '.';
    packages.push(rootPackage);
  }

  // Detect package manager
  const pm = await detectPackageManager(projectPath);

  let workspacePatterns: string[] = [];

  if (pm === 'pnpm') {
    // Read pnpm workspace config
    workspacePatterns = await readPnpmWorkspace(projectPath);
  } else {
    // Read npm/yarn workspace config from root package.json
    try {
      const rootPackageJsonPath = path.join(projectPath, 'package.json');
      const rootContent = await fs.readFile(rootPackageJsonPath, 'utf-8');
      const rootPackageJson = JSON.parse(rootContent);
      workspacePatterns = readNpmWorkspaces(rootPackageJson);
    } catch {
      // No workspace config found
    }
  }

  if (workspacePatterns.length === 0) {
    return packages; // No workspaces, return just root
  }

  // Expand patterns to actual package paths
  const workspacePaths = await expandWorkspacePatterns(projectPath, workspacePatterns);

  // Read all workspace packages
  for (const workspacePath of workspacePaths) {
    const fullPath = path.join(projectPath, workspacePath);
    const pkg = await readPackageJson(fullPath);
    if (pkg) {
      // Normalize path to be relative to project path
      pkg.path = workspacePath;
      packages.push(pkg);
    }
  }

  return packages;
}

/**
 * Merge dependencies from all workspace packages
 */
export function mergeWorkspaceDependencies(packages: WorkspacePackage[]): {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
} {
  const dependencies: Record<string, string> = {};
  const devDependencies: Record<string, string> = {};

  for (const pkg of packages) {
    // Merge dependencies (workspace packages take precedence)
    Object.assign(dependencies, pkg.dependencies);
    Object.assign(devDependencies, pkg.devDependencies);
  }

  return { dependencies, devDependencies };
}
