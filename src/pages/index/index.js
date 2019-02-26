//index.js
//获取应用实例
const app = getApp()
// 下载文件存储位置
let storageFileHash = {};

Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    TabCur: 0,
    channels: [],
    downloadPercent: 0,
    modalVisible: false,
    loadModal: false
  },
  renderMain: function(){
    this.setData({
      channels: [{
        text: '体重',
        icon: 'footprint'
      }, {
        text: '身高',
        icon: 'rank'
      }, {
          text: 'BMI（胖瘦）',
        icon: 'new'
      }]
    })
  },
  //事件处理函数
  tabSelect(e) {
    this.setData({
      TabCur: e.currentTarget.dataset.id
    })
  },
  swiperChange(e) {
    this.setData({
      TabCur: e.detail.current
    })
  },
  tointro: function(){
    wx.navigateTo({
      url: '/pages/about/about',
    })
  },
  updateDownloadPercent: function (downFileNumber) {
    this.setData({
      downloadPercent: Math.floor(downFileNumber / app.globalData.fileList.length * 100)
    }, function () {
      if (this.data.downloadPercent === 100) {
        this.setData({
          modalVisible: false
        });
        // 保存文件路径信息
        wx.setStorageSync('storageFileHash', storageFileHash)
        if (Object.keys(storageFileHash).length === app.globalData.fileList.length) {
          wx.reLaunch({
            url: 'index'
          })
        }else{
          console.log('客户端问题')
        }
        
      }
    })
  },
  login: function (callback) {
    //登录
    if (app.globalData.openid){
      typeof callback === 'function' && callback.call(this, app.globalData.openid)
    }else{
      this.setData({
        loadModal: true
      })
      wx.cloud.callFunction({
        name: 'login',
        complete: res => {
          app.globalData.openid = res.result.openid;
          this.setData({
            loadModal: false
          })
          typeof callback === 'function' && callback.call(this, app.globalData.openid)
        }
      })
    }
    
  },
  checkBaby: function(){
    // 更新baby数据
    this.login(function (openid){
      app.globalData.db.collection('baby').doc(openid).get({
        success: res => {
          const baby = res.data; //wx.getStorageSync('baby');
          if (baby.birthday && baby.weight && baby.length) {
            app.globalData.baby = baby;
            this.renderMain()
          } else {
            wx.navigateTo({
              url: '/pages/baby/baby'
            })
          }
        },
        fail: err => {
          wx.navigateTo({
            url: '/pages/baby/baby'
          })
        }
      })
    })
    
  },
  checkData: function () {
    // 检查数据
    wx.getSavedFileList({
      success: (res) => {
        const filePath = wx.getStorageSync('storageFileHash');
        
        if (Object.keys(filePath).length < app.globalData.fileList.length) {
          // 清理已下载文件
          res.fileList.forEach(localFile => {
            wx.removeSavedFile({
              filePath: localFile.filePath,
              complete(res) {
                console.log('本地文件已删除')
              }
            })
          })

          //初始化数据
          const fs = wx.getFileSystemManager();
          let downFileNumber = 0;
          this.setData({
            modalVisible: true
          });

          app.globalData.fileList.forEach(remoteFile => {
            wx.downloadFile({
              url: app.globalData.whoHost + remoteFile,
              success: downloadRes => {

                if (downloadRes.statusCode === 200) {
                  fs.saveFile({
                    tempFilePath: downloadRes.tempFilePath,
                    success: saveRes => {
                      storageFileHash[remoteFile] = saveRes.savedFilePath;

                      downFileNumber++;
                      this.updateDownloadPercent(downFileNumber)
                      
                    },
                    fail: saveFailRes => {
                      downFileNumber++;
                      this.updateDownloadPercent(downFileNumber)
                      console.log(saveFailRes.errMsg)
                    }
                  })
                }
              },
              fail: downloadFailRes => {
                console.warn('下载失败')
              }
            })
          })

        } else {
          console.log('数据就绪')
          this.checkBaby()
        }
      }
    })
  },
  onShow: function(){
    this.checkBaby()
  },
  onReady: function () {
    this.checkData()
  }
})
