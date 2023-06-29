const BaseTestUnit = require('../BaseTestUnit');
const { PhoneNumber, Message } = require('../../dist');
const { default: YunpianGateway } = require('../../dist/Gateways/YunpianGateway');

class TestUnit extends BaseTestUnit {

  test() {

    it('Should send content correctly.', async () => {
      let to = new PhoneNumber('13812345678');
      let message = new Message({
        content: 'mock-content',
      });

      let gateway = new YunpianGateway({
        api_key: 'mock-api_key',
      });

      let axios = this.getMockedHttpClient();
      gateway.setHttpClient(axios);

      axios.mock('post', 'https://sms.yunpian.com/v2/sms/single_send.json').reply(200, {
        "code": 0,
        "msg": "发送成功",
        "count": 1,
        "fee": 0.05,
        "unit": "RMB",
        "mobile": "13200000000",
        "sid": 3310228982
      });

      let result = await gateway.send(to, message);

      this.assert.strictEqual(result['sid'], 3310228982);
      this.assert.strictEqual(axios.getHistory().post[0].data, 'apikey=mock-api_key&mobile=13812345678&text=mock-content');
    });

    it('Should send template correctly.', async () => {
      let to = new PhoneNumber('13812345678');
      let message = new Message({
        template: 'mock-template',
        data: {
          foo: 123,
          bar: 'abc',
        },
      });

      let gateway = new YunpianGateway({
        api_key: 'mock-api_key',
      });

      let axios = this.getMockedHttpClient();
      gateway.setHttpClient(axios);

      axios.mock('post', 'https://sms.yunpian.com/v2/sms/tpl_single_send.json').reply(200, {
        "code": 0,
        "msg": "发送成功",
        "count": 1,
        "fee": 0.05,
        "unit": "RMB",
        "mobile": "13200000000",
        "sid": 3310228982
      });

      let result = await gateway.send(to, message);

      this.assert.strictEqual(result['sid'], 3310228982);
      this.assert.strictEqual(axios.getHistory().post[0].data, 'apikey=mock-api_key&mobile=13812345678&tpl_id=mock-template&tpl_value=%2523foo%2523%3D123%26%2523bar%2523%3Dabc');
    });

  }
}

new TestUnit('Gateway/YunpianGateway');
