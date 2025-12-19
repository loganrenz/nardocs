#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { NuxtPlugin } from './plugins/nuxt.js';
import { VuePlugin } from './plugins/vue.js';
import { AngularPlugin } from './plugins/angular.js';
import { SveltePlugin } from './plugins/svelte.js';
import { TailwindPlugin } from './plugins/tailwind.js';
import { ExpressPlugin } from './plugins/express.js';
import { PrismaPlugin } from './plugins/prisma.js';
import { NextjsPlugin } from './plugins/nextjs.js';
import { VitePlugin } from './plugins/vite.js';
import { AstroPlugin } from './plugins/astro.js';
import { SolidPlugin } from './plugins/solid.js';
import { RemixPlugin } from './plugins/remix.js';
import type { Plugin } from './plugins/nuxt.js';
import { PackageScanner, createDynamicPlugin, type DiscoveredPackage } from './discovery/index.js';

/**
 * Project information loaded from package.json
 */
interface ProjectInfo {
  name: string;
  version: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

/**
 * Configuration file format for custom documentation
 */
interface CustomDocsConfig {
  packages?: Array<{
    name: string;
    docsUrl: string;
    description?: string;
    version?: string;
  }>;
}

/**
 * Packages to skip for auto-discovery (types, build tools, internal packages)
 */
const SKIP_PACKAGES = new Set([
  // TypeScript types
  '@types/node',
  '@types/react',
  '@types/react-dom',
  'typescript',
  // Build tools and bundlers (already have plugins or not needed)
  'webpack',
  'rollup',
  'esbuild',
  'parcel',
  'turbo',
  // Linters and formatters
  'eslint',
  'prettier',
  'stylelint',
  '@eslint/js',
  'eslint-config-prettier',
  'eslint-plugin-prettier',
  '@typescript-eslint/eslint-plugin',
  '@typescript-eslint/parser',
  'typescript-eslint',
  // Testing (usually not needed for docs)
  '@vitest/coverage-v8',
  '@testing-library/jest-dom',
  // Git hooks
  'husky',
  'lint-staged',
  // Release tools
  'semantic-release',
  '@semantic-release/changelog',
  '@semantic-release/git',
  // This package itself
  'mcp-project-docs',
  '@modelcontextprotocol/sdk',
]);

/**
 * Check if a package should be skipped for auto-discovery
 */
function shouldSkipPackage(packageName: string): boolean {
  // Skip if in the skip list
  if (SKIP_PACKAGES.has(packageName)) return true;

  // Skip @types packages
  if (packageName.startsWith('@types/')) return true;

  // Skip eslint configs and plugins
  if (packageName.includes('eslint-config') || packageName.includes('eslint-plugin')) return true;

  return false;
}

/**
 * Main MCP server class
 */
class ProjectDocsServer {
  private server: Server;
  private projectPath: string;
  private projectInfo: ProjectInfo | null = null;
  private activePlugins: Plugin[] = [];
  private packageScanner = new PackageScanner();

  // Built-in plugins for major frameworks
  private builtInPlugins: Plugin[] = [
    new NuxtPlugin(),
    new VuePlugin(),
    new AngularPlugin(),
    new SveltePlugin(),
    new TailwindPlugin(),
    new ExpressPlugin(),
    new PrismaPlugin(),
    new NextjsPlugin(),
    new VitePlugin(),
    new AstroPlugin(),
    new SolidPlugin(),
    new RemixPlugin(),
  ];

  // Track which packages are handled by built-in plugins
  private builtInPackages = new Set<string>();

