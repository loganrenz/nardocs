import { Plugin, ToolDefinition } from './nuxt.js';
import { HtmlParser } from '../parsers/html.js';

/**
 * Svelte framework plugin
 */
export class SveltePlugin implements Plugin {
  private parser = new HtmlParser();

  detect(dependencies: Record<string, string>): boolean {
    return 'svelte' in dependencies || '@sveltejs/kit' in dependencies;
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'check_svelte_api',
        description:
          'Fetch Svelte API documentation for a specific feature or API. Use this when working with Svelte reactivity, stores, lifecycle functions, or component APIs.',
        inputSchema: {
          type: 'object',
          properties: {
            api: {
              type: 'string',
              description:
                'The API section (e.g., "svelte", "svelte-store", "svelte-motion", "svelte-transition")',
            },
          },
          required: ['api'],
        },
      },
      {
        name: 'check_sveltekit_feature',
        description:
          'Fetch SvelteKit documentation for a specific feature. Use this when working with SvelteKit routing, load functions, form actions, or server-side features.',
        inputSchema: {
          type: 'object',
          properties: {
            feature: {
              type: 'string',
              description:
                'The feature path (e.g., "routing", "load", "form-actions", "hooks", "adapters")',
            },
          },
          required: ['feature'],
        },
      },
    ];
  }

  async handleToolCall(name: string, args: Record<string, unknown>): Promise<string> {
    if (name === 'check_svelte_api') {
      return this.checkSvelteApi(args.api as string);
    } else if (name === 'check_sveltekit_feature') {
      return this.checkSvelteKitFeature(args.feature as string);
    }
    throw new Error(`Unknown tool: ${name}`);
  }

  getContext(dependencies: Record<string, string>): string {
    let context = '## Svelte Framework\n\n';

    if ('svelte' in dependencies) {
      context += `- Svelte version: ${dependencies.svelte}\n`;
    }

    if ('@sveltejs/kit' in dependencies) {
      context += `- SvelteKit version: ${dependencies['@sveltejs/kit']}\n`;
    }

    context += '\n### Documentation Links\n';
    context += '- Svelte Docs: https://svelte.dev/docs\n';
    context += '- SvelteKit Docs: https://kit.svelte.dev/docs\n';

    return context;
  }

  private async checkSvelteApi(api: string): Promise<string> {
    const url = `https://svelte.dev/docs/${api}`;

    try {
      const result = await this.parser.extractContent(url);
      let response = `# Svelte API: ${api}\n\n`;
      response += `Source: ${result.url}\n\n`;
      response += result.content;

      if (result.truncated) {
        response += '\n\n[Content truncated - visit URL for full documentation]';
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return `API "${api}" not found in Svelte documentation. Try checking:\n- API name spelling\n- Available APIs at https://svelte.dev/docs\n\nCommon APIs: svelte, svelte-store, svelte-motion, svelte-transition, svelte-animate`;
      }
      throw error;
    }
  }

  private async checkSvelteKitFeature(feature: string): Promise<string> {
    const url = `https://kit.svelte.dev/docs/${feature}`;

    try {
      const result = await this.parser.extractContent(url);
      let response = `# SvelteKit: ${feature}\n\n`;
      response += `Source: ${result.url}\n\n`;
      response += result.content;

      if (result.truncated) {
        response += '\n\n[Content truncated - visit URL for full documentation]';
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return `Feature "${feature}" not found in SvelteKit documentation. Try checking:\n- Feature path spelling\n- Available docs at https://kit.svelte.dev/docs\n\nCommon features: routing, load, form-actions, hooks, adapters, configuration`;
      }
      throw error;
    }
  }
}
