// pages/baby/baby.js
const app = getApp()
const util = require('../../utils/util.js');
const today = new Date();
const fiveYearsAgo = new Date(today.getTime() - 5 * (365 * 24 * 60 * 60 * 1000));

let baby;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    photo: '',
    locaAvatFile: wx.getStorageSync('babyAvatCache'),
    picker: ['男', '女'],
    today: util.formatTime(today),
    birthday: util.formatTime(today),
    startDate: util.formatTime(fiveYearsAgo),
    gender: '男',
    weight: null,
    length: null,
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
              }, function(){
                wx.hideLoading()
                this.setAvatCache(true)
              })
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
    return !!baby.weight && !!baby.length
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
  update: function(e, jumpCheck){
    //验证
    if (!jumpCheck && !this.checkData()) {
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
  setAvatCache: function(forceUpdate){
    //头像缓存
    if (this.data.photo) {
      if (forceUpdate || (!forceUpdate && !this.data.locaAvatFile)) {
        console.log(this.data.locaAvatFile)
        wx.showLoading({
          title: '更新头像缓存...',
        })
        wx.cloud.downloadFile({
          fileID: this.data.photo,
          success: res => {
            // 返回临时文件路径
            console.log(res.tempFilePath)
            wx.setStorage({
              key: 'babyAvatCache',
              data: res.tempFilePath,
            })
            this.setData({
              locaAvatFile: res.tempFilePath
            }, wx.hideLoading )
            this.update(true, true);
          },
          fail: console.error
        })
      }
    }
  },
  onReady: function () {
    //console.log(this.data.startDate)
    baby = app.globalData.baby;
    if (baby.birthday){
      baby.days = util.computeDays(baby.birthday)
    }
    
    this.setData({
      ...baby
    }, this.setAvatCache)
    
    if (!this.checkData()){
      this.setData({
        modalVisible: true
      })
    }

  }
})