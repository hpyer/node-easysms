const BaseTestUnit = require('../BaseTestUnit');
const { PhoneNumber, Message } = require('../../dist');
const { default: AliyunGateway } = require('../../dist/Gateways/AliyunGateway');

class TestUnit extends BaseTestUnit {

  test() {

    it('Should return send correctly.', async () => {
      let to = new PhoneNumber('13812345678');
      let message = new Message({
        template: 'mock-template',
        data: {
          foo: '123',
          bar: '123',
        },
      });

      let gateway = new AliyunGateway({
        access_key_id: 'mock-id',
        access_key_secret: 'mock-secret',
        region: 'mock-region',
        sign_name: 'mock-sign-name',
      });

      let axios = this.getMockedHttpClient();
      gateway.setHttpClient(axios);

      axios.mock('get', 'http://dysmsapi.aliyuncs.com').reply(200, {
        "Code": "OK",
        "Message": "OK",
        "BizId": "9006197469364984****",
        "RequestId": "F655A8D5-B967-440B-8683-DAD6FF8DE990",
      });

      let result = await gateway.send(to, message);

      this.assert.strictEqual(result['Code'], 'OK');
      this.assert.strictEqual(result['BizId'], '9006197469364984****');

    });

  }
}

new TestUnit('Gateway/AliyunGateway');
