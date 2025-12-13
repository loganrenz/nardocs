import { Plugin, ToolDefinition } from './nuxt.js';
import { HtmlParser } from '../parsers/html.js';

/**
 * SolidJS framework plugin
 */
export class SolidPlugin implements Plugin {
  private parser = new HtmlParser();

  detect(dependencies: Record<string, string>): boolean {
    return 'solid-js' in dependencies || '@solidjs/router' in dependencies;
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'check_solid_docs',
        description:
          'Fetch SolidJS documentation for a specific feature or API. Use this when working with SolidJS reactivity, components, stores, or routing.',
        inputSchema: {
          type: 'object',
          properties: {
            topic: {
              type: 'string',
              description:
                'The documentation topic (e.g., "concepts/intro/what-is-solid", "reference/reactive-utilities/createSignal", "guides/getting-started")',
            },
          },
          required: ['topic'],
        },
      },
    ];
  }

  async handleToolCall(name: string, args: Record<string, unknown>): Promise<string> {
    if (name === 'check_solid_docs') {
      return this.checkSolidDocs(args.topic as string);
    }
    throw new Error(`Unknown tool: ${name}`);
  }

  getContext(dependencies: Record<string, string>): string {
    let context = '## SolidJS\n\n';

    if ('solid-js' in dependencies) {
      context += `- SolidJS version: ${dependencies['solid-js']}\n`;
    }

    if ('@solidjs/router' in dependencies) {
      context += `- SolidJS Router version: ${dependencies['@solidjs/router']}\n`;
    }

    if ('solid-start' in dependencies) {
      context += `- SolidStart version: ${dependencies['solid-start']}\n`;
    }

    context += '\n### Documentation Links\n';
    context += '- SolidJS Docs: https://www.solidjs.com/docs\n';
    context += '- SolidJS Tutorial: https://www.solidjs.com/tutorial\n';

    return context;
  }

  private async checkSolidDocs(topic: string): Promise<string> {
    const url = `https://www.solidjs.com/docs/${topic}`;

    try {
      const result = await this.parser.extractContent(url);
      let response = `# SolidJS: ${topic}\n\n`;
      response += `Source: ${result.url}\n\n`;
      response += result.content;

      if (result.truncated) {
        response += '\n\n[Content truncated - visit URL for full documentation]';
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return `Topic "${topic}" not found in SolidJS documentation. Try checking:\n- Topic spelling\n- Available docs at https://www.solidjs.com/docs\n\nCommon topics: concepts/reactivity, reference/reactive-utilities/createSignal, reference/component-apis/createContext`;
      }
      throw error;
    }
  }
}
