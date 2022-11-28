
import { AxiosRequestConfig } from 'axios';
import Gateway from '../Core/Gateway';
import Exception from '../Exception/Exception';

declare module 'axios' {
  export interface AxiosRequestConfig {
    /**
     * 要发送的xml数据，会自动解析并赋值到data属性，同时设置content-type=text/xml
     */
    xml?: string | Record<string, any>;
    /**
     * 要发送的json数据，会自动解析并赋值到data属性，同时设置content-type=application/json
     */
    json?: string | Record<string, any>;
    /**
     * 要发送的FormData数据，会自动解析并赋值到data属性，同时设置根据内容提取headers
     */
    formData?: Record<string, any>;
  }
}

/**
 * 消息属性
 */
export declare interface MessageProperty {
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
  data?: Record<string, string | number> | MessagePropertyClosure<Record<string, string | number>>;
}

/**
 * 消息属性闭包
 */
export declare type MessagePropertyClosure<T> = (gateway: Gateway) => Promise<T>;

export declare interface GatewayConstructable {
  new(config: object): Gateway;
}

/**
 * 消息发送结果
 */
export declare interface MessengerResult {
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
export declare interface MessengerException {
  [key: string]: Exception;
}

/**
 * 本工具支持的网关映射表，键名为网关标识，键值为网关类
 */
export declare interface SupportGateways {
  [key: string]: GatewayConstructable;
}

/**
 * 已创建的网关映射表，键名为网关标识，键值为网关实例
 */
export declare interface CreatedGateways {
  [key: string]: Gateway;
}

/**
 * 网关配置
 */
export declare interface GatewayConfig {
  /**
   * 网关，支持3种方法
   *
   * 1、本工具支持的，则填写对应网关标识即可，如：'aliyun', 'qcloud'等；
   *
   * 2、自定义网关，并且通过 EasySms.extend() 方法扩展的，则填写自定义网关标识，如：'mygateway'；
   *
   * 3、自定义网关，则填写网关标识类名，如：MyGateway；
   */
  gateway?: string | GatewayConstructable;

  /**
   * 请求的超时时间，单位：毫秒
   */
  timeout?: number;
  /**
   * 短信签名，如果消息中未设置，则取该值
   */
  sign_name?: string,

  [key: string]: any;
}

/**
 * 阿里云配置项
 */
export declare interface AliyunGatewayConfig extends GatewayConfig {
  /**
   * AccessKey ID，必填
   */
  access_key_id: string,
  /**
   * AccessKey Secret，必填
   */
  access_key_secret: string,
  /**
   * 地域ID，默认：cn-hangzhou
   * @see https://help.aliyun.com/document_detail/419270.html
   */
  region?: string,
}

/**
 * 腾讯云配置项
 */
export declare interface TencentGatewayConfig extends GatewayConfig {
  /**
   * 短信 SdkAppId，必填
   */
  sdk_app_id: string,
  /**
   * SecretId，必填
   */
  secret_id: string,
  /**
   * SecretKey，必填
   */
  secret_key: string,
  /**
   * 地域ID，默认：ap-guangzhou
   * @see https://cloud.tencent.com/document/api/382/52071#.E5.9C.B0.E5.9F.9F.E5.88.97.E8.A1.A8
   */
  region?: string,
}

/**
 * 百度云配置项
 */
export declare interface BaiduGatewayConfig extends GatewayConfig {
  /**
   * Access Key Id，必填
   */
  ak: string,
  /**
   * Secret Access Key，必填
   */
  sk: string,
  /**
   * 短信签名ID，必填
   */
  sign_name: string,
  /**
   * 服务域名，默认：smsv3.bj.baidubce.com
   * @see https://cloud.baidu.com/doc/SMS/s/pjwvxrw6w
   */
  domain?: string,
}

/**
 * 网关配置映射
 */
export declare interface GatewayConfigMap {
  [key: string]: GatewayConfig;

  /**
   * 阿里云配置项
   */
  aliyun?: AliyunGatewayConfig,

  /**
   * 腾讯云配置项
   */
  tencent?: TencentGatewayConfig,

  /**
   * 百度云配置项
   */
  baidu?: BaiduGatewayConfig,
}

/**
 * 消息发送策略
 */
export declare type MessengerStrategyClosure = (gateways: string[]) => string[];

/**
 * 键名为网关的标识，如果需要管理同一个网关的不同应用，
 * 则键名可以用作别名，但同时配置中的 provider 属性必填
 */
export declare interface EasySmsConfig {
  /**
   * 请求的超时时间（秒）
   */
  timeout?: number;

  /**
   * 默认发送配置
   */
  default?: {
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
  gateways?: GatewayConfigMap;
}

/**
 * 自定义网关创建方法映射表，键名为网关标识，键值为对应的创建方法
 */
export declare interface CustomGatewayCreators {
  [key: string]: GatewayCreator | GatewayConstructable;
}

/**
 * 网关创建方法
 */
export declare type GatewayCreator = (config: GatewayConfig) => Gateway;
