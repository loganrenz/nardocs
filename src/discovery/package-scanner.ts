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
 * Reserved for future use in enhanced discovery
 */
// const DOCS_URL_PATTERNS: Record<string, (pkg: string) => string[]> = {
//   // Try common documentation hosting patterns
//   github: (pkg) => [
//     `https://${pkg}.github.io`,
//     `https://github.com/${pkg}/${pkg}#readme`,
//   ],
//   readthedocs: (pkg) => [`https://${pkg}.readthedocs.io`],
//   gitbook: (pkg) => [`https://${pkg}.gitbook.io`],
// };

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

    // Priority 1: Homepage (usually the docs site)
    if (metadata.homepage) {
      // Filter out npm/github links as they're not docs
      const homepage = metadata.homepage.toLowerCase();
      if (
        !homepage.includes('npmjs.com') &&
        !homepage.includes('github.com') &&
        !homepage.includes('gitlab.com')
      ) {
        result.docsUrl = metadata.homepage;
        result.confidence = 'high';
      }
    }

    // Priority 2: GitHub README (if no homepage)
    if (!result.docsUrl && result.githubUrl) {
      result.docsUrl = result.githubUrl;
      result.confidence = 'medium';
    }

    // Priority 3: npm page as last resort
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
