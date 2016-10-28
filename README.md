# express-verify
express校验插件，用于校验用户提交参数

## 安装
```
npm install express-verify
```
## 使用
*原则：适用于参数文本本身的校验，比如文本长度，数字大小，是否为空这类。而需要从数据库中校验的操作，比如通过某个参数判断用户是否存在这种校验应该放在router中*
### 一，在./app.js中执行全局配置
```
import verify from 'express-verify'
// 以下配置非必须，按你的需求来
// 校验前的hook 一般用于过滤或修改某些提交参数
verify.beforeVerify = (req, res, next, router) => {
    // next(Function)：继续校验
    // router(Function)：跳过本次校验，开始执行路由
    // 如果提交的name为"admin"则跳过本次校验，否则继续校验
    req.body.name = 'admin' ? router() : next()
}
// 校验不通过的hook 用于配置校验不通过时的返回信息
verify.onError = (errMsg, req, res, next) => {
  // errMsg：校验不通过的错误信息
  // next(Function)：忽略本次错误，继续执行路由
  
  // 插件默认执行如下代码，返回错误信息。你可以在这里修改校验不通过的response
  res.send({err_msg: errMsg})
}
// 校验插件获取req参数的方法配置 一般用于项目需要通过自己封装的方法获取参数
verify.paramGetter = (req, paramOn) => {
  // paramOn：参数在req中的位置(body/query/params...)
  return '处理后的提交参数'
})
// 配置默认校验不通过时的提示信息
verify.errMsg = YourErrMsg
```
### 二，针对每个router创建校验规则文件
*推荐在当前项目根目录下创建verify文件夹，所有校验规则放在该目录*
```
// ./verify/users.js 针对Router => users 的校验规则
import verify from 'verify'
export default {
  // 添加用户 接口的校验规则
  addUser: verify({
    // 参数路径 body/query/params ...
    body: {
      // 参数名
      name: {
        // 通过mark参数给name一个别名 使错误提示更具体(校验不通过会返回‘姓名不能为空／姓名至少2位／姓名至多6位’)
        mark: '姓名',
        // 具体的校验规则
        minLength: 2,
        maxLength: 6
      },
      phone: {
        // 自定义校验不通过提示
        errMsg: '手机号不正确',
        phone: true
      }
    }
  })
}
```
### 三，具体的router中引用对应的校验规则
```
import express from 'express'
// 引用校验规则
import usersVerify from '../verify/users'
var router = express.Router()
router.put('/users', usersVerify.addUser, (req, res, next) => {
  // 当所有参数校验都通过后才会执行这里的代码
})
```
## 支持的校验规则(继承verify-base.js)
* length: 校验文本长度
* minLength: 校验文本最短长度
* maxLength: 校验文本最长长度
* maxNumber: 校验数字最大值
* minNumber: 校验数字最小值
* decimalLength: 校验小数位
* number: 校验是否为数字
* int: 校验是否为整数
* phone: 校验是否为手机号
* idCard: 校验是否为身份证号
* bankCard: 校验是否为银行卡号
* email: 校验是否为电子邮件地址
* verifyCode: 校验是否为6位数字验证码
* canBeNull: 当参数为空时跳过校验，不会执行后面的校验规则
* mustBeNull: 强制参数必须为空，不允许提交

## 重要校验参数说明
### mark
* 用于给校验参数配置别名以替换默认校验不通过提示中的{mark}关键字。**错误提示优先读取errMsg配置项，如果已经配置了errMsg就没必要mark了**
* 如果没有配置mark和errMsg，将直接使用参数名作为别名
* 校验规则中出现的参数，默认都会校验不为空。如果某个参数仅仅是要校验不为空可以使用缩写：
```
// 假设name参数在req.body中
body: {
  name: '姓名'
}
```
### errMsg
用于自定义校验不通过提示
```
// 假设token参数在req.body中
// 当token长度不等于10时，错误提示为：'您没有权限访问'
body: {
  token: {
    errMsg: '您没有权限访问',
    length: 10
  }
}
```
### canBeNull
**校验规则中出现的参数，默认都会校验不为空**，该参数一般用于如下情况，比如邀请码这种一般可以为空的参数
```
// 假设invitationCode参数在req.body中
body: {
  invitationCode: {
    mark: '邀请码'
    // 邀请码为空时不校验
    canBeNull: true,
    // 不为空时校验长度是否为6
    length: 6
  }
}
```
### mustBeNull
用于强制参数必须为空，不允许提交。可以使用缩写
```
// 假设id参数在req.body中
body: {
  id: false
}
```
### maxNumber
注意小于和小于等于的写法
```
// 假设number1/number2参数在req.body中
body: {
  number1: {
    // number1 <= 10
    maxNumber: 10
  },
  number2: {
    // number2 < 10
    maxNumber: '!10'
  }
}
```
### minNumber
参考**maxNumber**配置

## 自定义校验方法
如果自带的校验方法满足不了您的需求，可以在校验规则中插入您自己的校验方法
```
// 假设id参数在req.body中
body: {
  id: {
    length: 24,
    verify (val) {
      // val为id参数的提交值
      // 可以直接return校验不通过的提示
      // if (val.substr(0,2) !== 'id') return 'id格式不正确'
      // 如果直接return true/false 校验不通过提示将使用errMsg或默认错误提示
      // return val.substr(0,2) === 'id'
    }
  }
}
```
## 自定义body/query/params..参数获取方法
除了使用插件默认参数获取或配置全局paramGetter外，如果需要针对某个校验规则单独处理参数获取，可以给主函数传入自定义参数获取方法
```
// ./verify/users.js 针对Router => users 的校验规则
import verify from 'verify'
export default {
  // verifyRule: 参考上文的校验规则示例
  addUser: verify(verifyRule, {
    body (req) {
      return '您处理后的body中的所有参数'
    },
    query (req) {
      return '您处理后的query中的所有参数'
    }
  })
}
```
## 属性
### beforeVerify
校验前的hook 一般用于过滤或修改某些提交参数。参考上文 **全局配置**

### onError
校验不通过的hook 一般用于配置校验不通过时的返回信息。参考上文 **全局配置**

### paramGetter
校验插件获取req参数的方法配置 一般用于项目需要通过自己封装的方法获取参数。参考上文 **全局配置**

### verifyBase
本插件校验的核心方法来自[verify-base](https://github.com/aweiu/verify-base)
```
// 通过该方式获取verifyBase以使用其内置的各种校验方法
verify.verifyBase
```
### errMsg
插件的默认校验不通过提示模版
```
{
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
```
您可以按照上述格式自定义您的错误提示
```
verify.errMsg = {}
```
也可以只修改某些项
```
verify.errMsg.int = '{mark}必须为整数'
```
## 方法
### canBeNull (rules, options = {})
用于批量给校验规则添加canBeNull属性 rules: 待处理的校验规则 options: 自定义处理规则
```
var rules = {
  body: {
    name: '姓名',
    age: {
      mark: '年龄'
      int: true,
      maxNumber: 20
    }
  }
}
// 为rules批量添加canBeNull属性，并传入自定义处理规则
verify.canBeNull(rules, {
  body: {
    // 添加sex参数的校验
    sex: {
      mark: '性别',
      canBeNull: true
    },
    // 覆盖age参数的校验
    age: {
      mark: '年龄'
      int: true,
      maxNumber: 21
    }
  }
})
// 返回
{
  body: {
    name: {
      mark: '姓名',
      canBeNull: true
    },
    age: {
      mark: '年龄'
      int: true,
      maxNumber: 21
    },
    sex: {
      mark: '性别',
      canBeNull: true
    }
  }
}
```
