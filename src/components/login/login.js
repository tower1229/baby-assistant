// components/login/login.js
const app = getApp()
// 用户信息
let userInfo = {};


Component({
  options: {
    addGlobalClass: true
  },
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    userInfo: userInfo,
    loadModal: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //授权
    onGetUserInfo: function (e) {
      if (e.detail.userInfo) {
        userInfo = e.detail.userInfo;
        app.globalData.userInfo = userInfo;
        this.setData({
          userInfo: userInfo
        }, this.checkRight)
      }
    },
    login: function () {
      //登录
      if (app.globalData.openid) {
        this.checkRight()
      } else {
        this.setData({
          loadModal: '登录'
        })
        wx.cloud.callFunction({
          name: 'login',
          success: res => {
            app.globalData.openid = res.result.openid;
            this.setData({
              loadModal: false
            }, () => {
              this.checkRight()
            })
          },
          fail: err => {
            console.warn(err)
            this.setData({
              loadModal: false
            })
          }
        })
      }
    },
    checkRight: function (callback) {
      if (userInfo && userInfo.nickName) {
        this.triggerLogin(userInfo)
      } else {
        wx.getSetting({
          success: res => {
            if (res.authSetting['scope.userInfo']) {
              console.log(app.globalData.openid, '已授权')
              wx.getUserInfo({
                success: res => {
                  userInfo = res.userInfo;
                  app.globalData.userInfo = userInfo;
                  this.setData({
                    userInfo: userInfo
                  })
                  this.triggerLogin(userInfo)
                },
                fail: err => {
                  this.triggerLogin(userInfo)
                }
              })
            } else {
              console.log('待授权')
              this.setData({
                userInfo: null
              })
            }
          }
        })
      }
    },
    triggerLogin: function (myEventDetail){
      this.triggerEvent('login', myEventDetail)
    }
  },
  lifetimes: {
    ready: function(){
      this.login()
    }
  }
})
