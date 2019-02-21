//app.js
App({
  onLaunch: function() {
    //初始化云环境
    wx.cloud.init({
      traceUser: true
    });
    this.globalData.db = wx.cloud.database();
      
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
    // 获取系统状态栏信息
    wx.getSystemInfo({
      success: e => {
        this.globalData.StatusBar = e.statusBarHeight;
        this.globalData.CustomBar = e.platform == 'android' ? e.statusBarHeight + 50 : e.statusBarHeight + 45;
      }
    })
  },
  globalData: {
    userInfo: null,
    whoHost: 'https://www.who.int/childgrowth/standards/',
    fileList: [
      'bfa_boys_p_exp.txt',
      'bfa_girls_p_exp.txt',
      'lhfa_boys_z_exp.txt',
      'lhfa_girls_p_exp.txt',
      'wfa_boys_p_exp.txt',
      'wfa_girls_p_exp.txt'
    ],
    baby: {}
  }
})