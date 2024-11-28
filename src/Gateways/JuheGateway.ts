'use strict';

import { GatewayErrorException } from "../Core/Exceptions/GatewayErrorException";
import { Gateway } from "../Core/Gateway";
import { Message } from "../Core/Message";
import { PhoneNumber } from "../Core/PhoneNumber";

/**
 * 聚合数据短信服务
 * @see https://www.juhe.cn/docs/api/id/54
 */
export class JuheGateway extends Gateway<JuheGatewayConfig> {

  public static ENDPOINT_URL: string = 'http://v.juhe.cn/sms/send';

  async send(to: PhoneNumber, message: Message) {

    let template = await message.getTemplate(this);
    let data = await message.getData(this);

    let params = {
      key: this.config['app_key'],
      mobile: to.getNumber(),
      tpl_id: template,
      vars: JSON.stringify(data),
      dtype: 'json',
    };

    let result = await this.postJson(JuheGateway.ENDPOINT_URL, params);

    if (result['error_code']) {
      throw new GatewayErrorException(result['reason'], result);
    }

    return result;
  }

}
