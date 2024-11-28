'use strict';

import { NoGatewayAvailableException } from "./Exceptions/NoGatewayAvailableException";
import { EasySms } from "./EasySms";
import { Message } from "./Message";
import { PhoneNumber } from "./PhoneNumber";

/**
 * 消息发送器
 */
export class Messenger {

  /**
   * 成果状态
   */
  public static STATUS_SUCCESS: 'success' = 'success';
  /**
   * 失败状态
   */
  public static STATUS_FAILURE: 'failure' = 'failure';

  /**
   * 执行策略，顺序执行
   */
  public static STRATEGY_ORDER: 'order' = 'order';
  /**
   * 执行策略，随机执行
   */
  public static STRATEGY_RANDOM: 'random' = 'random';

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
   * @param gateways 网关标识列表
   * @returns
   */
  async send(to: PhoneNumber, message: Message, gateways: string[]) {
    let results: MessengerResult[] = [];
    let isSuccess = false;

    for (let gateway of gateways) {
      try {
        results.push({
          gateway,
          status: Messenger.STATUS_SUCCESS,
          result: await this.app.gateway(gateway).send(to, message),
        });
        isSuccess = true;
        break;
      }
      catch (e) {
        results.push({
          gateway,
          status: Messenger.STATUS_FAILURE,
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
