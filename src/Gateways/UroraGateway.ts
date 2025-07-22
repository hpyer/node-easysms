'use strict';

import { GatewayErrorException } from "../Core/Exceptions/GatewayErrorException";
import { Gateway } from "../Core/Gateway";
import { Message } from "../Core/Message";
import { PhoneNumber } from "../Core/PhoneNumber";

/**
 * 极光短信服务
 * @see [发送单条模板短信](https://docs.jiguang.cn/jsms/server/rest_api_jsms)
 */
export class UroraGateway extends Gateway<UroraGatewayConfig> {

  public static ENDPOINT_DOMAIN: string = 'api.sms.jpush.cn';
  public static ENDPOINT_VERSION: string = 'v1';

  async send(to: PhoneNumber, message: Message) {

    let template = (await message.getTemplate(this)) ?? this.config.template ?? '';
    let data = (await message.getData(this)) ?? {};
    let sign = (await message.getSignName(this)) ?? this.config.sign_name ?? '';

    let method = 'messages';
    let params = {
      mobile: to.getUniversalNumber(),
      sign_id: sign,
      temp_id: template,
      temp_para: data,
    };

    let result = await this.post(this.buildEndpoint(method), params, {
      'Authorization': this.generateAuthorization(this.config),
      'Content-Type': 'application/json',
    });

    if (result['code']) {
      throw new GatewayErrorException(result['message'], result);
    }

    return result;
  }

  /**
   * 生成授权信息
   * @param config 极光短信配置
   * @returns
   */
  generateAuthorization(config: UroraGatewayConfig) {
    let authStr = `${config.app_key}:${config.app_secret}`;
    return 'Basic ' + Buffer.from(authStr, 'utf-8').toString('base64');
  }

  protected buildEndpoint(method: string) {
    return `https://${UroraGateway.ENDPOINT_DOMAIN}/${UroraGateway.ENDPOINT_VERSION}/${method}`;
  }

}
