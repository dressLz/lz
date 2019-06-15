var debug = getApp().debug || true;
//此处数据初始化后就不修改了
// var yxxruiSliderData = {
//   datas: [],//数据包，必须为数组
//   indicateDots: [],
//   blankWidth: 12,
//   newImgWidth: 18,
//   totalWidth:0,
//   firstX:0,  
//   direction:'left',
//   autorun:true,
//   duration:1000,
//   interval:2000,
//   startSlideCallback:null,
//   endSlideCallback:null
// };
//暂时记录一下，经常修改的参数
// var yxxruiSliderX;//当前位移的x
// var yxxruiSliderLock;//滚动锁
// var yxxruiSliderFirstPointX;//第一次触摸时的x坐标
// var yxxruiAutoRunTimer=null;//自动滚动定时器
// var yxxruiSlideTimer= null;//滚动一屏的定时器
// var yxxruiCurPage=1;//当前页面
// var yxxruiSliderLastX;//触摸屏幕时的位移x

function initMySlider(opt) {
  if(opt.that==null){
    console.log('请传入正确的this');
    return;
  }
  var that = opt.that;
  //此处数据初始化后就不修改了
  var yxxruiSliderData = {};
  //数据包，必须为数组
  yxxruiSliderData.datas = opt.datas || [];
  //空白处的宽度
  yxxruiSliderData.blankWidth = opt.blankWidth==undefined? 12:opt.blankWidth;
  //新图片凸出来的宽度
  yxxruiSliderData.newImgWidth = opt.newImgWidth == undefined ? 18 : opt.newImgWidth;
  //是否自动滚动
  yxxruiSliderData.autoRun = opt.autoRun;
  //每隔x毫秒滚动一次
  yxxruiSliderData.interval = opt.interval || 3000;
  //滚动一次需要x秒
  yxxruiSliderData.duration = opt.duration || 200;
  //滚动方向
  yxxruiSliderData.direction = opt.direction || 'left';
  //滚动开始回调事件
  yxxruiSliderData.startSlideCallback = opt.startSlide;
  //滚动结束回调事件
  yxxruiSliderData.endSlideCallback = opt.endSlide;

  var len = yxxruiSliderData.datas.length;
  if (len < 1) {
    console.log('数据数组必须设置');
    return;
  }
  //轮播图底部小点
  yxxruiSliderData.indicateDots = [];
  for(var i=0;i<len;i++){
    yxxruiSliderData.indicateDots.push(i+1);
  }
  //处理数据
  var fistImg = yxxruiSliderData.datas[0];
  var lastImg = yxxruiSliderData.datas[len - 1];
  yxxruiSliderData.datas.unshift(lastImg);//将最后一张图片重复放到前边，做无缝滚动
  yxxruiSliderData.datas.push(fistImg);//将第一张图片重复放到后边，做无缝滚动
  
  //计算各种参数
  var w = wx.getSystemInfoSync().screenWidth;
  var kx = yxxruiSliderData.blankWidth;//白色空隙宽度12px
  var nx = yxxruiSliderData.newImgWidth;//新图片突出来18px
  var ox = kx + nx * 2;//每页中无效的宽度
  var fx = w - (ox + nx);
  //总宽度
  yxxruiSliderData.totalWidth = yxxruiSliderData.datas.length * (w-ox);
  yxxruiSliderData.firstX = -fx;

  that.setData({
    yxxruiSliderData: yxxruiSliderData,
    yxxruiSliderX: yxxruiSliderData.firstX,
    yxxruiSliderCurPage : 1
  });
  dealEvent(that);
  // if (autoRun) {
  //   autoRunMyslider(that, interval);
  // }
  yxxruiSliderData.startSlideCallback && yxxruiSliderData.startSlideCallback(1);
  yxxruiSliderData.endSlideCallback && yxxruiSliderData.endSlideCallback(1);
}
function dealEvent(that) {
  //触摸开始事件
  that.sliderTouchStart = function (opt) {
    //解锁
    that.data.yxxruiSliderLock = 0;
    //让当前滚动暂定
    that.data.yxxruiSlideTimer && clearInterval(that.data.yxxruiSlideTimer);
    //暂定自动滚动
    that.data.yxxruiAutoRunTimer && clearInterval(that.data.yxxruiAutoRunTimer);
    that.setData({
      yxxruiSliderLastX : that.data.yxxruiSliderX,
      yxxruiSliderFirstPointX: opt.touches[0].clientX,
      yxxruiSlideTimer:null,
      yxxruiAutoRunTimer:null
    });
  };
  //触摸移动事件
  that.sliderTouchMove = function (opt) {
    //让轮播图跟着指头滑动
    var pointx = opt.touches[0].clientX;
    var x = that.data.yxxruiSliderLastX + (pointx - that.data.yxxruiSliderFirstPointX);
    that.setData({
      yxxruiSliderX: x
    });
  };
  //触摸结束事件
  that.sliderTouchEnd = function (opt) {
    //结束后，让轮播图回到该回到的地方
    slidePage(that, 0);
    //继续开启自动滚动
    var mydata = that.data.yxxruiSliderData;
    if (mydata.autoRun) {
      autoRunMyslider(that, mydata.interval);
    }
  };
  //触摸取消事件跟触摸结束事件相同
  that.sliderTouchCancel = that.sliderTouchEnd;
  //记录用户设置的隐藏事件，等待执行完毕之后恢复此事件
  var oldHide = that.onHide;
  that.onHide =function(){
    that.data.yxxruiAutoRunTimer && clearInterval(that.data.yxxruiAutoRunTimer);
    that.setData({
      yxxruiAutoRunTimer: null
    });
    oldHide && oldHide();
  };
  //记录用户设置的显示事件，等待执行完毕之后恢复此事件
  var oldShow = that.onShow;
  that.onShow = function(){
    var mydata = that.data.yxxruiSliderData;
    if (mydata.autoRun) {
      autoRunMyslider(that, mydata.interval);
    }
    oldShow && oldShow();
  }
}
/**
 * 自动开始滚动
 */
