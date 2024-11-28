'use strict';

/**
 * 电话号码类
 */
export class PhoneNumber {

  protected number: string = '';
  protected IDDCode: string = '';

  /**
   * @param number 电话号码，如：13812345678
   * @param IDDCode 国际长途区号，如：86
   */
  constructor(number: string | number, IDDCode: string | number = null) {
    this.number = number + '';
    if (IDDCode) {
      IDDCode = IDDCode + '';
      this.IDDCode = parseInt(IDDCode.replace(/^\+0/, '')).toString();
    }
  }

  /**
   * 获取国际长途区号，如：86
   * @returns
   */
  getIDDCode() {
    return this.IDDCode;
  }
  /**
   * 获取带前缀的国际长途区号
   * @param prefix
   * @returns
   */
  getPrefixedIDDCode(prefix: string) {
    return this.IDDCode ? prefix + this.IDDCode : '';
  }

  /**
   * 获取电话号码，如：13812345678
   * @returns
   */
  getNumber() {
    return this.number;
  }
  /**
   * 获取通用的，如：+8613812345678
   * @returns
   */
  getUniversalNumber() {
    return this.getPrefixedIDDCode('+') + this.number;
  }
  /**
   * 获取带前导0的电话号，如：008613812345678
   * @returns
   */
  getZeroPrefixedNumber() {
    return this.getPrefixedIDDCode('00') + this.number;
  }

  /**
   * 判断是否中国大陆电话号码
   * @returns
   */
  inChineseMainland() {
    return !this.IDDCode || this.IDDCode === '86';
  }

  toString() {
    return this.getUniversalNumber();
  }

};
