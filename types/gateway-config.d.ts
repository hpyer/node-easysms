
/**
 * 网关配置
 */
declare interface GatewayConfig extends Recordable {
  /**
   * 网关，支持3种方法
   *
   * 1、本工具支持的，则填写对应网关标识即可，如：'aliyun', 'qcloud'等；
   *
   * 2、自定义网关，并且通过 EasySms.extend() 方法扩展的，则填写自定义网关标识，如：'mygateway'；
   *
   * 3、自定义网关，则填写网关标识类名，如：MyGateway；
   */
  gateway: string | GatewayConstructable;

  /**
   * 请求的超时时间，单位：毫秒
   */
  timeout?: number;
  /**
   * 短信签名，如果消息中未设置，则取该值
   */
  sign_name?: string;
}

/**
 * 阿里云配置项
 */
declare interface AliyunGatewayConfig extends GatewayConfig {
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
declare interface TencentGatewayConfig extends GatewayConfig {
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
declare interface BaiduGatewayConfig extends GatewayConfig {
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
 * 七牛云配置项
 */
declare interface QiniuGatewayConfig extends GatewayConfig {
  /**
   * Access Key，必填
   */
  access_key: string,
  /**
   * Secret Access，必填
   */
  secret_key: string,
  /**
   * 短信签名ID，选填
   */
  sign_name?: string,
}

/**
 * 云片配置项
 */
declare interface YunpianGatewayConfig extends GatewayConfig {
  /**
   * 用户唯一标识，必填
   */
  api_key: string,
  /**
   * 服务器地址，默认：sms.yunpian.com
   */
  domain: string,
}

/**
 * 聚合数据配置项
 */
declare interface JuheGatewayConfig extends GatewayConfig {
  /**
   * 用户密钥，必填
   */
  app_key: string,
}

/**
 * 网关配置映射
 */
declare interface GatewayConfigMap {
  [key: string]: GatewayConfig | undefined;

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

  /**
   * 七牛云配置项
   */
  qiniu?: QiniuGatewayConfig,

  /**
   * 云片配置项
   */
  yunpian?: YunpianGatewayConfig,

  /**
   * 聚合数据配置项
   */
  juhe?: JuheGatewayConfig,
}
