// src/pages/about/about.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    dialogVisible: false
  },
  accounterror: function(e){
    console.log(e.detail)
  },
  updateData: function(){
    this.setData({
      dialogVisible: true
    })
    
  },
  hideModal: function(){
    this.setData({
      dialogVisible: false
    })
  },
  restart: function(){
    wx.removeStorageSync('storageFileHash');
    wx.reLaunch({
      url: '/pages/index/index'
    })
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
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

})