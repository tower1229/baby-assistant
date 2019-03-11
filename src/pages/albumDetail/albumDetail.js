const app = getApp()
const collectionAlbum = app.globalData.db.collection('album');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    dialogVisible: false,
    _id: '',
    titleDate: '',
    description: '',
    photos: []
  },
  preview: function(e){
    let current = e.currentTarget.dataset.src;
    if (current){
      wx.previewImage({
        current,
        urls: this.data.photos
      })
    }
  },
  del: function(){
    wx.showModal({
      title: '删除相册',
      content: '确定删除这个相册吗？',
      success: res => {
        if (res.confirm) {
          wx.showLoading({
            title: '正在删除...',
          })
          collectionAlbum.doc(this.data._id).remove({
            success: () => {
              //删除云盘文件
              wx.cloud.deleteFile({
                fileList: this.data.photos
              }).then(() => {
                console.log('云文件已删除')
                //重新计算空间
                wx.cloud.callFunction({
                  name: "disk-space",
                  complete: res => {
                    console.log('已重新计算空间')
                    wx.switchTab({
                      url: '/pages/album/album'
                    })
                  }
                })
              }).catch(err => {
                console.error(err)
              })
            },
            fail: console.error
          })
        } 
      }
    })
  },
  onLoad: function(){
    const pageParam = wx.getStorageSync('pageParam')
    if (pageParam._id){
      this.setData({
        ...pageParam
      })
    }else{
      console.warn(pageParam)
    }
  }

})