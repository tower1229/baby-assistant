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
    this.setData({
      gender: baby.gender
    })
  },
  DateChange(e) {
    baby.birthday = e.detail.value;
    baby.days = util.computeDays(baby.birthday)
    this.setData({
      birthday: baby.birthday
    })
  },
  uploadImg: function() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        wx.showLoading({
          title: '正在上传...',
        })
        let oldImgId = baby.photo;
        // 上传图片
        wx.cloud.uploadFile({
          cloudPath: app.globalData.openid + '/baby-photo-' + parseInt(Math.random() * 1e6) +'.png',
          filePath: res.tempFilePaths[0], // 文件路径
          success: res => {
            // get resource ID
            baby.photo = res.fileID;
            this.syncCloud(() => {
              this.setData({
                photo: baby.photo
              }, wx.hideLoading)
            })
            // 删除旧图片
            wx.cloud.deleteFile({
              fileList: [oldImgId],
              success: res => {
                // handle success
                console.log('旧图已删除')
              },
              fail: err => {
                // handle error
              }
            })
          },
          fail: err => {
            console.log(err)
            wx.hideLoading()
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
  syncCloud: function(callback){
    // 上传到云端
    delete baby._id;
    delete baby._openid;

    app.globalData.db.collection('baby').doc(app.globalData.openid).set({
      data: baby,
      success: res => {
        console.log('同步成功')
        typeof callback === 'function' && callback.call(this)
      },
      fail: err => {
        console.warn(err)
      }
    })
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
    this.syncCloud()
  },
  onReady: function () {
    baby = app.globalData.baby;
    baby.days = util.computeDays(baby.birthday)
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