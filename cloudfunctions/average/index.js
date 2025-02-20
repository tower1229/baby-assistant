// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

//保留小数
const fix2 = function (float) {
  return parseInt(float * 100) / 100
}
const fix3 = function (float) {
  return parseInt(float * 1000) / 1000
}


// 云函数入口函数
exports.main = async (event, context) => new Promise((resolve, reject) => {
  const db = cloud.database()
  let totalLength = 0;
  let totalWeight = 0;

  db.collection('baby').get().then(res => {
    const allDate = res.data;

    allDate.forEach(e => {
      totalLength += parseFloat(e.length);
      totalWeight += parseFloat(e.weight);
    });

    let length = fix2(totalLength / allDate.length);
    let weight = fix2(totalWeight / allDate.length);
    let bmi = fix3(weight / Math.pow(length / 100, 2))

    db.collection('system').doc('average').set({
      data: {
        length,
        weight,
        bmi
      }
    }).then(res => {
      console.log('平均数计算成功')
    }).catch(e => {
      console.error(e)
    })

    resolve({
      length,
      weight,
      bmi
    })
  }).catch(err => {
    console.error(err)
  })
})
