const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const config = getDefaultConfig(__dirname);

// ── Missing-image sentinel ────────────────────────────────────────────────────
// If a logo PNG is deleted or renamed Metro would normally fail the entire
// bundle.  Instead, any unresolvable image asset is silently remapped to the
// 1×1 transparent sentinel at assets/images/no-logo.png so the bundle still
// succeeds.  App code compares the resolved module ID against the NO_LOGO
// export from that same file and renders a coloured badge fallback instead of
// crashing.
const NO_LOGO_PATH = path.resolve(__dirname, 'assets/images/no-logo.png');

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  try {
    return originalResolveRequest
      ? originalResolveRequest(context, moduleName, platform)
      : context.resolveRequest(context, moduleName, platform);
  } catch (err) {
    if (/\.(png|jpe?g|gif|webp)$/i.test(moduleName)) {
      return { type: 'sourceFile', filePath: NO_LOGO_PATH };
    }
    throw err;
  }
};

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
