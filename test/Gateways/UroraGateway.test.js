const BaseTestUnit = require('../BaseTestUnit');
const { PhoneNumber, Message } = require('../../dist');
const { UroraGateway } = require('../../dist/Gateways/UroraGateway');

class TestUnit extends BaseTestUnit {

  test() {

    it('Should send template correctly.', async () => {
      let to = new PhoneNumber('13812345678');
      let message = new Message({
        sign_name: 'mock-sign-id',
        template: 'mock-template-id',
        data: {
          foo: 123,
          bar: 'abc',
        },
      });

      let config = {
        app_key: 'mock-app_key',
        app_secret: 'mock-app_secret',
      };
      let gateway = new UroraGateway(config);
      let auth = Buffer.from(`${config.app_key}:${config.app_secret}`, 'utf-8').toString('base64');

      let axios = this.getMockedHttpClient();
      gateway.setHttpClient(axios);

      axios.mock('post', 'https://api.sms.jpush.cn/v1/messages').reply(200, {
        "msg_id": 288193860302
      });

      let result = await gateway.send(to, message);

      this.assert.strictEqual(result['msg_id'], 288193860302);
      this.assert.strictEqual(axios.getHistory().post[0].headers.Authorization, `Basic ${auth}`);
      this.assert.strictEqual(axios.getHistory().post[0].data, '{"mobile":"13812345678","sign_id":"mock-sign-id","temp_id":"mock-template-id","temp_para":{"foo":123,"bar":"abc"}}');
    });

  }
}

new TestUnit('Gateway/UroraGateway');
