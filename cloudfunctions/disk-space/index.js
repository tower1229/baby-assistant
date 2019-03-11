// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

//遍历相册，累加已用空间，
//写入用户表

// 云函数入口函数
exports.main = async (event, context) => new Promise((resolve, reject) => {
  const db = cloud.database()
  const {
    OPENID,
    APPID,
    UNIONID
  } = cloud.getWXContext()

  db.collection('album').where({
    _openid: OPENID,
  }).get().then(res => {
    const albums = res.data;
    let diskUsed = 0;
    albums.forEach(e => {
      diskUsed += parseInt((e.size / 1024) * 10)/10
    })
    db.collection('user').doc(OPENID).update({
      data: {
        diskUsed
      }
    }).then(res => {
      console.log('使用空间更新完成')
    })
  }).catch(err => {
    console.error(err)
    db.collection('user').doc(OPENID).update({
      data: {
        diskUsed: 0
      }
    })
  })
})