function autoRunMyslider(that, t) {
  that.data.yxxruiAutoRunTimer && clearInterval(that.data.yxxruiAutoRunTimer);
  var autoRunTimer = setInterval(function () {
    var dir = that.data.yxxruiSliderData.direction=='right'?1:-1;
    slidePage(that, dir);
  }, t);
  that.setData({
    yxxruiAutoRunTimer: autoRunTimer
  });
}
//一次性滚动一屏，并且有方向
function slidePage(that,page){
  var mydata = that.data.yxxruiSliderData;
  var lastx = that.data.yxxruiSliderX - mydata.newImgWidth;
  var perScreenX = mydata.totalWidth / mydata.datas.length;
  var remain = (perScreenX-Math.abs(lastx%perScreenX))%perScreenX;//看看当前剩余了多少
  if(remain>0){
    //只需要看看离那边近就跑那边
    if(remain<perScreenX/2){
      //说明距离左边近
      slideTo(that, -remain);
    }else{
      //说明右边近
      slideTo(that,perScreenX-remain);
    }
  }else{
    slideTo(that, perScreenX * page);
  }
}
function slideTo(that, x) {
  //锁，如果正在滚动，那么不允许操作
  if (that.data.yxxruiSliderLock == 1) return;
  that.setData({
    yxxruiSliderLock:1
  });
  
  var mydata = that.data.yxxruiSliderData;
  var i = 0;
  var timeStep = 20;//x毫秒刷新一次
  var lastx = that.data.yxxruiSliderX;
  var perScreenX = mydata.totalWidth / mydata.datas.length;
  var step = Math.floor(perScreenX / (mydata.duration / timeStep));
  var totalWidth = mydata.totalWidth;
  
  var slideTimer = setInterval(function () {
    if(i==0){
      mydata.startSlideCallback && mydata.startSlideCallback(that.data.yxxruiSliderCurPage);
    }
    if (i >= Math.abs(x)) {
      slideTimer && clearInterval(slideTimer);
      that.setData({
        yxxruiSlideTimer:null
      });
      if (lastx + x >= mydata.newImgWidth) {
        //滚动到边际，处理无缝滚动
        var nowx = mydata.newImgWidth - (totalWidth - perScreenX * 2);
        that.setData({
          yxxruiSliderX: nowx
        });
      }
      if (lastx + x + totalWidth - perScreenX <= mydata.newImgWidth) {
        that.setData({
          yxxruiSliderX: mydata.firstX
        });
      }

      lastx = that.data.yxxruiSliderX;
      var curPage = Math.abs(Math.floor((lastx + perScreenX) / perScreenX))+1;

      that.setData({
        yxxruiSliderCurPage:curPage
      });
      mydata.endSlideCallback && mydata.endSlideCallback(curPage);
      that.setData({
        yxxruiSliderLock: 0
      });
      return;
    }
    //如果距离 比步数大，那么直接跳步数，不够的话，直接变成最终的答案
    if (Math.abs(x) - i > step) {
      i += step;
    } else {
      i = Math.abs(x);
    }
    if (x > 0) {
      that.setData({
        yxxruiSliderX: lastx + i
      });
    } else {
      that.setData({
        yxxruiSliderX: lastx - i
      });
    }
  }, timeStep);

  that.setData({
    yxxruiSlideTimer: slideTimer
  });
}
module.exports = {
  initMySlider: initMySlider
};