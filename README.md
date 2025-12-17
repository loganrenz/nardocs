# MCP Project Docs

[![npm version](https://img.shields.io/npm/v/mcp-project-docs.svg)](https://www.npmjs.com/package/mcp-project-docs)
[![CI](https://github.com/loganrenz/nardocs/actions/workflows/ci.yml/badge.svg)](https://github.com/loganrenz/nardocs/actions/workflows/ci.yml)
[![Release](https://github.com/loganrenz/nardocs/actions/workflows/release.yml/badge.svg)](https://github.com/loganrenz/nardocs/actions/workflows/release.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/mcp-project-docs.svg)](https://nodejs.org)
[![Downloads](https://img.shields.io/npm/dm/mcp-project-docs.svg)](https://www.npmjs.com/package/mcp-project-docs)

A Model Context Protocol (MCP) server that provides intelligent, context-aware documentation lookup for JavaScript/TypeScript projects. Designed to work seamlessly with AI assistants in Cursor IDE and other MCP-compatible tools.

## What is this?

This MCP server automatically detects which frameworks and libraries your project uses, then provides AI assistants with:

- **Automatic context loading**: Project dependencies and versions are automatically available to the AI
- **Smart documentation tools**: Framework-specific tools that fetch up-to-date documentation on demand
- **Intelligent suggestions**: AI can check current API documentation before suggesting code changes

### Why is this useful?

AI assistants can have outdated information about framework APIs, especially for rapidly evolving frameworks like Nuxt UI (which had breaking changes from v3 to v4). This server ensures your AI assistant always has access to the latest documentation for your specific project's dependencies.

## Features

- 🔍 **Auto-detection**: Automatically detects Nuxt, Vue, React, and other frameworks in your project
- 🤖 **Auto-discovery**: Automatically discovers documentation for ANY npm package in your project
- 📚 **Dynamic Documentation**: Fetches latest docs from official sources on demand
- 🎯 **Context-Aware**: Knows which versions of dependencies you're using
- 🧹 **Clean Output**: Extracts and formats documentation content for optimal AI consumption
- ⚡ **Fast**: Lightweight and responds quickly to tool calls
- 🔌 **Extensible**: Plugin system makes it easy to add support for new frameworks

## Installation

### Recommended: Install as Dev Dependency

Install in your project so the server automatically detects your dependencies:

```bash
npm install --save-dev mcp-project-docs
```

Then configure in your Cursor IDE settings (see Configuration below).

### Alternative: Using npx

No installation needed, but you'll need to specify the project path manually:

```bash
# The server will be downloaded and run on-demand
```

### Alternative: Global Installation

```bash
npm install -g mcp-project-docs
```

### From Source

```bash
git clone <repository-url>
cd mcp-project-docs
npm install
npm run build
npm link
```

## Configuration

### Cursor IDE

#### Option 1: Installed as Dev Dependency (Recommended)

If you installed `mcp-project-docs` as a dev dependency in your project:

```json
{
  "mcpServers": {
    "project-docs": {
      "command": "npx",
      "args": ["-y", "mcp-project-docs"]
    }
  }
}
```

**That's it!** The server automatically detects your project's `package.json` from the current working directory.

#### Option 2: Using npx or Global Install

If you're using `npx` without installing locally, or using a global install, you need to specify the project path:

```json
{
  "mcpServers": {
    "project-docs": {
      "command": "npx",
      "args": ["-y", "mcp-project-docs"],
      "env": {
        "PROJECT_PATH": "/absolute/path/to/your/project"
      }
    }
  }
}
```

**Important**: Replace `/absolute/path/to/your/project` with the actual absolute path to your project directory (the one containing `package.json`).

### Other MCP Clients

Configure according to your client's documentation, ensuring:

- Command: `npx -y mcp-project-docs` (or `mcp-project-docs` if installed globally)
- Environment variable `PROJECT_PATH` points to your project directory

## Supported Frameworks

### Currently Supported

#### Nuxt

- ✅ Nuxt UI component documentation
- ✅ Nuxt framework documentation
- ✅ Automatic version detection
- ✅ Breaking change warnings (e.g., v3 → v4)

**Tools:**

- `check_nuxt_ui_component`: Fetch component docs (e.g., UButton, UCard)
- `check_nuxt_feature`: Fetch framework docs (e.g., composables, server APIs)

#### Vue

- ✅ Vue 3 API documentation
- ✅ Composition API references
- ✅ Component API documentation

**Tools:**

- `check_vue_api`: Fetch Vue API docs (e.g., ref, computed, watch)

#### Next.js

- ✅ Next.js App Router documentation
- ✅ API reference for components and functions
- ✅ Automatic App Router detection (v13+)

**Tools:**

- `check_nextjs_docs`: Fetch Next.js documentation
- `check_nextjs_api`: Fetch Next.js API reference (next/image, next/link, etc.)

#### Angular

- ✅ Angular API documentation
- ✅ Angular guide documentation
- ✅ Angular Material detection

**Tools:**

- `check_angular_api`: Fetch Angular API docs (Component, Injectable, etc.)
- `check_angular_guide`: Fetch Angular guides (routing, forms, etc.)

#### Svelte/SvelteKit

- ✅ Svelte API documentation
- ✅ SvelteKit feature documentation

**Tools:**

- `check_svelte_api`: Fetch Svelte API docs
- `check_sveltekit_feature`: Fetch SvelteKit docs (routing, load, etc.)

#### Tailwind CSS

- ✅ Tailwind CSS utility documentation
- ✅ Plugin detection (@tailwindcss/forms, typography)

**Tools:**

- `check_tailwind_docs`: Fetch Tailwind CSS docs (flex, grid, colors, etc.)

#### Express.js

- ✅ Express API documentation
- ✅ Express guide documentation

**Tools:**

- `check_express_api`: Fetch Express API docs (app, req, res, router)
- `check_express_guide`: Fetch Express guides (routing, middleware, etc.)

#### Prisma

- ✅ Prisma concepts documentation
- ✅ Prisma API reference

**Tools:**

- `check_prisma_docs`: Fetch Prisma docs (schema, client, migrate)
- `check_prisma_reference`: Fetch Prisma API reference

#### Vite

- ✅ Vite configuration documentation
- ✅ Plugin detection (React, Vue)

**Tools:**

- `check_vite_docs`: Fetch Vite docs (features, config, build)

#### Astro

- ✅ Astro documentation
- ✅ Integration documentation
- ✅ Integration detection (React, Vue, Svelte, Tailwind)

**Tools:**

- `check_astro_docs`: Fetch Astro docs (components, content collections)
- `check_astro_integration`: Fetch Astro integration docs

#### SolidJS

- ✅ SolidJS documentation
- ✅ Router and SolidStart detection

**Tools:**

- `check_solid_docs`: Fetch SolidJS docs (reactivity, signals)

#### Remix

- ✅ Remix documentation
- ✅ Remix API reference

**Tools:**

- `check_remix_docs`: Fetch Remix docs (routing, loaders, actions)
- `check_remix_api`: Fetch Remix API reference (useLoaderData, etc.)

#### React (Basic)

- ✅ React context and version detection
- ⏳ React hooks documentation (planned)

The plugin system is already in place - contributions welcome!

### Auto-Discovery (Any npm Package)

In addition to built-in plugins, the server **automatically discovers documentation** for ANY npm package in your project using intelligent multi-strategy discovery!

**How it works:**

The auto-discovery system uses a sophisticated 5-tier strategy to find the best documentation:

1. **Known Documentation URLs** (Highest Priority)
   - 50+ curated documentation URLs for popular packages
   - Ensures packages like VueUse, Pinia, TanStack Query get their actual docs sites

2. **Homepage Analysis**
   - Checks if the package's homepage is a documentation site
   - Filters out repository links (github.com, gitlab.com)
   - Allows GitHub Pages (\*.github.io) which often host docs
   - Higher confidence for URLs with doc-related keywords (.dev, .io, docs, guide)

3. **Common Documentation Patterns** ⭐ NEW!
   - Tries `docs.{domain}` subdomain
   - Tries `{homepage}/docs` path
   - Tries `{homepage}/documentation` path
   - Tries `{homepage}/guide` path
   - Tries GitHub Pages pattern: `{org}.github.io/{repo}`
   - Tries ReadTheDocs: `{package}.readthedocs.io`
   - Actually verifies each URL exists before using it!

4. **Homepage Content Analysis** ⭐ NEW!
   - Fetches and parses the homepage HTML
   - Looks for documentation links in the page
   - Extracts links with patterns like `/docs`, `/documentation`, `/guide`
   - Converts relative URLs to absolute URLs

5. **Fallback Options**
   - GitHub README (if repository available)
   - npm package page (last resort)

**Example:** If your project has `lodash` installed, you'll automatically get:

```
AI: Let me check the lodash documentation for array methods...
[AI calls: check_lodash_docs({ topic: "array" })]
[Server returns: Lodash array documentation]
```

**What makes this intelligent:**

- ✅ **Verifies URLs exist** - Doesn't return broken links
- ✅ **Analyzes actual content** - Parses homepages to find doc links
- ✅ **Tries multiple strategies** - Falls back gracefully if one method fails
- ✅ **Caches results** - Avoids repeated lookups for performance
- ✅ **Confidence scoring** - Tells you how reliable the found URL is

**Supported packages include:**

- 50+ popular packages with curated documentation URLs
- Any package with a discoverable documentation site
- Packages using common doc hosting patterns (ReadTheDocs, GitHub Pages, etc.)
- Packages with documentation links on their homepage

**Disable auto-discovery:**

```json
{
  "mcpServers": {
    "project-docs": {
      "command": "npx",
      "args": ["-y", "mcp-project-docs"],
      "env": {
        "PROJECT_PATH": "/path/to/project",
        "AUTO_DISCOVERY": "false"
      }
    }
  }
}
```

## Usage Examples

### In Cursor IDE

Once configured, the AI assistant automatically has access to:

#### Resources (Auto-loaded)

- `project://dependencies` - Your complete dependency list with versions
- `project://context` - Framework-specific notes and documentation links

#### Tools (On-demand)

**Example 1: Checking Nuxt UI Component**

```
AI: I need to use a button component. Let me check the current Nuxt UI Button API...
[AI calls: check_nuxt_ui_component({ component: "button" })]
[Server returns: Latest UButton documentation]
AI: Based on the current v4 API, here's the correct usage...
```

**Example 2: Checking Vue Composable**

```
AI: Let me verify the ref() API before suggesting this code...
[AI calls: check_vue_api({ api: "ref" })]
[Server returns: Vue 3 ref documentation]
AI: According to the official docs...
```

### Tool Descriptions

The server provides clear, directive tool descriptions that guide AI behavior:

> "Check the latest API documentation for a Nuxt UI component. Use this BEFORE suggesting or modifying any Nuxt UI component code (UButton, UCard, UModal, etc.) to ensure you have the current v4 API."

This helps the AI know when and how to use each tool effectively.

## How It Works

1. **Project Detection**: Reads your `package.json` to identify dependencies and versions
   - When installed as a dev dependency, automatically detects your project directory
   - Falls back to `PROJECT_PATH` environment variable if needed
2. **Plugin Activation**: Activates built-in plugins for major frameworks (Nuxt, Vue, React, etc.)
3. **Auto-Discovery**: Scans npm registry for documentation URLs of remaining packages
4. **Dynamic Plugin Creation**: Creates plugins on-the-fly for discovered packages
5. **Resource Loading**: Makes project context available to AI automatically
6. **Tool Registration**: Registers framework-specific documentation tools
7. **On-Demand Fetching**: Fetches and parses documentation when AI needs it
8. **Clean Extraction**: Returns formatted, relevant content to AI

### Why Install as Dev Dependency?

Installing `mcp-project-docs` as a dev dependency in your project has several advantages:

- ✅ **Automatic Path Detection**: No need to manually configure `PROJECT_PATH`
- ✅ **Project-Specific**: Each project can have its own version
- ✅ **Version Control**: Lock the version in your `package.json`
- ✅ **Team Consistency**: Everyone on your team uses the same configuration
- ✅ **Simpler Setup**: Just `npm install --save-dev mcp-project-docs` and configure MCP

## Architecture

```
src/
├── index.ts              # Main MCP server
├── parsers/
│   └── html.ts           # HTML content extraction
├── discovery/
│   ├── package-scanner.ts  # npm registry metadata fetcher
│   ├── docs-crawler.ts     # Documentation site crawler
│   ├── dynamic-plugin.ts   # Auto-generated plugins
│   └── index.ts            # Discovery module exports
└── plugins/
    ├── nuxt.ts           # Nuxt-specific tools
    ├── vue.ts            # Vue-specific tools
    └── react.ts          # React-specific tools (stub)
```

### Plugin System

Each plugin implements:

- `detect(dependencies)`: Returns true if framework is present
- `getTools()`: Returns MCP tool definitions
- `handleToolCall(name, args)`: Handles tool execution
- `getContext(dependencies)`: Returns markdown context

This makes adding new frameworks straightforward.

## Adding Support for New Frameworks

1. Create a new plugin file in `src/plugins/`
2. Implement the `Plugin` interface
3. Add detection logic for the framework
4. Define tools with clear descriptions
5. Implement tool handlers
6. Register plugin in `src/index.ts`

Example skeleton:

```typescript
import { Plugin, ToolDefinition } from './nuxt.js';
import { HtmlParser } from '../parsers/html.js';

export class MyFrameworkPlugin implements Plugin {
  private parser = new HtmlParser();

  detect(dependencies: Record<string, string>): boolean {
    return 'my-framework' in dependencies;
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'check_my_framework_api',
        description: 'Clear description that tells AI when to use this tool',
        inputSchema: {
          type: 'object',
          properties: {
            api: { type: 'string', description: 'API to check' },
          },
          required: ['api'],
        },
      },
    ];
  }

  async handleToolCall(name: string, args: Record<string, unknown>): Promise<string> {
    // Implementation
  }

  getContext(dependencies: Record<string, string>): string {
    return '## My Framework\n\nContext information...';
  }
}
```

## Troubleshooting

### Server won't start

**Problem**: Error about missing `package.json`

**Solution**: Ensure `PROJECT_PATH` environment variable points to a directory containing `package.json`

```bash
# Check if PROJECT_PATH is set correctly
echo $PROJECT_PATH
ls $PROJECT_PATH/package.json
```

### No tools available

**Problem**: AI doesn't see any documentation tools

**Solution**:

1. Check that your project has supported frameworks installed
2. Verify `package.json` includes dependencies like `nuxt`, `vue`, or `react`
3. Restart your MCP client after configuration changes

### Documentation fetch fails

**Problem**: Tool returns "Failed to fetch" error

**Solution**:

1. Check internet connection
2. Verify the documentation URL is accessible
3. Some corporate networks may block certain domains

### Wrong documentation returned

**Problem**: Documentation doesn't match your version

**Solution**: The server fetches current documentation from official sites. If your dependency version is outdated, consider updating it, or manually check documentation for your specific version.

## Development

### Prerequisites

- Node.js 20+
- npm or yarn
- [Doppler CLI](https://docs.doppler.com/docs/install-cli) (for secrets management)

### Setup

```bash
# Clone the repository
git clone https://github.com/loganrenz/nardocs.git
cd nardocs

# Install dependencies
npm install

# Setup Doppler (for secrets management)
doppler login
doppler setup --project nardocs --config dev

# Build
npm run build

# Watch mode (for development)
doppler run -- npm run dev

# Run tests
doppler run -- npm run test

# Run tests with coverage
doppler run -- npm run test:coverage
```

For more details, see:

- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [.github/DOPPLER_SETUP.md](.github/DOPPLER_SETUP.md) - Secrets management setup

### Testing

```bash
# Build the server
npm run build

# Test with a sample project
PROJECT_PATH=/path/to/test/project node build/index.js
```

### Project Structure

- `src/`: TypeScript source code
- `build/`: Compiled JavaScript output
- `package.json`: Project configuration
- `tsconfig.json`: TypeScript configuration

## Requirements

- Node.js 20 or higher
- A project with `package.json`
- Internet connection (for fetching documentation)

## License

MIT

## Contributing

Contributions are welcome! We're especially interested in:

- 🎯 New framework plugins
- 🔧 Improved HTML parsing for documentation sites
- 💾 Caching for frequently accessed docs
- 📱 Offline documentation support
- 🎨 Better error messages and suggestions

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

### Quick Start for Contributors

```bash
# Fork and clone the repo
git clone https://github.com/YOUR_USERNAME/nardocs.git
cd nardocs

# Install dependencies
npm install

# Make your changes and test
npm run test
npm run lint

# Commit using conventional commits
git commit -m "feat: add support for new framework"

# Push and create a PR
git push origin your-branch-name
```

## Credits

Built with:

- [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/sdk) - MCP protocol implementation
- [cheerio](https://github.com/cheeriojs/cheerio) - HTML parsing
- [node-fetch](https://github.com/node-fetch/node-fetch) - HTTP requests
