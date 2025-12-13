import { Plugin, ToolDefinition } from './nuxt.js';
import { HtmlParser } from '../parsers/html.js';

/**
 * Astro framework plugin
 */
export class AstroPlugin implements Plugin {
  private parser = new HtmlParser();

  detect(dependencies: Record<string, string>): boolean {
    return 'astro' in dependencies;
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'check_astro_docs',
        description:
          'Fetch Astro documentation for a specific feature or concept. Use this when working with Astro components, routing, integrations, or content collections.',
        inputSchema: {
          type: 'object',
          properties: {
            topic: {
              type: 'string',
              description:
                'The documentation topic (e.g., "core-concepts/astro-components", "guides/content-collections", "reference/configuration-reference")',
            },
          },
          required: ['topic'],
        },
      },
      {
        name: 'check_astro_integration',
        description:
          'Fetch documentation for a specific Astro integration. Use this when setting up or configuring Astro integrations like React, Vue, Tailwind, etc.',
        inputSchema: {
          type: 'object',
          properties: {
            integration: {
              type: 'string',
              description:
                'The integration name (e.g., "react", "vue", "tailwind", "mdx", "image")',
            },
          },
          required: ['integration'],
        },
      },
    ];
  }

  async handleToolCall(name: string, args: Record<string, unknown>): Promise<string> {
    if (name === 'check_astro_docs') {
      return this.checkAstroDocs(args.topic as string);
    } else if (name === 'check_astro_integration') {
      return this.checkAstroIntegration(args.integration as string);
    }
    throw new Error(`Unknown tool: ${name}`);
  }

  getContext(dependencies: Record<string, string>): string {
    let context = '## Astro Framework\n\n';

    if ('astro' in dependencies) {
      context += `- Astro version: ${dependencies.astro}\n`;
    }

    // Check for common integrations
    const integrations = [
      '@astrojs/react',
      '@astrojs/vue',
      '@astrojs/svelte',
      '@astrojs/tailwind',
      '@astrojs/mdx',
    ];

    const activeIntegrations = integrations.filter((i) => i in dependencies);
    if (activeIntegrations.length > 0) {
      context += `- Integrations: ${activeIntegrations.map((i) => i.replace('@astrojs/', '')).join(', ')}\n`;
    }

    context += '\n### Documentation Links\n';
    context += '- Astro Docs: https://docs.astro.build\n';
    context += '- Astro Integrations: https://docs.astro.build/en/guides/integrations-guide\n';

    return context;
  }

  private async checkAstroDocs(topic: string): Promise<string> {
    const url = `https://docs.astro.build/en/${topic}`;

    try {
      const result = await this.parser.extractContent(url);
      let response = `# Astro: ${topic}\n\n`;
      response += `Source: ${result.url}\n\n`;
      response += result.content;

      if (result.truncated) {
        response += '\n\n[Content truncated - visit URL for full documentation]';
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return `Topic "${topic}" not found in Astro documentation. Try checking:\n- Topic spelling\n- Available docs at https://docs.astro.build\n\nCommon topics: core-concepts/astro-components, guides/content-collections, reference/configuration-reference`;
      }
      throw error;
    }
  }

  private async checkAstroIntegration(integration: string): Promise<string> {
    const url = `https://docs.astro.build/en/guides/integrations-guide/${integration}`;

    try {
      const result = await this.parser.extractContent(url);
      let response = `# Astro Integration: ${integration}\n\n`;
      response += `Source: ${result.url}\n\n`;
      response += result.content;

      if (result.truncated) {
        response += '\n\n[Content truncated - visit URL for full documentation]';
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return `Integration "${integration}" not found in Astro documentation. Try checking:\n- Integration name spelling\n- Available integrations at https://docs.astro.build/en/guides/integrations-guide\n\nCommon integrations: react, vue, svelte, tailwind, mdx, image`;
      }
      throw error;
    }
  }
}
