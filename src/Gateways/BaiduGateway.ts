'use strict';

import { GatewayErrorException } from "../Core/Exceptions/GatewayErrorException";
import { Gateway } from "../Core/Gateway";
import { Message } from "../Core/Message";
import { PhoneNumber } from "../Core/PhoneNumber";
import { createHmac, timestampUTC, trim } from "../Core/Support/Utils";

/**
 * 百度云短信服务
 * @see https://cloud.baidu.com/doc/SMS/s/lkijy5wvf
 */
export class BaiduGateway extends Gateway<BaiduGatewayConfig> {

  public static ENDPOINT_HOST: string = 'smsv3.bj.baidubce.com';
  public static ENDPOINT_METHOD: string = '/api/v3/sendSms';
  public static ENDPOINT_VERSION: string = 'bce-auth-v1';
  public static ENDPOINT_FORMAT: string = 'json';

  async send(to: PhoneNumber, message: Message) {
    let data = await message.getData(this);
    let signName = (await message.getSignName(this)) ?? this.config['sign_name'] ?? '';

    let mobile = to.getNumber();
    let params = {
      signatureId: signName,
      mobile,
      template: await message.getTemplate(this),
      contentVar: data,
    };

    if (params['contentVar']['custom']) {
      params['custom'] = params['contentVar']['custom'];
      delete params['contentVar']['custom'];
    }
    if (params['contentVar']['userExtId']) {
      params['userExtId'] = params['contentVar']['userExtId'];
      delete params['contentVar']['userExtId'];
    }

    let time = timestampUTC('YYYY-MM-DD\THH:mm:ss\Z');

    let headers = {
      host: this.getDomain(),
      'x-bce-date': time,
    };

    headers['Authorization'] = this.generateSign(headers, time);

    let result = await this.postJson(this.getEndpointUrl(), params, headers);

    if (result['code'] !== '1000') {
      throw new GatewayErrorException(result['message'], result);
    }

    return result;
  }

  protected getDomain() {
    return this.config['domain'] ?? BaiduGateway.ENDPOINT_HOST;
  }

  protected getEndpointUrl() {
    return `http://${this.getDomain()}${BaiduGateway.ENDPOINT_METHOD}`;
  }

  protected generateSign(headers: Record<string, any>, time: string) {
    let authString = `${BaiduGateway.ENDPOINT_VERSION}/${this.config['ak']}/${time}/1800`;

    let signingKey = createHmac(authString, this.config['sk'], 'sha256');

    // 生成标准化 URI
    // 根据 RFC 3986，除了：1.大小写英文字符 2.阿拉伯数字 3.点'.'、波浪线'~'、减号'-'以及下划线'_' 以外都要编码
    let canonicalURI = encodeURIComponent(BaiduGateway.ENDPOINT_METHOD).replace(/%2F/g, '/');

    let canonicalQueryString = '';

    let signedHeaders = trim(Object.keys(headers).join(';')).toLowerCase();

    let canonicalHeader = this.getCanonicalHeaders(headers);

    let canonicalRequest = `POST\n${canonicalURI}\n${canonicalQueryString}\n${canonicalHeader}`;

    let signature = createHmac(canonicalRequest, signingKey, 'sha256');

    return `${authString}/${signedHeaders}/${signature}`;
  }

  protected getCanonicalHeaders(headers: Record<string, any>) {
    let headerStrings = [];
    for (let key in headers) {
      headerStrings.push(
        encodeURIComponent(trim(key).toLowerCase()) + ':' + encodeURIComponent(trim(headers[key]))
      );
    }
    headerStrings.sort();
    return headerStrings.join('\n');
  }

}
