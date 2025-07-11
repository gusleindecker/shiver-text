# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-07-11

### Added

- New `createShiverText` factory function that returns an instance with explicit `start`, `stop`, and `setText` methods for controlling the animation.
- Support for a new `scrambleRange` option to customize the number of characters that will appear in the animation effect.
- A standalone HTML example (`examples/vanilla-js.html`) to demonstrate usage in a vanilla JavaScript environment.

### Changed

- **BREAKING CHANGE**: The library has been refactored to a functional approach. The `new ShiverText()` constructor is replaced by the `createShiverText()` factory function.
- The `README.md` has been completely revised and expanded with updated usage instructions, API references, and new examples for vanilla JS, React, and Vue.
- Build configuration was enhanced to produce separate UMD, ES module, and TypeScript declaration outputs.
- Package metadata, scripts, and dependencies were updated.
- `.gitignore` was updated to exclude macOS system files.

### Removed

- The class-based `ShiverText` implementation has been removed in favor of the functional approach.
