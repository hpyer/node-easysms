'use strict';

import { GatewayConfig } from "../Types/global";
import PhoneNumber from "./PhoneNumber";
import Message from "./Message";
import { applyMixins } from "./Support/Utils";
import HttpClientMixin from "./Mixins/HttpClientMixin";

abstract class Gateway {
  /**
   * 默认请求超时时间，单位：毫秒
   */
  public static DEFAULT_TIMEOUT: number = 5000;

  protected config: GatewayConfig;
  protected timeout: number;

  constructor(config: GatewayConfig) {
    this.config = config;
  }

  /**
   * 获取网关配置
   * @returns
   */
  getConfig(): GatewayConfig {
    return this.config;
  }
  /**
   * 设置网关配置
   * @param config
   * @returns
   */
  setConfig(config: GatewayConfig) {
    this.config = config;
    return this;
  }

  /**
   * 获取超时时间
   * @returns
   */
  getTimeout() {
    return this.timeout ?? this.config.timeout;
  }
  /**
   * 设置超时时间，单位：毫秒
   * @param timeout
   * @returns
   */
  setTimeout(timeout: number) {
    this.timeout = timeout;
    return this;
  }

  /**
   * 根据模板获取消息内容
   * @param message
   * @returns
   */
  async getContentFromTemplate(message: Message) {
    let content = await message.getTemplate(this);
    if (!content) return '';

    let data = await message.getData(this);
    let keys = Object.keys(data);
    if (keys.length === 0) return content;

    for (let key of keys) {
      content = content.replace(new RegExp(`{${key}}`, 'g'), data[key] + '');
    }
    return content;
  }

  /**
   * 发送短信
   * @param to 手机号
   * @param message 消息
   * @param config 配置
   */
  async send(to: PhoneNumber, message: Message): Promise<Record<string, any>> {
    return null;
  }
}

interface Gateway extends HttpClientMixin { };

applyMixins(Gateway, [ HttpClientMixin ]);

export default Gateway;
