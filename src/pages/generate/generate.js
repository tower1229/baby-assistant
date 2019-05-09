// src/pages/about/about.js
const app = getApp()
const util = require('../../utils/util.js');
const today = new Date();
const todayFormat = util.formatTime(today, true)
let baby;
// 绘制
const device = wx.getSystemInfoSync()
const ctxOffScreen = wx.createCanvasContext('myCanvas')
ctxOffScreen.customWidth = device.windowWidth;
ctxOffScreen.customCanvasId = 'myCanvas'
const ctxPreview = wx.createCanvasContext('previewCanvas')
ctxPreview.customCanvasId = 'previewCanvas'
//设置
let visibleDate = false;
let visibleText = '';
let textColor = '#434343';

Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    locaAvatFile: '/res/img/grey.png',
    shareImg: '',
    previewWidth: 0,
    previewHeight: 0
  },
  toggleDateVisible: function(e){
    visibleDate = e.detail.value
    this.magic(ctxPreview, true)
  },
  inputChange: function(e){
    visibleText = e.detail.value.trim()
    this.magic(ctxPreview, true)
  },
  setAvatCache: function () {
    wx.showLoading({
      title: '更新照片...',
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
            this.magic(ctxPreview)
          })
        }
      })
    }else if (baby.photo) {
      console.log(baby)
        wx.cloud.downloadFile({
          fileID: baby.photo,
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
                      this.magic(ctxPreview)
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
            //云端头像损坏
            wx.showToast({
              title: '请先上传图片',
              icon: 'none',
              mask: true,
              duration: 3000
            })
            wx.hideLoading()
            this.magic(ctxPreview)
          }
        })
    }else{
      //没有头像
      wx.showToast({
        title: '请先上传图片',
        icon: 'none',
        mask: true,
        duration: 3000
      })
      this.magic(ctxPreview)
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
          this.magic(ctxPreview)
        })
      }
    })
  },
  drawText: function (ctx, callback){
    if(callback){
      wx.showLoading({
        title: '正在绘制',
        mask: true
      })
    }
    //文字
    const baseEm = parseInt(ctx.customWidth / 24);
    const textWidth = parseInt(ctx.customWidth / 3 * 2 * 0.8);
    const textX = parseInt(ctx.customWidth / 3);
    //清除文字区域
    ctx.fillStyle = ('white')
    ctx.fillRect(0, ctx.customWidth, parseInt(ctx.customWidth / 3 * 2), parseInt(ctx.customWidth / 3))

    ctx.fillStyle = (textColor)
    ctx.setTextAlign('center')
    ctx.font = `${parseInt(baseEm * 1.5)}px Arial`;
    //标题
    let textline1 = visibleDate ? todayFormat : util.formatDays(baby.birthday);
    
    ctx.fillText(textline1, textX, ctx.customWidth + baseEm * 3, textWidth)
    ctx.font = `${baseEm}px Arial`
    //ctx.fillStyle = ('#434343')
    let textArray = [];
    const baseTextTop = ctx.customWidth + baseEm * 5;
    const baseTextLineHeight = parseInt(baseEm * 1.7);
    if (visibleText) {
      textArray = util.CalculateText.call(ctx, visibleText, textWidth)
    } else {
      let textline2 = app.globalData.bmi ? `BMI ${app.globalData.bmi}` : (baby.length ? `身高 ${baby.length} CM` : '');
      let textline3 = textline2 ? (app.globalData.bmiPercent ? `超过${app.globalData.bmiPercent}%的小朋友` : `体重 ${baby.weight} KG`) : '请输入文字'
      textArray = [textline2, textline3]
    }
    textArray.forEach((text, i) => {
      ctx.fillText(text, textX, baseTextTop + (i * baseTextLineHeight), textWidth)
    })
    //输出
    ctx.draw(true,  () => {
      if (callback){
        wx.canvasToTempFilePath({
          canvasId: ctx.customCanvasId,
          success: res => {
            //生成
            return this.setData({
              shareImg: res.tempFilePath
            }, function () {
              wx.hideLoading()
              typeof callback === 'function' && callback()
            })
          }
        })
      }else{
        wx.hideLoading()
      }
    })
  },
  magic: function (ctx, RedrawText, callback) {

    let self = this;
    if (RedrawText){
      self.drawText(ctx)
    }else{
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
          ctx.fillStyle = ('white')
          ctx.fillRect(0, 0, ctx.customWidth, ctx.customWidth / 3 * 4)

          //照片
          ctx.drawImage(self.data.locaAvatFile, moveX, moveY, imageLength, imageLength, 0, 0, ctx.customWidth, ctx.customWidth)
          ctx.draw(false, function () {
            //取主色调
            wx.canvasGetImageData({
              canvasId: ctx.customCanvasId,
              x: 0,
              y: 0,
              width: ctx.customWidth,
              height: ctx.customWidth,
              success(res) {
                //console.log(res)
                let r = 0, g = 0, b = 0;
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
                //设置文字颜色
                textColor = "rgb(" + r + "," + g + "," + b + ")";

                //绘制二维码
                ctx.drawImage('/res/img/qrcode.png', ctx.customWidth / 3 * 2, ctx.customWidth, ctx.customWidth / 3, ctx.customWidth / 3)

                self.drawText(ctx, callback)
                
              }
            })
          })

        }
      })
    } 
  },
  saveAlbum2Local: function () {
    this.magic(ctxOffScreen, false, () => {
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
    })
    
  },
  loginHandle: function () {
    const initBaby = () => {
      console.log(baby)
      this.setAvatCache()
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
  },
  onLoad: function(){
    wx.createSelectorQuery().select('#preview').boundingClientRect(rect => {
      let height = parseInt(rect.height);
      let width = parseInt(height / 4 * 3);

      ctxPreview.customWidth = width;

      this.setData({
        previewWidth: width,
        previewHeight: height
      })
    }).exec()

  }

})