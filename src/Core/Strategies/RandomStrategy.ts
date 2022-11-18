'use strict';

export default function (gateways: string[]) {
  return gateways.sort((a,b) => {
    return Math.random() - Math.random();
  });
};
