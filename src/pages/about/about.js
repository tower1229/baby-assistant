// src/pages/about/about.js
const app = getApp()

let cacheKeys = [];
let cacheWhiteList = ['storageFileHash']

Page({

  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    authorAvat: `${app.globalData.host}img/album.jpg`,
    cacheInfo: ''
  },
  accounterror: function(e){
    console.warn(e.detail)
  },
  
  copylinkurl: function(e){
    let link = e.currentTarget.dataset.link;
    wx.setClipboardData({
      data: link,
      success(res) {
        wx.showToast({
          title: '已复制到剪切板！',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  onShareAppMessage(res) {
    if (res.from === 'button') {
      console.log(res.target)
    }
    return {
      title: '宝贝成长助理',
      path: '/pages/index/index',
      imageUrl: '/res/img/logo.png'
    }
  },
  clearCache: function(){
    //清缓存
    wx.showLoading({
      title: '正在清理',
    })
    if (cacheKeys.length){
      cacheKeys.forEach(key => {
        if (!cacheWhiteList.includes(key))
        wx.removeStorageSync(key)
      })
      wx.showToast({
        title: '清理完成',
        icon: 'none',
        duration: 2000
      })
      this.checkCache()
    }
    
  },
  checkCache: function(){
    wx.getStorageInfo({
      success: res => {
        //缓存键
        cacheKeys = res.keys;
        
        let cacheInfo 
        if (res.currentSize < 1024){
          cacheInfo = `${res.currentSize}KB/${parseInt(res.limitSize / 1024)}M`;
        }else{
          cacheInfo = `${parseInt(res.currentSize / 1024 * 100) / 100}M/${parseInt(res.limitSize / 1024)}M`;
        }

        this.setData({
          cacheInfo
        })

      }
    })
  },
  onShow: function(){
    this.checkCache()
  }

})