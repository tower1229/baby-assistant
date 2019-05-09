const app = getApp()
const util = require('../../utils/util.js');
const today = new Date();
const todayFormat = util.formatTime(today)
const fiveYearsAgo = new Date(today.getTime() - 5 * (365 * 24 * 60 * 60 * 1000));

let baby;
let __photo = '';
//清理数据
const clearn = function(data){
  const __baby = Object.assign({}, data);
  delete __baby.photo;
  return __baby
}

Page({
  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    locaAvatFile: '',
    picker: ['男', '女'],
    today: todayFormat,
    birthday: todayFormat,
    startDate: util.formatTime(fiveYearsAgo),
    nickname: '',
    gender: '男',
    weight: null,
    length: null,
    formatDays: '',
    modalVisible: false,
    shareImg: ''
  },
  updateNickname(e) {
    baby.nickname = e.detail.value
  },
  PickerChange(e) {
    baby.gender = this.data.picker[e.detail.value]
    this.setData({
      gender: baby.gender
    })
  },
  DateChange(e) {
    baby.birthday = e.detail.value;
    baby.formatDays = util.formatDays(baby.birthday)
    this.setData({
      birthday: baby.birthday
    })
  },
  uploadImg: function () {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        wx.showLoading({
          title: '正在上传...',
        })
        const oldImgId = __photo;
        // 上传图片
        wx.cloud.uploadFile({
          cloudPath: app.globalData.openid + '/baby-photo-' + parseInt(Math.random() * 1e6) + '.png',
          filePath: res.tempFilePaths[0], // 文件路径
          success: res => {
            // get resource ID
            console.log(res)
            __photo = res.fileID;
            wx.hideLoading()
            this.setAvatCache(true)

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
  edit: function () {
    this.setData({
      modalVisible: true
    })
  },
  updateWeight: function (e) {
    baby.weight = e.detail.value
  },
  updateLength: function (e) {
    baby.length = e.detail.value
  },
  syncCloud: function (callback) {
    // 上传到云端
    delete baby._id;
    delete baby._openid;
    delete baby.formatDays;
    wx.cloud.callFunction({
      name: 'set-baby',
      data: baby,
      success: res => {
        console.log('同步成功', res)
        typeof callback === 'function' && callback.call(this)
      },
      fail: err => {
        console.warn(err)
      }
    })
  },
  update: function (e, jumpCheck) {
    //验证
    if (!jumpCheck && !util.checkData(baby)) {
      console.log(baby)
      return wx.showToast({
        title: '宝贝信息不完善',
        icon: 'none',
        duration: 2000
      })
    }
    setTimeout(() => {
      const __baby = clearn(baby);
      this.setData({
        modalVisible: false,
        ...__baby
      });
      app.globalData.baby = baby;
      this.syncCloud()
    },16)
    
  },
  //关闭弹窗
  hideModal: function(){
    this.setData({
      modalVisible: false
    });
  },
  setAvatCache: function (forceUpdate) {
    //头像缓存
    const savedFilePath = wx.getStorageSync('babyAvatCache')
    if (!forceUpdate && savedFilePath) {
      wx.setStorage({
        key: 'babyAvatCache',
        data: savedFilePath,
        success: () => {
          this.setData({
            locaAvatFile: savedFilePath
          }, function () {
            wx.hideLoading()
          })
        }
      })
    } else if (__photo) {
      wx.showLoading({
        title: '更新头像缓存...',
      })
      wx.cloud.downloadFile({
        fileID: __photo,
        success: res => {
          // 临时文件路径
          console.log(res.tempFilePath)
          wx.saveFile({
            tempFilePath: res.tempFilePath,
            success: res => {
              console.log('本地存储路径')
              const savedFilePath = res.savedFilePath;
              //本地存储路径
              wx.setStorage({
                key: 'babyAvatCache',
                data: savedFilePath,
                success: () => {
                  this.setData({
                    locaAvatFile: savedFilePath
                  }, function () {
                    wx.hideLoading()
                  })
                }
              })

              this.update(true, true);
            },
            fail: err => {
              wx.showToast({
                title: '头像下载失败，过一会儿再试试',
                icon: 'none',
                duration: 3000
              })
            }
          })
        },
        fail: err => {
          wx.showToast({
            title: '头像竟然损坏了，请重新上传',
            icon: 'none',
            duration: 3000
          })
        }
      })
    }else{
      console.warn('未上传头像')
    }
  },
  onShow: function () {
    this.setData({
      locaAvatFile: wx.getStorageSync('babyAvatCache')
    })
  },
  onReady: function () {
    const initBaby = () => {
      if (!baby.birthday) {
        baby.birthday = this.data.today
      }
      if (!baby.gender) {
        baby.gender = '男'
      }
      baby.formatDays = util.formatDays(baby.birthday);
      const __baby = clearn(baby);
      this.setData({
        ...__baby
      }, function () {
        this.setAvatCache()
      })

      if (!util.checkData(baby)) {
        this.setData({
          modalVisible: true
        })
      }
    }
    baby = app.globalData.baby;
    if (baby) {
      console.log('baby信息', baby)
      initBaby()
    } else {
      wx.showLoading({
        title: '正在更新信息',
      })
      wx.cloud.callFunction({
        name: 'get-baby',
        success: res => {
          console.log(res)
          wx.hideLoading()
          baby = res.result;
          app.globalData.baby = baby;
          initBaby()
        }
      })

    }

  }
})