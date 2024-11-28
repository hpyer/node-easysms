'use strict';

/**
 * 网关策略 - 顺序执行
 * @param gateways 要排序的网关列表
 * @returns
 */
export const OrderStrategy = function(gateways: string[]) {
  return gateways;
};
