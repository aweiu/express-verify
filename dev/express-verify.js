/**
 * Created by awei on 2016/7/6.
 */
import verifyBase from 'verify-base'
import verifyErrMsg from './verify-err-msg'
verifyBase.errMsg = verifyErrMsg
var hook = {
  beforeVerify: null,
  error: null,
  getParam: null
}
function verifyFromRules (req, rules, methodsForParamGet) {
  for (var paramOn in rules) {
    if (!rules.hasOwnProperty(paramOn)) break
    var rule1 = rules[paramOn]
    var params = typeof methodsForParamGet[paramOn] === 'function' ? methodsForParamGet[paramOn](req) : (typeof hook.getParam === 'function' ? hook.getParam(req, paramOn) : req[paramOn])
    for (var paramKey in rule1) {
      if (!rule1.hasOwnProperty(paramKey)) break
      var rule2 = rule1[paramKey]
      if (typeof rule2 === 'string') rule2 = {mark: rule2}
      var val = params[paramKey]
      if (rule2 === false) {
        if (val !== undefined) return verifyBase.macro(rule2.errMsg || verifyErrMsg.common.mustBeNull, 'mark', paramKey)
        else continue
      }
      val = val || ''
      if (rule2.space !== true && typeof val === 'string') val = val.trim()
      if (val === '') {
        if (rule2.minLength === 0 || rule2.canBeNull) {
          if (rule2.verify) var justVerifyRule = {verify: rule2.verify}
          else continue
        } else return verifyBase.macro(rule2.errMsg || verifyErrMsg.common.empty, 'mark', rule2.mark || paramKey)
      }
      for (var ruleKey in justVerifyRule || rule2) {
        if (!rule2.hasOwnProperty(ruleKey)) break
        if (ruleKey === 'errMsg' || ruleKey === 'mark' || ruleKey === 'canBeNull') continue
        var ruleVal = rule2[ruleKey]
        if (ruleKey === 'verify') {
          if (typeof ruleVal === 'function') {
            var verifyResult = ruleVal(val)
            if (typeof verifyResult === 'string' || verifyResult === false) return verifyBase.macro(verifyResult || rule2.errMsg || '{mark}未通过校验', 'mark', rule2.mark || paramKey)
          }
          continue
        }
        var verifyFun = verifyBase(ruleKey)
        if (verifyFun) {
          verifyResult = verifyFun(val, ruleVal)
          if (!verifyResult.valid) return verifyBase.macro(rule2.errMsg || verifyResult.err_msg, 'mark', rule2.mark || paramKey)
        }
      }
    }
  }
}
function verify (rules, methodsForParamGet = {}) {
  return function (req, res, next) {
    var tNext = function () {
      var errMsg = verifyFromRules(req, rules, methodsForParamGet)
      var tNext = function () {
        if (errMsg) res.send({err_msg: errMsg})
        else next()
      }
      if (typeof hook.error === 'function') hook.error(errMsg, req, res, next)
      else tNext()
    }
    if (typeof hook.beforeVerify === 'function') hook.beforeVerify(req, res, tNext)
    else tNext()
  }
}
verify.errMsg = verifyErrMsg
Object.defineProperty(verify, "errMsg", {
  set (v) {
    verifyErrMsg = v
    verifyBase.errMsg = v
  },
  get: () => verifyErrMsg
})
verify.verifyBase = verifyBase
verify.on = function (event, callBack) {
  if (hook.hasOwnProperty(event)) hook[event] = callBack
}
verify.canBeNull = function (rules, options = {}) {
  for (var paramOn in rules) {
    if (!rules.hasOwnProperty(paramOn)) break
    var rule1 = rules[paramOn]
    if (!options.hasOwnProperty(paramOn)) options[paramOn] = rule1
    var optionRule1 = options[paramOn]
    for (var paramKey in rule1) {
      if (!rule1.hasOwnProperty(paramKey)) break
      var rule2 = rule1[paramKey]
      if (!optionRule1.hasOwnProperty(paramKey)) optionRule1[paramKey] = rule2
      else if (optionRule1 !== rule1) continue
      if (paramOn !== 'params') {
        if (typeof rule2 === 'string') optionRule1[paramKey] = {mark: rule2, canBeNull: true}
        else if (typeof rule2 === 'object') rule2.canBeNull = true
      }
    }
  }
  return options
}
export default verify