  constructor() {
    this.server = new Server(
      {
        name: 'mcp-project-docs',
        version: '1.0.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    // Get project path from environment
    this.projectPath = process.env.PROJECT_PATH || process.cwd();

    // Check if auto-discovery is enabled (default: true)
    this.autoDiscoveryEnabled = process.env.AUTO_DISCOVERY !== 'false';

    this.setupHandlers();
  }

  private autoDiscoveryEnabled: boolean;

  /**
   * Load custom documentation configuration from .mcp-project-docs.json or mcp-project-docs.json
   */
  private async loadCustomDocsConfig(): Promise<CustomDocsConfig> {
    const configPaths = [
      path.join(this.projectPath, '.mcp-project-docs.json'),
      path.join(this.projectPath, 'mcp-project-docs.json'),
    ];

    for (const configPath of configPaths) {
      try {
        const content = await fs.readFile(configPath, 'utf-8');
        const config = JSON.parse(content) as CustomDocsConfig;
        console.error(`Loaded custom docs config from ${path.basename(configPath)}`);
        return config;
      } catch (error) {
        // File doesn't exist or invalid JSON, continue to next path
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          console.error(`Warning: Failed to parse config file ${configPath}:`, error);
        }
      }
    }

    return {};
  }

  /**
   * Convert custom docs config to DiscoveredPackage format
   */
  private createDiscoveredPackageFromConfig(
    pkg: NonNullable<CustomDocsConfig['packages']>[number]
  ): DiscoveredPackage {
    return {
      name: pkg.name,
      version: pkg.version || 'custom',
      description: pkg.description,
      docsUrl: pkg.docsUrl,
      githubUrl: null,
      npmUrl: `https://www.npmjs.com/package/${pkg.name}`,
      confidence: 'high', // Custom configs are always high confidence
    };
  }

  /**
   * Load project information from package.json
   */
  private async loadProjectInfo(): Promise<void> {
    try {
      const packageJsonPath = path.join(this.projectPath, 'package.json');
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);

      this.projectInfo = {
        name: packageJson.name || 'unknown',
        version: packageJson.version || '0.0.0',
        dependencies: packageJson.dependencies || {},
        devDependencies: packageJson.devDependencies || {},
      };

      // Detect and activate built-in plugins
      const allDependencies = {
        ...this.projectInfo.dependencies,
        ...this.projectInfo.devDependencies,
      };

      // First, activate built-in plugins and track which packages they handle
      this.activePlugins = [];
      this.builtInPackages.clear();

      for (const plugin of this.builtInPlugins) {
        if (plugin.detect(allDependencies)) {
          this.activePlugins.push(plugin);
          // Track packages handled by this plugin
          this.trackBuiltInPackages(plugin, allDependencies);
        }
      }

      console.error(`Loaded project: ${this.projectInfo.name}@${this.projectInfo.version}`);
      console.error(`Built-in plugins activated: ${this.activePlugins.length}`);

      // Load custom documentation from config file
      const customConfig = await this.loadCustomDocsConfig();
      if (customConfig.packages && customConfig.packages.length > 0) {
        console.error(`Loading ${customConfig.packages.length} custom documentation packages...`);
        for (const customPkg of customConfig.packages) {
          const discovered = this.createDiscoveredPackageFromConfig(customPkg);
          const dynamicPlugin = createDynamicPlugin(discovered);
          this.activePlugins.push(dynamicPlugin);
          console.error(`  + ${customPkg.name}: ${customPkg.docsUrl} (custom)`);
        }
      }

      // Auto-discover plugins for remaining packages
      if (this.autoDiscoveryEnabled) {
        await this.discoverAdditionalPlugins(allDependencies);
      }

      console.error(`Total active plugins: ${this.activePlugins.length}`);
    } catch (error) {
      console.error(`Failed to load project info from ${this.projectPath}:`, error);
      throw new Error(
        `Could not load package.json from ${this.projectPath}. Please ensure PROJECT_PATH environment variable points to a valid Node.js project.`
      );
    }
  }

  /**
   * Track which packages are handled by built-in plugins
   */
  private trackBuiltInPackages(plugin: Plugin, dependencies: Record<string, string>): void {
    // Map of plugin types to their handled packages
    const pluginPackages: Record<string, string[]> = {
      NuxtPlugin: [
        'nuxt',
        '@nuxt/kit',
        '@nuxt/ui',
        '@nuxt/image',
        '@nuxt/content',
        '@nuxtjs/i18n',
        '@nuxtjs/tailwindcss',
      ],
      VuePlugin: ['vue', '@vue/compiler-sfc'],
      AngularPlugin: ['@angular/core', '@angular/common'],
      SveltePlugin: ['svelte', '@sveltejs/kit'],
      TailwindPlugin: ['tailwindcss'],
      ExpressPlugin: ['express'],
      PrismaPlugin: ['prisma', '@prisma/client'],
      NextjsPlugin: ['next'],
      VitePlugin: ['vite'],
      AstroPlugin: ['astro'],
      SolidPlugin: ['solid-js'],
      RemixPlugin: ['@remix-run/react', '@remix-run/node'],
    };

    const pluginName = plugin.constructor.name;
    const packages = pluginPackages[pluginName] || [];

    for (const pkg of packages) {
      if (pkg in dependencies) {
        this.builtInPackages.add(pkg);
      }
    }
  }

