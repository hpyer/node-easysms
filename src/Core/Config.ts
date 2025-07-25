'use strict';

import { merge } from "./Support/Utils";

/**
 * 配置对象
 */
export class Config
{
  protected config: EasySmsConfig = {
    default: {
      gateways: ['test'],
      strategy: 'order',
    },
    gateways: {},
  };

  constructor(config: EasySmsConfig = null)
  {
    if (config) {
      this.config = {
        default: {
          gateways: config.default && config.default.gateways ? config.default.gateways : ['test'],
          strategy: config.default && config.default.strategy ? config.default.strategy : 'order',
        },
        gateways: merge({}, config.gateways),
      };
    }
  }

  get(key: string = null, defaultValue: any = null): any
  {
    let config = merge({}, this.config);

    if (!key) {
      return config;
    }

    if (typeof config[key] != 'undefined') {
      return config[key];
    }

    if (key.indexOf('.') > -1) {
      let keys = key.split('.');
      for (let i=0; i<keys.length; i++) {
        let k = keys[i];
        if (typeof config != 'object' || typeof config[k] == 'undefined') {
          return defaultValue;
        }

        config = config[k];
      }
      return config;
    }
    else {
      return defaultValue;
    }
  }

  set(key: string, value: any): object
  {
    if (!key) {
      throw new Error('Invalid config key.');
    }

    let keys = key.split('.');
    let config = this.config as any;

    while(keys.length > 1) {
      key = keys.shift();
      if (typeof config[key] == 'undefined' || typeof config[key] != 'object') {
        config[key] = {};
      }
      config = config[key];
    }

    config[keys.shift()] = value;

    return config;
  }

  has(key: string): boolean
  {
    return !!this.get(key);
  }

  offsetExists(key: string): boolean
  {
    return typeof this.config[key] == 'undefined';
  }

  offsetGet(key: string): any
  {
    return this.get(key);
  }

  offsetSet(key: string, value: any)
  {
    this.set(key, value);
  }

  offsetUnset(key: string)
  {
    this.set(key, null);
  }

  toString()
  {
    return JSON.stringify(this);
  }

};
