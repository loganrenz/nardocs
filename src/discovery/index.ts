/**
 * Discovery module - Auto-discovers documentation for npm packages
 */

export { PackageScanner, type DiscoveredPackage } from './package-scanner.js';
export { DocsCrawler, type CrawlResult, type DocSection } from './docs-crawler.js';
export { DynamicPlugin, createDynamicPlugin } from './dynamic-plugin.js';
export {
  detectPackageManager,
  findWorkspacePackages,
  mergeWorkspaceDependencies,
  type PackageManager,
  type WorkspacePackage,
} from './workspace.js';
