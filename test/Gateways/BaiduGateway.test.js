const BaseTestUnit = require('../BaseTestUnit');
const { PhoneNumber, Message } = require('../../dist');
const { BaiduGateway } = require('../../dist/Gateways/BaiduGateway');

class TestUnit extends BaseTestUnit {

  test() {

    it('Should generate signature correctly.', async () => {

      let gateway = new BaiduGateway({
        ak: 'mock-ak',
        sk: 'mock-sk',
        sign_name: 'mock-sms-sign',
        domain: 'smsv3.bj.baidubce.com',
      });

      let time = '2022-11-25T06:42:59Z';

      let sign = gateway.generateSign({
        'host': gateway.getDomain(),
        'x-bce-date': time,
      }, time);

      this.assert.strictEqual(sign, 'bce-auth-v1/mock-ak/2022-11-25T06:42:59Z/1800/host;x-bce-date/0b432a0437bff1a9f44aaa10b5d2527461a85b1a00681674efe64046023aa335');

    });

    it('Should return send correctly.', async () => {
      let to = new PhoneNumber('13812345678');
      let message = new Message({
        template: 'mock-template',
        data: ['foo', 'bar'],
      });

      let gateway = new BaiduGateway({
        ak: 'mock-ak',
        sk: 'mock-sk',
        sign_name: 'mock-sms-sign',
        domain: 'smsv3.bj.baidubce.com',
      });

      let axios = this.getMockedHttpClient();
      gateway.setHttpClient(axios);

      axios.mock('post', 'http://smsv3.bj.baidubce.com/api/v3/sendSms').reply(200, {
        "requestId": "5e6dacd5-8815-4183-8255-4ff079bf24e6",
        "code": "1000",
        "message": "成功",
        "data": [
          {
            "code": "1000",
            "message": "成功",
            "mobile": "13812345678",
            "messageId": "e325ea68-02c1-47ad-8844-c7b93cafaeba_13800138000"
          }
        ]
      });

      let result = await gateway.send(to, message);

      this.assert.strictEqual(result['requestId'], '5e6dacd5-8815-4183-8255-4ff079bf24e6');
      this.assert.strictEqual(result['data'][0]['mobile'], '13812345678');

    });

  }
}

new TestUnit('Gateway/BaiduGateway');
