// src/pages/about/about.js
const app = getApp()
const util = require('../../utils/util.js');
const collectionAlbum = app.globalData.db.collection('album');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    albums: [],
    diskUsed: 0,
    diskAll: 0,
    usedPer: 0
  },
  view: function(e){
    const id = e.currentTarget.dataset.id;
    if(id){
      const albumData = this.data.albums.find(e => e._id===id);
      //console.log(albumData)
      wx.setStorage({
        key: 'pageParam',
        data: albumData,
        success: function(){
          wx.navigateTo({
            url: '/pages/albumDetail/albumDetail',
          })
        }
      })
    }
  },
  add: function () {
    //检查空间容量
    if (this.data.usedPer>=100){
      return wx.showToast({
        title: '空间已满',
        icon: 'none',
        duration: 2000
      })
    }
    wx.redirectTo({
      url: '/pages/addAlbum/addAlbum',
    })
  },
  getDoc: function () {
    wx.showLoading({
      title: '加载中...',
    })
    collectionAlbum.where({
      _openid: app.globalData.openid
    })
    .orderBy('titleDate', 'desc')
    .get({
      success: res => {
        //扩展天数
        const renderData = res.data.map(e => {
          e.days = util.formatDays(e.titleDate)
          return e
        })
        //渲染
        this.setData({
          albums: renderData
        })
        wx.hideLoading()
      },
      fail: err => {
        wx.showToast({
          title: '查询异常',
          icon: 'none',
          duration: 2000
        })
        console.warn(err)
      }
    })
  },
  checkDisk: function () {
    //取用户数据
    app.globalData.db.collection('user').doc(app.globalData.openid).get().then(res => {
      console.log(res.data)
      const diskUsed = res.data.diskUsed;
      const diskAll = res.data.space;
      const usedPer = parseInt(diskUsed / diskAll * 100) / 100;
      
      this.setData({
        diskUsed: diskUsed > 1024 ? parseInt(diskUsed / 1024 * 10) / 10 + 'M' : diskUsed + 'KB',
        diskAll: util.fix1(diskAll / 1024),
        usedPer
      })
    }).catch(err => {
      console.warn(err)
    })
  },
  loginHandle: function () {
    this.getDoc()
    this.checkDisk()
  },
  onShow: function(){
    if (app.globalData.openid){
      this.getDoc()
      this.checkDisk()
    }
   
  }

})