const app = getApp()
const util = require('../../utils/util.js');
const today = new Date();
const todayFormat = util.formatTime(today)
const fiveYearsAgo = new Date(today.getTime() - 5 * (365 * 24 * 60 * 60 * 1000));

let baby;
// 绘制
const device = wx.getSystemInfoSync()
const ctx = wx.createCanvasContext('myCanvas')
const canvasOpt = {
  width: device.windowWidth * device.pixelRatio,
  height: device.windowWidth * device.pixelRatio / 3 * 4
}

Page({
  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    photo: '',
    locaAvatFile: '',
    picker: ['男', '女'],
    today: todayFormat,
    birthday: todayFormat,
    startDate: util.formatTime(fiveYearsAgo),
    gender: '男',
    weight: null,
    length: null,
    formatDays: '',
    modalVisible: false,
    shareImg: ''
  },
  closeShareImg: function(){
    this.setData({
      shareImg: ''
    })
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
        const oldImgId = baby.photo;
        // 上传图片
        wx.cloud.uploadFile({
          cloudPath: app.globalData.openid + '/baby-photo-' + parseInt(Math.random() * 1e6) + '.png',
          filePath: res.tempFilePaths[0], // 文件路径
          success: res => {
            // get resource ID
            console.log(res)
            baby.photo = res.fileID;
            this.setData({
              photo: baby.photo
            }, function () {
              wx.hideLoading()
              this.setAvatCache(true)
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
  checkData: function () {
    if (!baby.birthday) {
      baby.birthday = this.data.today
    }
    if (!baby.gender) {
      baby.gender = '男'
    }
    return !!baby.weight && !!baby.length
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
  setAvatCache: function (forceUpdate) {
    //头像缓存
    if (this.data.photo) {
      if (forceUpdate || (!forceUpdate && !this.data.locaAvatFile)) {
        wx.showLoading({
          title: '更新头像缓存...',
        })
        wx.cloud.downloadFile({
          fileID: this.data.photo,
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
                    }, function(){
                      wx.hideLoading()
                    })
                  }
                })
                
                this.update(true, true);
              },
              fail: console.error
            })

          },
          fail: console.error
        })
      }
    }
  },
  magic: function () {
    wx.showLoading({
      title: '马上好',
    })
    let self = this;
    if(self.data.locaAvatFile){
      wx.getImageInfo({
        src: self.data.locaAvatFile,
        success(res) {
          let imageLength;
          let imageDistance = (res.width - res.height) / 2;
          let moveX = (imageDistance > 0) ? imageDistance : 0;
          let moveY = (imageDistance < 0) ? -imageDistance : 0;
          //console.log(moveX, moveY)
          if (res.width < res.height){
            imageLength = res.width;
          }else{
            imageLength = res.height
          }
          //绘制
          ctx.setFillStyle('white')
          ctx.fillRect(0, 0, device.windowWidth, device.windowWidth / 3 * 4)
          //照片
          ctx.drawImage(self.data.locaAvatFile, moveX, moveY, imageLength, imageLength, 0, 0, device.windowWidth, device.windowWidth)
          ctx.draw(false, function(){
            //取主色调
            wx.canvasGetImageData({
              canvasId: 'myCanvas',
              x: 0,
              y: 0,
              width: device.windowWidth,
              height: device.windowWidth,
              success(res) {
                //console.log(res)
                let r = 0, g = 0, b = 0, color;
                for (let row = 0; row < res.height; row++) {
                  for (let col = 0; col < res.width; col++) {
                    r += res.data[((res.width * row) + col) * 4];
                    g += res.data[((res.width * row) + col) * 4 + 1];
                    b += res.data[((res.width * row) + col) * 4 + 2];
                  }
                }

                // 求取平均值
                r /= (res.width * res.height);
                g /= (res.width * res.height);
                b /= (res.width * res.height);

                // 将最终的值取整
                r = Math.round(r);
                g = Math.round(g);
                b = Math.round(b);

                color = "rgb(" + r + "," + g + "," + b + ")";
                console.log(color)

                //二维码
                ctx.drawImage('/res/img/qrcode.png', device.windowWidth / 3 * 2, device.windowWidth, device.windowWidth / 3, device.windowWidth / 3)
                //文字
                const baseEm = device.windowWidth / 24;
                ctx.setFillStyle(color)
                ctx.setTextAlign('center')
                ctx.setFontSize(baseEm * 1.5)
                ctx.fillText(self.data.formatDays , device.windowWidth / 3, device.windowWidth + baseEm * 3)
                ctx.setFontSize(baseEm)
                //ctx.setFillStyle('#434343')
                let textline2 = app.globalData.bmi ? `BMI ${app.globalData.bmi}` : `身高 ${self.data.height} CM`;
                let textline3 = app.globalData.bmiPercent ? `超过${app.globalData.bmiPercent}%的小朋友` : `体重 ${weight} KG`
                ctx.fillText(textline2, device.windowWidth / 3, device.windowWidth + baseEm * 5)
                ctx.fillText(textline3, device.windowWidth / 3, device.windowWidth + baseEm * 6.7)

                ctx.draw(true, function () {
                  wx.canvasToTempFilePath({
                    canvasId: 'myCanvas',
                    success(res) {
                      //生成
                      return self.setData({
                        shareImg: res.tempFilePath
                      }, function () {
                        wx.hideLoading()
                      })
                      
                    }
                  })
                })

              }
            })
          })
          
        }
      })
    }
  },
  saveAlbum2Local: function(){
    //海报存相册
    let filepath = this.data.shareImg;
    wx.saveImageToPhotosAlbum({
      filePath: filepath,
      success() {
        wx.showToast({
          title: '已保存到手机',
          icon: 'none',
          duration: 2000
        })
      },
      fail: err => {
        wx.showToast({
          title: err.errMsg,
          icon: 'none',
          duration: 2000
        })
      },
      complete: () => {
        this.closeShareImg()
      }
    })
  },
  onShow: function(){
    this.setData({
      locaAvatFile: wx.getStorageSync('babyAvatCache')
    })
  },
  onReady: function () {
    const initBaby = () => {
      if (baby.birthday) {
        baby.formatDays = util.formatDays(baby.birthday)
        this.setData({
          ...baby
        }, function () {
          this.setAvatCache()
        })

      }
      
      if (!this.checkData()) {
        this.setData({
          modalVisible: true
        })
      }
    }
    baby = app.globalData.baby;
    if (baby) {
      console.log('baby信息', baby)
      initBaby()
    }else{
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