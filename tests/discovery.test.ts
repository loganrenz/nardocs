import { describe, it, expect, beforeEach } from 'vitest';
import { PackageScanner } from '../src/discovery/package-scanner.js';
import { DynamicPlugin } from '../src/discovery/dynamic-plugin.js';

describe('PackageScanner', () => {
  let scanner: PackageScanner;

  beforeEach(() => {
    scanner = new PackageScanner();
  });

  describe('discoverPackage', () => {
    it('should return known docs override for popular packages', async () => {
      const result = await scanner.discoverPackage('lodash');

      expect(result.name).toBe('lodash');
      expect(result.docsUrl).toBe('https://lodash.com/docs');
      expect(result.confidence).toBe('high');
    });

    it('should return npm URL for unknown packages', async () => {
      const result = await scanner.discoverPackage('some-nonexistent-package-12345');

      expect(result.name).toBe('some-nonexistent-package-12345');
      expect(result.npmUrl).toBe('https://www.npmjs.com/package/some-nonexistent-package-12345');
      expect(result.confidence).toBe('low');
    });

    it('should cache results', async () => {
      const result1 = await scanner.discoverPackage('lodash');
      const result2 = await scanner.discoverPackage('lodash');

      expect(result1).toBe(result2); // Same object reference (cached)
    });

    it('should clear cache', async () => {
      const result1 = await scanner.discoverPackage('lodash');
      scanner.clearCache();
      const result2 = await scanner.discoverPackage('lodash');

      expect(result1).not.toBe(result2); // Different object reference (not cached)
      expect(result1.docsUrl).toBe(result2.docsUrl); // But same content
    });

    // Real-world package discovery tests
    it('should discover @supabase/supabase-js from npm registry', async () => {
      const result = await scanner.discoverPackage('@supabase/supabase-js');

      expect(result.name).toBe('@supabase/supabase-js');
      expect(result.version).toBeTruthy(); // Should have a version
      expect(result.docsUrl).toBeTruthy(); // Should find docs URL
      expect(result.docsUrl).toContain('supabase'); // Should be supabase docs
      expect(result.confidence).not.toBe('low'); // Should have high/medium confidence
      expect(result.githubUrl).toContain('github.com'); // Should find GitHub
    });

    it('should discover date-fns from npm registry', async () => {
      const result = await scanner.discoverPackage('date-fns');

      expect(result.name).toBe('date-fns');
      expect(result.docsUrl).toBe('https://date-fns.org/docs/Getting-Started');
      expect(result.confidence).toBe('high');
    });

    it('should discover zod from npm registry', async () => {
      const result = await scanner.discoverPackage('zod');

      expect(result.name).toBe('zod');
      expect(result.docsUrl).toBe('https://zod.dev');
      expect(result.confidence).toBe('high');
    });

    it('should discover scoped packages like @tanstack/react-query', async () => {
      const result = await scanner.discoverPackage('@tanstack/react-query');

      expect(result.name).toBe('@tanstack/react-query');
      expect(result.version).toBeTruthy();
      // Should find tanstack docs
      expect(result.docsUrl).toContain('tanstack');
      expect(result.confidence).toBe('high');
    });
  });

  describe('discoverPackages', () => {
    it('should discover multiple packages', async () => {
      const results = await scanner.discoverPackages(['lodash', 'axios']);

      expect(results.size).toBe(2);
      expect(results.get('lodash')?.docsUrl).toBe('https://lodash.com/docs');
      expect(results.get('axios')?.docsUrl).toBe('https://axios-http.com/docs/intro');
    });

    it('should discover multiple real packages in parallel', async () => {
      const packages = ['@supabase/supabase-js', 'zod', 'date-fns', '@tanstack/react-query'];
      const results = await scanner.discoverPackages(packages);

      expect(results.size).toBe(4);

      // All should have docs URLs
      for (const pkg of packages) {
        const result = results.get(pkg);
        expect(result).toBeDefined();
        expect(result?.docsUrl).toBeTruthy();
      }
    });
  });
});

