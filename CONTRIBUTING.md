# Contributing to deploy-mcp

Thank you for your interest in contributing to deploy-mcp! We welcome contributions from the community and are grateful for your support.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How to Contribute

### Reporting Issues

Before creating an issue, please:

1. **Check existing issues** to avoid duplicates
2. **Use the issue templates** when available
3. **Provide clear, detailed information** including:
   - Steps to reproduce the problem
   - Expected behavior
   - Actual behavior
   - Environment details (OS, Node.js version, etc.)

### Suggesting Features

We welcome feature suggestions! Please:

1. **Check existing feature requests** first
2. **Open a discussion** before implementing large features
3. **Explain the use case** and why it would benefit users
4. **Consider the scope** - smaller, focused features are easier to review

### Development Setup

1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/your-username/deploy-mcp.git
   cd deploy-mcp
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Run tests**:
   ```bash
   npm test
   ```

### Making Changes

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**:
   - Follow existing code style and conventions
   - Add tests for new functionality
   - Update documentation as needed

3. **Run quality checks**:
   ```bash
   npm run lint          # Check for linting errors
   npm run type-check    # TypeScript type checking
   npm run format        # Format code
   npm test              # Run tests
   ```

4. **Commit your changes**:
   - Use [Conventional Commits](https://conventionalcommits.org/) format
   - Examples:
     - `feat: add support for Railway platform`
     - `fix: handle API timeout errors properly`
     - `docs: update installation instructions`

### Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new functionality
3. **Ensure all checks pass**:
   - All tests pass
   - No linting errors
   - TypeScript compiles without errors
   - No security vulnerabilities

4. **Create the pull request**:
   - Use a descriptive title
   - Reference any related issues
   - Provide a clear description of changes
   - Include screenshots for UI changes

5. **Respond to feedback**:
   - Address reviewer comments promptly
   - Make requested changes
   - Keep the PR up to date with main branch

## Development Guidelines

### Code Style

- **TypeScript**: Use strict TypeScript throughout
- **ESLint + Prettier**: Follow the configured rules
- **Naming**: Use descriptive names for variables and functions
- **Comments**: Add comments for complex logic, avoid obvious comments

### Testing

- **Unit tests**: Test individual functions and classes
- **Integration tests**: Test adapter functionality
- **Mocking**: Use Vitest mocking for external dependencies
- **Coverage**: Aim for good test coverage of new code

### Platform Adapters

When adding support for new deployment platforms:

1. **Create adapter folder**: `src/adapters/platform-name/`
2. **Implement interface**: Extend `BaseAdapter` class
3. **Add types**: Define platform-specific types
4. **Add tests**: Create comprehensive test suite
5. **Update documentation**: Add configuration examples

### Commit Guidelines

We use [Conventional Commits](https://conventionalcommits.org/):

- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or modifying tests
- `chore`: Maintenance tasks

### Release Process

Releases are handled by maintainers:

1. Version bumping follows [Semantic Versioning](https://semver.org/)
2. Changelog is automatically generated
3. NPM package is published automatically
4. GitHub releases are created with release notes

## Getting Help

- **Documentation**: Check the [README](README.md) first
- **Discussions**: Use GitHub Discussions for questions
- **Issues**: Create an issue for bugs or feature requests
- **Email**: Contact alex.potapenko.dev@gmail.com for security issues

## Recognition

Contributors are recognized in several ways:

- Listed in the contributors section
- Mentioned in release notes for significant contributions
- Added to the GitHub contributors graph

Thank you for contributing to deploy-mcp!