
/**
 * 对象类型
 */
type Recordable<T = any> = Record<string, T>;

/**
 * 网关构造函数
 */
declare interface GatewayConstructable {
  new(config: Recordable): Gateway;
}

/**
 * 异常
 */
declare interface Exception extends Error {}

/**
 * 消息属性
 */
declare interface MessageProperty {
  /**
   * 消息签名
   */
  sign_name?: string | MessagePropertyClosure<string>;
  /**
   * 文字内容，使用在像云片类似的以文字内容发送的平台
   */
  content?: string | MessagePropertyClosure<string>;
  /**
   * 模板，使用在以模板来发送短信的平台
   */
  template?: string | MessagePropertyClosure<string>;
  /**
   * 模板变量，使用在以模板来发送短信的平台
   */
  data?: Recordable<string | number> | MessagePropertyClosure<Recordable<string | number>>;
}

/**
 * 消息属性闭包
 */
declare type MessagePropertyClosure<T> = (gateway: Gateway) => Promise<T>;

/**
 * 消息发送结果
 */
declare interface MessengerResult {
  /**
   * 网关标识
   */
  gateway: string;
  /**
   * 请求状态
   */
  status: 'success' | 'failure';
  /**
   * 网关返回数据
   */
  result?: any;
  /**
   * 网关异常信息
   */
  exception?: Exception;
}

/**
 * 消息发送异常
 */
declare interface MessengerException extends Recordable<Exception> {}

/**
 * 本工具支持的网关映射表，键名为网关标识，键值为网关类
 */
declare interface SupportGateways extends Record<string, GatewayConstructable> {}

/**
 * 已创建的网关映射表，键名为网关标识，键值为网关实例
 */
declare interface CreatedGateways extends Record<string, Gateway> {}

/**
 * 消息发送策略
 */
declare type MessengerStrategyClosure = (gateways: string[]) => string[];

/**
 * 键名为网关的标识，如果需要管理同一个网关的不同应用，
 * 则键名可以用作别名，但同时配置中的 provider 属性必填
 */
declare interface EasySmsConfig {
  /**
   * 请求的超时时间（秒）
   */
  timeout?: number;

  /**
   * 默认发送配置
   */
  default: {
    /**
     * 网关调用策略，默认：顺序调用
     */
    strategy: 'order' | 'random' | MessengerStrategyClosure;

    /**
     * 可用的网关，网关标识列表
     */
    gateways: string[];
  };

  /**
   * 可用的网关配置，键名为网关标识
   */
  gateways: GatewayConfigMap;
}

/**
 * 自定义网关创建方法映射表，键名为网关标识，键值为对应的创建方法
 */
declare interface CustomGatewayCreators extends Record<string, GatewayCreator | GatewayConstructable> {}

/**
 * 网关创建方法
 */
declare type GatewayCreator = (config: GatewayConfig) => Gateway;
