import { Plugin, ToolDefinition } from './nuxt.js';
import { HtmlParser } from '../parsers/html.js';

/**
 * Express.js plugin
 */
export class ExpressPlugin implements Plugin {
  private parser = new HtmlParser();

  detect(dependencies: Record<string, string>): boolean {
    return 'express' in dependencies;
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'check_express_api',
        description:
          'Fetch Express.js API documentation for a specific method or feature. Use this when working with Express routing, middleware, request/response objects, or application configuration.',
        inputSchema: {
          type: 'object',
          properties: {
            api: {
              type: 'string',
              description:
                'The API section (e.g., "express", "application", "request", "response", "router")',
            },
          },
          required: ['api'],
        },
      },
      {
        name: 'check_express_guide',
        description:
          'Fetch Express.js guide documentation for a specific topic. Use this when learning about Express concepts like routing, middleware, error handling, or templating.',
        inputSchema: {
          type: 'object',
          properties: {
            guide: {
              type: 'string',
              description:
                'The guide topic (e.g., "routing", "writing-middleware", "error-handling", "using-template-engines")',
            },
          },
          required: ['guide'],
        },
      },
    ];
  }

  async handleToolCall(name: string, args: Record<string, unknown>): Promise<string> {
    if (name === 'check_express_api') {
      return this.checkExpressApi(args.api as string);
    } else if (name === 'check_express_guide') {
      return this.checkExpressGuide(args.guide as string);
    }
    throw new Error(`Unknown tool: ${name}`);
  }

  getContext(dependencies: Record<string, string>): string {
    let context = '## Express.js\n\n';

    if ('express' in dependencies) {
      context += `- Express version: ${dependencies.express}\n`;
    }

    context += '\n### Documentation Links\n';
    context += '- Express Docs: https://expressjs.com\n';
    context += '- Express API Reference: https://expressjs.com/en/4x/api.html\n';

    return context;
  }

  private async checkExpressApi(api: string): Promise<string> {
    const url = `https://expressjs.com/en/4x/api.html#${api}`;

    try {
      const result = await this.parser.extractContent(url);
      let response = `# Express.js API: ${api}\n\n`;
      response += `Source: ${result.url}\n\n`;
      response += result.content;

      if (result.truncated) {
        response += '\n\n[Content truncated - visit URL for full documentation]';
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return `API "${api}" not found in Express documentation. Try checking:\n- API name spelling\n- Available APIs at https://expressjs.com/en/4x/api.html\n\nCommon APIs: express, app, req, res, router`;
      }
      throw error;
    }
  }

  private async checkExpressGuide(guide: string): Promise<string> {
    const url = `https://expressjs.com/en/guide/${guide}.html`;

    try {
      const result = await this.parser.extractContent(url);
      let response = `# Express.js Guide: ${guide}\n\n`;
      response += `Source: ${result.url}\n\n`;
      response += result.content;

      if (result.truncated) {
        response += '\n\n[Content truncated - visit URL for full documentation]';
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return `Guide "${guide}" not found in Express documentation. Try checking:\n- Guide name spelling\n- Available guides at https://expressjs.com/en/guide\n\nCommon guides: routing, writing-middleware, error-handling, using-template-engines`;
      }
      throw error;
    }
  }
}
