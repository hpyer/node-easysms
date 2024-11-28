'use strict';

/**
 * 网关策略 - 随机执行
 * @param gateways 要排序的网关列表
 * @returns
 */
export const RandomStrategy = function(gateways: string[]) {
  return gateways.sort((a,b) => {
    return Math.random() - Math.random();
  });
};
