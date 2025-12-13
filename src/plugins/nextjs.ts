import { Plugin, ToolDefinition } from './nuxt.js';
import { HtmlParser } from '../parsers/html.js';

/**
 * Next.js framework plugin (extends React plugin)
 */
export class NextjsPlugin implements Plugin {
  private parser = new HtmlParser();

  detect(dependencies: Record<string, string>): boolean {
    return 'next' in dependencies;
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'check_nextjs_docs',
        description:
          'Fetch Next.js documentation for a specific feature or API. Use this when working with Next.js App Router, pages, API routes, data fetching, or any Next.js functionality.',
        inputSchema: {
          type: 'object',
          properties: {
            topic: {
              type: 'string',
              description:
                'The documentation topic (e.g., "app/building-your-application/routing", "app/api-reference/functions/fetch", "pages/building-your-application/routing")',
            },
          },
          required: ['topic'],
        },
      },
      {
        name: 'check_nextjs_api',
        description:
          'Fetch Next.js API reference for a specific function or component. Use this when you need detailed information about Next.js built-in components or functions.',
        inputSchema: {
          type: 'object',
          properties: {
            api: {
              type: 'string',
              description:
                'The API name (e.g., "next/image", "next/link", "next/font", "next/script")',
            },
          },
          required: ['api'],
        },
      },
    ];
  }

  async handleToolCall(name: string, args: Record<string, unknown>): Promise<string> {
    if (name === 'check_nextjs_docs') {
      return this.checkNextjsDocs(args.topic as string);
    } else if (name === 'check_nextjs_api') {
      return this.checkNextjsApi(args.api as string);
    }
    throw new Error(`Unknown tool: ${name}`);
  }

  getContext(dependencies: Record<string, string>): string {
    let context = '## Next.js Framework\n\n';

    if ('next' in dependencies) {
      context += `- Next.js version: ${dependencies.next}\n`;
      const version = dependencies.next.replace(/[\^~]/g, '');
      const majorVersion = parseInt(version.split('.')[0], 10);
      if (majorVersion >= 13) {
        context += '- **Note**: Using App Router (Next.js 13+). Check App Router docs.\n';
      }
    }

    context += '\n### Documentation Links\n';
    context += '- Next.js Docs: https://nextjs.org/docs\n';
    context += '- Next.js API Reference: https://nextjs.org/docs/api-reference\n';

    return context;
  }

  private async checkNextjsDocs(topic: string): Promise<string> {
    const url = `https://nextjs.org/docs/${topic}`;

    try {
      const result = await this.parser.extractContent(url);
      let response = `# Next.js: ${topic}\n\n`;
      response += `Source: ${result.url}\n\n`;
      response += result.content;

      if (result.truncated) {
        response += '\n\n[Content truncated - visit URL for full documentation]';
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return `Topic "${topic}" not found in Next.js documentation. Try checking:\n- Topic spelling\n- Available docs at https://nextjs.org/docs\n\nCommon topics: app/building-your-application/routing, app/building-your-application/data-fetching, pages/building-your-application/routing`;
      }
      throw error;
    }
  }

  private async checkNextjsApi(api: string): Promise<string> {
    // Convert "next/image" to "api-reference/components/image"
    const apiPath = api.replace('next/', '');
    const url = `https://nextjs.org/docs/app/api-reference/components/${apiPath}`;

    try {
      const result = await this.parser.extractContent(url);
      let response = `# Next.js API: ${api}\n\n`;
      response += `Source: ${result.url}\n\n`;
      response += result.content;

      if (result.truncated) {
        response += '\n\n[Content truncated - visit URL for full documentation]';
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return `API "${api}" not found in Next.js documentation. Try checking:\n- API name spelling\n- Available APIs at https://nextjs.org/docs/app/api-reference\n\nCommon APIs: next/image, next/link, next/font, next/script, next/head`;
      }
      throw error;
    }
  }
}
