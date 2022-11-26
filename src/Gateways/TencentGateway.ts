'use strict';

import GatewayErrorException from "../Core/Exceptions/GatewayErrorException";
import Gateway from "../Core/Gateway";
import Message from "../Core/Message";
import PhoneNumber from "../Core/PhoneNumber";
import { createHash, createHmac, timestamp, timestampUTC } from "../Core/Support/Utils";
import { TencentGatewayConfig } from "../Types/global";

/**
 * 腾讯云短信服务
 * @see https://cloud.tencent.com/document/product/382/55981
 */
export default class TencentGateway extends Gateway<TencentGatewayConfig> {

  public static ENDPOINT_URL: string = 'https://sms.tencentcloudapi.com';
  public static ENDPOINT_HOST: string = 'sms.tencentcloudapi.com';
  public static ENDPOINT_SERVICE: string = 'sms';
  public static ENDPOINT_METHOD: string = 'SendSms';
  public static ENDPOINT_VERSION: string = '2021-01-11';
  public static ENDPOINT_FORMAT: string = 'json';

  async send(to: PhoneNumber, message: Message) {
    let data = await message.getData(this);
    let signName = (await message.getSignName(this)) ?? this.config['sign_name'] ?? '';

    let phone = to.getUniversalNumber();
    let params = {
      PhoneNumberSet: [phone],
      SmsSdkAppId: this.config['sdk_app_id'],
      SignName: signName,
      TemplateId: await message.getTemplate(this),
      TemplateParamSet: Object.values(data) || [],
    };

    let time = timestamp();

    let result = await this.postJson(TencentGateway.ENDPOINT_URL, params, {
      Authorization: this.generateSign(params, time),
      Host: TencentGateway.ENDPOINT_HOST,
      'X-TC-Action': TencentGateway.ENDPOINT_METHOD,
      'X-TC-Region': this.config['region'] || 'ap-guangzhou',
      'X-TC-Timestamp': time,
      'X-TC-Version': TencentGateway.ENDPOINT_VERSION,
    });

    if (result['Response']['Error'] && result['Response']['Error']['Code']) {
      throw new GatewayErrorException(result['Response']['Error']['Message'], result);
    }
    if (result['Response']['SendStatusSet']) {
      for (let set of result['Response']['SendStatusSet']) {
        if (set['Code'] !== 'OK') {
          throw new GatewayErrorException(set['Message'], result);
        }
      }
    }

    return result;
  }

  generateSign(params: Record<string, any>, time: string) {
    let date = timestampUTC('YYYY-MM-DD', new Date(parseInt(time + '000')));
    let secretKey = this.config['secret_key'];
    let secretId = this.config['secret_id'];

    let CanonicalURI = '/';
    let CanonicalQueryString = '';

    let canonicalRequest = `POST
${CanonicalURI}
${CanonicalQueryString}
content-type:application/json; charset=utf-8
host:${TencentGateway.ENDPOINT_HOST}

content-type;host
${createHash(JSON.stringify(params), 'sha256')}`;

    let stringToSign = `TC3-HMAC-SHA256
${time}
${date}/${TencentGateway.ENDPOINT_SERVICE}/tc3_request
${createHash(canonicalRequest, 'sha256')}`;

    let secretDate = createHmac(date, `TC3${secretKey}`, 'sha256', null);
    let secretService = createHmac(TencentGateway.ENDPOINT_SERVICE, secretDate, 'sha256', null);
    let secretSigning = createHmac('tc3_request', secretService, 'sha256', null);

    let signature = createHmac(stringToSign, secretSigning, 'sha256');

    return 'TC3-HMAC-SHA256'
      + ` Credential=${secretId}/${date}/${TencentGateway.ENDPOINT_SERVICE}/tc3_request`
      + `, SignedHeaders=content-type;host, Signature=${signature}`;
  }

}
