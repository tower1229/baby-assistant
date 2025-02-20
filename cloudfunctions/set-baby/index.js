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

  db.collection('baby').doc(OPENID).set({
    data: saveData
  })
    .then(res => {
      console.log('宝贝信息更新成功')
      resolve(res)
    })
    .catch(err => {
      console.warn(err)
      reject(err)
    })

})