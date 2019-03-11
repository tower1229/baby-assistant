// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => new Promise((resolve, reject) => {

  const {
    OPENID,
    APPID,
    UNIONID
  } = cloud.getWXContext()

  //检查用户表
  const db = cloud.database()
  db.collection('user').doc(OPENID).get().then(res => {
    
    resolve({
      openid: OPENID,
      APPID,
      UNIONID,
    }) 
  }).catch(err => {
    db.collection('system').doc('set').get().then(res => {
      const systemSet = res.data;
      console.log(systemSet)
      db.collection('user').doc(OPENID).set({
        data: {
          space: systemSet.userDisk,
          diskUsed: 0
        }
      }).then(res => {
        console.log('用户表初始化完成')
        resolve({
          openid: OPENID,
          APPID,
          UNIONID,
        }) 
      })
    })
    
  })
  
})