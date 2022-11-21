const BaseTestUnit = require('../BaseTestUnit');
const { PhoneNumber, Message } = require('../../dist');
const { default: TencentGateway } = require('../../dist/Gateways/TencentGateway');

class TestUnit extends BaseTestUnit {

  test() {

    it('Should return send correctly.', async () => {
      let to = new PhoneNumber('13812345678');
      let message = new Message({
        template: 'mock-template',
        data: ['foo', 'bar'],
      });

      let gateway = new TencentGateway({
        sdk_app_id: 'mock-appid',
        secret_id: 'mock-id',
        secret_key: 'mock-secret',
        region: 'mock-region',
        sign_name: 'mock-sign-name',
      });

      let axios = this.getMockedHttpClient();
      gateway.setHttpClient(axios);

      axios.mock('post', 'https://sms.tencentcloudapi.com').reply(200, {
        Response: {
          SendStatusSet: [
            {
              SerialNo: '2028:f825e6b16e23f73f4123',
              PhoneNumber: '8613812345678',
              Fee: 1,
              SessionContext: '',
              Code: 'OK',
              Message: 'send success',
              IsoCode: 'CN',
            },
          ],
        },
        RequestId: '111222',
      });

      let result = await gateway.send(to, message);

      this.assert.strictEqual(result['RequestId'], '111222');
      this.assert.strictEqual(result['Response']['SendStatusSet'][0]['PhoneNumber'], '8613812345678');

    });

  }
}

new TestUnit('Gateway/TencentGateway');
