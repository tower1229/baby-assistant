//app.js
App({
  onLaunch: function() {
    //初始化云环境
    wx.cloud.init({
      traceUser: true
    });
    this.globalData.db = wx.cloud.database();
    
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
    whoHost: 'https://static.refined-x.com/',
    fileList: [
      'bfa_boys_p_exp.txt',
      'bfa_girls_p_exp.txt',
      'lhfa_boys_p_exp.txt',
      'lhfa_girls_p_exp.txt',
      'wfa_boys_p_exp.txt',
      'wfa_girls_p_exp.txt'
    ],
    baby: {}
  }
})