// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

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
      diskUsed += e.size
    })
    diskUsed = parseInt(diskUsed /1024 * 10) / 10;
    console.log(`用户${OPENID}共${albums.length}条数据，占用空间${diskUsed}KB`)
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
