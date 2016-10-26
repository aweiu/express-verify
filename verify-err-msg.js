'use strict';

/**
 * Created by awei on 2016/7/6.
 */
module.exports = {
  number: {
    common: '应为数字',
    // >
    maxNumber: '不能大于{maxNumber}',
    // >=
    maxNumber2: '应小于{maxNumber}',
    // <
    minNumber: '不能小于{minNumber}',
    // <=
    minNumber2: '应大于{minNumber}',
    decimalLength: '最多为{decimalLength}位小数'
  },
  // 特殊类型
  int: '应为整数',
  phone: '手机号不正确',
  idCard: '身份证号不正确',
  bankCard: '银行卡号不正确',
  verifyCode: '验证码错误',
  email: '邮箱格式不正确',
  // 其他
  common: {
    length: '内容长度必须为{length}位',
    minLength: '内容至少{minLength}位',
    maxLength: '内容至多{maxLength}位'
  }
};