
## EasySMS is an SMS sender for Node.js

[![Build Status](https://app.travis-ci.com/hpyer/node-easysms.svg?branch=master)](https://app.travis-ci.com/github/hpyer/node-easysms) [![npm](https://img.shields.io/npm/v/node-easysms.svg)](https://www.npmjs.com/package/node-easysms) [![License](https://img.shields.io/npm/l/node-easysms.svg)](LICENSE)

[EasySMS](https://github.com/overtrue/easy-sms) 是一个由 `安正超` 大神用 PHP 开发的开源的短信发送工具包。本项目是 EasySMS 包在 Node.js 上的实现，并且基本还原了PHP版的配置项以及接口的调用方式。

> 注：虽然也使用了 EasySMS 这个名称，但是 `安正超` 大神并未参与开发，请各位开发者不要因使用本包产生的疑惑而去打扰大神，如有疑问请在本项目中提 issue，谢谢~


### 安装

`npm install -S node-easysms`

### 使用说明

如果仍有疑问，请提issue，谢谢～

```js
const { EasySms } = require('node-easysms');

// 配置项
let config = {
  // 请求的超时时间（豪秒）
  timeout: 5000,

  // 默认发送配置
  default: {
    // 网关调用策略，默认：order，可选值：order、random 或回调函数（使用方式见下文）
    strategy: 'order',
    // 可用于发送的网关标识列表
    gateways: ['aliyun']
  },

  // 各网关配置
  gateways: {
    aliyun: {
      access_key_id: 'your-key-id',
      access_key_secret: 'your-key-secret',
      region: 'cn-hangzhou',
      sign_name: 'xx平台',
    },
  }
};

let easySms = new EasySms(config);

// 调用发送api
let response = easySms.send('13812341234', {
  sign_name: 'xx平台',
  template: 'template_id',
  data: {
    code: '1234',
  }
});
```

### 国际短信

国际短信与国内短信的区别是号码前面需要加国际码，使用 `PhoneNumber` 类进行构建即可：

```js
const { EasySms, PhoneNumber } = require('node-easysms');

// 第一个参数为电话号码，第二个参数为国际码
let number = new PhoneNumber('13812345678', 31);

let easySms = new EasySms({...});

// 发送时，传入 PhoneNumber 实例即可
easySms.send(number, {...});
```

### 短信消息

根据平台情况使用 `content` 或者 `template` + `data` 设置消息即可。

* `content` 短信内容，适用于一些直接传短信内容的平台
* `template` 短信模版，适用于一些传模版id+参数的平台，如：阿里云、腾讯云等
* `data` 短信模版参数，与 `template` 配合使用
* `sign_name` 短信签名，可选，如果消息中未配置，则会提取平台配置中的 `sign_name`

你也可以使用闭包来返回对应字段的值，闭包接收一个网关实例的参数，闭包也支持异步调用，如下：

```js
easySms.send('13812341234', {
  sign_name: function (gateway) {
    return 'xx平台';
  },
  template: async function (gateway) {
    return await fetchTemplate();
  },
  data: function (gateway) {
    // 获取网关实例的类名
    let className = gateway.getName();

    if (className === 'aliyun') {
      return {
        code: '1234',
      };
    }

    // 默认数据
    return {
      code: '1234',
    };
  }
});
```

### 发送短信

默认会根据配置项中的 default.gateways 进行发送，如果某条短信需要覆盖默认对的发送网关，可以传入第三个参数：

```js
let response = easySms.send('13812341234', {
  sign_name: 'xx平台',
  template: 'template_id',
  data: {
    code: '1234',
  }
}, ['tencent']);
```

### 返回值

由于使用多网关发送，所以返回值为一个数组，顺序同发送网关标识，结构如下：

```js
[
  // 成功
  {
    'gateway': 'aliyun',
    'status': 'success',
    'result': {}, // 平台返回的数据
  },
  // 失败
  {
    'gateway': 'tencent',
    'status': 'failure',
    'exception': GatewayErrorException 异常实例
  },
]
```

`GatewayErrorException` 异常实例可以通过 `getRaw()` 方法获取接口返回的信息。如果所有网关均发送失败，则程序会抛出 `NoGatewayAvailableException` 异常，该异常可以通过下列方法获取对应错误信息：

```js
e.getResults();               // 获取所有接口返回的信息
e.getExceptions();            // 获取所有接口返回的信息
e.getException('aliyun');     // 获取所有接口返回的信息
e.getLastException();         // 获取最后一个失败的异常
```

### 自定义网关

如果本工具未集成您所需的网关，可通过如下方式进行扩展：

```js
// 需要引入网关基础类
const { EasySms, Gateway } = require('node-easysms');

// 创建自定义网关类
class MyGateway extends Gateway {
  // to: PhoneNumber 实例
  // message: Message 实例
  async send(to, message) {
    // 实现发送方法，并返回接口结果
    // 可以使用工具内置的请求方法：this.get()、this.post()、this.postJson()、this.request()
    return {};
  }
}

let easySms = new EasySms({
  default: {
    gateways: ['mygateway']
  },
  gateways: {
    mygateway: {
      // 网关所需的参数
    },
  }
});

// 注册自定义网关
// 方法一：直接传入类即可
easySms.extend('mygateway', MyGateway);
// 方法二：传入闭包，需接收一个参数，即上述配置中的 gateways.mygateway
easySms.extend('mygateway', function(config) {
  return new MyGateway($gatewayConfig);
});
```

### 自定义策略

工具集成了 `order`（顺序）、`random`（随机）两种方式，可以通过配置项 `default.strategy` 进行设置。如果需要自定义策略，则可以设置为一个回调函数：

```js
const { EasySms } = require('node-easysms');

// 需要接收网关标识列表，处理后返回新的列表
function customStrategy(gateways) {
  gateways.sort();
  return gateways;
}

let easySms = new EasySms({
  default: {
    strategy: customStrategy,
    gateways: []
  },
  gateways: {
    ...
  }
});
```

### 自定义短信

您可以根据不同的场景，预先定义不同的短信消息类，从而简化发送时的配置。这时只需继承 `Message` 类即可：

```js
const { EasySms, Message } = require('node-easysms');

class OrderPaidMessage extends Message {

  // 定义该消息所使用的网关，优先级高于配置项 default.gateways
  gateways = ['foo', 'bar'];

  constructor(order) {
    super({});
    this.order = order;
  }

  async getContent() {
    return `您的订单${this.order['no']}已完成付款`;
  }
  async getTemplate() {
    return 'TPL_ORDER_PAID';
  }
  async getData() {
    return {
      order_no: this.order['no'],
    };
  }
  async getSignName() {
    return 'xx商城';
  }
}

let easySms = new EasySms({...});

let order = {...};
let message = new OrderPaidMessage(order);

easySms.send(order.mobile, message);
```

> 注意，发送网关的优先级关系由高到低为：
> 1. `easySms.send()` 方法的第三个参数
> 2. 自定义消息中配置的 `gateways`
> 3. 工具配置项 `default.gateways`

### 各平台配置

#### aliyun

**阿里云** [文档](https://help.aliyun.com/document_detail/419273.html)，消息内容使用 `template` + `data`

```js
// 配置项
{
  access_key_id: '',
  access_key_secret: '',
  region: '',  // 默认：cn-hangzhou
}
```

#### tencent

**腾讯云** [文档](https://cloud.tencent.com/document/product/382/55981)，消息内容使用 `template` + `data`

> 注意：腾讯云的模版参数是`数组`，而`非键值对`，如果需要与其它平台一同使用，请通过闭包来返回数据。

```js
// 配置项
{
  secret_id: '',
  secret_key: '',
  sdk_app_id: '',
  region: '',  // 默认：ap-guangzhou
}
```

#### baidu

**百度云** [文档](https://cloud.baidu.com/doc/SMS/s/lkijy5wvf)，消息内容使用 `template` + `data`

> 注意：使用 `sign_name` 设置短信签名id

```js
// 配置项
{
  ak: '',
  sk: '',
  sign_name: '',
  domain: '',  // 默认：smsv3.bj.baidubce.com
}
```

#### qiniu

**七牛云** [文档](https://developer.qiniu.com/sms/5897/sms-api-send-message)，消息内容使用 `template` + `data`

> 注意：使用 `sign_name` 设置短信签名id

```js
// 配置项
{
  access_key: '',
  secret_key: '',
  sign_name: '',
}
```

#### yunpian

**云片** [按内容发送](https://www.yunpian.com/doc/zh_CN/domestic/single_send.html)，消息内容使用 `content`，同时也支持 [按模板发送](https://www.yunpian.com/doc/zh_CN/domestic/tpl_single_send.html)，消息内容使用 `template` + `data`

```js
// 配置项
{
  api_key: '',
  sign_name: '',
  domain: '',  // 默认：sms.yunpian.com
}
```

#### juhe

**聚合数据** [文档](https://www.juhe.cn/docs/api/id/54)，消息内容使用 `template` + `data`

```js
// 配置项
{
  app_key: '',
  sign_name: '',
}
```
