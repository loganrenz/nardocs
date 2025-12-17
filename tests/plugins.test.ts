import { describe, it, expect } from 'vitest';
import { NuxtPlugin } from '../src/plugins/nuxt.js';
import { VuePlugin } from '../src/plugins/vue.js';
import { AngularPlugin } from '../src/plugins/angular.js';
import { SveltePlugin } from '../src/plugins/svelte.js';
import { TailwindPlugin } from '../src/plugins/tailwind.js';
import { ExpressPlugin } from '../src/plugins/express.js';
import { PrismaPlugin } from '../src/plugins/prisma.js';
import { NextjsPlugin } from '../src/plugins/nextjs.js';
import { VitePlugin } from '../src/plugins/vite.js';
import { AstroPlugin } from '../src/plugins/astro.js';
import { SolidPlugin } from '../src/plugins/solid.js';
import { RemixPlugin } from '../src/plugins/remix.js';

describe('NuxtPlugin', () => {
  const plugin = new NuxtPlugin();

  describe('detect', () => {
    it('should detect nuxt dependency', () => {
      expect(plugin.detect({ nuxt: '^3.0.0' })).toBe(true);
    });

    it('should detect @nuxt/kit dependency', () => {
      expect(plugin.detect({ '@nuxt/kit': '^3.0.0' })).toBe(true);
    });

    it('should not detect when nuxt is not present', () => {
      expect(plugin.detect({ vue: '^3.0.0' })).toBe(false);
    });
  });

  describe('getTools', () => {
    it('should return nuxt tools', () => {
      const tools = plugin.getTools();
      expect(tools).toHaveLength(9);
      expect(tools[0].name).toBe('check_nuxt_ui_component');
      expect(tools[1].name).toBe('check_nuxt_feature');
      expect(tools[2].name).toBe('check_nuxt_module');
      expect(tools[3].name).toBe('check_nuxt_image');
      expect(tools[4].name).toBe('check_nuxt_content');
      expect(tools[5].name).toBe('check_nuxt_i18n');
      expect(tools[6].name).toBe('check_vueuse');
      expect(tools[7].name).toBe('check_pinia');
      expect(tools[8].name).toBe('check_nuxt_seo');
    });
  });

  describe('getContext', () => {
    it('should return context with nuxt version', () => {
      const context = plugin.getContext({ nuxt: '^3.0.0' });
      expect(context).toContain('Nuxt Framework');
      expect(context).toContain('3.0.0');
    });

    it('should include nuxt ui info when present', () => {
      const context = plugin.getContext({ nuxt: '^3.0.0', '@nuxt/ui': '^2.0.0' });
      expect(context).toContain('Nuxt UI version');
    });

    it('should detect and list installed modules', () => {
      const context = plugin.getContext({
        nuxt: '^3.0.0',
        '@nuxt/image': '^1.0.0',
        '@nuxt/content': '^2.0.0',
        '@nuxtjs/i18n': '^8.0.0',
      });
      expect(context).toContain('Installed Nuxt Modules');
      expect(context).toContain('Nuxt Image');
      expect(context).toContain('Nuxt Content');
      expect(context).toContain('Nuxt i18n');
    });

    it('should include module documentation links', () => {
      const context = plugin.getContext({
        nuxt: '^3.0.0',
        '@nuxt/image': '^1.0.0',
      });
      expect(context).toContain('Module Documentation');
      expect(context).toContain('https://image.nuxt.com');
    });

    it('should detect pinia module', () => {
      const context = plugin.getContext({
        nuxt: '^3.0.0',
        '@pinia/nuxt': '^0.5.0',
      });
      expect(context).toContain('Pinia');
    });

    it('should detect vueuse module', () => {
      const context = plugin.getContext({
        nuxt: '^3.0.0',
        '@vueuse/nuxt': '^10.0.0',
      });
      expect(context).toContain('VueUse');
    });
  });
});

