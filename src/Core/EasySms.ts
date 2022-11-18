'use strict';

import Axios, { AxiosInstance } from "axios";
import AliyunGateway from "../Gateways/AliyunGateway";
import OrderStrategy from "./Strategies/OrderStrategy";
import RandomStrategy from "./Strategies/RandomStrategy";
import { CreatedGateways, CustomGatewayCreators, EasySmsConfig, GatewayConfig, GatewayConfigMap, GatewayConstructable, GatewayCreator, MessageProperty, MessengerStrategyClosure, SupportGateways } from "../Types/global";
import Config from "./Config";
import GatewayInterface from "./Gateway";
import Message from "./Message";
import Messenger from "./Messenger";
import PhoneNumber from "./PhoneNumber";

export default class EasySms {

  protected config: Config = null;
  protected customCreators: CustomGatewayCreators = {};
  protected createdGateways: CreatedGateways = {};
  protected supportGateways: SupportGateways = {
    aliyun: AliyunGateway,
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
  getHttpClent(): AxiosInstance {
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
  setHttpClent(instance: AxiosInstance): this {
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
  extend(name: string, func: GatewayCreator) {
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
      this.createdGateways[name].setHttpClent(this.getHttpClent());
    }
    return this.createdGateways[name];
  }

  /**
   * 获取策略方法
   * @param strategy
   * @returns
   */
  strategy(strategy: 'order' | 'random' | MessengerStrategyClosure = null) {
    if (!strategy) {
      strategy = this.config.get('default.strategy', Messenger.STRATEGY_ORDER);
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
      throw new Error('Invalid gateway: ' + name);
    }

    if (typeof config.gateway == 'undefined') {
      config.gateway = name;
    }
    if (typeof config.timeout === 'undefined') {
      config.timeout = this.config.get('timeout', GatewayInterface.DEFAULT_TIMEOUT);
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

  protected buildGateway(className: GatewayConstructable, config: GatewayConfig): GatewayInterface {
    return new className(config);
  }

  protected callCustomCreator(name: string, config: GatewayConfig): GatewayInterface {
    return this.customCreators[name](config);
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

    let results: GatewayConfig[] = [];

    let globalSettings: GatewayConfigMap = this.config.get('gateways', {});
    for (let gateway of formatted) {
      let config = globalSettings[gateway] || {};
      // 重置网关标识
      config.gateway = gateway;
      results.push(config);
    }

    return results;
  }

};
