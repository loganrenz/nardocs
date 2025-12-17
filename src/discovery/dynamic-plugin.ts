/**
 * Dynamic Plugin - Auto-generated plugin for any discovered package
 */

import { Plugin, ToolDefinition } from '../plugins/nuxt.js';
import { HtmlParser } from '../parsers/html.js';
import { DiscoveredPackage } from './package-scanner.js';
import { DocsCrawler, CrawlResult } from './docs-crawler.js';

/**
 * Creates a sanitized tool name from a package name
 */
function createToolName(packageName: string): string {
  // Remove @ scope and convert to snake_case
  return packageName
    .replace(/^@/, '')
    .replace(/\//g, '_')
    .replace(/-/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .toLowerCase();
}

/**
 * Creates a human-readable name from a package name
 */
function createDisplayName(packageName: string): string {
  // Remove @ scope and convert to Title Case
  return packageName
    .replace(/^@[^/]+\//, '')
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * A dynamically generated plugin for any npm package
 */
export class DynamicPlugin implements Plugin {
  private parser = new HtmlParser();
  private crawler = new DocsCrawler();
  private crawlResult: CrawlResult | null = null;
  private crawlPromise: Promise<CrawlResult> | null = null;

  readonly packageInfo: DiscoveredPackage;
  readonly toolName: string;
  readonly displayName: string;

  constructor(packageInfo: DiscoveredPackage) {
    this.packageInfo = packageInfo;
    this.toolName = createToolName(packageInfo.name);
    this.displayName = createDisplayName(packageInfo.name);
  }

  /**
   * Detection is handled externally - this plugin is created for specific packages
   */
  detect(dependencies: Record<string, string>): boolean {
    return this.packageInfo.name in dependencies;
  }

  /**
   * Get the crawl result, crawling if necessary
   */
  private async getCrawlResult(): Promise<CrawlResult | null> {
    if (this.crawlResult) return this.crawlResult;

    if (!this.packageInfo.docsUrl) return null;

    // Avoid multiple concurrent crawls
    if (!this.crawlPromise) {
      this.crawlPromise = this.crawler.crawl(this.packageInfo.docsUrl);
    }

    this.crawlResult = await this.crawlPromise;
    return this.crawlResult;
  }

  getTools(): ToolDefinition[] {
    const tools: ToolDefinition[] = [];

    // Main documentation tool
    tools.push({
      name: `check_${this.toolName}_docs`,
      description: `Fetch ${this.displayName} documentation. Use this when working with ${this.packageInfo.name} to get the latest API documentation and usage examples.${this.packageInfo.description ? ` ${this.displayName}: ${this.packageInfo.description}` : ''}`,
      inputSchema: {
        type: 'object',
        properties: {
          topic: {
            type: 'string',
            description: `The documentation topic or path to fetch (e.g., "getting-started", "api", "configuration"). Leave empty for the main documentation page.`,
          },
        },
        required: [],
      },
    });

    return tools;
  }

  async handleToolCall(name: string, args: Record<string, unknown>): Promise<string> {
    if (name === `check_${this.toolName}_docs`) {
      return this.fetchDocs(args.topic as string | undefined);
    }

    throw new Error(`Unknown tool: ${name}`);
  }

  /**
   * Fetch documentation for a topic
   */
  private async fetchDocs(topic?: string): Promise<string> {
    if (!this.packageInfo.docsUrl) {
      return `No documentation URL found for ${this.packageInfo.name}.\n\nYou can try:\n- npm page: ${this.packageInfo.npmUrl}\n${this.packageInfo.githubUrl ? `- GitHub: ${this.packageInfo.githubUrl}` : ''}`;
    }

    let url = this.packageInfo.docsUrl;

    // If a topic is provided, try to find the matching section
    if (topic) {
      const crawlResult = await this.getCrawlResult();

      if (crawlResult && crawlResult.sections.length > 0) {
        // Try to find a matching section
        const normalizedTopic = topic.toLowerCase().replace(/[-_]/g, '');
        const matchingSection = crawlResult.sections.find((section) => {
          const normalizedPath = section.path.toLowerCase().replace(/[-_]/g, '');
          const normalizedTitle = section.title.toLowerCase().replace(/[-_]/g, '');
          return (
            normalizedPath.includes(normalizedTopic) ||
            normalizedTitle.includes(normalizedTopic) ||
            normalizedTopic.includes(normalizedPath.split('/').pop() || '')
          );
        });

        if (matchingSection) {
          url = matchingSection.url;
        } else {
          // Try appending the topic to the base URL
          const baseUrl = new URL(this.packageInfo.docsUrl);
          const topicPath = topic.startsWith('/') ? topic : `/${topic}`;
          url = new URL(topicPath, baseUrl).href;
        }
      } else {
        // No crawl result, try appending topic to URL
        const baseUrl = new URL(this.packageInfo.docsUrl);
        const topicPath = topic.startsWith('/') ? topic : `/${topic}`;
        url = new URL(topicPath, baseUrl).href;
      }
    }

    try {
      const result = await this.parser.extractContent(url);

      let response = `# ${this.displayName} Documentation\n\n`;
      response += `Package: ${this.packageInfo.name}@${this.packageInfo.version}\n`;
      response += `Source: ${result.url}\n\n`;
      response += result.content;

      if (result.truncated) {
        response += '\n\n[Content truncated - visit URL for full documentation]';
      }

      // Add available sections if we have them
      const crawlResult = await this.getCrawlResult();
      if (crawlResult && crawlResult.sections.length > 0 && !topic) {
        response += '\n\n---\n\n## Available Documentation Sections\n\n';
        const displaySections = crawlResult.sections.slice(0, 20);
        for (const section of displaySections) {
          response += `- **${section.title}**: \`${section.path}\`\n`;
        }
        if (crawlResult.sections.length > 20) {
          response += `\n... and ${crawlResult.sections.length - 20} more sections`;
        }
      }

      return response;
    } catch (error) {
      // If the URL failed, try the base docs URL
      if (topic && url !== this.packageInfo.docsUrl) {
        try {
          const result = await this.parser.extractContent(this.packageInfo.docsUrl);

          let response = `# ${this.displayName} Documentation\n\n`;
          response += `*Note: Could not find documentation for topic "${topic}". Showing main documentation instead.*\n\n`;
          response += `Package: ${this.packageInfo.name}@${this.packageInfo.version}\n`;
          response += `Source: ${result.url}\n\n`;
          response += result.content;

          if (result.truncated) {
            response += '\n\n[Content truncated - visit URL for full documentation]';
          }

          return response;
        } catch {
          // Fall through to error
        }
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      return `Failed to fetch documentation for ${this.packageInfo.name}: ${errorMessage}\n\nTry visiting:\n- ${this.packageInfo.docsUrl}\n- ${this.packageInfo.npmUrl}${this.packageInfo.githubUrl ? `\n- ${this.packageInfo.githubUrl}` : ''}`;
    }
  }

  getContext(dependencies: Record<string, string>): string {
    const version = dependencies[this.packageInfo.name] || this.packageInfo.version;

    let context = `## ${this.displayName}\n\n`;
    context += `- Package: ${this.packageInfo.name}\n`;
    context += `- Version: ${version}\n`;

    if (this.packageInfo.description) {
      context += `- Description: ${this.packageInfo.description}\n`;
    }

    context += '\n### Documentation Links\n';

    if (this.packageInfo.docsUrl && this.packageInfo.docsUrl !== this.packageInfo.npmUrl) {
      context += `- Docs: ${this.packageInfo.docsUrl}\n`;
    }

    context += `- npm: ${this.packageInfo.npmUrl}\n`;

    if (this.packageInfo.githubUrl) {
      context += `- GitHub: ${this.packageInfo.githubUrl}\n`;
    }

    context += `\n*Use \`check_${this.toolName}_docs\` to fetch documentation.*\n`;

    return context;
  }
}

/**
 * Factory function to create dynamic plugins for discovered packages
 */
export function createDynamicPlugin(packageInfo: DiscoveredPackage): DynamicPlugin {
  return new DynamicPlugin(packageInfo);
}
