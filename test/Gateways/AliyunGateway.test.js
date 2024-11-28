const BaseTestUnit = require('../BaseTestUnit');
const { PhoneNumber, Message } = require('../../dist');
const { AliyunGateway } = require('../../dist/Gateways/AliyunGateway');

class TestUnit extends BaseTestUnit {

  test() {

    it('Should generate signature correctly.', async () => {

      let gateway = new AliyunGateway({
        access_key_id: 'testid',
        access_key_secret: 'testsecret',
        region: 'mock-region',
        sign_name: 'mock-sign-name',
      });

      let sign = gateway.generateSign({
        AccessKeyId: 'testid',
        Format: 'XML',
        SignatureMethod: 'HMAC-SHA1',
        SignatureVersion: '1.0',
        SignatureNonce: '3ee8c1b8-xxxx-xxxx-xxxx-xxxxxxxxx',
        Timestamp: '2016-02-23T12:46:24Z',
        Action: 'DescribeDedicatedHosts',
        Version: '2014-05-26',
      }, 'testsecret');

      this.assert.strictEqual(sign, 'rARsF+BIg8pZ4e0ln6Z96lBMDms=');

    });

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
