
## EasySMS is an SMS sender for Node.js

[![Build Status](https://app.travis-ci.com/hpyer/node-easysms.svg?branch=master)](https://app.travis-ci.com/github/hpyer/node-easysms) [![npm](https://img.shields.io/npm/v/node-easysms.svg)](https://www.npmjs.com/package/node-easysms) [![License](https://img.shields.io/npm/l/node-easysms.svg)](LICENSE)

[EasySMS](https://github.com/overtrue/easy-sms) 是一个由 `安正超` 大神用 PHP 开发的开源的短信发送工具包。本项目是 EasySMS 包在 Node.js 上的实现，并且基本还原了PHP版的配置项以及接口的调用方式。

> 注：虽然也使用了 EasySMS 这个名称，但是 `安正超` 大神并未参与开发，请各位开发者不要因使用本包产生的疑惑而去打扰大神，如有疑问请在本项目中提 issue，谢谢~


### 安装

`npm install -S node-easysms`

### 使用说明

基本可以根据 [EasySMS 的文档](https://github.com/overtrue/easy-sms#readme) 来使用。如果仍有疑问，请提issue，谢谢～

```js
const { EasySms } = require('node-easysms');

let app = new EasySms({
  default: {
    gateways: ['aliyun']
  },
  gateways: {
    aliyun: {
      access_key_id: 'your-key-id',
      access_key_secret: 'your-key-secret',
      region: 'cn-hangzhou',
      sign_name: 'xx平台',
    },
  }
});

let response = app.send('13812341234', {
  sign_name: 'xx平台',
  template: 'template_id',
  data: {
    code: '1234',
  }
});
```
