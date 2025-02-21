// components/image-clip/index.js
let canvasData;
const baseWidth = 650;


Component({
  options: {},
  /**
   * 组件的属性列表
   */
  properties: {
    image: {
      type: String,
      value: '',
      observer: function (image) {
        const vm = this;
        if (image) {
          wx.getImageInfo({
            src: image,
            success(res) {
              const wrapHeight = parseInt(baseWidth * (res.height / res.width))
              const clipLength = Math.min(baseWidth, wrapHeight)
              let imageDistance = (res.width - res.height) / 2;
              let moveX = (imageDistance > 0) ? imageDistance : 0;
              let moveY = (imageDistance < 0) ? -imageDistance : 0;
              console.log(moveX, moveY)
              console.log(clipLength)
              vm.setData({
                clipWidth: clipLength,
                clipHeight: clipLength,
                wrapHeight
              })

            },
            fail: function (err) {
              console.log(err)
            }
          })
        }

        this.setData({
          visible: !!image
        })
      }
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    visible: false,
    wrapWidth: baseWidth,
    wrapHeight: baseWidth,
    clipWidth: baseWidth,
    clipHeight: baseWidth,
    moveX: 0,
    moveY: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    trigger: function () {
      if (canvasData) {
        this.triggerEvent('clip', canvasData)
      }

    },
    cancel: function () {
      this.triggerEvent('cancel')
    }
  }
})