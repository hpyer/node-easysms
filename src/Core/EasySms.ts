'use strict';

import Axios, { AxiosInstance } from "axios";
import { OrderStrategy } from "./Strategies/OrderStrategy";
import { RandomStrategy } from "./Strategies/RandomStrategy";
import { Config } from "./Config";
import { Gateway } from "./Gateway";
import { Message } from "./Message";
import { Messenger } from "./Messenger";
import { PhoneNumber } from "./PhoneNumber";
import { isGatewayConstructable } from "./Support/Utils";
import { TestGateway } from "../Gateways/TestGateway";
import { AliyunGateway } from "../Gateways/AliyunGateway";
import { TencentGateway } from "../Gateways/TencentGateway";
import { BaiduGateway } from "../Gateways/BaiduGateway";
import { QiniuGateway } from "../Gateways/QiniuGateway";
import { YunpianGateway } from "../Gateways/YunpianGateway";
import { JuheGateway } from "../Gateways/JuheGateway";
import { UroraGateway } from "../Gateways/UroraGateway";

/**
 * EasySms
 */
export class EasySms {

  protected config: Config = null;
  protected customCreators: CustomGatewayCreators = {};
  protected createdGateways: CreatedGateways = {};
  protected supportGateways: SupportGateways = {
    test: TestGateway,
    aliyun: AliyunGateway,
    tencent: TencentGateway,
    baidu: BaiduGateway,
    qiniu: QiniuGateway,
    yunpian: YunpianGateway,
    juhe: JuheGateway,
    urora: UroraGateway,
  };
  protected messenger: Messenger = null;
  protected httpClient: AxiosInstance;

  constructor(config: EasySmsConfig) {
    this.config = new Config(config);
  }

  /**
   * 获取请求客户端
   * @returns
   */
  getHttpClient(): AxiosInstance {
    if (!this.httpClient) {
      this.httpClient = Axios.create();
    }
    return this.httpClient;
  }
  /**
   * 设置请求客户端
   * @param instance
   * @returns
   */
  setHttpClient(instance: AxiosInstance): this {
    this.httpClient = instance;
    return this;
  }

  /**
   * 设置配置
   * @param config
   * @returns
   */
  setConfig(config: EasySmsConfig) {
    this.config = new Config(config);
    return this;
  }

  /**
   * 设置发送器
   * @param messenger
   * @returns
   */
  setMessenger(messenger: Messenger) {
    this.messenger = messenger;
    this.messenger.setApp(this);
    return this;
  }
  /**
   * 获取发送器
   * @returns
   */
  getMessenger() {
    if (!this.messenger) {
      this.messenger = new Messenger();
      this.messenger.setApp(this);
    }
    return this.messenger;
  }

  /**
   * 扩展自定义网关
   * @param name
   * @param func
   * @returns
   */
  extend(name: string, func: GatewayCreator | GatewayConstructable) {
    this.customCreators[name.toLowerCase()] = func;
    return this;
  }

  /**
   * 获取网关实例
   * @param name 网关标识
   * @returns
   */
  gateway(name: string) {
    if (!this.createdGateways[name]) {
      this.createdGateways[name] = this.createGateway(name);
      this.createdGateways[name].setHttpClient(this.getHttpClient());
    }
    return this.createdGateways[name];
  }

  /**
   * 获取或设置网关策略，并返回可执行方法
   * @param strategy
   * @returns
   */
  strategy(strategy: 'order' | 'random' | MessengerStrategyClosure = null) {
    if (!strategy) {
      strategy = this.config.get('default.strategy', Messenger.STRATEGY_ORDER);
    }
    else {
      this.config.set('default.strategy', strategy);
    }
    if (typeof strategy === 'function') {
      return strategy;
    }
    else if (strategy === Messenger.STRATEGY_RANDOM) {
      return RandomStrategy;
    }
    else {
      return OrderStrategy;
    }
  }

  /**
   * 发送短信
   * @param to 电话
   * @param message 消息
   * @param gateways 网关标识列表，默认去 default.gateways 配置
   * @returns
   */
  async send(to: string | PhoneNumber, message: string | MessageProperty | Message, gateways: string[] = null) {
    if (!to) {
      throw new Error('Empty number.');
    }
    if (!message) {
      throw new Error('Empty message.');
    }
    to = this.formatPhoneNumber(to);
    message = this.formatMessage(message);
    gateways = gateways ?? message.getGateways();
    if (!gateways || gateways.length === 0) {
      gateways = this.config.get('default.gateways', []);
    }
    if (!gateways || gateways.length === 0) {
      throw new Error('Empty gateways.');
    }
    let formattedGateways = this.formatGateways(gateways);

    return this.getMessenger().send(to, message, formattedGateways);
  }

  protected createGateway(name: string) {
    let config: GatewayConfig = this.config.get(`gateways.${name}`);
    if (!config) {
      if (name === 'test') {
        config = {
          gateway: 'test',
        };
      }
      else {
        throw new Error('Invalid gateway: ' + name);
      }
    }

    if (typeof config.gateway == 'undefined') {
      config.gateway = name;
    }
    if (typeof config.timeout === 'undefined') {
      config.timeout = this.config.get('timeout', Gateway.DEFAULT_TIMEOUT);
    }

    if (typeof config.gateway == 'string') {
      let gateway = config.gateway;
      if (typeof this.customCreators[gateway] != 'undefined') {
        return this.callCustomCreator(gateway, config);
      }
      if (typeof this.supportGateways[gateway] == 'undefined') {
        throw new Error('Invalid gateway: ' + gateway);
      }
      return this.buildGateway(this.supportGateways[gateway], config);
    }

    return this.buildGateway(config.gateway, config);
  }

  protected buildGateway(className: GatewayConstructable, config: GatewayConfig): Gateway {
    return new className(config);
  }

  protected callCustomCreator(name: string, config: GatewayConfig): Gateway {
    if (isGatewayConstructable(this.customCreators[name])) {
      let className = this.customCreators[name] as GatewayConstructable;
      return new className(config);
    }
    return (this.customCreators[name] as GatewayCreator)(config);
  }

  protected formatPhoneNumber(number: string | PhoneNumber) {
    if (number instanceof PhoneNumber) {
      return number;
    }
    return new PhoneNumber(number.replace(/^\s+/, '').replace(/\s+$/, ''));
  }

  protected formatMessage(message: string | MessageProperty | Message) {
    if (!(message instanceof Message)) {
      if (typeof message === 'string') {
        message = {
          content: message,
          template: message,
        };
      }
      message = new Message(message);
    }
    return message;
  }

  protected formatGateways(gateways: string[]) {
    let formatted: string[] = this.strategy().call(null, gateways);

    let results: string[] = [];
    let globalSettings: GatewayConfigMap = this.config.get('gateways', {});
    for (let gateway of formatted) {
      if (gateway !== 'test' && typeof globalSettings[gateway] === 'undefined') continue;
      results.push(gateway);
    }

    return results;
  }

};
