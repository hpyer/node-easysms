'use strict';

import NoGatewayAvailableException from "./Exceptions/NoGatewayAvailableException";
import { GatewayConfig, MessengerResult } from "../Types/global";
import EasySms from "./EasySms";
import Message from "./Message";
import PhoneNumber from "./PhoneNumber";

export default class Messenger {

  /**
   * 成果状态
   */
  public static STATUS_SUCCESS: string = 'success';
  /**
   * 失败状态
   */
  public static STATUS_FAILURE: string = 'failure';

  /**
   * 执行策略，顺序执行
   */
  public static STRATEGY_ORDER: string = 'order';
  /**
   * 执行策略，随机执行
   */
  public static STRATEGY_RANDOM: string = 'random';

  protected app: EasySms = null;

  /**
   * 设置应用实例
   * @param app
   * @returns
   */
  setApp(app?: EasySms) {
    this.app = app;
    return this;
  }

  /**
   * 调用网关进行发送
   * @param to 电话号码对象
   * @param message 消息对象
   * @param gateways 网关配置映射
   * @returns
   */
  async send(to: PhoneNumber, message: Message, gateways: GatewayConfig[]) {
    let results: MessengerResult[] = [];
    let isSuccess = false;

    for (let config of gateways) {
      let gateway = config.gateway as string;
      try {
        results.push({
          gateway,
          status: Messenger.STATUS_SUCCESS,
          result: await this.app.gateway(gateway).send(to, message, config),
        });
        isSuccess = true;
        break;
      }
      catch (e) {
        results.push({
          gateway,
          status: Messenger.STATUS_SUCCESS,
          exception: e,
        });
      }
    }

    if (!isSuccess) {
      throw new NoGatewayAvailableException(results);
    }

    return results;
  }

};
