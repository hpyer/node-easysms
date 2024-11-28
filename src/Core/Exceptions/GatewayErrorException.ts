'use strict';

export class GatewayErrorException implements Exception {

  name: string;
  message: string;
  stack?: string;
  raw: Record<string, any> = {};

  constructor(message: string, raw: Record<string, any>) {
    this.message = message;
    this.raw = raw;
  }

  /**
   * 获取发送结果
   * @returns
   */
  getRaw() {
    return this.raw;
  }

}
