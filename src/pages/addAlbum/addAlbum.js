// src/pages/about/about.js
const app = getApp()
const util = require('../../utils/util.js');
const today = new Date();
const todayDate = util.formatTime(today);
const fiveYearsAgo = new Date(today.getTime() - 5 * (365 * 24 * 60 * 60 * 1000));

const collectionAlbum = app.globalData.db.collection('album');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    most: 9,
    formData: {
      titleDate: todayDate,
      description: '',
      photos: []
    },
    today: todayDate,
    startDate: util.formatTime(fiveYearsAgo)
  },
  DateChange(e) {
    this.setData({
      "formData.titleDate": e.detail.value
    })
  },
  updateDesc: function (e) {
    this.setData({
      'formData.description': e.detail.value
    })
  },
  delPhoto: function (e) {
    const targetIndex = e.currentTarget.dataset.index;
    let photos = this.data.formData.photos;
    photos.splice(targetIndex, 1)
    this.setData({
      "formData.photos": photos
    })
  },
  uploadImg: function () {
    //选图片
    wx.chooseImage({
      count: this.data.most,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        console.log(res.tempFilePaths)
        let oData = this.data.formData.photos;
        let picked = res.tempFiles;
        //数量控制
        if (oData.length + picked.length > this.data.most){
          picked = picked.slice(0, this.data.most - oData.length)
          wx.showToast({
            title: '最多只能传九张',
            icon: 'none',
            duration: 2000
          })
        }
        oData = oData.concat(picked.map((tempFile, index) => {
          return {
            size: tempFile.size,
            src: tempFile.path
          }
        }))
        
        this.setData({
          "formData.photos": oData
        })

      }
    })
  },
  beforeSubmit: function () {
    //格式检查
    const checkData = (replace) => {
      const postData = this.data.formData;
      const tipErr = function (errmsg) {
        wx.showToast({
          title: errmsg,
          icon: 'none',
          duration: 2000
        })
      }
      //检查上传状态
      if (!postData.photos.length) {
        return tipErr('忘了传照片？')
      }

      return this.submit(replace)
    }
    //检查日期重复
    wx.showLoading({
      title: '正在准备...',
    })
    collectionAlbum.where({
      _openid: app.globalData.openid,
      titleDate: this.data.formData.titleDate
    }).get({
      success: result => {
        wx.hideLoading()
        if (result.data.length){
          wx.showModal({
            title: '覆盖',
            content: '当前日期相册已存在，继续操作将覆盖原相册',
            success(res) {
              if (res.confirm) {
                checkData(result.data[0]._id)
              }
            }
          })
        }else{
          checkData()
        }
      },
      fail: err => {
        console.error('跳过日期检查', err)
        checkData()
      }
    })
    
  },
  submit: function (replace) {
    const postData = this.data.formData;
    const puloadQueue = postData.photos.map(e => {
      return wx.cloud.uploadFile({
        cloudPath: app.globalData.openid + '/album/' + parseInt(Math.random() * 1e6) + '.png',
        filePath: e.src
      })
    })
    //上传
    wx.showLoading({
      title: '正在上传...',
    })
    //完成并跳转
    const jump = () => {
      //重新计算空间
      wx.cloud.callFunction({
        name: "disk-space",
        complete: res => {
          console.log(res)
          wx.switchTab({
            url: '/pages/album/album'
          })
        }
      })
    }
    Promise.all(puloadQueue).then(results => {
      console.log(app.globalData.openid)
      //组织数据
      wx.showLoading({
        title: '正在提交...',
      })
      let allSize = 0;
      postData.photos = postData.photos.map((e,index) => {
        allSize += e.size;
        return results[index].fileID
      });
      postData.size = allSize;
      postData.timestamp = new Date().getTime();
      console.log(postData)
      //提交数据
      if (replace){
        collectionAlbum.doc(replace).set({
          data: postData
        }).then(res => {
          jump()
        }).catch(err => {
          console.warn(err)
          wx.hideLoading()
        })
      }else{
        collectionAlbum.add({
          data: postData
        }).then(res => {
          jump()
        }).catch(err => {
          console.warn(err)
          wx.hideLoading()
        })
      }
      
    }).catch(err => {
      console.warn(err)
      wx.showToast({
        title: err.errMsg,
        icon: 'none',
        duration: 2000
      })
    })

  }
})