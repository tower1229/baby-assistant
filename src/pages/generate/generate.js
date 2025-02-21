// src/pages/about/about.js
const app = getApp();
const util = require("../../utils/util.js");
const today = new Date();
const todayFormat = util.formatTime(today, true);
let baby;
// 绘制
let myCanvas;
let myCtx;

let previewCanvas;
let previewCtx;

//设置
let visibleDate = false;
let visibleText = "";
const CONSTANTS = {
  DEFAULT_AVATAR: "/res/img/grey.png",
  QR_CODE_PATH: "/res/img/qrcode.png",
  STORAGE_KEY: "babyAvatCache",
  DEFAULT_TEXT_COLOR: "#434343",
};

// 初始化变量
let textColor = CONSTANTS.DEFAULT_TEXT_COLOR;

const showErrorToast = (message, duration = 3000) => {
  wx.showToast({
    title: message,
    icon: "none",
    duration: duration,
  });
};

Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    locaAvatFile: CONSTANTS.DEFAULT_AVATAR,
    chooseImageUrl: "",
    shareImg: "",
    previewWidth: 0,
    previewHeight: 0,
  },
  toggleDateVisible: function (e) {
    visibleDate = e.detail.value;
    this.magic(previewCtx, previewCanvas, true);
  },
  inputChange: function (e) {
    visibleText = e.detail.value.trim();
    this.magic(previewCtx, previewCanvas, true);
  },
  setAvatCache: function () {
    wx.showLoading({
      title: "更新照片...",
    });
    //头像缓存
    const savedFilePath = wx.getStorageSync(CONSTANTS.STORAGE_KEY);
    if (savedFilePath) {
      this.setData(
        {
          locaAvatFile: savedFilePath,
        },
        function () {
          wx.hideLoading();
          this.magic(previewCtx, previewCanvas);
        }
      );
    } else if (baby.photo) {
      console.log(baby);
      wx.cloud.downloadFile({
        fileID: baby.photo,
        success: (res) => {
          // 临时文件路径
          console.log(res.tempFilePath);
          wx.saveFile({
            tempFilePath: res.tempFilePath,
            success: (res) => {
              const savedFilePath = res.savedFilePath;
              //本地存储路径
              wx.setStorage({
                key: CONSTANTS.STORAGE_KEY,
                data: savedFilePath,
                success: () => {
                  this.setData(
                    {
                      locaAvatFile: savedFilePath,
                    },
                    function () {
                      wx.hideLoading();
                      this.magic(previewCtx, previewCanvas);
                    }
                  );
                },
              });
            },
            fail: (err) => {
              showErrorToast("头像下载失败，过一会儿再试试");
            },
          });
        },
        fail: (err) => {
          //云端头像损坏
          showErrorToast("请先上传图片");
          wx.hideLoading();
          this.magic(previewCtx, previewCanvas);
        },
      });
    } else {
      //没有头像
      showErrorToast("请先上传图片");
      console.log("setAvatCache", previewCtx);
      this.magic(previewCtx, previewCanvas);
    }
  },
  //选择本地照片
  uploadPic: function () {
    wx.chooseMedia({
      count: 1,
      mediaType: ["image"],
      sizeType: ["compressed"],
      sourceType: ["album", "camera"],
      success: (res) => {
        this.setData(
          {
            locaAvatFile: res.tempFiles[0].tempFilePath,
          },
          () => {
            this.magic(previewCtx, previewCanvas);
          }
        );
        // this.setData({
        //   chooseImageUrl: res.tempFiles[0].tempFilePath
        // })
      },
    });
  },
  drawText: function (ctx, canvasWidth, canvasHeight, callback) {
    if (callback) {
      wx.showLoading({
        title: "正在绘制",
        mask: true,
      });
    }
    //文字
    const baseEm = parseInt(canvasWidth / 24);
    const textWidth = parseInt((canvasWidth / 3) * 2 * 0.8);
    const textX = parseInt(canvasWidth / 3);
    //清除文字区域
    ctx.fillStyle = "white";
    ctx.fillRect(
      0,
      canvasWidth,
      parseInt((canvasWidth / 3) * 2),
      parseInt(canvasWidth / 3)
    );

    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.font = `${parseInt(baseEm * 1.5)}px Arial`;
    //标题
    let textline1 = visibleDate ? todayFormat : util.formatDays(baby.birthday);

    ctx.fillText(textline1, textX, canvasWidth + baseEm * 3, textWidth);
    ctx.font = `${baseEm}px Arial`;
    //ctx.fillStyle = ('#434343')
    let textArray = [];
    const baseTextTop = canvasWidth + baseEm * 5;
    const baseTextLineHeight = parseInt(baseEm * 1.7);
    if (visibleText) {
      textArray = util.CalculateText.call(ctx, visibleText, textWidth);
    } else {
      let textline2 = app.globalData.bmi
        ? `BMI ${app.globalData.bmi}`
        : baby.length
        ? `身高 ${baby.length} CM`
        : "";
      let textline3 = textline2
        ? app.globalData.bmiPercent
          ? `超过${app.globalData.bmiPercent}%的小朋友`
          : `体重 ${baby.weight} KG`
        : "请输入文字";
      textArray = [textline2, textline3];
    }
    textArray.forEach((text, i) => {
      ctx.fillText(
        text,
        textX,
        baseTextTop + i * baseTextLineHeight,
        textWidth
      );
    });
    //输出
    if (callback) {
      wx.canvasToTempFilePath({
        canvas: ctx.canvas,
        success: (res) => {
          //生成
          return this.setData(
            {
              shareImg: res.tempFilePath,
            },
            function () {
              wx.hideLoading();
              typeof callback === "function" && callback();
            }
          );
        },
      });
    } else {
      wx.hideLoading();
    }
  },
  clipHandle: function (canvasData) {
    console.log(canvasData);
  },
  clipCancel: function () {
    this.setData({
      chooseImageUrl: "",
    });
  },
  createImage(src) {
    return new Promise((resolve, reject) => {
      const image = myCanvas.createImage();
      image.onload = () => resolve(image);
      image.onerror = (err) => reject(err);
      image.src = src;
    });
  },
  getImageInfo(src) {
    return new Promise((resolve, reject) => {
      wx.getImageInfo({
        src,
        success: resolve,
        fail: reject,
      });
    });
  },
  async magic(ctx, canvas, RedrawText, callback) {
    let self = this;
    const canvasWidth = ctx.logicWidth;
    const canvasHeight = ctx.logicHeight;

    if (RedrawText) {
      return this.drawText(ctx, canvasWidth, canvasHeight, callback);
    }

    try {
      const imageInfo = await this.getImageInfo(this.data.locaAvatFile);
      // 计算图片缩放和位置
      const imageRatio = imageInfo.width / imageInfo.height;

      // 计算目标绘制区域（正方形，以画布宽度为准）
      const targetSize = canvasWidth;
      let drawX = 0;
      let drawY = 0;
      let drawWidth = targetSize;
      let drawHeight = targetSize;

      // 源图像裁剪参数
      let sx = 0;
      let sy = 0;
      let sWidth = imageInfo.width;
      let sHeight = imageInfo.height;

      if (imageRatio > 1) {
        // 横向图片，以高度为准进行裁剪
        sWidth = imageInfo.height;
        sx = (imageInfo.width - sWidth) / 2;
      } else if (imageRatio < 1) {
        // 纵向图片，以宽度为准进行裁剪
        sHeight = imageInfo.width;
        sy = (imageInfo.height - sHeight) / 2;
      }

      // 绘制白色背景
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // 绘制图片
      self.createImage(this.data.locaAvatFile).then((image) => {
        try {
          ctx.drawImage(
            image,
            sx,
            sy,
            sWidth,
            sHeight, // 源图像裁剪
            drawX,
            drawY,
            drawWidth,
            drawHeight // 目标画布位置和大小
          );

          // 获取主色调
          const imageData = ctx.getImageData(0, 0, canvasWidth, canvasWidth);

          // 计算主色调
          let r = 0,
            g = 0,
            b = 0;
          const pixels = imageData.width * imageData.height;

          for (let i = 0; i < pixels * 4; i += 4) {
            r += imageData.data[i];
            g += imageData.data[i + 1];
            b += imageData.data[i + 2];
          }

          // 求取平均值
          r = Math.round(r / pixels);
          g = Math.round(g / pixels);
          b = Math.round(b / pixels);

          // 设置文字颜色
          textColor = `rgb(${r},${g},${b})`;

          // 绘制二维码
          self.createImage(CONSTANTS.QR_CODE_PATH).then((image) => {
            ctx.drawImage(
              image,
              (canvasWidth / 3) * 2,
              canvasWidth,
              canvasWidth / 3,
              canvasWidth / 3
            );

            self.drawText(ctx, canvasWidth, canvasHeight, callback);
          });
        } catch (err) {
          console.error("Error drawing image:", err);
          showErrorToast("图片加载失败，请检查网络连接");
          wx.hideLoading();
        }
      });
    } catch (err) {
      showErrorToast("图片加载失败，请重试");
      wx.hideLoading();
    }
  },
  saveAlbum2Local: function () {
    this.magic(myCtx, myCanvas, false, () => {
      //海报存相册
      let filepath = this.data.shareImg;
      wx.saveImageToPhotosAlbum({
        filePath: filepath,
        success() {
          wx.showToast({
            title: "已保存到手机",
            icon: "none",
            duration: 2000,
          });
        },
        fail: (err) => {
          wx.showToast({
            title: err.errMsg,
            icon: "none",
            duration: 2000,
          });
        },
      });
    });
  },
  loginHandle: function () {
    const initBaby = () => {
      this.setAvatCache();
    };

    baby = app.globalData.baby;

    wx.showLoading({
      title: "正在更新信息",
    });
    wx.cloud.callFunction({
      name: "get-baby",
      success: (res) => {
        console.log(res);
        wx.hideLoading();
        baby = res.result;
        app.globalData.baby = baby;
        this.setAvatCache();
      },
    });
  },
  onLoad: function () {
    const query = this.createSelectorQuery();
    const dpr = wx.getWindowInfo().pixelRatio;
    console.log("onload", dpr);

    query.select("#myCanvas").node();
    query.select("#previewCanvas").node();
    query.select("#preview").boundingClientRect();
    query.exec((res) => {
      // offscreen canvas
      myCanvas = res[0].node;
      myCtx = myCanvas.getContext("2d");
      myCtx.width = myCanvas.width * dpr;
      myCtx.height = myCanvas.height * dpr;
      myCtx.scale(dpr, dpr);
      console.log("myCanvas init");
      // preview canvas
      previewCanvas = res[1].node;
      const rect = res[2];

      // 逻辑像素尺寸
      let height = parseInt(rect.height);
      let width = parseInt((height / 4) * 3);

      // 设置 canvas 的物理像素大小
      previewCanvas.width = width * dpr;
      previewCanvas.height = height * dpr;

      previewCtx = previewCanvas.getContext("2d");
      // 缩放画布上下文，使绘制的内容适配设备像素比
      previewCtx.scale(dpr, dpr);

      // 保存逻辑尺寸，用于后续计算
      previewCtx.logicWidth = width;
      previewCtx.logicHeight = height;

      // 设置样式尺寸（css 像素）
      this.setData(
        {
          previewWidth: width,
          previewHeight: height,
        },
        () => {
          // 初始化预览画布
          console.log("init draw", previewCtx);
          this.magic(previewCtx, previewCanvas);
        }
      );
    });
  },
});
