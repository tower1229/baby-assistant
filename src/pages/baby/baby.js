// pages/baby/baby.js
const app = getApp()
const util = require('../../utils/util.js');
let baby;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    photo: '',
    picker: ['男', '女'],
    birthday: '2018-03-19',
    gender: '男',
    weight: 0,
    length: 0,
    days: 0,
    modalVisible: false
  },
  PickerChange(e) {
    baby.gender = this.data.picker[e.detail.value]
  },
  DateChange(e) {
    baby.birthday = e.detail.value;
    baby.days = util.computeDays(baby.birthday)
  },
  uploadImg: function() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        // tempFilePath可以作为img标签的src属性显示图片
        baby.photo = res.tempFilePaths
        // 上传
        wx.cloud.uploadFile({
          cloudPath: 'baby-photo.png',
          filePath: res.tempFilePaths, // 文件路径
          success: res => {
            // get resource ID
            console.log(res.fileID)
            baby.photo = res.fileID
          },
          fail: err => {
            // handle error
          }
        })
      }
    })
  },
  edit: function(){
    this.setData({
      modalVisible: true
    })
  },
  updateWeight: function(e){
    baby.weight = e.detail.value
    
  },
  updateLength: function (e) {
    baby.length = e.detail.value
    
  },
  checkData: function(){
    if(!baby.birthday){
      baby.birthday = '2018-03-19'
    }
    if (!baby.gender) {
      baby.gender = '男'
    }
    
    return baby.birthday && baby.weight && baby.length
  },
  update: function(){
    //验证
    if (!this.checkData()) {
      console.log(baby)
      return wx.showToast({
        title: '宝贝信息不完善',
        icon: 'none',
        duration: 2000
      })
    }
    this.setData({
      modalVisible: false,
      ...baby
    });
    app.globalData.baby = baby;
    // 上传到云端
    app.globalData.db.collection('baby').doc(app.globalData.openid).set({
      data: baby,
      success: res => {
        console.log('同步成功')
      }
    })
  },
  onReady: function () {
    baby = app.globalData.baby;
    this.setData({
      ...baby
    })
    
    if (!this.checkData()){
      this.setData({
        modalVisible: true
      })
    }

  }
})