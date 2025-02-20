// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => new Promise((resolve, reject) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const {
    OPENID,
    APPID,
    UNIONID
  } = cloud.getWXContext()

  let saveData = Object.assign(event);
  delete saveData.userInfo;

  db.collection('user').doc(OPENID).update({
    data: saveData
  }).then(res => {
    resolve(res)
  }).catch(err => {
    reject(err)
  })

})