// pages/calendar/calendarGroup.js

const app = getApp()
const baseUrl = "https://time.mytime.net.cn/";
var pageSize = 20;
var currentPage = 1;
var oldDis,oldScale=1;
var winWidth, winHeight;
const weekDayDic = {
  1:'星期日',
  2:'星期一',
  3:'星期二',
  4:'星期三',
  5:'星期四',
  6:'星期五',
  7:'星期六'
}
function getWeekDay(numStr){

  return weekDayDic[numStr] ? weekDayDic[numStr] : numStr;
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
   
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    wx.getSystemInfo({
      success: function (res) {
        console.log(res)
        //console.log(res.windowHeight)
        winWidth = res.windowWidth;// * res.pixelRatio-60
        winHeight = res.windowHeight;
        that.setData({
          scaleWidth:winWidth,
          winHeight: winHeight
        });
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log(app.globalData.year);
    console.log(app.globalData.month);
    if (app.globalData.token) {
      wx.request({
        method: 'GET',
        header: { Authorization: 'time' + app.globalData.token },
        url: 'https://www.mytime.net.cn/getFileNames',
        data: { page: 0, pageSize: 20 },//, yearStr: app.globalData.year, monthStr:app.globalData.month
        success: res => {
          //console.log(res.data);
          if (res.data && res.data.result == 1) {

            if (res.data && res.data.extData && res.data.extData.length > 0) {
              var arrayTemp; var wJson;
              for (var i = 0; i < res.data.extData.length; i++) {
                res.data.extData[i].weekdayStr = getWeekDay(res.data.extData[i].weekdayStr);
                if (res.data.extData[i].weather){
                  try{
                    wJson = JSON.parse(res.data.extData[i].weather);
                    if (wJson && wJson.liveData){
                      res.data.extData[i].area = wJson.liveData.province + " " + wJson.liveData.city;
                      res.data.extData[i].weatherStr = wJson.liveData.weather + " " + wJson.liveData.temperature + "℃ " + wJson.liveData.winddirection + "风 " + wJson.liveData.windpower + "级 湿度" + wJson.liveData.humidity+"%";
                    }
                  }catch(e){}
                 
                }

                if (res.data.extData[i].filepath) {
                  res.data.extData[i].largefilepath = baseUrl + res.data.extData[i].filepath;
                  arrayTemp = res.data.extData[i].filepath.split('.');
                  if (arrayTemp.length == 2) {
                    res.data.extData[i].filepath = arrayTemp[0] + '_' + res.data.extData[i].slavePostfix + '.' + arrayTemp[1];
                  }
                }
              }
              this.setData({
                records: res.data.extData
              });
            }
          } else {
            console.error(res);
            var msg = '';
            if (res.data.message == "Access Denied") {
              msg += '您没有权限';
            }

            wx.showModal({
              title: '获取失败',
              content: msg,
              showCancel: false,
              success: function (res) {
                wx.navigateBack({
                  delta: 1
                });
              }
            });
          }
        },
        fail: function (res) {
          console.log(res);
        }
      });
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }, preViewImg: function (event) {
    var src = event.currentTarget.dataset.src;//获取data-src
    var imgList = event.currentTarget.dataset.list;//获取data-list
    //图片预览
    wx.previewImage({
      current:src, 
      urls: imgList 
    })
  },
  showPreview: function (event){
    oldScale = 1;
    var src = event.currentTarget.dataset.src;//获取data-src
    this.setData({
      largefilepath:src,
      isShowPreview:true,
      scaleWidth: winWidth 
    });
  },
  hidePreview:function(){
    this.setData({
      isShowPreview: false
    });
  },
  preimgtmover: function (e){
    if (e.touches){
      if (e.touches.length>1){
        var xMove = e.touches[1].clientX - e.touches[0].clientX;
        var yMove = e.touches[1].clientY - e.touches[0].clientY;
        var distance = Math.sqrt(xMove * xMove + yMove * yMove);
        console.log(distance);
        if (!oldDis){
          oldDis = distance;
        }
        var newScale = oldScale + 0.0001 * (distance-oldDis);
        oldScale = newScale;
        if (newScale < 0.9) { newScale=1}
        this.setData({
          scaleWidth:newScale * winWidth
        });
      }else{
        //oldScale=1;
        oldDis=0;
      }
    } else {
      oldDis = 0;
    }
   
  },
  preimgtmoverEnd:function(e){
    oldDis = 0;
  },
  takePhoto() {
    const ctx = wx.createCameraContext()
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        this.setData({
          src: res.tempImagePath
        })
      }
    })
  },
  error(e) {
    console.log(e.detail)
  }
})