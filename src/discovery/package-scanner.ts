/**
 * Package Scanner - Discovers documentation URLs from npm registry metadata
 */

interface NpmPackageMetadata {
  name: string;
  version: string;
  description?: string;
  homepage?: string;
  repository?: { type?: string; url?: string } | string;
  bugs?: { url?: string } | string;
  keywords?: string[];
}

export interface DiscoveredPackage {
  name: string;
  version: string;
  description?: string;
  docsUrl: string | null;
  githubUrl: string | null;
  npmUrl: string;
  confidence: 'high' | 'medium' | 'low';
  keywords?: string[];
}

/**
 * Common documentation URL patterns for popular hosting platforms
 */
const DOCS_URL_PATTERNS = {
  // Documentation hosting platforms
  readthedocs: (pkg: string) => `https://${pkg}.readthedocs.io`,
  gitbook: (pkg: string) => `https://${pkg}.gitbook.io`,
  githubPages: (pkg: string, repo: string) => {
    const parts = repo.split('/');
    const org = parts[parts.length - 2];
    const name = parts[parts.length - 1];
    return `https://${org}.github.io/${name}`;
  },
  // Common doc path patterns
  docsSubdomain: (domain: string) => `https://docs.${domain}`,
  docPath: (url: string) => `${url}/docs`,
  documentationPath: (url: string) => `${url}/documentation`,
  guidePath: (url: string) => `${url}/guide`,
};

/**
 * Known documentation URL overrides for packages where auto-discovery might fail
 */
