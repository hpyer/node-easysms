'use strict';

import Exception from "./Exception";

export default class GatewayErrorException extends Exception {

  public raw: Record<string, any> = {};

  constructor(message: string, raw: Record<string, any>) {
    super(message);

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
