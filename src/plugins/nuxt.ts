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
 * Nuxt module configuration with documentation URLs
 */
interface NuxtModuleConfig {
  packages: string[];
  docsUrl: string;
  name: string;
  description: string;
}

/**
 * Registry of supported Nuxt modules
 */
const NUXT_MODULES: Record<string, NuxtModuleConfig> = {
  image: {
    packages: ['@nuxt/image'],
    docsUrl: 'https://image.nuxt.com',
    name: 'Nuxt Image',
    description:
      'Optimized images for Nuxt with automatic resizing, lazy loading, and modern formats',
  },
  content: {
    packages: ['@nuxt/content'],
    docsUrl: 'https://content.nuxt.com',
    name: 'Nuxt Content',
    description: 'File-based CMS for Nuxt with Markdown, YAML, JSON, and CSV support',
  },
  fonts: {
    packages: ['@nuxt/fonts'],
    docsUrl: 'https://fonts.nuxt.com',
    name: 'Nuxt Fonts',
    description: 'Automatic font optimization and loading for Nuxt',
  },
  icon: {
    packages: ['@nuxt/icon', 'nuxt-icon'],
    docsUrl: 'https://nuxt.com/modules/icon',
    name: 'Nuxt Icon',
    description: 'Icon component with 200,000+ icons from Iconify',
  },
  scripts: {
    packages: ['@nuxt/scripts'],
    docsUrl: 'https://scripts.nuxt.com',
    name: 'Nuxt Scripts',
    description: 'Better third-party script management for Nuxt',
  },
  i18n: {
    packages: ['@nuxtjs/i18n'],
    docsUrl: 'https://i18n.nuxtjs.org',
    name: 'Nuxt i18n',
    description: 'Internationalization for Nuxt with Vue I18n integration',
  },
  colorMode: {
    packages: ['@nuxtjs/color-mode'],
    docsUrl: 'https://color-mode.nuxtjs.org',
    name: 'Nuxt Color Mode',
    description: 'Dark and light mode with auto detection for Nuxt',
  },
  pinia: {
    packages: ['@pinia/nuxt', 'pinia'],
    docsUrl: 'https://pinia.vuejs.org/ssr/nuxt.html',
    name: 'Pinia (Nuxt)',
    description: 'The intuitive store for Vue.js with Nuxt integration',
  },
  vueuse: {
    packages: ['@vueuse/nuxt', '@vueuse/core'],
    docsUrl: 'https://vueuse.org',
    name: 'VueUse',
    description: 'Collection of essential Vue Composition Utilities',
  },
  eslint: {
    packages: ['@nuxt/eslint'],
    docsUrl: 'https://eslint.nuxt.com',
    name: 'Nuxt ESLint',
    description: 'ESLint integration for Nuxt with auto-generated configs',
  },
  testUtils: {
    packages: ['@nuxt/test-utils'],
    docsUrl: 'https://nuxt.com/docs/getting-started/testing',
    name: 'Nuxt Test Utils',
    description: 'Testing utilities for Nuxt applications',
  },
  auth: {
    packages: ['nuxt-auth-utils', '@sidebase/nuxt-auth', '@auth/nuxt'],
    docsUrl: 'https://nuxt.com/modules/auth-utils',
    name: 'Nuxt Auth',
    description: 'Authentication utilities for Nuxt',
  },
  supabase: {
    packages: ['@nuxtjs/supabase'],
    docsUrl: 'https://supabase.nuxtjs.org',
    name: 'Nuxt Supabase',
    description: 'Supabase integration for Nuxt',
  },
  device: {
    packages: ['@nuxtjs/device'],
    docsUrl: 'https://nuxt.com/modules/device',
    name: 'Nuxt Device',
    description: 'Device detection for Nuxt (mobile, tablet, desktop)',
  },
  robots: {
    packages: ['@nuxtjs/robots', 'nuxt-simple-robots'],
    docsUrl: 'https://nuxtseo.com/robots',
    name: 'Nuxt Robots',
    description: 'Robots.txt generation for Nuxt',
  },
  sitemap: {
    packages: ['@nuxtjs/sitemap', 'nuxt-simple-sitemap'],
    docsUrl: 'https://nuxtseo.com/sitemap',
    name: 'Nuxt Sitemap',
    description: 'Sitemap generation for Nuxt',
  },
  ogImage: {
    packages: ['nuxt-og-image'],
    docsUrl: 'https://nuxtseo.com/og-image',
    name: 'Nuxt OG Image',
    description: 'Generate dynamic Open Graph images for Nuxt',
  },
  seo: {
    packages: ['@nuxtjs/seo', 'nuxt-seo-kit'],
    docsUrl: 'https://nuxtseo.com',
    name: 'Nuxt SEO',
    description: 'Complete SEO toolkit for Nuxt',
  },
  security: {
    packages: ['nuxt-security'],
    docsUrl: 'https://nuxt-security.vercel.app',
    name: 'Nuxt Security',
    description: 'Security module for Nuxt with OWASP best practices',
  },
  devtools: {
    packages: ['@nuxt/devtools'],
    docsUrl: 'https://devtools.nuxt.com',
    name: 'Nuxt DevTools',
    description: 'Developer tools for Nuxt with visual debugging',
  },
  hub: {
    packages: ['@nuxthub/core', 'nuxthub'],
    docsUrl: 'https://hub.nuxt.com/docs',
    name: 'NuxtHub',
    description: 'Full-stack Nuxt hosting and deployment platform',
  },
  primevue: {
    packages: ['@primevue/nuxt-module', 'nuxt-primevue'],
    docsUrl: 'https://primevue.org/nuxt',
    name: 'PrimeVue Nuxt',
    description: 'PrimeVue UI components for Nuxt',
  },
  shadcn: {
    packages: ['shadcn-nuxt'],
    docsUrl: 'https://www.shadcn-vue.com/docs/installation/nuxt',
    name: 'shadcn-vue Nuxt',
    description: 'Beautifully designed components built with Radix Vue and Tailwind',
  },
};

