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
    showTips: false,
    downloadPercent: 0,
    modalVisible: false
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
  //不合法数据提示
  illegalAlert: function(e){
    const tipHash = {
      weight: '体重',
      length: '身高',
      bmi: 'BMI'
    }
    wx.showToast({
      title: `【${tipHash[e.detail]}】 数据与同龄宝宝差异较大，请检查是否填写正确`,
      icon: 'none',
      duration: 8000
    })
    
  }, 
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
      url: '/pages/question/question'
    })
  },
  tobaby: function(){
    wx.navigateTo({
      url: '/pages/baby/baby',
      success: () => {
        this.hideAlert()
      }
    })
  },
  updateDownloadPercent: function (downFileNumber) {
    let percent = Math.floor(downFileNumber / app.globalData.fileList.length * 100);
    this.setData({
      downloadPercent: percent
    }, () => {
      if (percent >= 100) {
        this.setData({
          modalVisible: false
        });
        // 保存文件路径信息
        if (Object.keys(storageFileHash).length === app.globalData.fileList.length) {
          wx.setStorage({
            key: 'storageFileHash',
            data: storageFileHash,
            success: () => {
              this.checkBaby()
            }
          })
        }else{
          console.log('客户端问题')
        }
        
      }
    })
  },
  
  checkBaby: function () {
    console.warn('checkBaby')
    // 更新baby数据
    let baby = app.globalData.baby
    if (baby && baby.birthday && baby.weight && baby.length) {
      this.renderMain()
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
          if (baby.birthday && baby.weight && baby.length) {
            app.globalData.baby = baby;
            this.renderMain()
          } else {
            wx.showModal({
              title: '欢迎你来！',
              content: '请先完善宝宝信息',
              success: res => {
                if (res.confirm) {
                  wx.navigateTo({
                    url: '/pages/baby/baby'
                  })
                } else if (res.cancel) {
                  this.setData({
                    showTips: true
                  })
                }
              }
            })
            
          }
        }
      })
     
    }
    
  },
  checkData: function () {
    this.setData({
      showTips: false
    })
    if(!app.globalData.openid){
      return console.warn(app.globalData.openid, '用户未登录')
    }
    // 检查数据
    wx.getSavedFileList({
      success: (res) => {
        //文件映射
        const filePath = wx.getStorageSync('storageFileHash') || storageFileHash;
        
        if (Object.keys(filePath).length < app.globalData.fileList.length) {
          this.setData({
            modalVisible: true
          })
          // 清理已下载文件
          res.fileList.forEach(localFile => {
            wx.removeSavedFile({
              filePath: localFile.filePath,
              complete(res) {
                console.log('本地文件已删除')
              }
            })
          })

          //下载数据
          const fs = wx.getFileSystemManager();
          let downFileNumber = 0;
          
          app.globalData.fileList.forEach(remoteFile => {
            wx.downloadFile({
              url: `${app.globalData.host}data/${remoteFile}`,
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
                      console.err(saveFailRes.errMsg)
                    }
                  })
                }
              },
              fail: downloadFailRes => {
                wx.showModal({
                  title: '下载失败',
                  content: '点击"确定"将重新初始化数据',
                  success(res) {
                    if (res.confirm) {
                      wx.removeStorageSync('storageFileHash');
                      wx.reLaunch({
                        url: '/pages/index/index'
                      })
                    }
                  }
                })
                
              }
            })
          })
        } else {
          console.log('数据就绪')
          this.checkBaby()
        }
      },
      fail: err => {
        console.warn('获取下载文件失败')
      }
    })
  },
  loginHandle: function(){
    this.checkData()
  },
  onShow: function(){
    this.checkData()
  }
})
