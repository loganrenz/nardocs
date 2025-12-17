# Contributing to MCP Project Docs

Thank you for your interest in contributing to MCP Project Docs! This document provides guidelines and instructions for contributing.

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please be respectful and constructive in all interactions.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/loganrenz/nardocs/issues)
2. If not, create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (Node.js version, OS, etc.)
   - Relevant logs or error messages

### Suggesting Features

1. Check [Issues](https://github.com/loganrenz/nardocs/issues) for similar suggestions
2. Create a new issue describing:
   - The problem you're trying to solve
   - Your proposed solution
   - Any alternatives you've considered
   - Examples of how it would be used

### Adding Framework Support

We welcome plugins for new frameworks! Here's how:

1. **Create a plugin file** in `src/plugins/your-framework.ts`
2. **Implement the Plugin interface**:
   ```typescript
   export class YourFrameworkPlugin implements Plugin {
     detect(dependencies: Record<string, string>): boolean {
       // Return true if framework is in dependencies
     }

     getTools(): ToolDefinition[] {
       // Return MCP tool definitions
     }

     async handleToolCall(name: string, args: Record<string, unknown>): Promise<string> {
       // Handle tool execution
     }

     getContext(dependencies: Record<string, string>): string {
       // Return markdown context
     }
   }
   ```
3. **Register your plugin** in `src/index.ts`
4. **Add tests** for your plugin
5. **Update documentation** in README.md

### Pull Request Process

1. **Fork the repository** and create a new branch from `main`

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards:
   - Write clear, documented code
   - Follow existing code style
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**:

   ```bash
   npm run lint          # Check code style
   npm run typecheck     # Verify TypeScript
   npm run test          # Run tests
   npm run build         # Ensure it builds
   ```

4. **Commit with conventional commits**:

   ```bash
   git commit -m "feat: add support for framework X"
   git commit -m "fix: resolve documentation parsing issue"
   git commit -m "docs: update installation instructions"
   ```

   Commit types:
   - `feat`: New feature
   - `fix`: Bug fix
   - `docs`: Documentation changes
   - `style`: Code style changes (formatting, etc.)
   - `refactor`: Code refactoring
   - `test`: Adding or updating tests
   - `chore`: Maintenance tasks

5. **Push and create a Pull Request**:

   ```bash
   git push origin feature/your-feature-name
   ```

6. **Describe your PR**:
   - What changes you made
   - Why you made them
   - How to test them
   - Any breaking changes
   - Screenshots (if UI changes)

7. **Wait for review** - Maintainers will review and may request changes

## Development Setup

### Prerequisites

- Node.js >= 20.0.0
- npm or yarn
- Git

### Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/nardocs.git
cd nardocs

# Install dependencies
npm install

# Build
npm run build

# Run in development mode
npm run dev

# Run tests
npm run test

# Run with a test project
PROJECT_PATH=/path/to/test/project node build/index.js
```

### Project Structure

```
src/
├── index.ts           # Main MCP server
├── parsers/
│   └── html.ts       # HTML content extraction
└── plugins/
    ├── nuxt.ts       # Nuxt plugin
    ├── vue.ts        # Vue plugin
    ├── nextjs.ts     # Next.js plugin
    └── ...           # Other framework plugins
```

## Coding Standards

### TypeScript

- Use TypeScript strict mode
- Define proper types (avoid `any`)
- Use meaningful variable names
- Add JSDoc comments for public APIs

### Code Style

- Run `npm run format` before committing
- Follow existing patterns in the codebase
- Keep functions focused and small
- Write self-documenting code

### Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Aim for good coverage of critical paths

### Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for public APIs
- Include examples in plugin documentation
- Update CHANGELOG.md (handled by semantic-release)

## Release Process

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) for automated versioning and publishing.

- Commits to `main` trigger automatic releases
- Version numbers are determined by commit messages
- CHANGELOG.md is automatically generated
- npm and GitHub releases are created automatically

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

Examples:

```
feat(nuxt): add support for Nuxt UI v4 components

docs: update installation instructions

fix(parser): handle malformed HTML gracefully

BREAKING CHANGE: minimum Node.js version is now 20
```

## Questions?

Feel free to:

- Open an issue for discussion
- Ask questions in pull requests
- Reach out to maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
