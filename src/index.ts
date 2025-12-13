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
import { ReactPlugin } from './plugins/react.js';
import type { Plugin } from './plugins/nuxt.js';

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
 * Main MCP server class
 */
class ProjectDocsServer {
  private server: Server;
  private projectPath: string;
  private projectInfo: ProjectInfo | null = null;
  private activePlugins: Plugin[] = [];
  private allPlugins: Plugin[] = [
    new NuxtPlugin(),
    new VuePlugin(),
    new ReactPlugin(),
  ];

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

    this.setupHandlers();
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

      // Detect and activate plugins
      const allDependencies = {
        ...this.projectInfo.dependencies,
        ...this.projectInfo.devDependencies,
      };

      this.activePlugins = this.allPlugins.filter((plugin) =>
        plugin.detect(allDependencies)
      );

      console.error(`Loaded project: ${this.projectInfo.name}@${this.projectInfo.version}`);
      console.error(`Active plugins: ${this.activePlugins.length}`);
    } catch (error) {
      console.error(`Failed to load project info from ${this.projectPath}:`, error);
      throw new Error(
        `Could not load package.json from ${this.projectPath}. Please ensure PROJECT_PATH environment variable points to a valid Node.js project.`
      );
    }
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
