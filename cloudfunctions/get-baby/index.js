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

  db.collection('baby').doc(OPENID).get()
    .then(res => {
      console.log('宝贝信息获取成功')
      let babyData = res.data;
      delete babyData._id
      delete babyData.__openid
      resolve(babyData)
    })
    .catch(err => {
      //初始化baby
      const newBaby = {
        birthday: '',
        gender: '',
        length: 0,
        weight: 0,
        photo: ''
      }
      db.collection('baby').add({
        data: {
          _id: OPENID,
          ...newBaby
        }
      }).then(() => {
        console.log('宝贝信息已初始化')
        resolve(newBaby)
      }).catch(err => {
        console.warn(err)
        resolve(newBaby)
      })
    })

})