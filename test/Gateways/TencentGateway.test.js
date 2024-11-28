const BaseTestUnit = require('../BaseTestUnit');
const { PhoneNumber, Message } = require('../../dist');
const { TencentGateway } = require('../../dist/Gateways/TencentGateway');

class TestUnit extends BaseTestUnit {

  test() {

    it('Should generate signature correctly.', async () => {

      let gateway = new TencentGateway({
        sdk_app_id: 'mock-appid',
        secret_id: 'AKIDz8krbsJ5yKBZQpn74WFkmLPx3*******',
        secret_key: 'Gu5t9xGARNpq86cd98joQYCN3*******',
        region: 'ap-guangzhou',
        sign_name: 'mock-sign-name',
      });

      let time = '1551113065';

      let sign = gateway.generateSign({
        PhoneNumberSet: ['13812345678'],
        SmsSdkAppId: 'mock-sdk_app_id',
        SignName: 'xx平台',
        TemplateId: 'mock-template_id',
        TemplateParamSet: ['foo', 'bar'],
      }, time);

      this.assert.strictEqual(sign, 'TC3-HMAC-SHA256 Credential=AKIDz8krbsJ5yKBZQpn74WFkmLPx3*******/2019-02-25/sms/tc3_request, SignedHeaders=content-type;host, Signature=ceaef92817668dcd32d328fa30a0b4612a3b10cdb1cff1f625baaf77f027915d');

    });

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
