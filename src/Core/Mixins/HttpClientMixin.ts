'use strict';

import { AxiosInstance, AxiosRequestConfig, AxiosResponse, Method } from "axios";
import FormData from 'form-data';
import { buildXml, parseXml } from "../Support/Utils";

export default class HttpClientMixin
{

  /**
   * 请求客户端实例
   */
  protected httpClient: AxiosInstance;

  /**
   * 获取请求客户端实例
   * @returns
   */
  getHttpClient(): AxiosInstance {
    return this.httpClient;
  }
  /**
   * 设置请求客户端实例
   * @param instance
   * @returns
   */
  setHttpClient(instance: AxiosInstance): this {
    this.httpClient = instance;
    return this;
  }

  get(url: string, query: Record<string, any> = {}, headers: Record<string, any> = {}) {
    return this.request('get', url, {
      params: query,
      headers,
    });
  }

  post(url: string, data: Record<string, any> = {}, headers: Record<string, any> = {}) {
    return this.request('post', url, {
      formData: data,
      headers,
    });
  }

  postJson(url: string, data: Record<string, any> = {}, headers: Record<string, any> = {}) {
    return this.request('post', url, {
      json: data,
      headers,
    });
  }

  /**
   * 发起网络请求
   * @param method 请求方式
   * @param url 请求地址
   * @param payload 请求参数
   * @returns
   */
  async request(method: Method, url: string, payload: AxiosRequestConfig<any> = {}) {
    let options: AxiosRequestConfig = { ...payload };
    if (!options.headers) options.headers = {};
    options.method = method;
    options.url = url;

    if (typeof this['getTimeout'] === 'function') {
      options.timeout = this['getTimeout']();
    }
    else {
      options.timeout = 5000;
    }

    if (options['xml'] !== undefined) {
      let xml = '';
      if (typeof options['xml'] === 'object') {
        xml = buildXml(options['xml']);
      }
      else if (typeof options['xml'] === 'string') {
        xml = options['xml'];
      }
      else {
        throw new Error('The type of `xml` must be string or object.');
      }

      if (!options.headers['Content-Type'] && !options.headers['content-type']) {
        options.headers['content-type'] = 'text/xml';
      }

      options.data = xml;
      options['xml'] = undefined;
      delete options['xml'];
    }
    if (options['json'] !== undefined) {
      let json = '';
      if (typeof options['json'] === 'object') {
        json = JSON.stringify(options['json']);
      }
      else if (typeof options['json'] === 'string') {
        json = options['json'];
      }
      else {
        throw new Error('The type of `json` must be string or object.');
      }

      if (!options.headers['Content-Type'] && !options.headers['content-type']) {
        options.headers['content-type'] = 'application/json';
      }

      options.data = json;
      options['json'] = undefined;
      delete options['json'];
    }
    if (options['formData'] && Object.keys(options['formData']).length > 0) {
      let formData = new FormData();
      for (let key in options['formData']) {
        formData.append(key, options['formData'][key]);
      }
      if (options.data) for (let key in options.data) {
        formData.append(key, options.data[key]);
      }
      options.data = formData;
      options['formData'] = undefined;
      delete options['formData'];
    }

    // 如果 data 是 FormData 对象，则从中提取 headers
    if (options.data && options.data instanceof FormData) {
      options.headers = { ...(await this.getFormDataHeaders(options.data)), ...options.headers };
    }

    let response = await this.httpClient.request(options);

    return await this.unwrapResponse(response);
  }

  /**
   * 获取 FormData 对象的 headers
   * @param formData
   * @returns
   */
  protected getFormDataHeaders(formData: FormData): Promise<Record<string, string | number>> {
    return new Promise((resolve, reject) => {
      let headers = formData.getHeaders();
      formData.getLength(function (err, length) {
        if (err) {
          headers['content-length'] = 0;
        }
        else {
          headers['content-length'] = length;
        }
        resolve(headers);
      });
    });
  }

  protected async unwrapResponse(response: AxiosResponse): Promise<Record<string, any>> {
    let contentType = response.headers['Content-Type'];
    let content = response.data;

    if (contentType) {
      if (contentType.indexOf('xml') > -1) {
        content = await parseXml(content);
      }
    }

    return content;
  }

};
