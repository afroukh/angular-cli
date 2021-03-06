import {CliConfig as CliConfigBase} from './config/config';
import {CliConfig as ConfigInterface} from '../lib/config/schema';
import { oneLine } from 'common-tags';
import * as chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';

import {findUp} from '../utilities/find-up';


export const CLI_CONFIG_FILE_NAME = '.angular-cli.json';
const CLI_CONFIG_FILE_NAME_ALT = 'angular-cli.json';


function getUserHome() {
  return process.env[(process.platform.startsWith('win')) ? 'USERPROFILE' : 'HOME'];
}


const configCacheMap = new Map<string, CliConfigBase<ConfigInterface>>();


export class CliConfig extends CliConfigBase<ConfigInterface> {
  static configFilePath(projectPath?: string): string {
    // Find the configuration, either where specified, in the Angular CLI project
    // (if it's in node_modules) or from the current process.
    return (projectPath && findUp(CLI_CONFIG_FILE_NAME, projectPath))
        || (projectPath && findUp(CLI_CONFIG_FILE_NAME_ALT, projectPath))
        || findUp(CLI_CONFIG_FILE_NAME, process.cwd())
        || findUp(CLI_CONFIG_FILE_NAME_ALT, process.cwd())
        || findUp(CLI_CONFIG_FILE_NAME, __dirname)
        || findUp(CLI_CONFIG_FILE_NAME_ALT, __dirname);
  }

  static globalConfigFilePath(): string {
    let globalConfigPath = path.join(getUserHome(), CLI_CONFIG_FILE_NAME);
    const altGlobalConfigPath = path.join(getUserHome(), CLI_CONFIG_FILE_NAME_ALT);
    if (!fs.existsSync(globalConfigPath) && fs.existsSync(altGlobalConfigPath)) {
      return altGlobalConfigPath;
    }
    return globalConfigPath;
  }

  static fromGlobal(): CliConfig {
    const globalConfigPath = this.globalConfigFilePath();

    if (configCacheMap.has(globalConfigPath)) {
      return configCacheMap.get(globalConfigPath);
    }

    const cliConfig = CliConfigBase.fromConfigPath<ConfigInterface>(globalConfigPath);

    const aliases = [
      cliConfig.alias('apps.0.root', 'defaults.sourceDir'),
      cliConfig.alias('apps.0.prefix', 'defaults.prefix')
    ];

    // Additional aliases which do not emit any messages.
    cliConfig.alias('defaults.interface.prefix', 'defaults.inline.prefixInterfaces');
    cliConfig.alias('defaults.component.inlineStyle', 'defaults.inline.style');
    cliConfig.alias('defaults.component.inlineTemplate', 'defaults.inline.template');
    cliConfig.alias('defaults.component.spec', 'defaults.spec.component');
    cliConfig.alias('defaults.class.spec', 'defaults.spec.class');
    cliConfig.alias('defaults.component.directive', 'defaults.spec.directive');
    cliConfig.alias('defaults.component.module', 'defaults.spec.module');
    cliConfig.alias('defaults.component.pipe', 'defaults.spec.pipe');
    cliConfig.alias('defaults.component.service', 'defaults.spec.service');

    // If any of them returned true, output a deprecation warning.
    if (aliases.some(x => x)) {
      console.error(chalk.yellow(oneLine`
        The "defaults.prefix" and "defaults.sourceDir" properties of .angular-cli.json
        are deprecated in favor of "apps[0].root" and "apps[0].prefix".\n
        Please update in order to avoid errors in future versions of Angular CLI.
      `));
    }

    configCacheMap.set(globalConfigPath, cliConfig);
    return cliConfig;
  }

  static fromProject(projectPath?: string): CliConfig {
    const configPath = this.configFilePath(projectPath);
    if (!configPath || configPath === this.globalConfigFilePath()) {
      return null;
    }
    if (configCacheMap.has(configPath)) {
      return configCacheMap.get(configPath);
    }

    let globalConfigPath = path.join(getUserHome(), CLI_CONFIG_FILE_NAME);
    const altGlobalConfigPath = path.join(getUserHome(), CLI_CONFIG_FILE_NAME_ALT);
    if (!fs.existsSync(globalConfigPath) && fs.existsSync(altGlobalConfigPath)) {
      globalConfigPath = altGlobalConfigPath;
    }

    const cliConfig = CliConfigBase.fromConfigPath<ConfigInterface>(configPath, [globalConfigPath]);

    const aliases = [
      cliConfig.alias('apps.0.root', 'defaults.sourceDir'),
      cliConfig.alias('apps.0.prefix', 'defaults.prefix')
    ];

    // Additional aliases which do not emit any messages.
    cliConfig.alias('defaults.interface.prefix', 'defaults.inline.prefixInterfaces');
    cliConfig.alias('defaults.component.inlineStyle', 'defaults.inline.style');
    cliConfig.alias('defaults.component.inlineTemplate', 'defaults.inline.template');
    cliConfig.alias('defaults.component.spec', 'defaults.spec.component');
    cliConfig.alias('defaults.class.spec', 'defaults.spec.class');
    cliConfig.alias('defaults.component.directive', 'defaults.spec.directive');
    cliConfig.alias('defaults.component.module', 'defaults.spec.module');
    cliConfig.alias('defaults.component.pipe', 'defaults.spec.pipe');
    cliConfig.alias('defaults.component.service', 'defaults.spec.service');

    // If any of them returned true, output a deprecation warning.
    if (aliases.some(x => x)) {
      console.error(chalk.yellow(oneLine`
        The "defaults.prefix" and "defaults.sourceDir" properties of .angular-cli.json
        are deprecated in favor of "apps[0].root" and "apps[0].prefix".\n
        Please update in order to avoid errors in future versions of Angular CLI.
      `));
    }

    configCacheMap.set(configPath, cliConfig);
    return cliConfig as CliConfig;
  }
}
