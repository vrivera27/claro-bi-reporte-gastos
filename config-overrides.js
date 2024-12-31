const webpack = require('webpack');

module.exports = function override(config) {
  if (!config.resolve.fallback) {
    config.resolve.fallback = {};
  }

  config.resolve.fallback.stream = require.resolve('stream-browserify');
  config.resolve.fallback.crypto = require.resolve('crypto-browserify');
  config.resolve.fallback.buffer = require.resolve('buffer');
  config.resolve.fallback.fs = false;
  config.resolve.fallback.path = require.resolve('path-browserify');
  config.resolve.fallback.util = require.resolve('util/');
  config.resolve.fallback.querystring = require.resolve('querystring-es3');
  config.resolve.fallback.child_process = false;
  config.resolve.fallback.os = require.resolve('os-browserify/browser');
  config.resolve.fallback.http = require.resolve('stream-http');
  config.resolve.fallback.https = require.resolve('https-browserify');
  config.resolve.fallback.url = require.resolve('url/');
  config.resolve.fallback.net = false;
  config.resolve.fallback.tls = false; // <-- Desactiva tls en el browser
  config.resolve.fallback.assert = require.resolve('assert/');

  config.resolve.plugins = config.resolve.plugins.filter(
    (plugin) => plugin.constructor.name !== 'ModuleScopePlugin'
  );

  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    })
  );

  return config;
};