describe('VuePlugin', () => {
  const plugin = new VuePlugin();

  describe('detect', () => {
    it('should detect vue dependency', () => {
      expect(plugin.detect({ vue: '^3.0.0' })).toBe(true);
    });

    it('should detect @vue/runtime-core dependency', () => {
      expect(plugin.detect({ '@vue/runtime-core': '^3.0.0' })).toBe(true);
    });

    it('should not detect when vue is not present', () => {
      expect(plugin.detect({ react: '^18.0.0' })).toBe(false);
    });
  });

  describe('getTools', () => {
    it('should return vue tools', () => {
      const tools = plugin.getTools();
      expect(tools).toHaveLength(1);
      expect(tools[0].name).toBe('check_vue_api');
    });
  });

  describe('getContext', () => {
    it('should return context with vue version', () => {
      const context = plugin.getContext({ vue: '^3.0.0' });
      expect(context).toContain('Vue Framework');
      expect(context).toContain('3.0.0');
    });
  });
});

describe('AngularPlugin', () => {
  const plugin = new AngularPlugin();

  describe('detect', () => {
    it('should detect @angular/core dependency', () => {
      expect(plugin.detect({ '@angular/core': '^17.0.0' })).toBe(true);
    });

    it('should detect @angular/cli dependency', () => {
      expect(plugin.detect({ '@angular/cli': '^17.0.0' })).toBe(true);
    });

    it('should not detect when angular is not present', () => {
      expect(plugin.detect({ react: '^18.0.0' })).toBe(false);
    });
  });

  describe('getTools', () => {
    it('should return angular tools', () => {
      const tools = plugin.getTools();
      expect(tools).toHaveLength(2);
      expect(tools[0].name).toBe('check_angular_api');
      expect(tools[1].name).toBe('check_angular_guide');
    });
  });

  describe('getContext', () => {
    it('should return context with angular version', () => {
      const context = plugin.getContext({ '@angular/core': '^17.0.0' });
      expect(context).toContain('Angular Framework');
      expect(context).toContain('17.0.0');
    });
  });
});

describe('SveltePlugin', () => {
  const plugin = new SveltePlugin();

  describe('detect', () => {
    it('should detect svelte dependency', () => {
      expect(plugin.detect({ svelte: '^4.0.0' })).toBe(true);
    });

    it('should detect @sveltejs/kit dependency', () => {
      expect(plugin.detect({ '@sveltejs/kit': '^2.0.0' })).toBe(true);
    });

    it('should not detect when svelte is not present', () => {
      expect(plugin.detect({ react: '^18.0.0' })).toBe(false);
    });
  });

  describe('getTools', () => {
    it('should return svelte tools', () => {
      const tools = plugin.getTools();
      expect(tools).toHaveLength(2);
      expect(tools[0].name).toBe('check_svelte_api');
      expect(tools[1].name).toBe('check_sveltekit_feature');
    });
  });
});

describe('TailwindPlugin', () => {
  const plugin = new TailwindPlugin();

  describe('detect', () => {
    it('should detect tailwindcss dependency', () => {
      expect(plugin.detect({ tailwindcss: '^3.0.0' })).toBe(true);
    });

    it('should not detect when tailwind is not present', () => {
      expect(plugin.detect({ react: '^18.0.0' })).toBe(false);
    });
  });

  describe('getTools', () => {
    it('should return tailwind tools', () => {
      const tools = plugin.getTools();
      expect(tools).toHaveLength(1);
      expect(tools[0].name).toBe('check_tailwind_docs');
    });
  });
});

describe('ExpressPlugin', () => {
  const plugin = new ExpressPlugin();

  describe('detect', () => {
    it('should detect express dependency', () => {
      expect(plugin.detect({ express: '^4.0.0' })).toBe(true);
    });

    it('should not detect when express is not present', () => {
      expect(plugin.detect({ fastify: '^4.0.0' })).toBe(false);
    });
  });

  describe('getTools', () => {
    it('should return express tools', () => {
      const tools = plugin.getTools();
      expect(tools).toHaveLength(2);
      expect(tools[0].name).toBe('check_express_api');
      expect(tools[1].name).toBe('check_express_guide');
    });
  });
});

