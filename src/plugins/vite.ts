import { Plugin, ToolDefinition } from './nuxt.js';
import { HtmlParser } from '../parsers/html.js';

/**
 * Vite build tool plugin
 */
export class VitePlugin implements Plugin {
  private parser = new HtmlParser();

  detect(dependencies: Record<string, string>): boolean {
    return 'vite' in dependencies;
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'check_vite_docs',
        description:
          'Fetch Vite documentation for a specific feature or configuration. Use this when working with Vite configuration, plugins, build optimization, or development server features.',
        inputSchema: {
          type: 'object',
          properties: {
            topic: {
              type: 'string',
              description:
                'The documentation topic (e.g., "guide/features", "config", "guide/env-and-mode", "guide/build")',
            },
          },
          required: ['topic'],
        },
      },
    ];
  }

  async handleToolCall(name: string, args: Record<string, unknown>): Promise<string> {
    if (name === 'check_vite_docs') {
      return this.checkViteDocs(args.topic as string);
    }
    throw new Error(`Unknown tool: ${name}`);
  }

  getContext(dependencies: Record<string, string>): string {
    let context = '## Vite\n\n';

    if ('vite' in dependencies) {
      context += `- Vite version: ${dependencies.vite}\n`;
    }

    if ('@vitejs/plugin-react' in dependencies) {
      context += '- Using React plugin\n';
    }

    if ('@vitejs/plugin-vue' in dependencies) {
      context += '- Using Vue plugin\n';
    }

    context += '\n### Documentation Links\n';
    context += '- Vite Docs: https://vitejs.dev/guide\n';
    context += '- Vite Config Reference: https://vitejs.dev/config\n';

    return context;
  }

  private async checkViteDocs(topic: string): Promise<string> {
    const url = `https://vitejs.dev/${topic}`;

    try {
      const result = await this.parser.extractContent(url);
      let response = `# Vite: ${topic}\n\n`;
      response += `Source: ${result.url}\n\n`;
      response += result.content;

      if (result.truncated) {
        response += '\n\n[Content truncated - visit URL for full documentation]';
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return `Topic "${topic}" not found in Vite documentation. Try checking:\n- Topic spelling\n- Available docs at https://vitejs.dev/guide\n\nCommon topics: guide/features, config, guide/env-and-mode, guide/build, guide/dep-pre-bundling`;
      }
      throw error;
    }
  }
}
