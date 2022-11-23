'use strict';

import { MessageProperty, MessagePropertyClosure } from "../Types/global";
import GatewayInterface from "./Gateway";

export default class Message {

  /**
   * 文本消息
   */
  public static TEXT_MESSAGE: string = 'text';
  /**
   * 语音消息
   */
  public static VOICE_MESSAGE: string = 'voice';

  protected gateways: string[] = [];
  protected type: string = '';

  protected sign_name: string | MessagePropertyClosure<string> = '';
  protected content: string | MessagePropertyClosure<string> = '';
  protected template: string | MessagePropertyClosure<string> = '';
  protected data: Record<string, string | number> | MessagePropertyClosure<Record<string, string | number>> = null;

  constructor(attributes: MessageProperty, type: string = Message.TEXT_MESSAGE) {
    this.type = type;

    if (attributes['sign_name']) {
      this.sign_name = attributes['sign_name'];
    }
    if (attributes['content']) {
      this.content = attributes['content'];
    }
    if (attributes['template']) {
      this.template = attributes['template'];
    }
    if (attributes['data']) {
      if (typeof attributes['data'] === 'function') {
        this.data = attributes['data'];
      }
      else {
        this.data = { ...attributes['data'] };
      }
    }
  }

  /**
   * 设置消息所对应的网关
   * @param gateways
   * @returns
   */
  setGateways(gateways: string[]) {
    this.gateways = gateways;
    return this;
  }
  /**
   * 获取消息所对应的网关
   * @returns
   */
  getGateways() {
    return this.gateways;
  }

  /**
   * 设置消息类型
   * @param type
   * @returns
   */
  setType(type: string) {
    this.type = type;
    return this;
  }
  /**
   * 获取消息类型
   * @returns
   */
  getType() {
    return this.type;
  }
  /**
   * 获取消息类型
   * @returns
   */
  getMessageType() {
    return this.type;
  }

  /**
   * 设置消息签名
   * @param sign_name
   * @returns
   */
  setSignName(sign_name: string | MessagePropertyClosure<string>) {
    this.sign_name = sign_name;
    return this;
  }
  /**
   * 获取消息签名
   * @param gateway 当前网关
   * @returns
   */
  async getSignName(gateway: GatewayInterface) {
    if (typeof this.sign_name === 'function') {
      return await this.sign_name(gateway)
    }
    return this.sign_name;
  }

  /**
   * 设置消息内容
   * @param content
   * @returns
   */
  setContent(content: string | MessagePropertyClosure<string>) {
    this.content = content;
    return this;
  }
  /**
   * 获取消息内容
   * @param gateway 当前网关
   * @returns
   */
  async getContent(gateway: GatewayInterface) {
    if (typeof this.content === 'function') {
      return await this.content(gateway)
    }
    return this.content;
  }

  /**
   * 设置消息模版
   * @param template
   * @returns
   */
  setTemplate(template: string | MessagePropertyClosure<string>) {
    this.template = template;
    return this;
  }
  /**
   * 获取消息模版
   * @param gateway 当前网关
   * @returns
   */
  async getTemplate(gateway: GatewayInterface) {
    if (typeof this.template === 'function') {
      return await this.template(gateway)
    }
    return this.template;
  }

  setData(data: Record<string, string | number> | MessagePropertyClosure<Record<string, string | number>>) {
    if (typeof data === 'function') {
      this.data = data;
    }
    else {
      this.data = { ...data };
    }
    return this;
  }
  /**
   * 获取消息模版参数
   * @param gateway 当前网关
   * @returns
   */
  async getData(gateway: GatewayInterface) {
    if (typeof this.data === 'function') {
      return await this.data(gateway);
    }
    return this.data;
  }

};
