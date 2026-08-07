const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Replit's temporary skill workspaces can disappear while Metro is watching
// them, which crashes the bundler with an ENOENT watcher error.
const defaultBlockList = config.resolver.blockList;
const defaultBlockPatterns = Array.isArray(defaultBlockList)
  ? defaultBlockList
  : defaultBlockList
    ? [defaultBlockList]
    : [];

config.resolver.blockList = new RegExp(
  [
    /\/\.local\/skills\/\.tmp-.*/,
    ...defaultBlockPatterns,
  ]
    .map((pattern) => pattern.source)
    .join('|'),
);

module.exports = config;
