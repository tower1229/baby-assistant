// src/pages/about/about.js
const app = getApp()
const util = require('../../utils/util.js');

let baby;
// 绘制
const device = wx.getSystemInfoSync()
const ctx = wx.createCanvasContext('myCanvas')
const canvasOpt = {
  width: device.windowWidth * device.pixelRatio,
  height: device.windowWidth * device.pixelRatio / 3 * 4
}

Page({

  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    locaAvatFile: '/res/img/fff.png',
    shareImg: ''
  },
  setAvatCache: function () {
    wx.showLoading({
      title: '获取宝宝照片...',
    })
    //头像缓存
    const savedFilePath = wx.getStorageSync('babyAvatCache')
    if (savedFilePath){
      wx.setStorage({
        key: 'babyAvatCache',
        data: savedFilePath,
        success: () => {
          this.setData({
            locaAvatFile: savedFilePath
          }, function () {
            wx.hideLoading()
            this.magic()
          })
        }
      })
    }else if (this.data.photo) {
        wx.cloud.downloadFile({
          fileID: this.data.photo,
          success: res => {
            // 临时文件路径
            console.log(res.tempFilePath)
            wx.saveFile({
              tempFilePath: res.tempFilePath,
              success: res => {
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
                      this.magic()
                    })
                  }
                })
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
    }
  },
  uploadPic: function(){
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        this.setData({
          locaAvatFile: res.tempFilePaths[0]
        }, () => {
          this.magic()
        })
      }
    })
  },
  magic: function () {

    let self = this;
    if (self.data.locaAvatFile) {
      wx.getImageInfo({
        src: self.data.locaAvatFile,
        success(res) {
          let imageLength;
          let imageDistance = (res.width - res.height) / 2;
          let moveX = (imageDistance > 0) ? imageDistance : 0;
          let moveY = (imageDistance < 0) ? -imageDistance : 0;
          //console.log(moveX, moveY)
          if (res.width < res.height) {
            imageLength = res.width;
          } else {
            imageLength = res.height
          }
          //绘制
          ctx.setFillStyle('white')
          ctx.fillRect(0, 0, device.windowWidth, device.windowWidth / 3 * 4)
          //照片
          ctx.drawImage(self.data.locaAvatFile, moveX, moveY, imageLength, imageLength, 0, 0, device.windowWidth, device.windowWidth)
          ctx.draw(false, function () {
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
                ctx.fillText(self.data.formatDays, device.windowWidth / 3, device.windowWidth + baseEm * 3)
                ctx.setFontSize(baseEm)
                //ctx.setFillStyle('#434343')
                let textline2 = app.globalData.bmi ? `BMI ${app.globalData.bmi}` : `身高 ${self.data.length} CM`;
                let textline3 = app.globalData.bmiPercent ? `超过${app.globalData.bmiPercent}%的小朋友` : `体重 ${self.data.weight} KG`
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
    } else {
      wx.showToast({
        title: '你还没上传宝宝靓照呢',
        icon: 'none',
        duration: 2000
      })
    }
  },
  saveAlbum2Local: function () {
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
      }
    })
  },
  loginHandle: function () {
    const initBaby = () => {
      if (baby.birthday) {
        baby.formatDays = util.formatDays(baby.birthday)
        this.setData({
          ...baby
        }, function () {
          this.setAvatCache()
        })
      }
    }

    baby = app.globalData.baby;
    console.log(baby)
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