import * as webpack from 'webpack';
const webpackMerge = require('webpack-merge');

import { BuildOptions } from './build-options';
import { NgCliWebpackConfig } from './webpack-config';
import {
  getCommonConfig,
  getStylesConfig,
  getNonAotTestConfig,
  getTestConfig
} from './webpack-configs';

export interface WebpackTestOptions extends BuildOptions {
  codeCoverage?: boolean;
}
export class WebpackTestConfig extends NgCliWebpackConfig {
  constructor(private testOptions: WebpackTestOptions) {
    super(testOptions);
  }

  public buildConfig() {
    let webpackConfigs = [
      getCommonConfig(this.wco),
      getStylesConfig(this.wco),
      this.getTargetConfig(this.wco),
      getNonAotTestConfig(this.wco),
      getTestConfig(this.testOptions)
    ];

    this.config = webpackMerge(webpackConfigs);

    // Remove any instance of CommonsChunkPlugin, not needed with karma-webpack.
    this.config.plugins = this.config.plugins.filter((plugin: any) =>
      !(plugin instanceof webpack.optimize.CommonsChunkPlugin));

    return this.config;
  }
}
