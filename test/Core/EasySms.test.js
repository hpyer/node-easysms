const BaseTestUnit = require('../BaseTestUnit');
const { EasySms, Gateway, Messenger } = require('../../dist/');

class TestUnit extends BaseTestUnit {

  test() {

    it('Should get gateway instance correctly.', async () => {
      let app = new EasySms({
        gateways: {
          aliyun: {},
        }
      });

      this.assert.strictEqual(app.gateway('aliyun') instanceof Gateway, true);
    });

    it('Should throw Error when get an invalid gateway.', async () => {
      let app = new EasySms({});

      try {
        app.gateway('aliyun2');
      }
      catch (e) {
        this.assert.strictEqual(e.message, 'Invalid gateway: aliyun2');
      }
    });

    it('Should get messenger instance correctly.', async () => {
      let app = new EasySms({});

      let messenger = app.getMessenger();

      this.assert.strictEqual(messenger instanceof Messenger, true);
    });

    it('Should extend custom gateway correctly.', async () => {

      class TestCustomGateway extends Gateway {
        async send(to, message, config) {
          return true;
        }
      }

      let custom_config = {
        custom_id: 'mock-id',
        custom_key: 'mock-key',
      };

      let app = new EasySms({
        gateways: {
          custom: custom_config,
        }
      });

      app.extend('custom', function (config) {
        return new TestCustomGateway(config);
      });

      let gateway = app.gateway('custom');
      let config = gateway.getConfig();

      this.assert.strictEqual(gateway instanceof TestCustomGateway, true);
      this.assert.strictEqual(config.custom_id, custom_config.custom_id);
      this.assert.strictEqual(config.custom_key, custom_config.custom_key);
    });

    it('Should send correctly.', async () => {

      class TestCustomGateway extends Gateway {
        async send(to, message, config) {
          return await this.get('/test-url');
        }
      }

      let custom_config = {
        custom_id: 'mock-id',
        custom_key: 'mock-key',
      };

      let app = new EasySms({
        default: {
          gateways: ['custom'],
        },
        gateways: {
          custom: custom_config,
        }
      });

      app.extend('custom', function (config) {
        return new TestCustomGateway(config);
      });

      let client = this.getMockedHttpClient(app.getHttpClent());
      app.setHttpClent(client);

      client.mock('get', '/test-url').reply(200, 'mock-success');

      let result = await app.send('13812341234', {
        content: 'Test content',
      });
      this.assert.deepStrictEqual(result, [{
        gateway: 'custom',
        status: 'success',
        result: 'mock-success',
      }]);

    });

  }
}

new TestUnit('Core/EasySms');