  /**
   * Discover and create plugins for packages not handled by built-in plugins
   */
  private async discoverAdditionalPlugins(dependencies: Record<string, string>): Promise<void> {
    // Find packages that need auto-discovery
    const packagesToDiscover = Object.keys(dependencies).filter((pkg) => {
      // Skip if handled by built-in plugin
      if (this.builtInPackages.has(pkg)) return false;

      // Skip utility packages
      if (shouldSkipPackage(pkg)) return false;

      return true;
    });

    if (packagesToDiscover.length === 0) {
      console.error('No additional packages to discover');
      return;
    }

    console.error(`Discovering documentation for ${packagesToDiscover.length} packages...`);

    // Discover packages in parallel
    const discoveries = await this.packageScanner.discoverPackages(packagesToDiscover);

    // Create dynamic plugins for packages with documentation
    let dynamicPluginCount = 0;
    for (const [packageName, discovery] of discoveries) {
      // Only create plugins for packages with high/medium confidence docs
      if (discovery.docsUrl && discovery.confidence !== 'low') {
        const dynamicPlugin = createDynamicPlugin(discovery);
        this.activePlugins.push(dynamicPlugin);
        dynamicPluginCount++;
        console.error(`  + ${packageName}: ${discovery.docsUrl}`);
      }
    }

    console.error(`Created ${dynamicPluginCount} dynamic plugins`);
  }

  /**
   * Get all dependencies as a merged object
   */
  private getAllDependencies(): Record<string, string> {
    if (!this.projectInfo) return {};
    return {
      ...this.projectInfo.dependencies,
      ...this.projectInfo.devDependencies,
    };
  }

  /**
   * Setup MCP request handlers
   */
  private setupHandlers(): void {
    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      await this.ensureProjectLoaded();

      return {
        resources: [
          {
            uri: 'project://dependencies',
            name: 'Project Dependencies',
            description: 'Complete list of project dependencies with versions',
            mimeType: 'application/json',
          },
          {
            uri: 'project://context',
            name: 'Project Context',
            description: 'Framework-specific context and documentation links',
            mimeType: 'text/markdown',
          },
        ],
      };
    });

    // Read resource content
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      await this.ensureProjectLoaded();

      const uri = request.params.uri;

      if (uri === 'project://dependencies') {
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(
                {
                  name: this.projectInfo!.name,
                  version: this.projectInfo!.version,
                  dependencies: this.projectInfo!.dependencies,
                  devDependencies: this.projectInfo!.devDependencies,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      if (uri === 'project://context') {
        let context = `# Project: ${this.projectInfo!.name}\n\n`;
        context += `Version: ${this.projectInfo!.version}\n\n`;

        // Add context from active plugins
        for (const plugin of this.activePlugins) {
          context += plugin.getContext(this.getAllDependencies()) + '\n\n';
        }

        return {
          contents: [
            {
              uri,
              mimeType: 'text/markdown',
              text: context,
            },
          ],
        };
      }

      throw new Error(`Unknown resource: ${uri}`);
    });

    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      await this.ensureProjectLoaded();

      const tools = this.activePlugins.flatMap((plugin) => plugin.getTools());

      return { tools };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      await this.ensureProjectLoaded();

      const { name, arguments: args } = request.params;

      // Find the plugin that handles this tool
      for (const plugin of this.activePlugins) {
        const tools = plugin.getTools();
        if (tools.some((tool) => tool.name === name)) {
          try {
            const result = await plugin.handleToolCall(name, args || {});
            return {
              content: [
                {
                  type: 'text',
                  text: result,
                },
              ],
            };
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
              content: [
                {
                  type: 'text',
                  text: `Error: ${errorMessage}`,
                },
              ],
              isError: true,
            };
          }
        }
      }

      throw new Error(`Unknown tool: ${name}`);
    });
  }

  /**
   * Ensure project is loaded before handling requests
   */
  private async ensureProjectLoaded(): Promise<void> {
    if (!this.projectInfo) {
      await this.loadProjectInfo();
    }
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('MCP Project Docs server started');
  }
}

// Start the server
const server = new ProjectDocsServer();
server.start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
