// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => new Promise((resolve, reject) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const {
    OPENID,
    APPID,
    UNIONID
  } = cloud.getWXContext()

  db.collection('user').doc(OPENID).get()
  .then(res => {
    resolve(res.data)
  }).catch(err => {
    reject(err)
  })

})