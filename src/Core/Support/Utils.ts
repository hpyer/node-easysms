'use strict';

import Crypto from 'crypto';
import Qs from 'qs';
import Xml2js from 'xml2js';

export const createHash = function (str: string, type: string = 'sha1', encode: Crypto.BinaryToTextEncoding = 'hex'): any {
  return Crypto.createHash(type).update(str).digest(encode);
};

export const createHmac = function (str: string, key: string, type: string = 'sha256', encode: Crypto.BinaryToTextEncoding = 'hex'): any {
  return Crypto.createHmac(type, key).update(str).digest(encode);
};

/**
 * 生成随机字符串
 * @param len 长度，默认：16
 * @returns
 */
export const randomString = function (len: number = 16): string {
  let chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  let str = '';
  for (let i = 0; i < len; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return str;
};

/**
 * 获取时间戳
 * @param format 默认返回时间戳
 * @returns
 */
export const timestamp = function (format: string = null): string {
  let date = new Date;
  let str = format || 'u';
  str = str.replace(/yyyy|YYYY/, pad(date.getFullYear(), 4));
  str = str.replace(/yy|YY/, (date.getFullYear() % 100) > 8 ? (date.getFullYear() % 100).toString() : '0' + (date.getFullYear() % 100));
  str = str.replace(/MM/, date.getMonth() > 8 ? (date.getMonth() + 1).toString() : ('0' + (date.getMonth() + 1)));
  str = str.replace(/M/g, (date.getMonth() + 1) + '');
  str = str.replace(/dd|DD/, pad(date.getDate(), 2));
  str = str.replace(/d|D/g, date.getDate() + '');
  str = str.replace(/hh|HH/, pad(date.getHours(), 2));
  str = str.replace(/h|H/g, date.getHours() + '');
  str = str.replace(/mm/, pad(date.getMinutes(), 2));
  str = str.replace(/m/g, date.getMinutes() + '');
  str = str.replace(/ss|SS/, pad(date.getSeconds(), 2));
  str = str.replace(/s|S/g, date.getSeconds() + '');
  str = str.replace(/u/g, parseInt((date.getTime() / 1000).toString()) + '');
  return str;
};

/**
 * 获取UTC时间戳
 * @param format 默认返回时间戳
 * @returns
 */
export const timestampUTC = function (format: string = null): string {
  let date = new Date;
  let str = format || 'u';
  str = str.replace(/yyyy|YYYY/, this.pad(date.getUTCFullYear(), 4));
  str = str.replace(/yy|YY/, (date.getUTCFullYear() % 100) > 8 ? (date.getUTCFullYear() % 100).toString() : '0' + (date.getUTCFullYear() % 100));
  str = str.replace(/MM/, date.getUTCMonth() > 8 ? (date.getUTCMonth() + 1).toString() : ('0' + (date.getUTCMonth() + 1)));
  str = str.replace(/M/g, (date.getUTCMonth() + 1) + '');
  str = str.replace(/dd|DD/, this.pad(date.getUTCDate()));
  str = str.replace(/d|D/g, date.getUTCDate() + '');
  str = str.replace(/hh|HH/, this.pad(date.getUTCHours()));
  str = str.replace(/h|H/g, date.getUTCHours() + '');
  str = str.replace(/mm/, this.pad(date.getUTCMinutes()));
  str = str.replace(/m/g, date.getUTCMinutes() + '');
  str = str.replace(/ss|SS/, this.pad(date.getUTCSeconds()));
  str = str.replace(/s|S/g, date.getUTCSeconds() + '');
  str = str.replace(/u/g, parseInt((date.getTime() / 1000).toString()) + '');
  return str;
};

export const merge = (target: any, source: any): any => {
  if (Object.prototype.toString.call(source) == '[object Object]') {
    if (source.constructor !== Object) {
      target = source;
    }
    else {
      if (!target || Object.prototype.toString.call(target) != '[object Object]') {
        target = {};
      }
      Object.keys(source).map((k) => {
        if (!target[k]) {
          target[k] = null;
        }
        target[k] = merge(target[k], source[k]);
      });
    }
  }
  else if (Array.isArray(source)) {
    if (!target || !Array.isArray(target)) {
      target = [];
    }
    target = target.concat(target, source);
  }
  else {
    target = source;
  }
  return target;
}

export const buildQueryString = function (data: object, options: object = {}): string
{
  return Qs.stringify(data, options);
};

export const parseQueryString = function (data: string, options: object = {}): object
{
  return Qs.parse(data, options);
};

/**
 * 类应用混入方法
 * @param derivedCtor 目标类
 * @param constructors 混入类列表
 */
export const applyMixins = function (derivedCtor: any, constructors: any[]): void {
  constructors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      // 构造函数或目标类已有的方法，则以目标类的为准
      if (name === 'constructor' || typeof derivedCtor.prototype[name] !== 'undefined') return;
      Object.defineProperty(
        derivedCtor.prototype,
        name,
        Object.getOwnPropertyDescriptor(baseCtor.prototype, name) || Object.create(null)
      );
    });
  });
};

