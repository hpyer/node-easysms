'use strict';

import GatewayErrorException from "../Core/Exceptions/GatewayErrorException";
import Gateway from "../Core/Gateway";
import Message from "../Core/Message";
import PhoneNumber from "../Core/PhoneNumber";
import { YunpianGatewayConfig } from "../Types/global";

/**
 * 云片短信服务
 * @see [按内容发送](https://www.yunpian.com/doc/zh_CN/domestic/single_send.html)
 * @see [按模板发送](https://www.yunpian.com/doc/zh_CN/domestic/tpl_single_send.html)
 */
export default class YunpianGateway extends Gateway<YunpianGatewayConfig> {

  public static ENDPOINT_DOMAIN: string = 'sms.yunpian.com';
  public static ENDPOINT_VERSION: string = 'v2';

  async send(to: PhoneNumber, message: Message) {

    let template = await message.getTemplate(this);

    let func = 'single_send';
    let domain = this.config['domain'] ?? YunpianGateway.ENDPOINT_DOMAIN;

    let params = {
      apikey: this.config['api_key'],
      mobile: to.getUniversalNumber(),
    };

    if (template) {
      func = 'tpl_single_send';

      let data = [];
      let templateData = await message.getData(this);
      if (templateData) {
        for (let key in templateData) {
          data.push(encodeURIComponent(`#${key}#`) + '=' + encodeURIComponent(templateData[key]));
        }
      }
      params['tpl_id'] = template;
      params['tpl_value'] = data.join('&');
    }
    else {
      let content = await message.getContent(this);
      if (!(/^【.+】.+/.test(content))) {
        let signName = (await message.getSignName(this)) ?? this.config['sign_name'] ?? '';
        content = signName + content;
      }
      params['text'] = content;
    }

    let result = await this.postJson(this.buildEndpoint(func, domain), params);

    if (result['code']) {
      throw new GatewayErrorException(result['msg'], result);
    }

    return result;
  }

  protected buildEndpoint(func: string, domain: string) {
    return `https://${domain}/${YunpianGateway.ENDPOINT_VERSION}/sms/${func}.json`;
  }

}
