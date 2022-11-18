'use strict';

import { MessengerException, MessengerResult } from "../../Types/global";
import Exception from "./Exception";

export default class NoGatewayAvailableException extends Exception {

  protected results: MessengerResult[] = [];
  protected exceptions: MessengerException = {};

  constructor(results: MessengerResult[]) {
    super('All the gateways have failed. You can get error details by `exception.getExceptions()`');

    this.results = results;
    this.exceptions = {};
    for (let result of results) {
      this.exceptions[result.gateway] = result.exception;
    }
  }

  /**
   * 获取发送结果
   * @returns
   */
  getResults() {
    return this.results;
  }

  /**
   * 获取某个网关的异常信息
   * @returns
   */
  getException(gateway: string) {
    return this.exceptions[gateway] ?? null;
  }

  /**
   * 获取所有网关的异常信息
   * @returns
   */
  getExceptions() {
    return this.exceptions;
  }

  /**
   * 获取最后一个网关的异常信息
   * @returns
   */
  getLastException() {
    return this.exceptions[this.results[this.results.length - 1].gateway];
  }
}
