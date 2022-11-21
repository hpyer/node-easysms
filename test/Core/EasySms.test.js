const BaseTestUnit = require('../BaseTestUnit');
const { EasySms, Gateway, Messenger, Message } = require('../../dist/');

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

    it('Should format message correctly.', async () => {
      let app = new EasySms({});

      let message1 = app.formatMessage('mock-sms-content1');
      this.assert.strictEqual(message1 instanceof Message, true);
      this.assert.strictEqual(await message1.getContent(), 'mock-sms-content1');

      let message2 = app.formatMessage({
        template: 'mock-sms-template2',
        data: {
          a: '123',
          b: '456',
        }
      });
      this.assert.strictEqual(message2 instanceof Message, true);
      this.assert.strictEqual(await message2.getTemplate(), 'mock-sms-template2');

      let message3 = app.formatMessage({
        content: () => {
          return 'mock-sms-content3'
        },
      });
      this.assert.strictEqual(message3 instanceof Message, true);
      this.assert.strictEqual(await message3.getContent(), 'mock-sms-content3');
    });

    it('Should format gateways correctly.', async () => {
      let app = new EasySms({
        gateways: {
          foo: {
            a: '123',
          },
          bar: {
            b: '456',
          },
        }
      });

      let configs1 = app.formatGateways(['foo', 'bar']);
      this.assert.strictEqual(configs1.length, 2);
      this.assert.deepStrictEqual(configs1[0], {
        gateway: 'foo',
        a: '123',
      });

      let config2 = app.formatGateways(['foo', 'bar2']);
      this.assert.strictEqual(config2.length, 1);

    });

    it('Should use custom strategy correctly.', async () => {

      const customStrategy = function (gateways) {
        gateways.sort();
        return gateways;
      };

      let app = new EasySms({
        default: {
          strategy: customStrategy,
          gateways: ['foo', 'bar'],
        },
        gateways: {
          foo: {
            a: '123',
          },
          bar: {
            b: '456',
          },
        }
      });

      this.assert.deepStrictEqual(app.config.get('default.gateways'), ['foo', 'bar']);

      let gateways = app.strategy().call(null, ['foo', 'bar']);
      this.assert.deepStrictEqual(gateways, ['bar', 'foo']);
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

    it('Should return error when send fail.', async () => {

      class TestCustomGateway extends Gateway {
        async send(to, message, config) {
          throw new Error('mock-error');
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

      try {
        await app.send('13812341234', {
          content: 'Test content',
        });
      }
      catch (e) {
        this.assert.strictEqual(e.message, 'All the gateways have failed. You can get error details by `exception.getExceptions()`');

        let exception = e.getException('custom');
        this.assert.strictEqual(exception.message, 'mock-error');
      }

    });

  }
}

new TestUnit('Core/EasySms');
