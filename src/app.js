//app.js
App({
  upDataApp: function () {//版本更新
    const updateManager = wx.getUpdateManager();
    updateManager.onCheckForUpdate(function (res) {
      if (res.hasUpdate) { // 请求完新版本信息的回调
        updateManager.onUpdateReady(function () {
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用？',
            success: function (res) {
              if (res.confirm) {
                updateManager.applyUpdate()
              }
            }
          })
        });
        updateManager.onUpdateFailed(function () {
          wx.showModal({// 新的版本下载失败
            title: '更新提示',
            content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开',
          })
        })
      }else{
        console.warn(res)
      }
    })
  },
  onLaunch: function() {
    //初始化云环境
    wx.cloud.init({
      env:"cloudbase-8grlv3hha693d6f6",
      traceUser: true
    });
    this.globalData.db = wx.cloud.database();
    
    // 获取系统状态栏信息
    const windowInfo = wx.getWindowInfo();
    this.globalData.StatusBar = windowInfo.statusBarHeight;
    this.globalData.CustomBar = windowInfo.statusBarHeight * 3;

    //调试
    // wx.setEnableDebug({
    //   enableDebug: true
    // })

  },
  onShow: function(){
    this.upDataApp()
  },
  globalData: {
    userInfo: null,
    host: 'https://weapp.refined-x.com/',
    fileList: [
      'bfa_boys_p_exp.txt',
      'bfa_girls_p_exp.txt',
      'lhfa_boys_p_exp.txt',
      'lhfa_girls_p_exp.txt',
      'wfa_boys_p_exp.txt',
      'wfa_girls_p_exp.txt'
    ],
    baby: null
  }
})