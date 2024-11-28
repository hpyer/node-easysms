const BaseTestUnit = require('../BaseTestUnit');
const { PhoneNumber, Message } = require('../../dist');
const { JuheGateway } = require('../../dist/Gateways/JuheGateway');

class TestUnit extends BaseTestUnit {

  test() {

    it('Should send template correctly.', async () => {
      let to = new PhoneNumber('13812345678');
      let message = new Message({
        template: 'mock-template',
        data: {
          foo: 123,
          bar: 'abc',
        },
      });

      let gateway = new JuheGateway({
        app_key: 'mock-app_key',
      });

      let axios = this.getMockedHttpClient();
      gateway.setHttpClient(axios);

      axios.mock('post', 'http://v.juhe.cn/sms/send').reply(200, {
        "reason": "短信发送成功",
        "result": {
          "count": 1, /*发送数量*/
          "fee": 1, /*扣除条数*/
          "sid": "23d6bc4913614919a823271d820662af" /*短信ID*/
        },
        "error_code": 0 /*发送成功*/
      });

      let result = await gateway.send(to, message);

      this.assert.strictEqual(result['result']['sid'], '23d6bc4913614919a823271d820662af');
      this.assert.strictEqual(axios.getHistory().post[0].data, '{"key":"mock-app_key","mobile":"13812345678","tpl_id":"mock-template","vars":"{\\"foo\\":123,\\"bar\\":\\"abc\\"}","dtype":"json"}');
    });

  }
}

new TestUnit('Gateway/JuheGateway');
