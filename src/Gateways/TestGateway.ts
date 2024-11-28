'use strict';

import { Gateway } from "../Core/Gateway";
import { Message } from "../Core/Message";
import { PhoneNumber } from "../Core/PhoneNumber";

/**
 * 测试网关
 */
export class TestGateway extends Gateway<TestGatewayConfig> {

  async send(to: PhoneNumber, message: Message) {
    if (!!this.config.log) {
      console.log('TestGateway', to, message);
    }

    return {
      status: 'service-ok',
    };
  }
}
