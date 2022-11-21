const BaseTestUnit = require('../BaseTestUnit');
const { PhoneNumber } = require('../../dist');

class TestUnit extends BaseTestUnit {

  test() {

    it('Should get number correctly when the phone number set only.', async () => {
      let phone = new PhoneNumber('13812345678');

      this.assert.strictEqual(phone.getNumber(), '13812345678');
      this.assert.strictEqual(phone.getIDDCode(), '');
      this.assert.strictEqual(phone.getUniversalNumber(), '13812345678');
      this.assert.strictEqual(phone.getZeroPrefixedNumber(), '13812345678');
      this.assert.strictEqual(phone + '', '13812345678');
    });

    it('Should get number correctly when the IDD number set.', async () => {
      let phone = new PhoneNumber('13812345678', 86);

      this.assert.strictEqual(phone.getNumber(), '13812345678');
      this.assert.strictEqual(phone.getIDDCode(), '86');
      this.assert.strictEqual(phone.getUniversalNumber(), '+8613812345678');
      this.assert.strictEqual(phone.getZeroPrefixedNumber(), '008613812345678');
      this.assert.strictEqual(phone + '', '+8613812345678');
    });

  }
}

new TestUnit('Core/PhoneNumber');
