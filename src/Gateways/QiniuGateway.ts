'use strict';

import URL from "url";
import { GatewayErrorException } from "../Core/Exceptions/GatewayErrorException";
import { Gateway } from "../Core/Gateway";
import { Message } from "../Core/Message";
import { PhoneNumber } from "../Core/PhoneNumber";
import { createHmac } from "../Core/Support/Utils";

/**
 * 七牛云短信服务
 * @see https://developer.qiniu.com/sms/5897/sms-api-send-message
 */
export class QiniuGateway extends Gateway<QiniuGatewayConfig> {

  public static ENDPOINT_URL: string = 'https://sms.qiniuapi.com/v1/message/single';

  async send(to: PhoneNumber, message: Message) {

    let params = {
      mobile: to.getNumber(),
      template_id: await message.getTemplate(this),
    };

    let data = await message.getData(this);
    if (data) {
      params['parameters'] = data;
    }

    let signName = (await message.getSignName(this)) ?? this.config['sign_name'] ?? '';
    if (signName) {
      params['signature_id'] = signName;
    }

    let headers = {
      'Content-Type': 'application/json',
    };

    headers['Authorization'] = this.generateSign(QiniuGateway.ENDPOINT_URL, 'POST', JSON.stringify(params), headers['Content-Type']);

    let result = await this.postJson(QiniuGateway.ENDPOINT_URL, params, headers);

    if (result['error']) {
      throw new GatewayErrorException(result['message'], result);
    }

    return result;
  }

  protected generateSign(url: string, method: string, body: string, contentType: string) {
    let parsedUrl = URL.parse(url);

    let queryString = parsedUrl.query ? `?${parsedUrl.query}` : '';
    let port = parsedUrl.port ? `:${parsedUrl.port}` : '';
    body = body ?? '';

    let signString = `${method.toUpperCase()} ${parsedUrl.path}${queryString}
Host: ${parsedUrl.host}${port}
Content-Type: ${contentType}

${body}`;

    let signature = createHmac(signString, this.config['secret_key'], 'sha1', 'base64');

    signature = signature.replace(/\+/g, '-').replace(/\//g, '_');

    return `Qiniu ${this.config['access_key']}:${signature}`;
  }

}
