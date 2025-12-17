/**
 * Documentation Crawler - Validates and indexes documentation structure
 */

import { HtmlParser } from '../parsers/html.js';

export interface DocSection {
  title: string;
  path: string;
  url: string;
}

export interface CrawlResult {
  baseUrl: string;
  isValidDocs: boolean;
  title?: string;
  sections: DocSection[];
  sitemapFound: boolean;
  navigationFound: boolean;
}

/**
 * Common selectors for finding navigation/sidebar in documentation sites
 */
const NAV_SELECTORS = [
  // Sidebars
  '.sidebar nav',
  '.sidebar-nav',
  '.docs-sidebar',
  '.documentation-sidebar',
  '[class*="sidebar"] nav',
  '[class*="sidebar"] ul',
  'aside nav',
  'aside ul',
  // Navigation
  '.docs-nav',
  '.doc-nav',
  '.toc',
  '.table-of-contents',
  '[class*="toc"]',
  // Common frameworks
  '.VPSidebar', // VitePress
  '.sidebar-links', // VuePress
  '.menu-list', // Bulma-based
  '[class*="DocsSidebar"]', // Various
  '.nextra-sidebar', // Nextra
  '.gitbook-root nav', // GitBook
];

/**
 * Common patterns for documentation paths
 */
const DOC_PATH_PATTERNS = [
  /^\/docs?\//i,
  /^\/guide\//i,
  /^\/api\//i,
  /^\/reference\//i,
  /^\/learn\//i,
  /^\/tutorial/i,
  /^\/getting-started/i,
  /^\/introduction/i,
  /^\/overview/i,
];

/**
 * Crawls documentation sites to discover structure and validate content
 */
export class DocsCrawler {
  private parser = new HtmlParser();