describe('PrismaPlugin', () => {
  const plugin = new PrismaPlugin();

  describe('detect', () => {
    it('should detect prisma dependency', () => {
      expect(plugin.detect({ prisma: '^5.0.0' })).toBe(true);
    });

    it('should detect @prisma/client dependency', () => {
      expect(plugin.detect({ '@prisma/client': '^5.0.0' })).toBe(true);
    });

    it('should not detect when prisma is not present', () => {
      expect(plugin.detect({ mongoose: '^8.0.0' })).toBe(false);
    });
  });

  describe('getTools', () => {
    it('should return prisma tools', () => {
      const tools = plugin.getTools();
      expect(tools).toHaveLength(2);
      expect(tools[0].name).toBe('check_prisma_docs');
      expect(tools[1].name).toBe('check_prisma_reference');
    });
  });
});

describe('NextjsPlugin', () => {
  const plugin = new NextjsPlugin();

  describe('detect', () => {
    it('should detect next dependency', () => {
      expect(plugin.detect({ next: '^14.0.0' })).toBe(true);
    });

    it('should not detect when next is not present', () => {
      expect(plugin.detect({ react: '^18.0.0' })).toBe(false);
    });
  });

  describe('getTools', () => {
    it('should return nextjs tools', () => {
      const tools = plugin.getTools();
      expect(tools).toHaveLength(2);
      expect(tools[0].name).toBe('check_nextjs_docs');
      expect(tools[1].name).toBe('check_nextjs_api');
    });
  });

  describe('getContext', () => {
    it('should indicate App Router for Next.js 13+', () => {
      const context = plugin.getContext({ next: '^14.0.0' });
      expect(context).toContain('App Router');
    });
  });
});

describe('VitePlugin', () => {
  const plugin = new VitePlugin();

  describe('detect', () => {
    it('should detect vite dependency', () => {
      expect(plugin.detect({ vite: '^5.0.0' })).toBe(true);
    });

    it('should not detect when vite is not present', () => {
      expect(plugin.detect({ webpack: '^5.0.0' })).toBe(false);
    });
  });

  describe('getTools', () => {
    it('should return vite tools', () => {
      const tools = plugin.getTools();
      expect(tools).toHaveLength(1);
      expect(tools[0].name).toBe('check_vite_docs');
    });
  });
});

describe('AstroPlugin', () => {
  const plugin = new AstroPlugin();

  describe('detect', () => {
    it('should detect astro dependency', () => {
      expect(plugin.detect({ astro: '^4.0.0' })).toBe(true);
    });

    it('should not detect when astro is not present', () => {
      expect(plugin.detect({ next: '^14.0.0' })).toBe(false);
    });
  });

  describe('getTools', () => {
    it('should return astro tools', () => {
      const tools = plugin.getTools();
      expect(tools).toHaveLength(2);
      expect(tools[0].name).toBe('check_astro_docs');
      expect(tools[1].name).toBe('check_astro_integration');
    });
  });
});

describe('SolidPlugin', () => {
  const plugin = new SolidPlugin();

  describe('detect', () => {
    it('should detect solid-js dependency', () => {
      expect(plugin.detect({ 'solid-js': '^1.0.0' })).toBe(true);
    });

    it('should detect @solidjs/router dependency', () => {
      expect(plugin.detect({ '@solidjs/router': '^0.10.0' })).toBe(true);
    });

    it('should not detect when solid is not present', () => {
      expect(plugin.detect({ react: '^18.0.0' })).toBe(false);
    });
  });

  describe('getTools', () => {
    it('should return solid tools', () => {
      const tools = plugin.getTools();
      expect(tools).toHaveLength(1);
      expect(tools[0].name).toBe('check_solid_docs');
    });
  });
});

describe('RemixPlugin', () => {
  const plugin = new RemixPlugin();

  describe('detect', () => {
    it('should detect @remix-run/react dependency', () => {
      expect(plugin.detect({ '@remix-run/react': '^2.0.0' })).toBe(true);
    });

    it('should detect @remix-run/node dependency', () => {
      expect(plugin.detect({ '@remix-run/node': '^2.0.0' })).toBe(true);
    });

    it('should not detect when remix is not present', () => {
      expect(plugin.detect({ next: '^14.0.0' })).toBe(false);
    });
  });

  describe('getTools', () => {
    it('should return remix tools', () => {
      const tools = plugin.getTools();
      expect(tools).toHaveLength(2);
      expect(tools[0].name).toBe('check_remix_docs');
      expect(tools[1].name).toBe('check_remix_api');
    });
  });
});
