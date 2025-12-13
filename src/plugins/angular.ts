import { Plugin, ToolDefinition } from './nuxt.js';
import { HtmlParser } from '../parsers/html.js';

/**
 * Angular framework plugin
 */
export class AngularPlugin implements Plugin {
  private parser = new HtmlParser();

  detect(dependencies: Record<string, string>): boolean {
    return '@angular/core' in dependencies || '@angular/cli' in dependencies;
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'check_angular_api',
        description:
          'Fetch Angular API documentation for a specific class, decorator, or service. Use this when working with Angular components, services, directives, pipes, or any Angular core functionality to ensure you have the latest documentation.',
        inputSchema: {
          type: 'object',
          properties: {
            api: {
              type: 'string',
              description: 'The API name (e.g., "Component", "Injectable", "HttpClient", "Router")',
            },
          },
          required: ['api'],
        },
      },
      {
        name: 'check_angular_guide',
        description:
          'Fetch Angular guide documentation for a specific topic. Use this when learning about Angular concepts like dependency injection, routing, forms, or RxJS integration.',
        inputSchema: {
          type: 'object',
          properties: {
            guide: {
              type: 'string',
              description:
                'The guide path (e.g., "dependency-injection", "routing", "forms", "http")',
            },
          },
          required: ['guide'],
        },
      },
    ];
  }

  async handleToolCall(name: string, args: Record<string, unknown>): Promise<string> {
    if (name === 'check_angular_api') {
      return this.checkAngularApi(args.api as string);
    } else if (name === 'check_angular_guide') {
      return this.checkAngularGuide(args.guide as string);
    }
    throw new Error(`Unknown tool: ${name}`);
  }

  getContext(dependencies: Record<string, string>): string {
    let context = '## Angular Framework\n\n';

    if ('@angular/core' in dependencies) {
      context += `- Angular version: ${dependencies['@angular/core']}\n`;
    }

    if ('@angular/material' in dependencies) {
      context += `- Angular Material version: ${dependencies['@angular/material']}\n`;
    }

    context += '\n### Documentation Links\n';
    context += '- Angular Docs: https://angular.io/docs\n';
    context += '- Angular API Reference: https://angular.io/api\n';

    return context;
  }

  private async checkAngularApi(api: string): Promise<string> {
    const url = `https://angular.io/api/core/${api}`;

    try {
      const result = await this.parser.extractContent(url);
      let response = `# Angular API: ${api}\n\n`;
      response += `Source: ${result.url}\n\n`;
      response += result.content;

      if (result.truncated) {
        response += '\n\n[Content truncated - visit URL for full documentation]';
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return `API "${api}" not found in Angular documentation. Try checking:\n- API name spelling\n- Available APIs at https://angular.io/api\n\nCommon APIs: Component, Injectable, NgModule, HttpClient, Router, FormControl`;
      }
      throw error;
    }
  }

  private async checkAngularGuide(guide: string): Promise<string> {
    const url = `https://angular.io/guide/${guide}`;

    try {
      const result = await this.parser.extractContent(url);
      let response = `# Angular Guide: ${guide}\n\n`;
      response += `Source: ${result.url}\n\n`;
      response += result.content;

      if (result.truncated) {
        response += '\n\n[Content truncated - visit URL for full documentation]';
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return `Guide "${guide}" not found in Angular documentation. Try checking:\n- Guide path spelling\n- Available guides at https://angular.io/docs\n\nCommon guides: dependency-injection, routing, forms, http, lifecycle-hooks`;
      }
      throw error;
    }
  }
}