/**
 * Nuxt framework plugin
 */
export class NuxtPlugin implements Plugin {
  private parser = new HtmlParser();

  detect(dependencies: Record<string, string>): boolean {
    return 'nuxt' in dependencies || '@nuxt/kit' in dependencies;
  }

  /**
   * Detect which Nuxt modules are installed
   */
  private detectInstalledModules(dependencies: Record<string, string>): string[] {
    const installed: string[] = [];

    for (const [moduleKey, config] of Object.entries(NUXT_MODULES)) {
      if (config.packages.some((pkg) => pkg in dependencies)) {
        installed.push(moduleKey);
      }
    }

    return installed;
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'check_nuxt_ui_component',
        description:
          'Check the latest API documentation for a Nuxt UI component. Use this BEFORE suggesting or modifying any Nuxt UI component code (UButton, UCard, UModal, etc.) to ensure you have the current v4 API. This will fetch the most up-to-date component documentation including props, slots, and usage examples.',
        inputSchema: {
          type: 'object',
          properties: {
            component: {
              type: 'string',
              description: 'The component name (e.g., "button", "card", "modal")',
            },
          },
          required: ['component'],
        },
      },
      {
        name: 'check_nuxt_feature',
        description:
          'Fetch Nuxt framework documentation for a specific feature or API. Use this when working with Nuxt composables, server APIs, routing, configuration, or any core Nuxt functionality to ensure you have the latest documentation.',
        inputSchema: {
          type: 'object',
          properties: {
            feature: {
              type: 'string',
              description:
                'The feature or API path (e.g., "getting-started/data-fetching", "api/composables/use-fetch", "guide/directory-structure/server")',
            },
          },
          required: ['feature'],
        },
      },
      {
        name: 'check_nuxt_module',
        description:
          'Fetch documentation for a Nuxt module. Use this when working with Nuxt modules like @nuxt/image, @nuxt/content, @nuxtjs/i18n, @nuxtjs/color-mode, Pinia, VueUse, or any other Nuxt ecosystem module.',
        inputSchema: {
          type: 'object',
          properties: {
            module: {
              type: 'string',
              description:
                'The module name (e.g., "image", "content", "fonts", "icon", "scripts", "i18n", "color-mode", "pinia", "vueuse", "eslint", "auth", "supabase", "device", "robots", "sitemap", "og-image", "seo", "security", "devtools", "hub", "primevue", "shadcn")',
            },
            path: {
              type: 'string',
              description:
                'Optional documentation path within the module docs (e.g., "getting-started", "api/components", "configuration")',
            },
          },
          required: ['module'],
        },
      },
      {
        name: 'check_nuxt_image',
        description:
          'Fetch Nuxt Image module documentation. Use this when working with <NuxtImg>, <NuxtPicture>, image optimization, providers, or responsive images.',
        inputSchema: {
          type: 'object',
          properties: {
            topic: {
              type: 'string',
              description:
                'The documentation topic (e.g., "get-started/installation", "usage/nuxt-img", "usage/nuxt-picture", "providers/cloudinary", "configuration")',
            },
          },
          required: ['topic'],
        },
      },
      {
        name: 'check_nuxt_content',
        description:
          'Fetch Nuxt Content module documentation. Use this when working with Markdown content, content queries, document-driven mode, or content components.',
        inputSchema: {
          type: 'object',
          properties: {
            topic: {
              type: 'string',
              description:
                'The documentation topic (e.g., "get-started/installation", "usage/markdown", "usage/content-query", "api/composables", "configuration")',
            },
          },
          required: ['topic'],
        },
      },
      {
        name: 'check_nuxt_i18n',
        description:
          'Fetch Nuxt i18n module documentation. Use this when working with internationalization, translations, locale switching, or language routing.',
        inputSchema: {
          type: 'object',
          properties: {
            topic: {
              type: 'string',
              description:
                'The documentation topic (e.g., "getting-started/setup", "guide/lazy-load-translations", "api/composables", "api/vue-i18n")',
            },
          },
          required: ['topic'],
        },
      },
      {
        name: 'check_vueuse',
        description:
          'Fetch VueUse documentation. Use this when working with VueUse composables like useFetch, useStorage, useDark, useMediaQuery, or any of the 200+ utility functions.',
        inputSchema: {
          type: 'object',
          properties: {
            composable: {
              type: 'string',
              description:
                'The composable or function name (e.g., "useFetch", "useStorage", "useDark", "useMediaQuery", "useIntersectionObserver")',
            },
          },
          required: ['composable'],
        },
      },
      {
        name: 'check_pinia',
        description:
          'Fetch Pinia documentation. Use this when working with Pinia stores, state management, getters, actions, or Nuxt integration.',
        inputSchema: {
          type: 'object',
          properties: {
            topic: {
              type: 'string',
              description:
                'The documentation topic (e.g., "getting-started", "core-concepts/state", "core-concepts/getters", "core-concepts/actions", "ssr/nuxt")',
            },
          },
          required: ['topic'],
        },
      },
      {
        name: 'check_nuxt_seo',
        description:
          'Fetch Nuxt SEO documentation. Use this when working with SEO modules like robots.txt, sitemap, OG images, schema.org, or the complete SEO toolkit.',
        inputSchema: {
          type: 'object',
          properties: {
            module: {
              type: 'string',
              description:
                'The SEO module (e.g., "robots", "sitemap", "og-image", "schema-org", "link-checker", "site-config")',
            },
            topic: {
              type: 'string',
              description: 'Optional documentation path within the module docs',
            },
          },
          required: ['module'],
        },
      },
    ];
  }

  async handleToolCall(name: string, args: Record<string, unknown>): Promise<string> {
    switch (name) {
      case 'check_nuxt_ui_component':
        return this.checkNuxtUiComponent(args.component as string);
      case 'check_nuxt_feature':
        return this.checkNuxtFeature(args.feature as string);
      case 'check_nuxt_module':
        return this.checkNuxtModule(args.module as string, args.path as string | undefined);
      case 'check_nuxt_image':
        return this.checkNuxtImage(args.topic as string);
      case 'check_nuxt_content':
        return this.checkNuxtContent(args.topic as string);
      case 'check_nuxt_i18n':
        return this.checkNuxtI18n(args.topic as string);
      case 'check_vueuse':
        return this.checkVueUse(args.composable as string);
      case 'check_pinia':
        return this.checkPinia(args.topic as string);
      case 'check_nuxt_seo':
        return this.checkNuxtSeo(args.module as string, args.topic as string | undefined);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  getContext(dependencies: Record<string, string>): string {
    let context = '## Nuxt Framework\n\n';

    if ('nuxt' in dependencies) {
      context += `- Nuxt version: ${dependencies.nuxt}\n`;
    }

    if ('@nuxt/ui' in dependencies || 'nuxt-ui' in dependencies) {
      const version = dependencies['@nuxt/ui'] || dependencies['nuxt-ui'];
      context += `- Nuxt UI version: ${version}\n`;
      context +=
        '- **Important**: Nuxt UI v4 has breaking changes from v3. Always check component docs before use.\n';
    }

    // Detect and list installed modules
    const installedModules = this.detectInstalledModules(dependencies);
    if (installedModules.length > 0) {
      context += '\n### Installed Nuxt Modules\n';
      for (const moduleKey of installedModules) {
        const config = NUXT_MODULES[moduleKey];
        const installedPkg = config.packages.find((pkg) => pkg in dependencies);
        const version = installedPkg ? dependencies[installedPkg] : 'unknown';
        context += `- ${config.name} (${installedPkg}): ${version}\n`;
      }
    }

    context += '\n### Documentation Links\n';
    context += '- Nuxt Docs: https://nuxt.com/docs\n';
    context += '- Nuxt UI Docs: https://ui.nuxt.com\n';
    context += '- Nuxt Modules: https://nuxt.com/modules\n';

    // Add links for installed modules
    if (installedModules.length > 0) {
      context += '\n### Module Documentation\n';
      for (const moduleKey of installedModules) {
        const config = NUXT_MODULES[moduleKey];
        context += `- ${config.name}: ${config.docsUrl}\n`;
      }
    }

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
        return `Component "${component}" not found in Nuxt UI documentation. Try checking:\n- Component name spelling\n- Available components at https://ui.nuxt.com/components\n\nCommon components: button, card, modal, input, select, dropdown, badge, alert, avatar, accordion, breadcrumb, checkbox, form, table, tabs`;
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
        return `Feature "${feature}" not found in Nuxt documentation. Try checking:\n- Feature path (e.g., "api/composables/use-fetch" or "guide/directory-structure/pages")\n- Available docs at https://nuxt.com/docs\n\nCommon paths:\n- getting-started/introduction\n- api/composables/use-fetch\n- api/composables/use-async-data\n- guide/directory-structure/pages\n- guide/directory-structure/server\n- guide/directory-structure/components`;
      }
      throw error;
    }
  }

  private async checkNuxtModule(module: string, path?: string): Promise<string> {
    // Normalize module name
    const moduleKey = module.toLowerCase().replace(/-/g, '');
    const normalizedKeys: Record<string, string> = {
      image: 'image',
      nuxtimage: 'image',
      content: 'content',
      nuxtcontent: 'content',
      fonts: 'fonts',
      nuxtfonts: 'fonts',
      icon: 'icon',
      nuxticon: 'icon',
      scripts: 'scripts',
      nuxtscripts: 'scripts',
      i18n: 'i18n',
      colormode: 'colorMode',
      'color-mode': 'colorMode',
      pinia: 'pinia',
      vueuse: 'vueuse',
      eslint: 'eslint',
      nuxteslint: 'eslint',
      testutils: 'testUtils',
      'test-utils': 'testUtils',
      auth: 'auth',
      nuxtauth: 'auth',
      supabase: 'supabase',
      device: 'device',
      robots: 'robots',
      sitemap: 'sitemap',
      ogimage: 'ogImage',
      'og-image': 'ogImage',
      seo: 'seo',
      security: 'security',
      devtools: 'devtools',
      hub: 'hub',
      nuxthub: 'hub',
      primevue: 'primevue',
      shadcn: 'shadcn',
    };

    const resolvedKey = normalizedKeys[moduleKey] || moduleKey;
    const config = NUXT_MODULES[resolvedKey];

    if (!config) {
      const availableModules = Object.keys(NUXT_MODULES).join(', ');
      return `Module "${module}" not found in supported modules. Available modules: ${availableModules}\n\nYou can also search for modules at https://nuxt.com/modules`;
    }

    let url = config.docsUrl;
    if (path) {
      url = `${config.docsUrl}/${path}`;
    }

    try {
      const result = await this.parser.extractContent(url);
      let response = `# ${config.name} Documentation\n\n`;
      response += `${config.description}\n\n`;
      response += `Source: ${result.url}\n\n`;
      response += result.content;

      if (result.truncated) {
        response += '\n\n[Content truncated - visit URL for full documentation]';
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return `Documentation not found at ${url}. Try:\n- Checking the path\n- Visiting ${config.docsUrl} directly\n\nModule: ${config.name}\nDescription: ${config.description}`;
      }
      throw error;
    }
  }

  private async checkNuxtImage(topic: string): Promise<string> {
    const url = `https://image.nuxt.com/${topic}`;

    try {
      const result = await this.parser.extractContent(url);
      let response = `# Nuxt Image: ${topic}\n\n`;
      response += `Source: ${result.url}\n\n`;
      response += result.content;

      if (result.truncated) {
        response += '\n\n[Content truncated - visit URL for full documentation]';
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return `Topic "${topic}" not found in Nuxt Image documentation. Try:\n- get-started/installation\n- usage/nuxt-img\n- usage/nuxt-picture\n- providers/cloudinary\n- providers/imgix\n- configuration\n\nFull docs: https://image.nuxt.com`;
      }
      throw error;
    }
  }

  private async checkNuxtContent(topic: string): Promise<string> {
    const url = `https://content.nuxt.com/${topic}`;

    try {
      const result = await this.parser.extractContent(url);
      let response = `# Nuxt Content: ${topic}\n\n`;
      response += `Source: ${result.url}\n\n`;
      response += result.content;

      if (result.truncated) {
        response += '\n\n[Content truncated - visit URL for full documentation]';
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return `Topic "${topic}" not found in Nuxt Content documentation. Try:\n- get-started/installation\n- usage/markdown\n- usage/content-query\n- usage/navigation\n- api/composables\n- api/components\n- configuration\n\nFull docs: https://content.nuxt.com`;
      }
      throw error;
    }
  }

  private async checkNuxtI18n(topic: string): Promise<string> {
    const url = `https://i18n.nuxtjs.org/${topic}`;

    try {
      const result = await this.parser.extractContent(url);
      let response = `# Nuxt i18n: ${topic}\n\n`;
      response += `Source: ${result.url}\n\n`;
      response += result.content;

      if (result.truncated) {
        response += '\n\n[Content truncated - visit URL for full documentation]';
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return `Topic "${topic}" not found in Nuxt i18n documentation. Try:\n- getting-started/setup\n- getting-started/basic-usage\n- guide/lazy-load-translations\n- guide/browser-language-detection\n- api/composables\n- api/vue-i18n\n\nFull docs: https://i18n.nuxtjs.org`;
      }
      throw error;
    }
  }

  private async checkVueUse(composable: string): Promise<string> {
    // VueUse uses kebab-case in URLs
    const kebabCase = composable
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase()
      .replace(/^use-/, '');

    // Determine category based on composable name patterns
    const categories: Record<string, string[]> = {
      browser: [
        'clipboard',
        'permission',
        'broadcast-channel',
        'media-query',
        'preferred-dark',
        'preferred-languages',
        'color-scheme',
        'favicon',
        'fullscreen',
        'share',
        'wake-lock',
        'eye-dropper',
      ],
      sensors: [
        'mouse',
        'keyboard',
        'scroll',
        'resize',
        'intersection-observer',
        'mutation-observer',
        'element-size',
        'element-visibility',
        'window-size',
        'device-motion',
        'device-orientation',
        'geolocation',
        'idle',
        'network',
        'online',
        'battery',
        'memory',
      ],
      state: [
        'storage',
        'local-storage',
        'session-storage',
        'async-state',
        'debounced-ref',
        'throttled-ref',
      ],
      elements: ['draggable', 'drop-zone', 'element-bounding', 'element-hover', 'active-element'],
      utilities: [
        'toggle',
        'counter',
        'cycle-list',
        'timeout',
        'interval',
        'timestamp',
        'date-format',
      ],
    };

    let category = 'core';
    for (const [cat, patterns] of Object.entries(categories)) {
      if (patterns.some((p) => kebabCase.includes(p))) {
        category = cat;
        break;
      }
    }

    const url = `https://vueuse.org/core/${composable}/`;

    try {
      const result = await this.parser.extractContent(url);
      let response = `# VueUse: ${composable}\n\n`;
      response += `Source: ${result.url}\n\n`;
      response += result.content;

      if (result.truncated) {
        response += '\n\n[Content truncated - visit URL for full documentation]';
      }

      return response;
    } catch {
      // Try with different URL patterns
      const altUrls = [
        `https://vueuse.org/${category}/${composable}/`,
        `https://vueuse.org/shared/${composable}/`,
      ];

      for (const altUrl of altUrls) {
        try {
          const result = await this.parser.extractContent(altUrl);
          let response = `# VueUse: ${composable}\n\n`;
          response += `Source: ${result.url}\n\n`;
          response += result.content;

          if (result.truncated) {
            response += '\n\n[Content truncated - visit URL for full documentation]';
          }

          return response;
        } catch {
          continue;
        }
      }

      return `Composable "${composable}" not found in VueUse documentation. Try:\n- Checking the composable name spelling\n- Using the correct case (e.g., "useStorage" not "usestorage")\n- Browsing functions at https://vueuse.org/functions\n\nPopular composables: useStorage, useFetch, useDark, useToggle, useMediaQuery, useIntersectionObserver, useEventListener, useClipboard, useDebounce, useThrottle`;
    }
  }

  private async checkPinia(topic: string): Promise<string> {
    const url = `https://pinia.vuejs.org/${topic}.html`;

    try {
      const result = await this.parser.extractContent(url);
      let response = `# Pinia: ${topic}\n\n`;
      response += `Source: ${result.url}\n\n`;
      response += result.content;

      if (result.truncated) {
        response += '\n\n[Content truncated - visit URL for full documentation]';
      }

      return response;
    } catch {
      // Try without .html extension
      try {
        const altUrl = `https://pinia.vuejs.org/${topic}`;
        const result = await this.parser.extractContent(altUrl);
        let response = `# Pinia: ${topic}\n\n`;
        response += `Source: ${result.url}\n\n`;
        response += result.content;

        if (result.truncated) {
          response += '\n\n[Content truncated - visit URL for full documentation]';
        }

        return response;
      } catch {
        return `Topic "${topic}" not found in Pinia documentation. Try:\n- getting-started\n- core-concepts/state\n- core-concepts/getters\n- core-concepts/actions\n- core-concepts/plugins\n- ssr/nuxt\n\nFull docs: https://pinia.vuejs.org`;
      }
    }
  }

  private async checkNuxtSeo(module: string, topic?: string): Promise<string> {
    const seoModules: Record<string, string> = {
      robots: 'robots',
      sitemap: 'sitemap',
      'og-image': 'og-image',
      ogimage: 'og-image',
      'schema-org': 'schema-org',
      schemaorg: 'schema-org',
      'link-checker': 'link-checker',
      linkchecker: 'link-checker',
      'site-config': 'site-config',
      siteconfig: 'site-config',
    };

    const resolvedModule = seoModules[module.toLowerCase()] || module.toLowerCase();
    let url = `https://nuxtseo.com/${resolvedModule}`;

    if (topic) {
      url = `${url}/${topic}`;
    }

    try {
      const result = await this.parser.extractContent(url);
      let response = `# Nuxt SEO - ${module}\n\n`;
      response += `Source: ${result.url}\n\n`;
      response += result.content;

      if (result.truncated) {
        response += '\n\n[Content truncated - visit URL for full documentation]';
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return `Topic not found in Nuxt SEO documentation. Available modules:\n- robots - Robots.txt generation\n- sitemap - XML sitemap generation\n- og-image - Dynamic OG image generation\n- schema-org - Schema.org structured data\n- link-checker - Check for broken links\n- site-config - Site configuration\n\nFull docs: https://nuxtseo.com`;
      }
      throw error;
    }
  }
}
