'use strict';

import GatewayErrorException from "../Core/Exceptions/GatewayErrorException";
import GatewayInterface from "../Core/Gateway";
import Message from "../Core/Message";
import PhoneNumber from "../Core/PhoneNumber";
import { createHmac, randomString, timestampUTC } from "../Core/Support/Utils";
import { GatewayConfig } from "../Types/global";

export default class AliyunGateway extends GatewayInterface {

  public static ENDPOINT_URL: string = 'http://dysmsapi.aliyuncs.com';
  public static ENDPOINT_METHOD: string = 'SendSms';
  public static ENDPOINT_VERSION: string = '2017-05-25';
  public static ENDPOINT_FORMAT: string = 'JSON';
  public static ENDPOINT_SIGNATURE_METHOD: string = 'HMAC-SHA1';
  public static ENDPOINT_SIGNATURE_VERSION: string = '1.0';

  async send(to: PhoneNumber, message: Message, config: GatewayConfig) {
    let data = await message.getData(this);
    let signName = data['sign_name'] ?? config['sign_name'] ?? '';
    delete data['sign_name'];

    let query = {
      RegionId: config['region'] || 'cn-hangzhou',
      AccessKeyId: config['access_key_id'] || '',
      Format: AliyunGateway.ENDPOINT_FORMAT,
      SignatureMethod: AliyunGateway.ENDPOINT_SIGNATURE_METHOD,
      SignatureVersion: AliyunGateway.ENDPOINT_SIGNATURE_VERSION,
      SignatureNonce: randomString(),
      Timestamp: timestampUTC('YYYY-MM-DD\THH:mm:ss\Z'),
      Action: AliyunGateway.ENDPOINT_METHOD,
      Version: AliyunGateway.ENDPOINT_VERSION,
      PhoneNumbers: to.getIDDCode() ? to.getZeroPrefixedNumber() : to.getNumber(),
      SignName: signName,
      TemplateCode: await message.getTemplate(this),
      TemplateParam: JSON.stringify(data),
    };

    query['Signature'] = this.generateSign(query, config['access_key_secret']);

    let result = await this.get(AliyunGateway.ENDPOINT_URL, query);

    if ('OK' !== result['Code']) {
      throw new GatewayErrorException(result['Message'], result);
    }

    return result;
  }

  generateSign(params: Record<string, any>, key: string) {
    let paramsString = '';
    let sparator = '';
    let keys = Object.keys(params);
    keys = keys.sort();
    for (let i = 0; i < keys.length; i++) {
      paramsString += sparator + keys[i] + '=' + params[keys[i]];
      sparator = '&';
    }
    if (key) {
      paramsString += '&key=' + key;
    }
    paramsString = 'GET&%2F&' + encodeURIComponent(paramsString);
    paramsString = paramsString.replace(/%7E/g, '~');
    let sign = createHmac(paramsString, key, 'sha1', 'base64');
    return (sign + '').toUpperCase();
  }

}