const KNOWN_DOCS_OVERRIDES: Record<string, string> = {
  // These are packages where the homepage might not be the docs
  lodash: 'https://lodash.com/docs',
  axios: 'https://axios-http.com/docs/intro',
  moment: 'https://momentjs.com/docs/',
  dayjs: 'https://day.js.org/docs/en/installation/installation',
  'date-fns': 'https://date-fns.org/docs/Getting-Started',
  zod: 'https://zod.dev',
  yup: 'https://github.com/jquense/yup#readme',
  joi: 'https://joi.dev/api/',
  express: 'https://expressjs.com/en/api.html',
  fastify: 'https://fastify.dev/docs/latest/',
  koa: 'https://koajs.com/',
  hono: 'https://hono.dev/docs/',
  elysia: 'https://elysiajs.com/introduction.html',
  trpc: 'https://trpc.io/docs',
  '@trpc/server': 'https://trpc.io/docs',
  '@trpc/client': 'https://trpc.io/docs',
  graphql: 'https://graphql.org/learn/',
  'apollo-server': 'https://www.apollographql.com/docs/apollo-server/',
  '@apollo/client': 'https://www.apollographql.com/docs/react/',
  urql: 'https://commerce.nearform.com/open-source/urql/docs/',
  swr: 'https://swr.vercel.app/docs/getting-started',
  '@tanstack/react-query': 'https://tanstack.com/query/latest/docs/react/overview',
  '@tanstack/vue-query': 'https://tanstack.com/query/latest/docs/vue/overview',
  zustand: 'https://docs.pmnd.rs/zustand/getting-started/introduction',
  jotai: 'https://jotai.org/docs/introduction',
  recoil: 'https://recoiljs.org/docs/introduction/getting-started',
  mobx: 'https://mobx.js.org/README.html',
  redux: 'https://redux.js.org/introduction/getting-started',
  '@reduxjs/toolkit': 'https://redux-toolkit.js.org/introduction/getting-started',
  immer: 'https://immerjs.github.io/immer/',
  ramda: 'https://ramdajs.com/docs/',
  rxjs: 'https://rxjs.dev/guide/overview',
  three: 'https://threejs.org/docs/',
  d3: 'https://d3js.org/getting-started',
  'chart.js': 'https://www.chartjs.org/docs/latest/',
  echarts: 'https://echarts.apache.org/en/option.html',
  'framer-motion': 'https://www.framer.com/motion/',
  'react-spring': 'https://www.react-spring.dev/docs/getting-started',
  gsap: 'https://gsap.com/docs/v3/',
  anime: 'https://animejs.com/documentation/',
  'socket.io': 'https://socket.io/docs/v4/',
  'socket.io-client': 'https://socket.io/docs/v4/client-api/',
  ws: 'https://github.com/websockets/ws#readme',
  mongoose: 'https://mongoosejs.com/docs/guide.html',
  sequelize: 'https://sequelize.org/docs/v6/',
  typeorm: 'https://typeorm.io/',
  knex: 'https://knexjs.org/guide/',
  'drizzle-orm': 'https://orm.drizzle.team/docs/overview',
  kysely: 'https://kysely.dev/docs/intro',
  '@supabase/supabase-js': 'https://supabase.com/docs/reference/javascript/introduction',
  firebase: 'https://firebase.google.com/docs',
  'aws-sdk': 'https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/',
  '@aws-sdk/client-s3': 'https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/',
  stripe: 'https://stripe.com/docs/api',
  'next-auth': 'https://next-auth.js.org/getting-started/introduction',
  passport: 'https://www.passportjs.org/docs/',
  jsonwebtoken: 'https://github.com/auth0/node-jsonwebtoken#readme',
  bcrypt: 'https://github.com/kelektiv/node.bcrypt.js#readme',
  helmet: 'https://helmetjs.github.io/',
  cors: 'https://github.com/expressjs/cors#readme',
  dotenv: 'https://github.com/motdotla/dotenv#readme',
  winston: 'https://github.com/winstonjs/winston#readme',
  pino: 'https://getpino.io/#/',
  jest: 'https://jestjs.io/docs/getting-started',
  vitest: 'https://vitest.dev/guide/',
  mocha: 'https://mochajs.org/',
  cypress: 'https://docs.cypress.io/guides/overview/why-cypress',
  playwright: 'https://playwright.dev/docs/intro',
  puppeteer: 'https://pptr.dev/',
  cheerio: 'https://cheerio.js.org/docs/intro',
  sharp: 'https://sharp.pixelplumbing.com/',
  jimp: 'https://jimp-dev.github.io/jimp/',
  'node-fetch': 'https://github.com/node-fetch/node-fetch#readme',
  got: 'https://github.com/sindresorhus/got#readme',
  ky: 'https://github.com/sindresorhus/ky#readme',
  'form-data': 'https://github.com/form-data/form-data#readme',
  multer: 'https://github.com/expressjs/multer#readme',
  formidable: 'https://github.com/node-formidable/formidable#readme',
  uuid: 'https://github.com/uuidjs/uuid#readme',
  nanoid: 'https://github.com/ai/nanoid#readme',
  slugify: 'https://github.com/simov/slugify#readme',
  marked: 'https://marked.js.org/',
  'markdown-it': 'https://markdown-it.github.io/',
  highlight: 'https://highlightjs.org/',
  prismjs: 'https://prismjs.com/',
  handlebars: 'https://handlebarsjs.com/guide/',
  ejs: 'https://ejs.co/',
  pug: 'https://pugjs.org/api/getting-started.html',
  sass: 'https://sass-lang.com/documentation/',
  less: 'https://lesscss.org/',
  postcss: 'https://postcss.org/docs/',
  autoprefixer: 'https://github.com/postcss/autoprefixer#readme',
  tailwindcss: 'https://tailwindcss.com/docs',
  'styled-components': 'https://styled-components.com/docs',
  emotion: 'https://emotion.sh/docs/introduction',
  '@emotion/react': 'https://emotion.sh/docs/introduction',
  'class-variance-authority': 'https://cva.style/docs',
  clsx: 'https://github.com/lukeed/clsx#readme',
  'tailwind-merge': 'https://github.com/dcastil/tailwind-merge#readme',
  // VueUse and related
  '@vueuse/core': 'https://vueuse.org',
  '@vueuse/components': 'https://vueuse.org/guide/components.html',
  '@vueuse/router': 'https://vueuse.org/router/README.html',
  '@vueuse/integrations': 'https://vueuse.org/integrations/README.html',
  '@vueuse/head': 'https://github.com/vueuse/head#readme',
  '@vueuse/motion': 'https://motion.vueuse.org/',
  // Nuxt ecosystem
  '@nuxtjs/color-mode': 'https://color-mode.nuxtjs.org/',
  '@nuxtjs/device': 'https://github.com/nuxt-modules/device#readme',
  '@nuxtjs/google-fonts': 'https://google-fonts.nuxtjs.org/',
  '@nuxtjs/i18n': 'https://i18n.nuxtjs.org/',
  '@nuxtjs/tailwindcss': 'https://tailwindcss.nuxtjs.org/',
  '@nuxtjs/supabase': 'https://supabase.nuxtjs.org/',
  '@pinia/nuxt': 'https://pinia.vuejs.org/ssr/nuxt.html',
  '@vite-pwa/nuxt': 'https://vite-pwa-org.netlify.app/frameworks/nuxt.html',
  // Vue ecosystem
  'vue-router': 'https://router.vuejs.org/',
  pinia: 'https://pinia.vuejs.org/',
  vuex: 'https://vuex.vuejs.org/',
  'vue-i18n': 'https://vue-i18n.intlify.dev/',
  '@intlify/vue-i18n': 'https://vue-i18n.intlify.dev/',
  // Testing libraries
  '@testing-library/vue': 'https://testing-library.com/docs/vue-testing-library/intro/',
  '@testing-library/react': 'https://testing-library.com/docs/react-testing-library/intro/',
  '@testing-library/user-event': 'https://testing-library.com/docs/user-event/intro',
  '@vue/test-utils': 'https://test-utils.vuejs.org/',
  // React ecosystem
  'react-router-dom': 'https://reactrouter.com/en/main',
  'react-hook-form': 'https://react-hook-form.com/get-started',
  formik: 'https://formik.org/docs/overview',
  // UI component libraries
  '@headlessui/vue': 'https://headlessui.com/v1/vue',
  '@headlessui/react': 'https://headlessui.com/v1/react',
  'radix-vue': 'https://www.radix-vue.com/',
  '@radix-ui/react-accordion': 'https://www.radix-ui.com/primitives/docs/components/accordion',
  'shadcn-vue': 'https://www.shadcn-vue.com/',
  // Animation libraries
  'vue-motion': 'https://motion.vueuse.org/',
  // Form validation
  'vee-validate': 'https://vee-validate.logaretm.com/v4/',
  // Date/time
  luxon: 'https://moment.github.io/luxon/',
  // Utilities
  'lodash-es': 'https://lodash.com/docs',
  'ts-pattern': 'https://github.com/gvergnaud/ts-pattern#readme',
  'type-fest': 'https://github.com/sindresorhus/type-fest#readme',
  // API clients
  ofetch: 'https://github.com/unjs/ofetch#readme',
};

