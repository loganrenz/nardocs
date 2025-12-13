import { Plugin, ToolDefinition } from './nuxt.js';
import { HtmlParser } from '../parsers/html.js';

/**
 * Tailwind CSS plugin
 */
export class TailwindPlugin implements Plugin {
  private parser = new HtmlParser();

  detect(dependencies: Record<string, string>): boolean {
    return 'tailwindcss' in dependencies;
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'check_tailwind_docs',
        description:
          'Fetch Tailwind CSS documentation for a specific utility or feature. Use this when working with Tailwind classes, configuration, or customization to ensure you have the latest documentation.',
        inputSchema: {
          type: 'object',
          properties: {
            topic: {
              type: 'string',
              description:
                'The documentation topic (e.g., "flex", "grid", "colors", "spacing", "responsive-design", "dark-mode")',
            },
          },
          required: ['topic'],
        },
      },
    ];
  }

  async handleToolCall(name: string, args: Record<string, unknown>): Promise<string> {
    if (name === 'check_tailwind_docs') {
      return this.checkTailwindDocs(args.topic as string);
    }
    throw new Error(`Unknown tool: ${name}`);
  }

  getContext(dependencies: Record<string, string>): string {
    let context = '## Tailwind CSS\n\n';

    if ('tailwindcss' in dependencies) {
      context += `- Tailwind CSS version: ${dependencies.tailwindcss}\n`;
    }

    if ('@tailwindcss/forms' in dependencies) {
      context += '- @tailwindcss/forms plugin installed\n';
    }

    if ('@tailwindcss/typography' in dependencies) {
      context += '- @tailwindcss/typography plugin installed\n';
    }

    context += '\n### Documentation Links\n';
    context += '- Tailwind CSS Docs: https://tailwindcss.com/docs\n';

    return context;
  }

  private async checkTailwindDocs(topic: string): Promise<string> {
    const url = `https://tailwindcss.com/docs/${topic}`;

    try {
      const result = await this.parser.extractContent(url);
      let response = `# Tailwind CSS: ${topic}\n\n`;
      response += `Source: ${result.url}\n\n`;
      response += result.content;

      if (result.truncated) {
        response += '\n\n[Content truncated - visit URL for full documentation]';
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return `Topic "${topic}" not found in Tailwind CSS documentation. Try checking:\n- Topic spelling\n- Available docs at https://tailwindcss.com/docs\n\nCommon topics: flex, grid, padding, margin, colors, typography, responsive-design, dark-mode, customizing-colors`;
      }
      throw error;
    }
  }
}
