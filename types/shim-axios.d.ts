
import axios from 'axios';

declare module 'axios' {
  interface AxiosRequestConfig {
    /**
     * 要发送的xml数据，会自动解析并赋值到data属性，同时设置content-type=text/xml
     */
    xml?: string | Record<string, any>;
    /**
     * 要发送的json数据，会自动解析并赋值到data属性，同时设置content-type=application/json
     */
    json?: string | Record<string, any>;
    /**
     * 要发送的FormData数据，会自动解析并赋值到data属性，同时设置根据内容提取headers
     */
    formData?: Record<string, any>;
  }
}
