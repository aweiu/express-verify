/**
 * Created by awei on 2016/7/6.
 */
export default{
  number: {
    common: '{mark}应为数字',
    // >
    maxNumber: '{mark}不能大于{maxNumber}',
    // >=
    maxNumber2: '{mark}应小于{maxNumber}',
    // <
    minNumber: '{mark}不能小于{minNumber}',
    // <=
    minNumber2: '{mark}应大于{minNumber}',
    decimalLength: '{mark}最多为{decimalLength}位小数'
  },
  // 特殊类型
  int: '{mark}仅接受整数',
  phone: '手机号不正确',
  idCard: '身份证号不正确',
  bankCard: '银行卡号不正确',
  verifyCode: '验证码错误',
  email: '邮箱格式不正确',
  common: {
    empty: '{mark}不能为空',
    length: '{mark}必须为{length}位',
    minLength: '{mark}至少{minLength}位',
    maxLength: '{mark}至多{maxLength}位',
    mustBeNull: '{mark}参数不允许'
  }
}

