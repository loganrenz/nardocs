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
 * Registry of supported Nuxt modules - COMPREHENSIVE LIST
 */
const NUXT_MODULES: Record<string, NuxtModuleConfig> = {
  // ============================================
  // OFFICIAL @nuxt/* MODULES
  // ============================================
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
  ui: {
    packages: ['@nuxt/ui', 'nuxt-ui'],
    docsUrl: 'https://ui.nuxt.com',
    name: 'Nuxt UI',
    description: 'Beautiful and accessible UI components built with Tailwind CSS',
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
  devtools: {
    packages: ['@nuxt/devtools'],
    docsUrl: 'https://devtools.nuxt.com',
    name: 'Nuxt DevTools',
    description: 'Developer tools for Nuxt with visual debugging',
  },

  // ============================================
  // OFFICIAL @nuxtjs/* MODULES
  // ============================================
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
  tailwindcss: {
    packages: ['@nuxtjs/tailwindcss'],
    docsUrl: 'https://tailwindcss.nuxtjs.org',
    name: 'Nuxt Tailwind CSS',
    description: 'Tailwind CSS integration with PurgeCSS for Nuxt',
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
  seo: {
    packages: ['@nuxtjs/seo', 'nuxt-seo-kit'],
    docsUrl: 'https://nuxtseo.com',
    name: 'Nuxt SEO',
    description: 'Complete SEO toolkit for Nuxt',
  },
  googleFonts: {
    packages: ['@nuxtjs/google-fonts'],
    docsUrl: 'https://google-fonts.nuxtjs.org',
    name: 'Nuxt Google Fonts',
    description: 'Google Fonts integration with performance optimization',
  },
  pwa: {
    packages: ['@vite-pwa/nuxt', '@nuxtjs/pwa'],
    docsUrl: 'https://vite-pwa-org.netlify.app/frameworks/nuxt',
    name: 'Nuxt PWA',
    description: 'Progressive Web App support for Nuxt',
  },
  partytown: {
    packages: ['@nuxtjs/partytown'],
    docsUrl: 'https://partytown.builder.io',
    name: 'Nuxt Partytown',
    description: 'Relocate resource intensive scripts into web workers',
  },
  fontaine: {
    packages: ['@nuxtjs/fontaine'],
    docsUrl: 'https://nuxt.com/modules/fontaine',
    name: 'Nuxt Fontaine',
    description: 'Automatic font fallback based on font metrics',
  },
  critters: {
    packages: ['@nuxtjs/critters'],
    docsUrl: 'https://nuxt.com/modules/critters',
    name: 'Nuxt Critters',
    description: 'Critical CSS inlining for faster page loads',
  },
  html: {
    packages: ['@nuxtjs/html-validator'],
    docsUrl: 'https://html-validator.nuxtjs.org',
    name: 'Nuxt HTML Validator',
    description: 'HTML validation for Nuxt applications',
  },
  web3: {
    packages: ['@nuxtjs/web3'],
    docsUrl: 'https://nuxt.com/modules/web3',
    name: 'Nuxt Web3',
    description: 'Web3 and blockchain integration for Nuxt',
  },
  apollo: {
    packages: ['@nuxtjs/apollo'],
    docsUrl: 'https://apollo.nuxtjs.org',
    name: 'Nuxt Apollo',
    description: 'Apollo GraphQL client integration for Nuxt',
  },
  graphql: {
    packages: ['nuxt-graphql-client', '@nuxtjs/apollo'],
    docsUrl: 'https://nuxt-graphql-client.web.app',
    name: 'Nuxt GraphQL Client',
    description: 'GraphQL client with code generation for Nuxt',
  },

  // ============================================
  // AUTHENTICATION MODULES
  // ============================================
  auth: {
    packages: ['nuxt-auth-utils', '@sidebase/nuxt-auth', '@auth/nuxt'],
    docsUrl: 'https://nuxt.com/modules/auth-utils',
    name: 'Nuxt Auth Utils',
    description: 'Authentication utilities for Nuxt',
  },
  clerk: {
    packages: ['vue-clerk', '@clerk/nuxt'],
    docsUrl: 'https://clerk.com/docs/quickstarts/nuxt',
    name: 'Clerk Nuxt',
    description: 'Complete user management and authentication with Clerk',
  },
  kinde: {
    packages: ['@nuxtjs/kinde'],
    docsUrl: 'https://kinde.com/docs/developer-tools/nuxt-module',
    name: 'Kinde Nuxt',
    description: 'Kinde authentication for Nuxt',
  },
  logto: {
    packages: ['@logto/nuxt'],
    docsUrl: 'https://docs.logto.io/quick-starts/nuxt',
    name: 'Logto Nuxt',
    description: 'Logto authentication module for Nuxt',
  },
  auth0: {
    packages: ['@auth0/auth0-vue'],
    docsUrl: 'https://auth0.com/docs/quickstart/spa/vuejs',
    name: 'Auth0 Vue',
    description: 'Auth0 authentication for Vue/Nuxt applications',
  },
  hanko: {
    packages: ['@anthropics/nuxt-hanko', 'nuxt-hanko'],
    docsUrl: 'https://www.hanko.io/docs/guides/nuxt',
    name: 'Hanko Nuxt',
    description: 'Passkey authentication with Hanko',
  },
  lucia: {
    packages: ['lucia', 'lucia-auth'],
    docsUrl: 'https://lucia-auth.com',
    name: 'Lucia Auth',
    description: 'Simple and flexible authentication library',
  },
  sidebaseAuth: {
    packages: ['@sidebase/nuxt-auth'],
    docsUrl: 'https://sidebase.io/nuxt-auth',
    name: 'Sidebase Auth',
    description: 'Authentication module with NextAuth.js support',
  },

  // ============================================
  // DATABASE & BACKEND MODULES
  // ============================================
  supabase: {
    packages: ['@nuxtjs/supabase'],
    docsUrl: 'https://supabase.nuxtjs.org',
    name: 'Nuxt Supabase',
    description: 'Supabase integration for Nuxt',
  },
  prisma: {
    packages: ['@prisma/nuxt', '@prisma/client'],
    docsUrl:
      'https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nuxt-prisma-module',
    name: 'Prisma Nuxt',
    description: 'Prisma ORM integration for Nuxt',
  },
  drizzle: {
    packages: ['drizzle-orm', 'nuxt-drizzle'],
    docsUrl: 'https://orm.drizzle.team',
    name: 'Drizzle ORM',
    description: 'TypeScript ORM with SQL-like syntax',
  },
  firebase: {
    packages: ['nuxt-vuefire', 'vuefire'],
    docsUrl: 'https://vuefire.vuejs.org/nuxt/getting-started.html',
    name: 'VueFire Nuxt',
    description: 'Firebase integration for Nuxt with VueFire',
  },
  mongoose: {
    packages: ['nuxt-mongoose'],
    docsUrl: 'https://nuxt.com/modules/nuxt-mongoose',
    name: 'Nuxt Mongoose',
    description: 'MongoDB integration with Mongoose for Nuxt',
  },
  hub: {
    packages: ['@nuxthub/core', 'nuxthub'],
    docsUrl: 'https://hub.nuxt.com/docs',
    name: 'NuxtHub',
    description: 'Full-stack Nuxt hosting and deployment platform with D1, KV, R2',
  },
  turso: {
    packages: ['@nuxt/turso', 'nuxt-turso'],
    docsUrl: 'https://nuxt.com/modules/turso',
    name: 'Nuxt Turso',
    description: 'Turso (LibSQL) database integration for Nuxt',
  },
  planetscale: {
    packages: ['@planetscale/database'],
    docsUrl: 'https://planetscale.com/docs',
    name: 'PlanetScale',
    description: 'PlanetScale serverless MySQL database',
  },
  neon: {
    packages: ['@neondatabase/serverless'],
    docsUrl: 'https://neon.tech/docs',
    name: 'Neon Database',
    description: 'Neon serverless Postgres database',
  },

  // ============================================
  // CMS INTEGRATIONS
  // ============================================
  strapi: {
    packages: ['@nuxtjs/strapi'],
    docsUrl: 'https://strapi.nuxtjs.org',
    name: 'Nuxt Strapi',
    description: 'Strapi headless CMS integration for Nuxt',
  },
  sanity: {
    packages: ['@nuxtjs/sanity'],
    docsUrl: 'https://sanity.nuxtjs.org',
    name: 'Nuxt Sanity',
    description: 'Sanity.io headless CMS integration for Nuxt',
  },
  storyblok: {
    packages: ['@storyblok/nuxt'],
    docsUrl: 'https://github.com/storyblok/storyblok-nuxt',
    name: 'Storyblok Nuxt',
    description: 'Storyblok headless CMS integration for Nuxt',
  },
  directus: {
    packages: ['nuxt-directus'],
    docsUrl: 'https://nuxt.com/modules/directus',
    name: 'Nuxt Directus',
    description: 'Directus headless CMS integration for Nuxt',
  },
  contentful: {
    packages: ['contentful'],
    docsUrl: 'https://www.contentful.com/developers/docs/javascript/',
    name: 'Contentful',
    description: 'Contentful headless CMS for Nuxt',
  },
  prismic: {
    packages: ['@nuxtjs/prismic'],
    docsUrl: 'https://prismic.nuxtjs.org',
    name: 'Nuxt Prismic',
    description: 'Prismic headless CMS integration for Nuxt',
  },
  wordpress: {
    packages: ['nuxt-wp', '@nuxtjs/wordpress'],
    docsUrl: 'https://nuxt.com/modules/wp-nuxt',
    name: 'Nuxt WordPress',
    description: 'WordPress REST API integration for Nuxt',
  },
  payload: {
    packages: ['payload', '@payloadcms/nuxt'],
    docsUrl: 'https://payloadcms.com/docs',
    name: 'Payload CMS',
    description: 'Payload headless CMS integration',
  },
  keystatic: {
    packages: ['@keystatic/core', '@keystatic/nuxt'],
    docsUrl: 'https://keystatic.com/docs',
    name: 'Keystatic',
    description: 'Git-based CMS for Nuxt',
  },
  tina: {
    packages: ['tinacms', '@tinacms/cli'],
    docsUrl: 'https://tina.io/docs',
    name: 'TinaCMS',
    description: 'Git-backed headless CMS',
  },

  // ============================================
  // ANALYTICS & MONITORING
  // ============================================
  plausible: {
    packages: ['@nuxtjs/plausible', 'vue-plausible'],
    docsUrl: 'https://nuxt.com/modules/plausible',
    name: 'Nuxt Plausible',
    description: 'Plausible Analytics integration (privacy-friendly)',
  },
  gtag: {
    packages: ['nuxt-gtag', '@nuxtjs/google-analytics'],
    docsUrl: 'https://nuxt.com/modules/gtag',
    name: 'Nuxt Google Analytics',
    description: 'Google Analytics 4 integration for Nuxt',
  },
  posthog: {
    packages: ['nuxt-posthog', 'posthog-js'],
    docsUrl: 'https://posthog.com/docs/libraries/nuxt-js',
    name: 'PostHog Nuxt',
    description: 'PostHog product analytics for Nuxt',
  },
  sentry: {
    packages: ['@sentry/nuxt', '@nuxtjs/sentry'],
    docsUrl: 'https://docs.sentry.io/platforms/javascript/guides/nuxt/',
    name: 'Sentry Nuxt',
    description: 'Sentry error tracking and performance monitoring',
  },
  clarity: {
    packages: ['nuxt-clarity-analytics'],
    docsUrl: 'https://nuxt.com/modules/clarity-analytics',
    name: 'Microsoft Clarity',
    description: 'Microsoft Clarity analytics for Nuxt',
  },
  umami: {
    packages: ['nuxt-umami'],
    docsUrl: 'https://nuxt.com/modules/umami',
    name: 'Umami Analytics',
    description: 'Umami self-hosted analytics for Nuxt',
  },
  fathom: {
    packages: ['nuxt-fathom', '@funken-studio/nuxt-fathom'],
    docsUrl: 'https://nuxt.com/modules/fathom',
    name: 'Fathom Analytics',
    description: 'Privacy-focused Fathom analytics',
  },
  mixpanel: {
    packages: ['nuxt-mixpanel'],
    docsUrl: 'https://nuxt.com/modules/mixpanel',
    name: 'Mixpanel Nuxt',
    description: 'Mixpanel product analytics',
  },
  segment: {
    packages: ['nuxt-segment', '@segment/analytics-next'],
    docsUrl: 'https://segment.com/docs',
    name: 'Segment Analytics',
    description: 'Segment customer data platform',
  },
  hotjar: {
    packages: ['nuxt-hotjar'],
    docsUrl: 'https://nuxt.com/modules/hotjar',
    name: 'Hotjar',
    description: 'Hotjar heatmaps and session recordings',
  },

  // ============================================
  // PAYMENT & E-COMMERCE
  // ============================================
  stripe: {
    packages: ['@unlok-co/nuxt-stripe', 'nuxt-stripe'],
    docsUrl: 'https://nuxt.com/modules/stripe',
    name: 'Nuxt Stripe',
    description: 'Stripe payment integration for Nuxt',
  },
  lemonSqueezy: {
    packages: ['@lemonsqueezy/wedges-vue', 'nuxt-lemonsqueezy'],
    docsUrl: 'https://docs.lemonsqueezy.com',
    name: 'LemonSqueezy',
    description: 'LemonSqueezy payment platform integration',
  },
  shopify: {
    packages: ['@shopify/hydrogen-vue', 'nuxt-shopify'],
    docsUrl: 'https://nuxt.com/modules/shopify',
    name: 'Nuxt Shopify',
    description: 'Shopify Storefront API integration',
  },
  medusa: {
    packages: ['nuxt-medusa', '@medusajs/medusa-js'],
    docsUrl: 'https://nuxt.com/modules/medusa',
    name: 'Nuxt Medusa',
    description: 'Medusa e-commerce integration',
  },
  snipcart: {
    packages: ['@nuxtjs/snipcart'],
    docsUrl: 'https://nuxt.com/modules/snipcart',
    name: 'Snipcart',
    description: 'Snipcart shopping cart integration',
  },
  paddle: {
    packages: ['nuxt-paddle', '@paddle/paddle-js'],
    docsUrl: 'https://developer.paddle.com',
    name: 'Paddle',
    description: 'Paddle payments and subscriptions',
  },

  // ============================================
  // STATE MANAGEMENT
  // ============================================
  pinia: {
    packages: ['@pinia/nuxt', 'pinia'],
    docsUrl: 'https://pinia.vuejs.org/ssr/nuxt.html',
    name: 'Pinia (Nuxt)',
    description: 'The intuitive store for Vue.js with Nuxt integration',
  },
  piniaPersistedstate: {
    packages: ['pinia-plugin-persistedstate', '@pinia-plugin-persistedstate/nuxt'],
    docsUrl: 'https://prazdevs.github.io/pinia-plugin-persistedstate/frameworks/nuxt-3.html',
    name: 'Pinia Persisted State',
    description: 'Persist Pinia stores across sessions',
  },
  vueuse: {
    packages: ['@vueuse/nuxt', '@vueuse/core'],
    docsUrl: 'https://vueuse.org',
    name: 'VueUse',
    description: 'Collection of essential Vue Composition Utilities',
  },

  // ============================================
  // UI COMPONENT LIBRARIES
  // ============================================
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
  vuetify: {
    packages: ['vuetify-nuxt-module', 'vuetify'],
    docsUrl: 'https://vuetifyjs.com/en/getting-started/installation/#nuxt-install',
    name: 'Vuetify Nuxt',
    description: 'Material Design component framework for Nuxt',
  },
  quasar: {
    packages: ['nuxt-quasar-ui', 'quasar'],
    docsUrl: 'https://quasar.dev',
    name: 'Quasar Nuxt',
    description: 'Quasar Framework UI components',
  },
  element: {
    packages: ['@element-plus/nuxt', 'element-plus'],
    docsUrl: 'https://element-plus.org/en-US/guide/quickstart.html#nuxt',
    name: 'Element Plus Nuxt',
    description: 'Element Plus UI components for Nuxt',
  },
  naive: {
    packages: ['@bg-dev/nuxt-naiveui', 'naive-ui'],
    docsUrl: 'https://www.naiveui.com',
    name: 'Naive UI Nuxt',
    description: 'Naive UI components for Nuxt',
  },
  antDesign: {
    packages: ['@ant-design-vue/nuxt', 'ant-design-vue'],
    docsUrl: 'https://antdv.com/docs/vue/introduce',
    name: 'Ant Design Vue Nuxt',
    description: 'Ant Design UI components for Nuxt',
  },
  headlessui: {
    packages: ['@headlessui/vue', 'nuxt-headlessui'],
    docsUrl: 'https://headlessui.com',
    name: 'Headless UI',
    description: 'Unstyled, accessible UI components',
  },
  radix: {
    packages: ['radix-vue'],
    docsUrl: 'https://www.radix-vue.com',
    name: 'Radix Vue',
    description: 'Unstyled, accessible components for Vue',
  },
  anu: {
    packages: ['anu-vue', '@anu-vue/nuxt'],
    docsUrl: 'https://anu-vue.netlify.app',
    name: 'Anu Vue',
    description: 'DX focused utility based Vue component library',
  },
  daisyui: {
    packages: ['daisyui'],
    docsUrl: 'https://daisyui.com',
    name: 'DaisyUI',
    description: 'Tailwind CSS component library',
  },
  flowbite: {
    packages: ['flowbite', 'flowbite-vue'],
    docsUrl: 'https://flowbite.com/docs/getting-started/nuxt-js/',
    name: 'Flowbite Vue',
    description: 'Tailwind CSS components built with Flowbite',
  },

  // ============================================
  // SEO & PERFORMANCE
  // ============================================
  ogImage: {
    packages: ['nuxt-og-image'],
    docsUrl: 'https://nuxtseo.com/og-image',
    name: 'Nuxt OG Image',
    description: 'Generate dynamic Open Graph images for Nuxt',
  },
  schemaOrg: {
    packages: ['nuxt-schema-org'],
    docsUrl: 'https://nuxtseo.com/schema-org',
    name: 'Nuxt Schema.org',
    description: 'Schema.org structured data for Nuxt',
  },
  linkChecker: {
    packages: ['nuxt-link-checker'],
    docsUrl: 'https://nuxtseo.com/link-checker',
    name: 'Nuxt Link Checker',
    description: 'Find and fix broken links in Nuxt',
  },
  siteConfig: {
    packages: ['nuxt-site-config'],
    docsUrl: 'https://nuxtseo.com/site-config',
    name: 'Nuxt Site Config',
    description: 'Site configuration management for Nuxt',
  },
  security: {
    packages: ['nuxt-security'],
    docsUrl: 'https://nuxt-security.vercel.app',
    name: 'Nuxt Security',
    description: 'Security module for Nuxt with OWASP best practices',
  },
  delay: {
    packages: ['nuxt-delay-hydration'],
    docsUrl: 'https://nuxt.com/modules/delay-hydration',
    name: 'Nuxt Delay Hydration',
    description: 'Delay hydration for better performance scores',
  },
  speedkit: {
    packages: ['nuxt-speedkit'],
    docsUrl: 'https://nuxt.com/modules/speedkit',
    name: 'Nuxt Speedkit',
    description: 'Performance optimization toolkit',
  },

  // ============================================
  // ANIMATION & MOTION
  // ============================================
  motion: {
    packages: ['@vueuse/motion'],
    docsUrl: 'https://motion.vueuse.org',
    name: 'VueUse Motion',
    description: 'Animation library for Vue with composables',
  },
  gsap: {
    packages: ['@gsap/nuxt', 'gsap'],
    docsUrl: 'https://gsap.com/docs/v3/',
    name: 'GSAP Nuxt',
    description: 'GreenSock Animation Platform for Nuxt',
  },
  lottie: {
    packages: ['vue3-lottie', 'nuxt-lottie'],
    docsUrl: 'https://nuxt.com/modules/lottie',
    name: 'Nuxt Lottie',
    description: 'Lottie animations for Nuxt',
  },
  aos: {
    packages: ['nuxt-aos', 'aos'],
    docsUrl: 'https://nuxt.com/modules/aos',
    name: 'Nuxt AOS',
    description: 'Animate On Scroll library for Nuxt',
  },

  // ============================================
  // FORMS & VALIDATION
  // ============================================
  veeValidate: {
    packages: ['vee-validate', '@vee-validate/nuxt'],
    docsUrl: 'https://vee-validate.logaretm.com/v4/',
    name: 'VeeValidate',
    description: 'Form validation for Vue with Nuxt integration',
  },
  formkit: {
    packages: ['@formkit/nuxt', '@formkit/vue'],
    docsUrl: 'https://formkit.com/getting-started/installation#nuxt',
    name: 'FormKit',
    description: 'Form building framework for Vue/Nuxt',
  },
  zod: {
    packages: ['zod', '@vee-validate/zod'],
    docsUrl: 'https://zod.dev',
    name: 'Zod',
    description: 'TypeScript-first schema validation',
  },

  // ============================================
  // UTILITIES & MISC
  // ============================================
  dayjs: {
    packages: ['dayjs-nuxt', 'dayjs'],
    docsUrl: 'https://nuxt.com/modules/dayjs',
    name: 'Nuxt Day.js',
    description: 'Day.js date library integration',
  },
  lodash: {
    packages: ['nuxt-lodash'],
    docsUrl: 'https://nuxt.com/modules/lodash',
    name: 'Nuxt Lodash',
    description: 'Lodash utility library integration',
  },
  time: {
    packages: ['@nuxtjs/date-fns', 'date-fns'],
    docsUrl: 'https://date-fns.org',
    name: 'Date-fns',
    description: 'Modern JavaScript date utility library',
  },
  markdown: {
    packages: ['nuxt-markdown', '@nuxtjs/markdownit'],
    docsUrl: 'https://nuxt.com/modules/mdc',
    name: 'Nuxt Markdown',
    description: 'Markdown rendering for Nuxt',
  },
  mdc: {
    packages: ['@nuxtjs/mdc'],
    docsUrl: 'https://nuxt.com/modules/mdc',
    name: 'Nuxt MDC',
    description: 'Markdown Components for Nuxt',
  },
  svgo: {
    packages: ['nuxt-svgo'],
    docsUrl: 'https://nuxt.com/modules/svgo',
    name: 'Nuxt SVGO',
    description: 'SVG optimization and component usage',
  },
  pdf: {
    packages: ['@pdfme/nuxt', 'vue-pdf-embed'],
    docsUrl: 'https://nuxt.com/modules/pdfme',
    name: 'Nuxt PDF',
    description: 'PDF generation and rendering',
  },
  qrcode: {
    packages: ['nuxt-qrcode'],
    docsUrl: 'https://nuxt.com/modules/qrcode',
    name: 'Nuxt QR Code',
    description: 'QR code generation for Nuxt',
  },
  turnstile: {
    packages: ['@nuxtjs/turnstile', 'nuxt-turnstile'],
    docsUrl: 'https://nuxt.com/modules/turnstile',
    name: 'Nuxt Turnstile',
    description: 'Cloudflare Turnstile CAPTCHA integration',
  },
  recaptcha: {
    packages: ['@nuxtjs/recaptcha', 'nuxt-recaptcha'],
    docsUrl: 'https://nuxt.com/modules/recaptcha',
    name: 'Nuxt reCAPTCHA',
    description: 'Google reCAPTCHA integration',
  },

  // ============================================
  // EMAIL & NOTIFICATIONS
  // ============================================
  resend: {
    packages: ['nuxt-resend', 'resend'],
    docsUrl: 'https://resend.com/docs',
    name: 'Resend',
    description: 'Email API for developers',
  },
  nodemailer: {
    packages: ['nodemailer', 'nuxt-nodemailer'],
    docsUrl: 'https://nodemailer.com',
    name: 'Nodemailer',
    description: 'Email sending with Nodemailer',
  },
  vueEmail: {
    packages: ['vue-email', '@vue-email/nuxt'],
    docsUrl: 'https://vuemail.net',
    name: 'Vue Email',
    description: 'Build emails with Vue components',
  },
  pusher: {
    packages: ['nuxt-pusher', 'pusher-js'],
    docsUrl: 'https://pusher.com/docs',
    name: 'Pusher',
    description: 'Real-time notifications with Pusher',
  },

  // ============================================
  // MAPS & LOCATION
  // ============================================
  leaflet: {
    packages: ['@nuxtjs/leaflet', 'nuxt-leaflet'],
    docsUrl: 'https://nuxt.com/modules/leaflet',
    name: 'Nuxt Leaflet',
    description: 'Leaflet maps integration for Nuxt',
  },
  mapbox: {
    packages: ['nuxt-mapbox', 'mapbox-gl'],
    docsUrl: 'https://nuxt.com/modules/mapbox',
    name: 'Nuxt Mapbox',
    description: 'Mapbox GL maps for Nuxt',
  },
  googleMaps: {
    packages: ['@nuxtjs/google-maps', 'nuxt-google-maps'],
    docsUrl: 'https://nuxt.com/modules/google-maps',
    name: 'Nuxt Google Maps',
    description: 'Google Maps integration for Nuxt',
  },

  // ============================================
  // MEDIA & FILES
  // ============================================
  cloudinary: {
    packages: ['@nuxtjs/cloudinary', 'nuxt-cloudinary'],
    docsUrl: 'https://cloudinary.nuxtjs.org',
    name: 'Nuxt Cloudinary',
    description: 'Cloudinary media management for Nuxt',
  },
  uploadthing: {
    packages: ['nuxt-uploadthing', 'uploadthing'],
    docsUrl: 'https://docs.uploadthing.com',
    name: 'UploadThing',
    description: 'File uploads made easy',
  },
  mux: {
    packages: ['nuxt-mux', '@mux/mux-player'],
    docsUrl: 'https://nuxt.com/modules/mux',
    name: 'Nuxt Mux',
    description: 'Mux video streaming for Nuxt',
  },

  // ============================================
  // TESTING
  // ============================================
  vitest: {
    packages: ['@nuxt/test-utils', 'vitest'],
    docsUrl: 'https://nuxt.com/docs/getting-started/testing',
    name: 'Nuxt Vitest',
    description: 'Vitest testing for Nuxt',
  },
  storybook: {
    packages: ['@nuxtjs/storybook', '@storybook/vue3'],
    docsUrl: 'https://storybook.nuxtjs.org',
    name: 'Nuxt Storybook',
    description: 'Storybook integration for Nuxt',
  },
  histoire: {
    packages: ['@histoire/plugin-nuxt', 'histoire'],
    docsUrl: 'https://histoire.dev',
    name: 'Histoire',
    description: 'Story-driven component development',
  },

  // ============================================
  // DEPLOYMENT & HOSTING
  // ============================================
  vercel: {
    packages: ['@vercel/analytics', 'nuxt-vercel-analytics'],
    docsUrl: 'https://vercel.com/docs/frameworks/nuxt',
    name: 'Vercel',
    description: 'Vercel deployment and analytics',
  },
  netlify: {
    packages: ['@netlify/functions', 'nuxt-netlify'],
    docsUrl: 'https://docs.netlify.com/frameworks/nuxt/',
    name: 'Netlify',
    description: 'Netlify deployment integration',
  },
  cloudflare: {
    packages: ['wrangler', 'nitro-cloudflare-dev'],
    docsUrl: 'https://developers.cloudflare.com/pages/framework-guides/nuxt/',
    name: 'Cloudflare Pages',
    description: 'Cloudflare Pages deployment',
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
          'Fetch documentation for any Nuxt module. Supports 100+ modules including official @nuxt/* modules, @nuxtjs/* modules, UI libraries, CMS integrations, authentication, databases, analytics, payments, and more.',
        inputSchema: {
          type: 'object',
          properties: {
            module: {
              type: 'string',
              description:
                'The module name. Examples: Official: "image", "content", "fonts", "icon", "scripts", "ui", "devtools", "eslint". Nuxtjs: "i18n", "color-mode", "tailwindcss", "pwa", "apollo". Auth: "auth", "clerk", "kinde", "auth0", "lucia". DB: "supabase", "prisma", "drizzle", "firebase", "mongoose". CMS: "strapi", "sanity", "storyblok", "directus", "prismic". Analytics: "plausible", "gtag", "posthog", "sentry". UI: "primevue", "shadcn", "vuetify", "quasar", "element", "naive", "headlessui". Payment: "stripe", "lemonsqueezy", "shopify". State: "pinia", "vueuse". SEO: "robots", "sitemap", "og-image", "schema-org". And many more!',
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
    const moduleKey = module.toLowerCase().replace(/-/g, '').replace(/_/g, '');
    const normalizedKeys: Record<string, string> = {
      // Official @nuxt/* modules
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
      ui: 'ui',
      nuxtui: 'ui',
      eslint: 'eslint',
      nuxteslint: 'eslint',
      testutils: 'testUtils',
      devtools: 'devtools',
      nuxtdevtools: 'devtools',

      // Official @nuxtjs/* modules
      i18n: 'i18n',
      nuxti18n: 'i18n',
      colormode: 'colorMode',
      tailwindcss: 'tailwindcss',
      tailwind: 'tailwindcss',
      device: 'device',
      robots: 'robots',
      sitemap: 'sitemap',
      seo: 'seo',
      googlefonts: 'googleFonts',
      pwa: 'pwa',
      partytown: 'partytown',
      fontaine: 'fontaine',
      critters: 'critters',
      htmlvalidator: 'html',
      web3: 'web3',
      apollo: 'apollo',
      graphql: 'graphql',
      graphqlclient: 'graphql',

      // Authentication
      auth: 'auth',
      nuxtauth: 'auth',
      authutils: 'auth',
      clerk: 'clerk',
      kinde: 'kinde',
      logto: 'logto',
      auth0: 'auth0',
      hanko: 'hanko',
      lucia: 'lucia',
      luciaauth: 'lucia',
      sidebaseauth: 'sidebaseAuth',

      // Database & Backend
      supabase: 'supabase',
      prisma: 'prisma',
      drizzle: 'drizzle',
      drizzleorm: 'drizzle',
      firebase: 'firebase',
      vuefire: 'firebase',
      mongoose: 'mongoose',
      mongodb: 'mongoose',
      hub: 'hub',
      nuxthub: 'hub',
      turso: 'turso',
      planetscale: 'planetscale',
      neon: 'neon',
      neondb: 'neon',

      // CMS
      strapi: 'strapi',
      sanity: 'sanity',
      storyblok: 'storyblok',
      directus: 'directus',
      contentful: 'contentful',
      prismic: 'prismic',
      wordpress: 'wordpress',
      wp: 'wordpress',
      payload: 'payload',
      payloadcms: 'payload',
      keystatic: 'keystatic',
      tina: 'tina',
      tinacms: 'tina',

      // Analytics
      plausible: 'plausible',
      gtag: 'gtag',
      googleanalytics: 'gtag',
      ga: 'gtag',
      posthog: 'posthog',
      sentry: 'sentry',
      clarity: 'clarity',
      umami: 'umami',
      fathom: 'fathom',
      mixpanel: 'mixpanel',
      segment: 'segment',
      hotjar: 'hotjar',

      // Payment
      stripe: 'stripe',
      lemonsqueezy: 'lemonSqueezy',
      shopify: 'shopify',
      medusa: 'medusa',
      snipcart: 'snipcart',
      paddle: 'paddle',

      // State Management
      pinia: 'pinia',
      piniapersistedstate: 'piniaPersistedstate',
      vueuse: 'vueuse',

      // UI Libraries
      primevue: 'primevue',
      shadcn: 'shadcn',
      shadcnvue: 'shadcn',
      vuetify: 'vuetify',
      quasar: 'quasar',
      element: 'element',
      elementplus: 'element',
      naive: 'naive',
      naiveui: 'naive',
      antdesign: 'antDesign',
      antdesignvue: 'antDesign',
      headlessui: 'headlessui',
      radix: 'radix',
      radixvue: 'radix',
      anu: 'anu',
      anuvue: 'anu',
      daisyui: 'daisyui',
      daisy: 'daisyui',
      flowbite: 'flowbite',

      // SEO & Performance
      ogimage: 'ogImage',
      schemaorg: 'schemaOrg',
      linkchecker: 'linkChecker',
      siteconfig: 'siteConfig',
      security: 'security',
      nuxtsecurity: 'security',
      delayhydration: 'delay',
      speedkit: 'speedkit',

      // Animation
      motion: 'motion',
      vuemotion: 'motion',
      gsap: 'gsap',
      lottie: 'lottie',
      aos: 'aos',

      // Forms
      veevalidate: 'veeValidate',
      formkit: 'formkit',
      zod: 'zod',

      // Utilities
      dayjs: 'dayjs',
      lodash: 'lodash',
      datefns: 'time',
      markdown: 'markdown',
      mdc: 'mdc',
      svgo: 'svgo',
      pdf: 'pdf',
      qrcode: 'qrcode',
      turnstile: 'turnstile',
      recaptcha: 'recaptcha',

      // Email
      resend: 'resend',
      nodemailer: 'nodemailer',
      vueemail: 'vueEmail',
      pusher: 'pusher',

      // Maps
      leaflet: 'leaflet',
      mapbox: 'mapbox',
      googlemaps: 'googleMaps',

      // Media
      cloudinary: 'cloudinary',
      uploadthing: 'uploadthing',
      mux: 'mux',

      // Testing
      vitest: 'vitest',
      storybook: 'storybook',
      histoire: 'histoire',

      // Deployment
      vercel: 'vercel',
      netlify: 'netlify',
      cloudflare: 'cloudflare',
      cloudflarepages: 'cloudflare',
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
