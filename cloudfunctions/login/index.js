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
  db.collection('user').doc(OPENID).get().then(userRes => {
    db.collection('system').doc('set').get().then(sysRes => {
      const systemSet = sysRes.data;
      let updateObj = Object.assign(userRes.data)
      delete updateObj._id;

      if (updateObj.space < systemSet.userDisk) {
        updateObj.space = systemSet.userDisk
      }
      if (updateObj.themeName === void (0)) {
        updateObj.themeName = ''
      }

      db.collection('user').doc(OPENID).set({
        data: updateObj
      }).then(() => {
        console.log('用户表更新完成')
        resolve({
          openid: OPENID,
          APPID,
          UNIONID,
        })
      }).catch(err => {
        console.error('用户表更新错误', err)
        resolve({
          openid: OPENID,
          APPID,
          UNIONID,
        })
      })
    })

  }).catch(err => {
    db.collection('system').doc('set').get().then(res => {
      const systemSet = res.data;
      db.collection('user').doc(OPENID).set({
        data: {
          space: systemSet.userDisk,
          diskUsed: 0,
          themeName: ''
        }
      }).then(res => {
        console.log('用户表初始化完成')
        resolve({
          openid: OPENID,
          APPID,
          UNIONID,
        })
      }).catch(err => {
        console.error('用户表初始化错误', err)
        resolve({
          openid: OPENID,
          APPID,
          UNIONID,
        })
      })
    })

  })



})