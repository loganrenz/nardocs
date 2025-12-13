import { Plugin, ToolDefinition } from './nuxt.js';
import { HtmlParser } from '../parsers/html.js';

/**
 * Remix framework plugin
 */
export class RemixPlugin implements Plugin {
  private parser = new HtmlParser();

  detect(dependencies: Record<string, string>): boolean {
    return '@remix-run/react' in dependencies || '@remix-run/node' in dependencies;
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'check_remix_docs',
        description:
          'Fetch Remix documentation for a specific feature or API. Use this when working with Remix routing, loaders, actions, or form handling.',
        inputSchema: {
          type: 'object',
          properties: {
            topic: {
              type: 'string',
              description:
                'The documentation topic (e.g., "start/quickstart", "route/loader", "route/action", "components/form")',
            },
          },
          required: ['topic'],
        },
      },
      {
        name: 'check_remix_api',
        description:
          'Fetch Remix API reference for a specific function or component. Use this when you need detailed information about Remix utilities and hooks.',
        inputSchema: {
          type: 'object',
          properties: {
            api: {
              type: 'string',
              description:
                'The API name (e.g., "useLoaderData", "useActionData", "useFetcher", "json", "redirect")',
            },
          },
          required: ['api'],
        },
      },
    ];
  }

  async handleToolCall(name: string, args: Record<string, unknown>): Promise<string> {
    if (name === 'check_remix_docs') {
      return this.checkRemixDocs(args.topic as string);
    } else if (name === 'check_remix_api') {
      return this.checkRemixApi(args.api as string);
    }
    throw new Error(`Unknown tool: ${name}`);
  }

  getContext(dependencies: Record<string, string>): string {
    let context = '## Remix Framework\n\n';

    if ('@remix-run/react' in dependencies) {
      context += `- Remix React version: ${dependencies['@remix-run/react']}\n`;
    }

    if ('@remix-run/node' in dependencies) {
      context += `- Remix Node version: ${dependencies['@remix-run/node']}\n`;
    }

    context += '\n### Documentation Links\n';
    context += '- Remix Docs: https://remix.run/docs\n';
    context += '- Remix API Reference: https://remix.run/docs/en/main/api\n';

    return context;
  }

  private async checkRemixDocs(topic: string): Promise<string> {
    const url = `https://remix.run/docs/en/main/${topic}`;

    try {
      const result = await this.parser.extractContent(url);
      let response = `# Remix: ${topic}\n\n`;
      response += `Source: ${result.url}\n\n`;
      response += result.content;

      if (result.truncated) {
        response += '\n\n[Content truncated - visit URL for full documentation]';
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return `Topic "${topic}" not found in Remix documentation. Try checking:\n- Topic spelling\n- Available docs at https://remix.run/docs\n\nCommon topics: start/quickstart, route/loader, route/action, components/form`;
      }
      throw error;
    }
  }

  private async checkRemixApi(api: string): Promise<string> {
    const url = `https://remix.run/docs/en/main/utils/${api}`;

    try {
      const result = await this.parser.extractContent(url);
      let response = `# Remix API: ${api}\n\n`;
      response += `Source: ${result.url}\n\n`;
      response += result.content;

      if (result.truncated) {
        response += '\n\n[Content truncated - visit URL for full documentation]';
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return `API "${api}" not found in Remix documentation. Try checking:\n- API name spelling\n- Available APIs at https://remix.run/docs/en/main/utils\n\nCommon APIs: useLoaderData, useActionData, useFetcher, json, redirect`;
      }
      throw error;
    }
  }
}
