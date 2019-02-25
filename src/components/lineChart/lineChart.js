// components/radioChart/radioChart.js
const app = getApp()
const util = require('../../utils/util.js');
let animation = wx.createAnimation({
  delay: 300,
  timingFunction: 'ease'
});

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    currentIndex: { // 属性名
      type: Number,
      value: 0, // 属性初始值（可选），如果未指定则会根据类型选择一个
      observer(newVal, oldVal, changedPath) {
        //console.log(newVal)
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    baby: {},
    bmi: 0,
    percent: 0,
    median: 0,
    animation: null,
    standards: []
  },

  /**
   * 组件的方法列表
   */
  methods: {
    setPercent: function (percent, median) {
      const screenWidth = wx.getSystemInfoSync().windowWidth;
      const percentPx = parseInt(screenWidth / 750 * 562.5 / 100 * percent);

      animation.translateY(-percentPx).step();

      this.setData({
        animation: animation.export(),
        percent: percent,
        median: median
      })
    },
    fetchData: function () {
      // 计算bmi
      const bmi = parseInt(this.data.baby.weight / Math.pow(this.data.baby.length / 100, 2) * 1000) / 1000;
      this.setData({
        bmi
      });
      const filePath = wx.getStorageSync('storageFileHash');
      const fs = wx.getFileSystemManager();
      const fileName = this.data.baby.gender === '男' ? 'bfa_boys_p_exp.txt' : 'bfa_girls_p_exp.txt';
      if (!filePath[fileName]) {
        return console.warn(fileName + '存储异常！')
      }

      fs.readFile({
        filePath: filePath[fileName],
        encoding: 'utf-8',
        success: res => {
          let table = util.formatTableData(res.data);
          this.setData({
            standards: table
          }, this.show)
        },
        fail: res => {
          console.warn(res.errMsg)
        }
      })

    },
    show: function () {
      if (this.data.baby.birthday) {
        
        let babyDays = util.computeDays(this.data.baby.birthday);
        let percent = util.computePercent(this.data.bmi, this.data.standards[babyDays]);
        this.setPercent(percent, this.data.standards[babyDays][7])
      } else {

      }
    },
    editBaby: function () {
      wx.navigateTo({
        url: '/pages/baby/baby'
      })
    },
    updateBaby: function () {
      // 宝宝数据
      if (app.globalData.baby) {
        this.setData({
          baby: app.globalData.baby
        }, this.fetchData)
      }
    }
  },
  lifetimes: {
    attached: function () {
      this.updateBaby()
    }
  },
  pageLifetimes: {
    show: function () {
      this.updateBaby()
    }
  }
})
