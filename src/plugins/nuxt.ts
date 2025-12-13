import { HtmlParser } from '../parsers/html.js';

/**
 * Plugin interface for framework-specific documentation tools
 */
export interface Plugin {
  /**
   * Detect if this plugin should be enabled based on project dependencies
   */
  detect(dependencies: Record<string, string>): boolean;

  /**
   * Get MCP tool definitions for this plugin
   */
  getTools(): ToolDefinition[];

  /**
   * Handle a tool call
   */
  handleToolCall(name: string, args: Record<string, unknown>): Promise<string>;

  /**
   * Get context information for this plugin
   */
  getContext(dependencies: Record<string, string>): string;
}

/**
 * MCP Tool definition
 */
export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, unknown>;
    required?: string[];
  };
}

/**
 * Nuxt framework plugin
 */
export class NuxtPlugin implements Plugin {
  private parser = new HtmlParser();

  detect(dependencies: Record<string, string>): boolean {
    return 'nuxt' in dependencies || '@nuxt/kit' in dependencies;
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'check_nuxt_ui_component',
        description: 'Check the latest API documentation for a Nuxt UI component. Use this BEFORE suggesting or modifying any Nuxt UI component code (UButton, UCard, UModal, etc.) to ensure you have the current v4 API. This will fetch the most up-to-date component documentation including props, slots, and usage examples.',
        inputSchema: {
          type: 'object',
          properties: {
            component: {
              type: 'string',
              description: 'The component name (e.g., "button", "card", "modal")'
            }
          },
          required: ['component']
        }
      },
      {
        name: 'check_nuxt_feature',
        description: 'Fetch Nuxt framework documentation for a specific feature or API. Use this when working with Nuxt composables, server APIs, routing, configuration, or any core Nuxt functionality to ensure you have the latest documentation.',
        inputSchema: {
          type: 'object',
          properties: {
            feature: {
              type: 'string',
              description: 'The feature or API path (e.g., "getting-started/data-fetching", "api/composables/use-fetch", "guide/directory-structure/server")'
            }
          },
          required: ['feature']
        }
      }
    ];
  }

  async handleToolCall(name: string, args: Record<string, unknown>): Promise<string> {
    if (name === 'check_nuxt_ui_component') {
      return this.checkNuxtUiComponent(args.component as string);
    } else if (name === 'check_nuxt_feature') {
      return this.checkNuxtFeature(args.feature as string);
    }
    throw new Error(`Unknown tool: ${name}`);
  }

  getContext(dependencies: Record<string, string>): string {
    let context = '## Nuxt Framework\n\n';
    
    if ('nuxt' in dependencies) {
      context += `- Nuxt version: ${dependencies.nuxt}\n`;
    }
    
    if ('@nuxt/ui' in dependencies || 'nuxt-ui' in dependencies) {
      const version = dependencies['@nuxt/ui'] || dependencies['nuxt-ui'];
      context += `- Nuxt UI version: ${version}\n`;
      context += '- **Important**: Nuxt UI v4 has breaking changes from v3. Always check component docs before use.\n';
    }

    context += '\n### Documentation Links\n';
    context += '- Nuxt Docs: https://nuxt.com/docs\n';
    context += '- Nuxt UI Docs: https://ui.nuxt.com\n';

    return context;
  }

  private async checkNuxtUiComponent(component: string): Promise<string> {
    const url = `https://ui.nuxt.com/components/${component.toLowerCase()}`;
    
    try {
      const result = await this.parser.extractContent(url);
      let response = `# Nuxt UI Component: ${component}\n\n`;
      response += `Source: ${result.url}\n\n`;
      response += result.content;
      
      if (result.truncated) {
        response += '\n\n[Content truncated - visit URL for full documentation]';
      }
      
      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return `Component "${component}" not found in Nuxt UI documentation. Try checking:\n- Component name spelling\n- Available components at https://ui.nuxt.com/components\n\nCommon components: button, card, modal, input, select, dropdown, badge, alert`;
      }
      throw error;
    }
  }

  private async checkNuxtFeature(feature: string): Promise<string> {
    const url = `https://nuxt.com/docs/${feature}`;
    
    try {
      const result = await this.parser.extractContent(url);
      let response = `# Nuxt Documentation: ${feature}\n\n`;
      response += `Source: ${result.url}\n\n`;
      response += result.content;
      
      if (result.truncated) {
        response += '\n\n[Content truncated - visit URL for full documentation]';
      }
      
      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return `Feature "${feature}" not found in Nuxt documentation. Try checking:\n- Feature path (e.g., "api/composables/use-fetch" or "guide/directory-structure/pages")\n- Available docs at https://nuxt.com/docs\n\nCommon paths: getting-started, api/composables, guide/directory-structure`;
      }
      throw error;
    }
  }
}
