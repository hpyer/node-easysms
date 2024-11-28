const BaseTestUnit = require('../BaseTestUnit');
const { PhoneNumber, Message } = require('../../dist');
const { QiniuGateway } = require('../../dist/Gateways/QiniuGateway');

class TestUnit extends BaseTestUnit {

  test() {

    it('Should generate signature correctly.', async () => {

      let gateway = new QiniuGateway({
        access_key: 'mock-access_key',
        secret_key: 'mock-secret_key',
      });

      let url = 'https://sms.qiniuapi.com/v1/message/single';
      let method = 'post';
      let params = JSON.stringify({
        foo: 123,
        bar: 'abc',
      });
      let contentType = 'application/json';

      let sign = gateway.generateSign(url, method, params, contentType);

      this.assert.strictEqual(sign, 'Qiniu mock-access_key:jbYUWt2wNqdTnCO-Kc2CxepNgCY=');

    });

    it('Should return send correctly.', async () => {
      let to = new PhoneNumber('13812345678');
      let message = new Message({
        template: 'mock-template',
        data: {
          foo: 123,
          bar: 'abc',
        },
      });

      let gateway = new QiniuGateway({
        access_key: 'mock-access_key',
        secret_key: 'mock-secret_key',
      });

      let axios = this.getMockedHttpClient();
      gateway.setHttpClient(axios);

      axios.mock('post', 'https://sms.qiniuapi.com/v1/message/single').reply(200, {
        "message_id": 'mock-message_id'
      });

      let result = await gateway.send(to, message);

      this.assert.strictEqual(result['message_id'], 'mock-message_id');
    });

  }
}

new TestUnit('Gateway/QiniuGateway');
