var path = require('path');
const { override, addWebpackPlugin, overrideDevServer } = require('customize-cra')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const TerserPlugin = require("terser-webpack-plugin");
const fs = require('fs');

const addDevServerConfig = () => config => {
  return {
    ...config,
    client: {
      overlay: false
    }
  };
}

const packagesPath = path.resolve(__dirname, '../../packages');
const srcPath = path.resolve(__dirname, 'src');
// 添加 node_modules 中 @tsdaodao 包的路径
const tsdaodaoModulesPath = path.resolve(__dirname, '../../node_modules/@tsdaodao');

module.exports = {
  webpack: function (config, env) {
    if (process.env.NODE_ENV === 'production') {
      config.devtool = false;
    }
    if (env === 'production') {
      config.optimization = {
        minimize: true,
        minimizer: [new TerserPlugin()],
      };
    }

    // 手动修改 webpack 规则
    config.module.rules.forEach(rule => {
      if (rule.oneOf) {
        rule.oneOf.forEach(oneOfRule => {
          // 找到处理 JS/TS 的 babel-loader 规则
          if (
            oneOfRule.test &&
            oneOfRule.test.toString().includes('tsx') &&
            oneOfRule.include
          ) {
            // 扩展 include 以包含 packages 目录和 node_modules/@tsdaodao
            oneOfRule.include = [srcPath, packagesPath, tsdaodaoModulesPath];
          }
        });
      }
    });

    return Object.assign(
      config,
      override(
        // 判断环境变量ANALYZER参数的值
        process.env.ANALYZER && addWebpackPlugin(new BundleAnalyzerPlugin())
      )(config, env)
    )
  },
  devServer: overrideDevServer(addDevServerConfig())
}