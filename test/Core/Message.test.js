const BaseTestUnit = require('../BaseTestUnit');
const { Message } = require('../../dist');

class TestUnit extends BaseTestUnit {

  test() {

    it('Should create message correctly.', async () => {
      let message = new Message({
        content: 'mock-content',
        template: 'mock-template',
        data: {
          a: '123',
          b: '456',
        },
        sign_name: 'mock-sign_name',
      });

      this.assert.strictEqual(await message.getContent(), 'mock-content');
      this.assert.strictEqual(await message.getTemplate(), 'mock-template');
      this.assert.deepStrictEqual(await message.getData(), {
        a: '123',
        b: '456',
      });
      this.assert.strictEqual(await message.getSignName(), 'mock-sign_name');
    });

    it('Should create custom message correctly.', async () => {
      class OrderMessage extends Message {
        gateways = ['foo', 'bar'];

        constructor(order) {
          super({});
          this.order = order;
        }

        async getContent() {
          return `custom-content-${this.order['id']}`;
        }
        async getTemplate() {
          return `custom-template-${this.order['id']}`;
        }
        async getData() {
          return {
            c: '123',
            d: '456',
          };
        }
        async getSignName() {
          return `custom-sign_name-${this.order['name']}`;
        }
      }
      let message = new OrderMessage({
        id: 'mock-id',
        name: 'mock-name',
      });

      this.assert.strictEqual(await message.getContent(), 'custom-content-mock-id');
      this.assert.strictEqual(await message.getTemplate(), 'custom-template-mock-id');
      this.assert.deepStrictEqual(await message.getData(), {
        c: '123',
        d: '456',
      });
      this.assert.strictEqual(await message.getSignName(), 'custom-sign_name-mock-name');
      this.assert.deepStrictEqual(message.getGateways(), ['foo', 'bar']);
    });

  }
}

new TestUnit('Core/Message');