/**
 * 如果只有一个同名、同级节点，则不当作数组
 * @param obj
 * @returns
 */
export const singleItem = function (obj: any): any {
  if (typeof obj == 'object') {
    if (typeof obj.length != 'undefined') {
      if (obj.length == 1) {
        return singleItem(obj[0]);
      }
      for (let i = 0; i < obj.length; i++) {
        obj[i] = singleItem(obj[i]);
      }
      return obj;
    }
    else {
      for (let k in obj) {
        obj[k] = singleItem(obj[k]);
      }
    }
  }
  return obj;
};

/**
 * 解析xml
 * @param xml
 * @returns
 */
export const parseXml = async function (xml: string): Promise<Record<string, any>> {
  let res = await Xml2js.parseStringPromise(xml);
  res = singleItem(res);
  return res;
}

/**
 * 构建xml
 * @param data 对象
 * @param rootName 根节点名，默认：'xml'
 * @returns
 */
export const buildXml = function (data: Record<string, any>, rootName: string = 'xml'): string {
  let XmlBuilder = new Xml2js.Builder({
    cdata: true,
    xmldec: null,
    rootName,
    renderOpts: {
      pretty: false,
      indent: '',
      newline: '',
    }
  });
  return XmlBuilder.buildObject(data).replace('<?xml version="1.0"?>', '');
}

/**
 * 将字符串复制为多份
 * @param str 要复制的字符串
 * @param num 要复制的次数
 */
export const repeat = (str: string, num: number): string => {
  return new Array(num + 1).join(str);
}

/**
 * 给字符串填充字符
 * @param str 原字符串
 * @param len 要填充到的字符串长度
 * @param chr 要填充的字符
 * @param leftJustify Ture 表示左侧填充，否则反之
 */
export const pad = function (str: string | number, len: number, chr: string = ' ', leftJustify: boolean = true): string {
  if (typeof str !== 'string') str = str + '';
  let padding = (str.length >= len) ? '' : repeat(chr, len - str.length >>> 0)
  return leftJustify ? padding + str : str + padding
}

// 将单词首字母转成大写，'hello word' => 'Hello World'
export const strUcwords = function (str: string): string
{
  return str.replace(/\b[a-z]/gi, function (letter) {
    return letter.toUpperCase();
  });
};

// 将单词首字母转成小写，'Hello World' => 'hello word'
export const strLcwords = function (str: string): string
{
  return str.replace(/\b[a-z]/gi, function (letter) {
    return letter.toLowerCase();
  });
};

// 驼峰（首字母大写），'hello word' => 'HelloWorld'
export const strStudly = function (value: string): string
{
  return strUcwords(value.replace(/[\-|\_]/gi, ' ')).replace(/\s/gi, '');
};

// 驼峰（首字母小写），'hello word' => 'helloWorld'
export const strCamel = function (value: string): string
{
  return strLcwords(strStudly(value));
};
