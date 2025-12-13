import { Plugin, ToolDefinition } from './nuxt.js';
import { HtmlParser } from '../parsers/html.js';

/**
 * Prisma ORM plugin
 */
export class PrismaPlugin implements Plugin {
  private parser = new HtmlParser();

  detect(dependencies: Record<string, string>): boolean {
    return 'prisma' in dependencies || '@prisma/client' in dependencies;
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'check_prisma_docs',
        description:
          'Fetch Prisma documentation for a specific topic. Use this when working with Prisma schema, client API, migrations, or database queries to ensure you have the latest documentation.',
        inputSchema: {
          type: 'object',
          properties: {
            topic: {
              type: 'string',
              description:
                'The documentation topic (e.g., "prisma-schema", "prisma-client", "prisma-migrate", "crud", "filtering-and-sorting")',
            },
          },
          required: ['topic'],
        },
      },
      {
        name: 'check_prisma_reference',
        description:
          'Fetch Prisma API reference documentation. Use this when you need detailed information about Prisma Client methods, schema syntax, or CLI commands.',
        inputSchema: {
          type: 'object',
          properties: {
            reference: {
              type: 'string',
              description:
                'The reference section (e.g., "api-reference/prisma-client-reference", "api-reference/prisma-schema-reference")',
            },
          },
          required: ['reference'],
        },
      },
    ];
  }

  async handleToolCall(name: string, args: Record<string, unknown>): Promise<string> {
    if (name === 'check_prisma_docs') {
      return this.checkPrismaDocs(args.topic as string);
    } else if (name === 'check_prisma_reference') {
      return this.checkPrismaReference(args.reference as string);
    }
    throw new Error(`Unknown tool: ${name}`);
  }

  getContext(dependencies: Record<string, string>): string {
    let context = '## Prisma ORM\n\n';

    if ('prisma' in dependencies) {
      context += `- Prisma CLI version: ${dependencies.prisma}\n`;
    }

    if ('@prisma/client' in dependencies) {
      context += `- Prisma Client version: ${dependencies['@prisma/client']}\n`;
    }

    context += '\n### Documentation Links\n';
    context += '- Prisma Docs: https://www.prisma.io/docs\n';
    context += '- Prisma Client API: https://www.prisma.io/docs/reference/api-reference\n';

    return context;
  }

  private async checkPrismaDocs(topic: string): Promise<string> {
    const url = `https://www.prisma.io/docs/concepts/${topic}`;

    try {
      const result = await this.parser.extractContent(url);
      let response = `# Prisma: ${topic}\n\n`;
      response += `Source: ${result.url}\n\n`;
      response += result.content;

      if (result.truncated) {
        response += '\n\n[Content truncated - visit URL for full documentation]';
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return `Topic "${topic}" not found in Prisma documentation. Try checking:\n- Topic spelling\n- Available docs at https://www.prisma.io/docs\n\nCommon topics: prisma-schema, prisma-client, prisma-migrate, relations, crud`;
      }
      throw error;
    }
  }

  private async checkPrismaReference(reference: string): Promise<string> {
    const url = `https://www.prisma.io/docs/reference/${reference}`;

    try {
      const result = await this.parser.extractContent(url);
      let response = `# Prisma Reference: ${reference}\n\n`;
      response += `Source: ${result.url}\n\n`;
      response += result.content;

      if (result.truncated) {
        response += '\n\n[Content truncated - visit URL for full documentation]';
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return `Reference "${reference}" not found in Prisma documentation. Try checking:\n- Reference path spelling\n- Available references at https://www.prisma.io/docs/reference\n\nCommon references: api-reference/prisma-client-reference, api-reference/prisma-schema-reference`;
      }
      throw error;
    }
  }
}
