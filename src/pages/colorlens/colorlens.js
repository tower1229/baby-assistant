const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    dialogVisible: false,
    themeName: '',
    list: [{
      name: 'theme1',
      title: '好多香瓜',
      bgsrc: app.globalData.host + '/img/theme/album-b-1.jpeg'
    }, {
        name: 'theme2',
        title: '青柠时代',
        bgsrc: app.globalData.host + '/img/theme/album-b-2.jpeg'
      }, {
        name: 'theme3',
        title: '我爱菠萝',
        bgsrc: app.globalData.host + '/img/theme/album-b-3.jpeg'
      }, {
        name: 'theme4',
        title: '可爱草莓',
        bgsrc: app.globalData.host + '/img/theme/album-b-4.jpeg'
      }, {
        name: 'theme5',
        title: '个性涂鸦',
        bgsrc: app.globalData.host + '/img/theme/album-b-5.jpeg'
      }, {
        name: 'theme6',
        title: '粉红小马',
        bgsrc: app.globalData.host + '/img/theme/album-b-6.jpeg'
      }]
  },
  chooseTheme: function(e){
    let themeName = e.currentTarget.dataset.theme;
    if (themeName){
      this.setData({
        themeName
      })
    }
    
  },
  save: function(){
    let themeName = this.data.themeName;
    wx.setStorageSync('themeName', themeName);
    console.log(themeName)
    wx.showLoading({
      title: '正在保存...',
    })
    wx.cloud.callFunction({
      name: 'userSet',
      data: {
        themeName
      }
    }).then(res => {
      console.log(res)
      wx.switchTab({
        url: '/pages/album/album'
      })
    }).catch(err => {
      console.error(err)
      wx.showToast({
        title: err.errMsg,
        icon: 'none'
      })
    })
    
  },
  onShow: function(){
    this.setData({
      themeName: wx.getStorageSync('themeName')
    })
  }

})