describe('DynamicPlugin', () => {
  describe('constructor', () => {
    it('should create a plugin with correct tool name', () => {
      const plugin = new DynamicPlugin({
        name: '@tanstack/react-query',
        version: '5.0.0',
        docsUrl: 'https://tanstack.com/query',
        githubUrl: null,
        npmUrl: 'https://www.npmjs.com/package/@tanstack/react-query',
        confidence: 'high',
      });

      expect(plugin.toolName).toBe('tanstack_react_query');
      expect(plugin.displayName).toBe('React Query');
    });

    it('should handle simple package names', () => {
      const plugin = new DynamicPlugin({
        name: 'lodash',
        version: '4.17.21',
        docsUrl: 'https://lodash.com/docs',
        githubUrl: null,
        npmUrl: 'https://www.npmjs.com/package/lodash',
        confidence: 'high',
      });

      expect(plugin.toolName).toBe('lodash');
      expect(plugin.displayName).toBe('Lodash');
    });
  });

  describe('detect', () => {
    it('should detect when package is in dependencies', () => {
      const plugin = new DynamicPlugin({
        name: 'lodash',
        version: '4.17.21',
        docsUrl: 'https://lodash.com/docs',
        githubUrl: null,
        npmUrl: 'https://www.npmjs.com/package/lodash',
        confidence: 'high',
      });

      expect(plugin.detect({ lodash: '^4.17.21' })).toBe(true);
      expect(plugin.detect({ axios: '^1.0.0' })).toBe(false);
    });
  });

  describe('getTools', () => {
    it('should return documentation tool', () => {
      const plugin = new DynamicPlugin({
        name: 'lodash',
        version: '4.17.21',
        description: 'A modern JavaScript utility library',
        docsUrl: 'https://lodash.com/docs',
        githubUrl: 'https://github.com/lodash/lodash',
        npmUrl: 'https://www.npmjs.com/package/lodash',
        confidence: 'high',
      });

      const tools = plugin.getTools();

      expect(tools).toHaveLength(1);
      expect(tools[0].name).toBe('check_lodash_docs');
      expect(tools[0].description).toContain('Lodash');
      expect(tools[0].description).toContain('A modern JavaScript utility library');
    });
  });

  describe('getContext', () => {
    it('should return context with documentation links', () => {
      const plugin = new DynamicPlugin({
        name: 'lodash',
        version: '4.17.21',
        description: 'A modern JavaScript utility library',
        docsUrl: 'https://lodash.com/docs',
        githubUrl: 'https://github.com/lodash/lodash',
        npmUrl: 'https://www.npmjs.com/package/lodash',
        confidence: 'high',
      });

      const context = plugin.getContext({ lodash: '^4.17.21' });

      expect(context).toContain('## Lodash');
      expect(context).toContain('lodash');
      expect(context).toContain('^4.17.21');
      expect(context).toContain('https://lodash.com/docs');
      expect(context).toContain('https://github.com/lodash/lodash');
    });
  });

  describe('handleToolCall - integration', () => {
    it('should fetch real documentation for zod', async () => {
      const plugin = new DynamicPlugin({
        name: 'zod',
        version: '3.22.4',
        description: 'TypeScript-first schema validation',
        docsUrl: 'https://zod.dev',
        githubUrl: 'https://github.com/colinhacks/zod',
        npmUrl: 'https://www.npmjs.com/package/zod',
        confidence: 'high',
      });

      const result = await plugin.handleToolCall('check_zod_docs', {});

      expect(result).toContain('Zod');
      expect(result).toContain('zod.dev');
      // Should contain some actual documentation content
      expect(result.length).toBeGreaterThan(500);
    }, 10000); // 10 second timeout for network request
  });
});

describe('End-to-end: Discover and fetch docs', () => {
  it('should discover @supabase/supabase-js and fetch its documentation', async () => {
    const scanner = new PackageScanner();

    // Step 1: Discover the package
    const discovery = await scanner.discoverPackage('@supabase/supabase-js');
    expect(discovery.docsUrl).toBeTruthy();

    // Step 2: Create a dynamic plugin
    const plugin = new DynamicPlugin(discovery);
    expect(plugin.toolName).toBe('supabase_supabase_js');

    // Step 3: Verify tools are generated
    const tools = plugin.getTools();
    expect(tools).toHaveLength(1);
    expect(tools[0].name).toBe('check_supabase_supabase_js_docs');

    // Step 4: Fetch actual documentation
    const docs = await plugin.handleToolCall('check_supabase_supabase_js_docs', {});
    expect(docs).toContain('Supabase');
    expect(docs.length).toBeGreaterThan(100);
  }, 15000); // 15 second timeout

  it('should discover and create working plugin for drizzle-orm', async () => {
    const scanner = new PackageScanner();

    const discovery = await scanner.discoverPackage('drizzle-orm');
    expect(discovery.docsUrl).toBe('https://orm.drizzle.team/docs/overview');
    expect(discovery.confidence).toBe('high');

    const plugin = new DynamicPlugin(discovery);
    const tools = plugin.getTools();

    expect(tools[0].name).toBe('check_drizzle_orm_docs');
    expect(tools[0].description).toContain('drizzle-orm');
  });
});
