const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files in the monorepo workspace
config.watchFolders = [workspaceRoot];

// 2. Search for node_modules in both local and workspace root directories
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Enable hierarchical lookup so Metro can resolve transitive dependencies correctly through pnpm symlinks
config.resolver.disableHierarchicalLookup = false;

module.exports = config;