  /**
   * Crawl a documentation URL to discover its structure
   */
  async crawl(url: string): Promise<CrawlResult> {
    const result: CrawlResult = {
      baseUrl: url,
      isValidDocs: false,
      sections: [],
      sitemapFound: false,
      navigationFound: false,
    };

    try {
      const fetch = (await import('node-fetch')).default;
      const cheerio = await import('cheerio');

      // First, try to fetch the page
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MCPProjectDocs/1.0)',
        },
      });

      if (!response.ok) {
        return result;
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Get page title
      result.title = $('title').text().trim() || $('h1').first().text().trim();

      // Check if this looks like documentation
      result.isValidDocs = this.looksLikeDocumentation($, url);

      // Try to find navigation/sidebar
      const navSections = this.extractNavigation($, url);
      if (navSections.length > 0) {
        result.sections = navSections;
        result.navigationFound = true;
      }

      // Try to find sitemap
      const sitemapSections = await this.trySitemap(url);
      if (sitemapSections.length > 0) {
        result.sitemapFound = true;
        // Merge with nav sections, preferring sitemap for completeness
        const existingPaths = new Set(result.sections.map((s) => s.path));
        for (const section of sitemapSections) {
          if (!existingPaths.has(section.path)) {
            result.sections.push(section);
          }
        }
      }

      // If no navigation found, try common doc paths
      if (result.sections.length === 0) {
        result.sections = await this.probeCommonPaths(url);
      }
    } catch (error) {
      console.error(`Failed to crawl ${url}:`, error);
    }

    return result;
  }

  /**
   * Check if a page looks like documentation
   */
  private looksLikeDocumentation(
    $: ReturnType<typeof import('cheerio').load>,
    url: string
  ): boolean {
    const urlLower = url.toLowerCase();

    // URL patterns that suggest documentation
    if (
      urlLower.includes('/docs') ||
      urlLower.includes('/documentation') ||
      urlLower.includes('/guide') ||
      urlLower.includes('/api') ||
      urlLower.includes('/reference') ||
      urlLower.includes('docs.') ||
      urlLower.includes('documentation.')
    ) {
      return true;
    }

    // Check for documentation-like content
    const hasCodeBlocks = $('pre code, .highlight, .code-block').length > 0;
    const hasSidebar = $(NAV_SELECTORS.join(', ')).length > 0;
    const hasApiHeaders =
      $('h2, h3').filter((_, el) => {
        const text = $(el).text().toLowerCase();
        return (
          text.includes('api') ||
          text.includes('usage') ||
          text.includes('installation') ||
          text.includes('getting started') ||
          text.includes('props') ||
          text.includes('methods') ||
          text.includes('options')
        );
      }).length > 0;

    return hasCodeBlocks || hasSidebar || hasApiHeaders;
  }

  /**
   * Extract navigation links from the page
   */
  private extractNavigation(
    $: ReturnType<typeof import('cheerio').load>,
    baseUrl: string
  ): DocSection[] {
    const sections: DocSection[] = [];
    const seenPaths = new Set<string>();
    const base = new URL(baseUrl);

    for (const selector of NAV_SELECTORS) {
      const nav = $(selector).first();
      if (nav.length === 0) continue;

      nav.find('a[href]').each((_, el) => {
        const href = $(el).attr('href');
        const title = $(el).text().trim();

        if (!href || !title || title.length > 100) return;

        // Skip external links, anchors, and non-doc links
        if (
          (href.startsWith('http') && !href.startsWith(base.origin)) ||
          href.startsWith('#') ||
          href.startsWith('mailto:') ||
          href.startsWith('javascript:')
        ) {
          return;
        }

        // Normalize the path
        let path = href;
        if (!path.startsWith('/')) {
          path = '/' + path;
        }
        path = path.split('#')[0].split('?')[0];

        // Skip if we've seen this path
        if (seenPaths.has(path)) return;
        seenPaths.add(path);

        // Check if it looks like a doc path
        const isDocPath = DOC_PATH_PATTERNS.some((pattern) => pattern.test(path));
        if (
          !isDocPath &&
          !path.includes('doc') &&
          !path.includes('guide') &&
          !path.includes('api')
        ) {
          // Be more lenient - include paths that are at least 2 levels deep
          if (path.split('/').filter(Boolean).length < 2) return;
        }

        const fullUrl = new URL(path, baseUrl).href;
        sections.push({ title, path, url: fullUrl });
      });

      // If we found navigation, stop looking
      if (sections.length > 0) break;
    }

    return sections;
  }

  /**
   * Try to fetch and parse sitemap.xml
   */
  private async trySitemap(baseUrl: string): Promise<DocSection[]> {
    const sections: DocSection[] = [];

    try {
      const fetch = (await import('node-fetch')).default;
      const cheerio = await import('cheerio');
      const base = new URL(baseUrl);

      // Try common sitemap locations
      const sitemapUrls = [
        `${base.origin}/sitemap.xml`,
        `${base.origin}/sitemap_index.xml`,
        `${base.origin}/docs/sitemap.xml`,
      ];

      for (const sitemapUrl of sitemapUrls) {
        try {
          const response = await fetch(sitemapUrl);
          if (!response.ok) continue;

          const xml = await response.text();
          const $ = cheerio.load(xml, { xmlMode: true });

          $('url loc').each((_, el) => {
            const url = $(el).text().trim();
            if (!url) return;

            // Only include URLs that look like documentation
            const path = new URL(url).pathname;
            const isDocPath = DOC_PATH_PATTERNS.some((pattern) => pattern.test(path));

            if (isDocPath || url.includes('/docs/') || url.includes('/guide/')) {
              // Generate title from path
              const pathParts = path.split('/').filter(Boolean);
              const title =
                pathParts[pathParts.length - 1]
                  ?.replace(/-/g, ' ')
                  .replace(/\b\w/g, (c) => c.toUpperCase()) || 'Unknown';

              sections.push({ title, path, url });
            }
          });

          if (sections.length > 0) break;
        } catch {
          continue;
        }
      }
    } catch {
      // Sitemap not available
    }

    return sections;
  }

  /**
   * Probe common documentation paths to see if they exist
   */
  private async probeCommonPaths(baseUrl: string): Promise<DocSection[]> {
    const sections: DocSection[] = [];
    const fetch = (await import('node-fetch')).default;
    const base = new URL(baseUrl);

    const commonPaths = [
      '/docs',
      '/docs/',
      '/documentation',
      '/guide',
      '/guide/',
      '/api',
      '/api/',
      '/reference',
      '/getting-started',
      '/introduction',
      '/overview',
      '/quickstart',
    ];

    // Probe paths in parallel
    const probes = await Promise.all(
      commonPaths.map(async (path) => {
        try {
          const url = new URL(path, base.origin).href;
          const response = await fetch(url, { method: 'HEAD' });
          if (response.ok) {
            const title =
              path
                .split('/')
                .filter(Boolean)[0]
                ?.replace(/-/g, ' ')
                .replace(/\b\w/g, (c) => c.toUpperCase()) || 'Documentation';
            return { title, path, url };
          }
        } catch {
          // Path doesn't exist
        }
        return null;
      })
    );

    for (const probe of probes) {
      if (probe) sections.push(probe);
    }

    return sections;
  }

  /**
   * Fetch documentation content from a specific path
   */
  async fetchDocContent(url: string): Promise<string> {
    try {
      const result = await this.parser.extractContent(url);
      return result.content;
    } catch (error) {
      throw new Error(`Failed to fetch documentation from ${url}: ${error}`);
    }
  }
}
