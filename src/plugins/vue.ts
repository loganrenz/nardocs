import { Plugin, ToolDefinition } from './nuxt.js';
import { HtmlParser } from '../parsers/html.js';

/**
 * Vue framework plugin
 */
export class VuePlugin implements Plugin {
  private parser = new HtmlParser();

  detect(dependencies: Record<string, string>): boolean {
    return 'vue' in dependencies || '@vue/runtime-core' in dependencies;
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'check_vue_api',
        description: 'Fetch Vue 3 API documentation for a specific API, composable, or feature. Use this when working with Vue composition API (ref, computed, watch), component APIs, directives, or any Vue core functionality to ensure you have the latest documentation.',
        inputSchema: {
          type: 'object',
          properties: {
            api: {
              type: 'string',
              description: 'The API path (e.g., "reactivity-core.html#ref", "composition-api-setup.html", "built-in-components.html")'
            }
          },
          required: ['api']
        }
      }
    ];
  }

  async handleToolCall(name: string, args: Record<string, unknown>): Promise<string> {
    if (name === 'check_vue_api') {
      return this.checkVueApi(args.api as string);
    }
    throw new Error(`Unknown tool: ${name}`);
  }

  getContext(dependencies: Record<string, string>): string {
    let context = '## Vue Framework\n\n';
    
    if ('vue' in dependencies) {
      context += `- Vue version: ${dependencies.vue}\n`;
    }

    context += '\n### Documentation Links\n';
    context += '- Vue 3 Docs: https://vuejs.org\n';
    context += '- Vue 3 API Reference: https://vuejs.org/api\n';

    return context;
  }

  private async checkVueApi(api: string): Promise<string> {
    // Handle both full paths and shorthand (e.g., "ref" -> "reactivity-core.html#ref")
    let apiPath = api;
    if (!api.includes('.html')) {
      // Common API shortcuts
      const shortcuts: Record<string, string> = {
        'ref': 'reactivity-core.html#ref',
        'reactive': 'reactivity-core.html#reactive',
        'computed': 'reactivity-core.html#computed',
        'watch': 'reactivity-core.html#watch',
        'watchEffect': 'reactivity-core.html#watcheffect',
        'onMounted': 'composition-api-lifecycle.html#onmounted',
        'onUnmounted': 'composition-api-lifecycle.html#onunmounted',
        'defineProps': 'sfc-script-setup.html#defineprops-defineemits',
        'defineEmits': 'sfc-script-setup.html#defineprops-defineemits',
      };
      
      apiPath = shortcuts[api] || `${api}.html`;
    }

    const url = `https://vuejs.org/api/${apiPath}`;
    
    try {
      const result = await this.parser.extractContent(url);
      let response = `# Vue 3 API: ${api}\n\n`;
      response += `Source: ${result.url}\n\n`;
      response += result.content;
      
      if (result.truncated) {
        response += '\n\n[Content truncated - visit URL for full documentation]';
      }
      
      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return `API "${api}" not found in Vue documentation. Try checking:\n- API name or path\n- Available APIs at https://vuejs.org/api\n\nCommon APIs: ref, reactive, computed, watch, onMounted, defineProps, defineEmits`;
      }
      throw error;
    }
  }
}
