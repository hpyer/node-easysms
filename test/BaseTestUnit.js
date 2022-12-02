
const MockAdapter = require('axios-mock-adapter');
const assert = require('assert');
const Axios = require('axios');

module.exports = class BaseTestUnit {

  /**
   * 构造通用模块测试用例
   * @param {string} module 测试模块
   */
  constructor(module) {
    /**
     * 断言方法
     * @type {typeof assert}
     */
    this.assert = assert;

    describe(module, () => {
      this.test();
    });
  }

  /**
   * 创建模拟的 HttpClient
   * @param {import('axios').AxiosInstance} client HttpClient实例
   */
  getMockedHttpClient(client = null) {
    if (!client) {
      client = Axios.create();
    }
    client.__mockedAxios = new MockAdapter(client);

    /**
     * 模拟请求
     * @param method 请求方式，如：get, post
     * @param url 请求地址
     * @param data 请求参数，默认：undefined
     */
    client.mock = function (method, url, data = undefined) {
      method = method.toLowerCase();
      method = 'on' + method.substring(0, 1).toUpperCase() + method.substring(1);
      return this.__mockedAxios[method](url, data);
    };

    /**
     * 获取请求历史
     */
    client.getHistory = function() {
      return this.__mockedAxios.history;
    }

    return client;
  }

  /**
   * 具体的测试方法，需要被继承
   */
  test() {
  }

};