/**
 * Scans npm packages to discover documentation URLs
 */
export class PackageScanner {
  private readonly npmRegistry = 'https://registry.npmjs.org';
  private cache = new Map<string, DiscoveredPackage>();

  /**
   * Fetch package metadata from npm registry
   */
  async getPackageMetadata(packageName: string): Promise<NpmPackageMetadata | null> {
    try {
      const fetch = (await import('node-fetch')).default;
      const encodedName = encodeURIComponent(packageName).replace('%40', '@');
      const response = await fetch(`${this.npmRegistry}/${encodedName}`);

      if (!response.ok) return null;

      const data = (await response.json()) as Record<string, unknown>;
      const distTags = data['dist-tags'] as Record<string, string> | undefined;
      const latest = distTags?.latest;
      const versions = data.versions as Record<string, NpmPackageMetadata> | undefined;
      const version = versions?.[latest || ''];

      return {
        name: packageName,
        version: latest || 'unknown',
        description: (version?.description || data.description) as string | undefined,
        homepage: (version?.homepage || data.homepage) as string | undefined,
        repository: version?.repository || (data.repository as NpmPackageMetadata['repository']),
        bugs: version?.bugs || (data.bugs as NpmPackageMetadata['bugs']),
        keywords: (version?.keywords || data.keywords) as string[] | undefined,
      };
    } catch {
      return null;
    }
  }

  /**
   * Extract GitHub URL from repository field
   */
  private extractGitHubUrl(repository: NpmPackageMetadata['repository']): string | null {
    if (!repository) return null;

    let url: string;
    if (typeof repository === 'string') {
      url = repository;
    } else if (repository.url) {
      url = repository.url;
    } else {
      return null;
    }

    // Clean up the URL
    url = url
      .replace(/^git\+/, '')
      .replace(/\.git$/, '')
      .replace(/^git:\/\//, 'https://')
      .replace(/^ssh:\/\/git@github\.com/, 'https://github.com')
      .replace(/^git@github\.com:/, 'https://github.com/');

    if (url.includes('github.com')) {
      return url;
    }

    return null;
  }

  /**
   * Try to find documentation based on package scope/organization
   */
  private async tryOrganizationDocs(
    packageName: string
  ): Promise<{ url: string; confidence: 'high' | 'medium' } | null> {
    // Extract scope from scoped packages (@org/package)
    const scopeMatch = packageName.match(/^@([^/]+)\//);
    if (!scopeMatch) return null;

    const org = scopeMatch[1];
    const pkgName = packageName.substring(org.length + 2); // Remove @org/

    // Known organization documentation patterns
    const orgPatterns: Record<string, (pkg: string) => string[]> = {
      vercel: (pkg) => {
        // Special case mappings for Vercel packages
        const specialCases: Record<string, string> = {
          og: 'og-image-generation',
          analytics: 'analytics',
          edge: 'functions/edge-functions',
          'edge-config': 'storage/edge-config',
        };

        const docPath = specialCases[pkg] || pkg;

        return [
          `https://vercel.com/docs/${docPath}`,
          `https://vercel.com/docs/functions/${docPath}`,
          `https://vercel.com/docs/${pkg}`,
        ];
      },
      aws: (pkg) => [
        `https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/${pkg}/`,
        `https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/${pkg}.html`,
      ],
      azure: (pkg) => [
        `https://docs.microsoft.com/en-us/javascript/api/${pkg}/`,
        `https://learn.microsoft.com/en-us/javascript/api/${pkg}/`,
      ],
      google: (pkg) => [
        `https://cloud.google.com/nodejs/docs/reference/${pkg}/latest`,
        `https://googleapis.dev/nodejs/${pkg}/latest/`,
      ],
      cloudflare: (pkg) => [
        `https://developers.cloudflare.com/${pkg}/`,
        `https://developers.cloudflare.com/workers/${pkg}/`,
      ],
    };

    const patterns = orgPatterns[org];
    if (!patterns) return null;

    const urlsToTry = patterns(pkgName);
    const fetch = (await import('node-fetch')).default;

    for (const url of urlsToTry) {
      try {
        const response = await fetch(url, {
          method: 'HEAD',
          redirect: 'follow',
          // @ts-expect-error - timeout is valid in node-fetch
          timeout: 3000,
        });

        if (response.ok) {
          console.error(`  🏢 Found docs via organization pattern: ${url}`);
          return { url, confidence: 'high' };
        }
      } catch {
        continue;
      }
    }

    return null;
  }

  /**
   * Try to find documentation by checking common URL patterns
   */
  private async tryCommonDocPatterns(
    packageName: string,
    homepage: string | undefined,
    githubUrl: string | null
  ): Promise<{ url: string; confidence: 'high' | 'medium' } | null> {
    const urlsToTry: Array<{ url: string; confidence: 'high' | 'medium' }> = [];

    // Extract domain from homepage
    if (homepage) {
      try {
        const url = new URL(homepage);
        const domain = url.hostname.replace(/^www\./, '');

        // Try docs subdomain
        urlsToTry.push({
          url: DOCS_URL_PATTERNS.docsSubdomain(domain),
          confidence: 'high',
        });

        // Try /docs path
        urlsToTry.push({
          url: DOCS_URL_PATTERNS.docPath(homepage.replace(/\/$/, '')),
          confidence: 'high',
        });

        // Try /documentation path
        urlsToTry.push({
          url: DOCS_URL_PATTERNS.documentationPath(homepage.replace(/\/$/, '')),
          confidence: 'medium',
        });

        // Try /guide path
        urlsToTry.push({
          url: DOCS_URL_PATTERNS.guidePath(homepage.replace(/\/$/, '')),
          confidence: 'medium',
        });
      } catch {
        // Invalid URL, skip
      }
    }

    // Try GitHub Pages if we have a GitHub URL
    if (githubUrl) {
      urlsToTry.push({
        url: DOCS_URL_PATTERNS.githubPages(packageName, githubUrl),
        confidence: 'medium',
      });
    }

    // Try ReadTheDocs
    const cleanName = packageName.replace('@', '').replace('/', '-');
    urlsToTry.push({
      url: DOCS_URL_PATTERNS.readthedocs(cleanName),
      confidence: 'medium',
    });

    // Check each URL to see if it exists
    const fetch = (await import('node-fetch')).default;
    for (const { url, confidence } of urlsToTry) {
      try {
        const response = await fetch(url, {
          method: 'HEAD',
          redirect: 'follow',
          // @ts-expect-error - timeout is valid in node-fetch
          timeout: 3000,
        });

        if (response.ok) {
          return { url, confidence };
        }
      } catch {
        // URL doesn't exist or timed out, continue
        continue;
      }
    }

    return null;
  }

  /**
   * Analyze homepage content to find documentation links
   */
  private async analyzeHomepageForDocs(homepage: string): Promise<string | null> {
    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(homepage, {
        // @ts-expect-error - timeout is valid in node-fetch
        timeout: 5000,
        headers: {
          'User-Agent': 'mcp-project-docs/1.0',
        },
      });

      if (!response.ok) return null;

      const html = await response.text();

      // Look for common documentation link patterns in HTML
      const docPatterns = [
        /href=["']([^"']*(?:docs|documentation|guide|api-reference)[^"']*)["']/gi,
        /href=["'](https?:\/\/docs\.[^"']+)["']/gi,
        /<a[^>]*href=["']([^"']*\/docs[^"']*)["']/gi,
      ];

      for (const pattern of docPatterns) {
        const matches = html.matchAll(pattern);
        for (const match of matches) {
          let docUrl = match[1];

          // Convert relative URLs to absolute
          if (docUrl.startsWith('/')) {
            const baseUrl = new URL(homepage);
            docUrl = `${baseUrl.protocol}//${baseUrl.host}${docUrl}`;
          } else if (!docUrl.startsWith('http')) {
            continue;
          }

          // Verify it's a valid URL and not a GitHub repo link
          if (
            docUrl.includes('docs') ||
            docUrl.includes('documentation') ||
            docUrl.includes('guide')
          ) {
            return docUrl;
          }
        }
      }
    } catch {
      // Failed to fetch or parse, skip
    }

    return null;
  }

  /**
   * Discover documentation URL for a package
   */
  async discoverPackage(packageName: string): Promise<DiscoveredPackage> {
    // Check cache first
    if (this.cache.has(packageName)) {
      return this.cache.get(packageName)!;
    }

    const result: DiscoveredPackage = {
      name: packageName,
      version: 'unknown',
      docsUrl: null,
      githubUrl: null,
      npmUrl: `https://www.npmjs.com/package/${packageName}`,
      confidence: 'low',
    };

    // Check for known overrides first
    if (KNOWN_DOCS_OVERRIDES[packageName]) {
      result.docsUrl = KNOWN_DOCS_OVERRIDES[packageName];
      result.confidence = 'high';
    }

    // Fetch metadata from npm
    const metadata = await this.getPackageMetadata(packageName);
    if (!metadata) {
      this.cache.set(packageName, result);
      return result;
    }

    result.version = metadata.version;
    result.description = metadata.description;
    result.keywords = metadata.keywords;
    result.githubUrl = this.extractGitHubUrl(metadata.repository);

    // If we already have a known override, use it but still populate other fields
    if (result.docsUrl) {
      this.cache.set(packageName, result);
      return result;
    }

    // Priority 1: Homepage (if it looks like docs)
    if (metadata.homepage) {
      const homepage = metadata.homepage.toLowerCase();

      // Filter out npm/github/gitlab repository links as they're not docs
      // But allow GitHub Pages (*.github.io) as they often host docs
      const isGitHubPages = homepage.includes('.github.io');
      const isRepositoryLink =
        (homepage.includes('github.com') && !isGitHubPages) ||
        homepage.includes('gitlab.com') ||
        homepage.includes('npmjs.com');

      if (!isRepositoryLink) {
        result.docsUrl = metadata.homepage;
        // Higher confidence if URL contains doc-related keywords
        const hasDocKeywords =
          homepage.includes('docs') ||
          homepage.includes('documentation') ||
          homepage.includes('guide') ||
          homepage.includes('.dev') ||
          homepage.includes('.io') ||
          isGitHubPages;
        result.confidence = hasDocKeywords ? 'high' : 'medium';
      }
    }

    // Priority 2: Try organization-specific patterns (for scoped packages)
    if (!result.docsUrl && packageName.startsWith('@')) {
      const discovered = await this.tryOrganizationDocs(packageName);
      if (discovered) {
        result.docsUrl = discovered.url;
        result.confidence = discovered.confidence;
      }
    }

    // Priority 3: Try common documentation URL patterns
    if (!result.docsUrl) {
      const discovered = await this.tryCommonDocPatterns(
        packageName,
        metadata.homepage,
        result.githubUrl
      );
      if (discovered) {
        result.docsUrl = discovered.url;
        result.confidence = discovered.confidence;
        console.error(`  📚 Found docs via pattern: ${discovered.url}`);
      }
    }

    // Priority 4: Analyze homepage content for doc links
    if (!result.docsUrl && metadata.homepage) {
      const homepage = metadata.homepage.toLowerCase();
      const isRepositoryLink =
        homepage.includes('github.com') ||
        homepage.includes('gitlab.com') ||
        homepage.includes('npmjs.com');

      // Only analyze if homepage isn't a repository
      if (!isRepositoryLink) {
        const docUrl = await this.analyzeHomepageForDocs(metadata.homepage);
        if (docUrl) {
          result.docsUrl = docUrl;
          result.confidence = 'high';
          console.error(`  🔍 Found docs via homepage analysis: ${docUrl}`);
        }
      }
    }

    // Priority 5: GitHub README (if no better option)
    if (!result.docsUrl && result.githubUrl) {
      result.docsUrl = result.githubUrl;
      result.confidence = 'medium';
    }

    // Priority 6: npm page as last resort
    if (!result.docsUrl) {
      result.docsUrl = result.npmUrl;
      result.confidence = 'low';
    }

    this.cache.set(packageName, result);
    return result;
  }

  /**
   * Discover documentation for multiple packages
   */
  async discoverPackages(packageNames: string[]): Promise<Map<string, DiscoveredPackage>> {
    const results = new Map<string, DiscoveredPackage>();

    // Process in parallel with concurrency limit
    const batchSize = 10;
    for (let i = 0; i < packageNames.length; i += batchSize) {
      const batch = packageNames.slice(i, i + batchSize);
      const discoveries = await Promise.all(batch.map((name) => this.discoverPackage(name)));

      for (const discovery of discoveries) {
        results.set(discovery.name, discovery);
      }
    }

    return results;
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}
