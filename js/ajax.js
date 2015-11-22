


//报错提示，还未完善
function windowsShow (mes,error) {
	if(error)
  {
    switch(mes)
    {
      case 'ACCOUNT_ERROR':
        mes = '账号错误，密码错误或账户不存在';
        break;
      case 'USER_NOT_LOGIN':
        mes = '用户未登陆';
        break;
      case 'NO_RECORD':
        mes = '记录为空';
        break;
      case 'REMOTE_SERVER_ERROR':
        mes = '远程服务器错误';
        break;
      case 'PARAM_ERROR':
        mes = '参数错误';
        break;
      case 'RENEW_FAILED':
        mes = '续借失败';
        break;
      case 'OUT_OF_RANGE':
        mes = '超出范围';
        break;
      case 'DELETED_SUCCEED':
        mes = '删除成功';
        break;
      case 'DELETED_FAILED':
        mes = '删除失败';
        break;
      case 'ADDED_SUCCEED':
        mes = '收藏成功';
        break;
      case 'ALREADY_IN_FAVORITE':
        mes = '已经收藏过了';
        break;
      case 'ADDED_FAILED':
        mes = '收藏失败';
        break;

    }
  }
  $.toast(mes);
}



// 保存用户名和密码
function saveUser(ID,psw){
    //对用户名和密码进行base64加密并cookie保存
    var baseStr = Encode(ID) + '%-%' + Encode(psw);
    var Days = 30;
    var exp = new Date();
    exp.setTime(exp.getTime() + Days*24*60*60*1000);
    document.cookie = "User="+ escape(baseStr) + ";expires=" + exp.toGMTString();
  
}
//从cookie中读取用户名和密码
function returnUserCookie(ok)
{
  var arr,reg=new RegExp("(^| )User=([^;]*)(;|$)");
  var baseStr = '';
  var use = {};
  if(arr=document.cookie.match(reg))
  {
    baseStr = unescape(arr[2]);
    if(ok)
    {
      return baseStr;
    }
    baseStr = baseStr.split('%-%');
    use.ID = Decode(baseStr[0]);
    use.psw = Decode(baseStr[1]);
    return use;
  }
  else
    return null;

}

//删除Cookie
function delUserCookie(){
  var exp = new Date();
  exp.setTime(exp.getTime() - 1);
  var cval=returnUserCookie(true);
  if(cval!=null)
  document.cookie= "User="+cval+";expires="+exp.toGMTString();
}

//获取搜索结果
function addFindResult(keyword,page,callback)
{
	
	var content = $('#findResult .content .list-block');
	var BookData = [];
	var moban = '<div class="card">'
        +'<div class="card-header">%Title%</div>'
        +'<div class="card-content">'
        +'<div class="card-content-inner">'
        +'<p>作者:%Author%</p>'
        +'<p>出版社:%Pub%</p>'
        +'<div class="none card-footer">%ID%</div>'
        +'</div></div></div>';
	var html = "";
	if($('#findResult')[0].pages && ($('#findResult')[0].pages - 0 < page || page < 1))
	{
		callback(false,true);
		return;
	}
	$.ajax({
		url : 'http://api.xiyoumobile.com/xiyoulibv2/book/search?keyword=' + keyword + '&size=10&page=' + page,
      	type : 'get',
      	dataType : 'jsonp',
      	success : function(data){
      		if(!data.Result)
      		{
      			callback();
      			windowsShow("加载失败，请重试！");
      			return;
      		}
      		$('#findResult')[0].pages = data['Detail']['Pages'];
      		BookData = data['Detail']['BookData'];
          if(!BookData)
          {
            callback(false);
            windowsShow(data['Detail'],true);

            return;
          }
          if(BookData.length < 4)
            $('#findResult .infinite-scroll-preloader').css("display","none");
      		for(var i in BookData)
      		{
      			html += moban.replace('%Title%',BookData[i]['Title'])
      						 .replace('%Pub%',BookData[i]['Pub'])
                   .replace('%ID%',BookData[i]['ID'])
      						 .replace('%Author%',BookData[i]['Author']);
      		}
      		// if(is)
      		// 	content.html(html);
      		// else
      			content.append(html);
      		callback(true);
      		// $('#findResult .content').scrollTop(0);
      		
      	},
      	error : function(){
      		callback(false);
      		windowsShow("加载失败，请重试！");
      	}
	});
}


//获取排行榜书籍列表
function getPaihang(type,that,target)
{
  var Detail = [];
  var moban = '<div class="card"><div class="card-header">%Title%</div><div class="card-footer">'
            +'<span>排名:%Sort%</span>'
                    +'<span>次数:%BorNum%</span>'
                    +'<span>分类号:%ID%</span>'
                    +'</div></div>';
   var html = '';
   $.ajax({
        url : 'http://api.xiyoumobile.com/xiyoulibv2/book/rank?type=' + type,
        type : 'get',
        dataType : 'jsonp',
        success : function(data){
          if(!data.Result)
          {
            $.hideIndicator();
            windowsShow('加载错误，请重试！');
          }
          Detail = data['Detail'];
          for(var i in Detail)
          {
            if(!Detail[i]['Title'])
              Detail[i]['Title'] = '';
            if(!Detail[i]['Sort'])
              Detail[i]['Sort'] = '';
            if(!Detail[i]['BorNum'])
              Detail[i]['BorNum'] = '';
            if(!Detail[i]['ID'])
              Detail[i]['ID'] = '';
            html += moban.replace('%Title%',Detail[i]['Title']).
                replace('%Sort%',Detail[i]['Sort']).
                replace('%BorNum%',Detail[i]['BorNum']).
                replace('%ID%',Detail[i]['ID']);
          }
          that.next().html(html);


          target.isopen = true;
          that.find('.item-after').html('收起');
          $.hideIndicator();
          that.next().css('display','block');


        },
        error : function(){
          $.hideIndicator();
          windowsShow('加载错误，请重试！');
        }
      });
}


//获取图书详细信息
function getBookInfo (ID,callback,Barcode) {
  if(!ID)
  {
    callback(false);
    return;
  }
  var tab1 = $('#tab1 .card'),
      tab2 = $('#tab2'),
      tab3 = $('#tab3 .card-content-inner'),
      tab4 = $('#tab4');
  var Detail = {};
  var CirculationInfo = [];
  var ReferBooks = [];
  var moban1 = '<div valign="bottom" class="card-header color-white no-border no-padding">'
                    +'<img class="card-cover" src="%src%" alt="%Title%">'
                    +'</div><div class="card-content"><div class="card-content-inner">'
                    +'<p class="color-gray">图书馆索书号:%Sort%</p>'
                    +'<p>书名:%Title%</p>'
                    +'<p>出版社:%Pub%</p>'
                    +'<p>作者:%Author%</p>'
                    +'<p>图书馆可借:%Avaliable%部</p>'
                    +'<p>标准号:%ISBN%</p>'
                    +'</div></div><div class="card-content"><div class="card-content-inner"><p class="color-gray">豆瓣书情</p>'
                    +'<p>书名:%DTitle%</p>'
                    +'<p>单价:%Price%</p>'
                    +'<p>页数:%Pages%</p>'
                    +'<p>出版时间:%PubDate%</p>'
                    +'<p class="none">%ID%</p>'
                    +'</div></div>';
  var moban2 = '<div class="card">'
                +'<div class="card-header">%Department%</div>'
                +'<div class="card-content">'
                +'<div class="card-content-inner">%Status%</div>'
                +'</div><div class="card-footer"><span>条码</span>'
                +'<span>%Barcode%</span>'
                +'</div></div>';
  var moban3 = '<p>%Summary%</p>';
  var moban4 = '<div class="card">'
                +'<div class="card-header">名称:%Title%</div>'
                +'<div class="card-content">'
                +'<div class="card-content-inner">作者:%Author%</div>'
                +'</div><div class="card-footer">'
                +'控制号:%ID%'
                +'</div></div>';

  var html1 = '';
  var html2 = '';
  var html3 = '';
  var html4 = '';

  $.ajax({
        url : Barcode ? 
              'http://api.xiyoumobile.com/xiyoulibv2/book/detail/barcode/' + Barcode :
              'http://api.xiyoumobile.com/xiyoulibv2/book/detail/id/' + ID,
        type : 'get',
        dataType : 'jsonp',
        success : function(data){
          if(!data.Result)
          {
            callback(false);
            windowsShow(data.Detail,true);
            return;
          }
          Detail = data.Detail;
          if(typeof Detail === "string")
          {
            callback(false);
            windowsShow(Detail,true);
            return;
          }
          // $('#bookInfo .title').html(Detail['Title']);
          //大图小图
          var img = "";
          if(!Detail['DoubanInfo'])
          {
            Detail['DoubanInfo']={
              Images : {},
              Title : '',
              Price : '',
              Pages : '',
              PubDate : ''
            };
          }
            img = Detail['DoubanInfo']['Images']['large'] || 
                  Detail['DoubanInfo']['Images']['small'] ||
                  Detail['DoubanInfo']['Images']['medium'] ||
                  false;
          
          if(!img)
          {
            moban1 = moban1.replace('<img class="card-cover" src="%src%" alt="%Title%">','');
          }

          html1 += moban1.replace("%src%",img)
                         .replace(/%Title%/g,Detail['Title'])
                         .replace("%Sort%",Detail['Sort'])
                         .replace("%Pub%",Detail['Pub'])
                         .replace("%Author%",Detail['Author'])
                         .replace("%Avaliable%",Detail['Avaliable'])
                         .replace("%ISBN%",Detail['ISBN'])
                         .replace("%DTitle%",Detail['DoubanInfo']['Title'])
                         .replace("%Price%",Detail['DoubanInfo']['Price'])
                         .replace("%Pages%",Detail['DoubanInfo']['Pages'])
                         .replace("%ID%",Detail['ID'])
                         .replace("%PubDate%",Detail['DoubanInfo']['PubDate']);
          tab1.html(html1);


          
          CirculationInfo = Detail.CirculationInfo;
          if(!CirculationInfo)
            tab2.html('<h1>没有藏书</h1>');
          else
          {
            for(var i in CirculationInfo)
            {
              html2 += moban2.replace('%Department%',CirculationInfo[i]['Department'])
                             .replace('%Barcode%',CirculationInfo[i]['Barcode'])
                             .replace('%Status%',CirculationInfo[i]['Status']);
            }
            tab2.html(html2);
          }
          var Summary = Detail['Summary'] || Detail['DoubanInfo']['Summary'] || "暂无简介";
          html3 = moban3.replace('%Summary%',Summary);
          tab3.html(html3);
          ReferBooks = Detail.ReferBooks;
          if(!ReferBooks)
          {
            tab4.html('<h1>没有相关书籍</h1>');
            return;
          }
          for(var j in ReferBooks)
          {
            html4 += moban4.replace('%Title%',ReferBooks[j]['Title'])
                           .replace('%Author%',ReferBooks[j]['Author'])
                           .replace('%ID%',ReferBooks[j]['ID']);
          }
          tab4.html(html4);


          callback(true);
          $('#bookInfo .content').scrollTop(0);
          $('#bookInfo .tab-link').eq(0).click();

          
        },  
        error : function(){
          callback(false);
          windowsShow("error");
        }
  });
}

// 登陆
// var Userlogin = {
//   logined : false,
//   userID : '',
//   userName : '',
//   Department : '',
//   Debt : '',
//   Session : ''
// };
function Ulogin(ID,psw,callback){
  $.showPreloader();
  $.ajax({
        url : 'http://api.xiyoumobile.com/xiyoulibv2/user/login?username=' + ID + '&password=' + psw,
        type : 'get',
        dataType : 'jsonp',
        success : function(data){
          if(!data)
          {
            $.hidePreloader();
            callback(false,'登陆失败，请重试');
            return;
          }
          if(!data.Result)
          {
            $.hidePreloader();
            callback(false,data.Detail);
            return;
          }
          callback(true,data.Detail);
        },
        error : function(){
          $.hidePreloader();
          callback(false);
        }
  });
}

//查询个人信息
function getUserInfo(session,callback){
  $.ajax({
        url : 'http://api.xiyoumobile.com/xiyoulibv2/user/info?session=' + session,
        type : 'get',
        dataType : 'jsonp',
        success : function(data)
        {
          if(!data){
            $.hidePreloader();
             callback(false,'获取个人信息失败');
            return;
          }
          if(!data.Result)
          {
            $.hidePreloader();
            callback(false,data.Detail);
            return;
          }
          callback(true,data.Detail);
        },
        error : function(){
          $.hidePreloader();
          callback(false);
        }
  });
}

function getDateFormat(datestr){
  var date = [];
  if(datestr.charAt(4) != '-')
  {
    datestr = datestr.replace(/\D/,'');
    date.push(datestr.substr(0,4));
    date.push(datestr.substr(4,2));
    date.push(datestr.substr(6,2));
    datestr = date.join('-'); 
  }
  return datestr;
}

//计算时间差距
function getDateC(datestr){
  var date = [];
  var d;
  var now = new Date();
  datestr = getDateFormat(datestr);
  d =  Date.parse(datestr);
  return Math.floor((d - now.getTime())/(24*3600*1000));
}


// 获取我的借阅列表, 并加载
function getMyRent(session,callback)
{
  var item = $('#tab5');
  var detail = [];
  var moban = '<div class="card">'
                +'<div class="card-header %red%">%Title%</div>'
                +'<div class="card-content"><div class="card-content-inner">'
                +'<p>书籍书库:%Department%</p>'
                +'<p>当前状态:%State%</p>'
                +'<p>到期时间:%Date%</p>'
                +'<p class="none">%Barcode%</p>'
                +'</div></div><div class="card-footer">'
                +'<a href="#" class="button %disabled%">%CanRenew%</a>'
                +'<a class="none">{"barcode":"%Barcode%","department_id":"%Department_id%","library_id":"%Library_id%"}</a>'
                +'<a href="#" class="%red%">%dateC%</a>'
                +'</div></div>';
  var html = '';
  $.ajax({
        url : 'http://api.xiyoumobile.com/xiyoulibv2/user/rent?session=' + session,
        type : 'get',
        dataType : 'jsonp',
        success : function(data){
          if(!data)
          {
            $.hidePreloader();
            callback(false,"加载失败");
            return;
          }
          detail = data.Detail;
          if(!data.Result)
          {
            $.hidePreloader();
            callback(false,detail);
            return;
          }
          if(typeof detail === 'string')
          {
            $.hidePreloader();
            item.html("您还没有借阅任何书籍");
            callback(true);
            return;
          }
          setLeftInfo(false,detail.length,false);
          for(var i in detail)
          {
            var red = '';
            var dateCF = '剩%day%天到期';
            var day = '';
            var disabled = 'CanRenew';
            var CanRenew = '续借';
            var dateC = getDateC(detail[i]['Date']);
            if(dateC <= -3)
              red = 'red';
            if(dateC < 0)
              dateCF = '已超期%day%天';
            if(!detail[i]['CanRenew'])
            {
              disabled = 'disabled';
              CanRenew = '不可续借';
            }
            day = Math.abs(dateC);
            html += moban.replace(/%red%/g,red)
                         .replace('%Title%',detail[i]['Title'])
                         .replace('%Department%',detail[i]['Department'])
                         .replace('%State%',detail[i]['State'])
                         .replace('%Date%',getDateFormat(detail[i]['Date']))
                         .replace('%disabled%',disabled)
                         .replace('%CanRenew%',CanRenew)
                         .replace('%dateC%',dateCF)
                         .replace(/%Barcode%/g,detail[i]['Barcode'])
                         .replace('%day%',day)
                         .replace('%Department_id%',detail[i]['Department_id'])
                         .replace('%Library_id%',detail[i]['Library_id']);
          }
          item.html(html);
          $.hidePreloader();
          callback(true);




        },
        error : function(){
          $.hidePreloader();
          callback(false);
        }
  });
}



// 加载我的收藏列表
function setMyFavorite(session,callback)
{
  var item = $("#tab6");
  var detail = '';
  var moban = '<div class="card">'
              +'<div class="card-header">%Title%</div>'
              +'<div class="card-content"><div class="list-block media-list">'
              +'<ul><li class="item-content"><div class="item-media">'
              +'<img src="%img%" width="80"></div><div class="item-inner">'
              +'<p>作者:%Author%</p>'
              +'<p>出版社:%Pub%</p>'
              +'<p>索书号:%Sort%<a href="#" class="icon icon-remove pull-right remove"></a></p>'
              +'</div></li></ul></div></div>'
              +'<div class="none card-footer">%ID%</div>'
              +'</div>';
  var html = '';
  $.ajax({
      url : 'http://api.xiyoumobile.com/xiyoulibv2/user/favoriteWithImg?session=' + session,
      type : 'get',
      dataType : 'jsonp',
      success : function(data){
        if(!data)
        {
          item.html("加载失败,请刷新重试");
          return;
        }
        if(!data.Result)
        {
          item.html("获取列表失败，请重试");
          return;
        }
        detail = data.Detail;
        if(typeof detail === 'string')
        {
          item.html("您还没有收藏图书");
          return;
        }
        setLeftInfo(false,false,detail.length);
        for(var i in detail)
        {
          var img = '';
          if(!detail[i].Images)
            moban.replace('<img src="%img%" width="80">','');
          else
            img = detail[i]['Images']['large'] || detail[i]['Images']['small'] || detail[i]['Images']['medium'] || '';
          html += moban.replace('%Title%',detail[i]['Title'])
                       .replace('%Author%',detail[i]['Author'])
                       .replace('%Pub%',detail[i]['Pub'])
                       .replace('%Sort%',detail[i]['Sort'])
                       .replace('%ID%',detail[i]['ID'])
                       .replace('%img%',img);

        }
        item.html(html);
      },
      error : function(){
        item.html("ServerError");
      }
  });


}
// 加载用户借阅历史
function setUserHistory(session)
{
  var item = $('#tab7');
  var moban = '<div class="card">'
                +'<div class="card-header">%Title%</div>'
                +'<div class="card-content"><div class="card-content-inner">'
                +'<p>操作类型:%Type%</p>'
                +'<p>操作日期:%Date%</p>'
                +'<p class="none">%Barcode%</p>'
                +'</div></div></div>';
  var html = '';
  var detail = '';
  $.ajax({
      url : 'http://api.xiyoumobile.com/xiyoulibv2/user/history?session=' + session,
      type : 'get',
      dataType : 'jsonp',
      success : function(data)
      {
        if(!data)
        {
          item.html("加载失败,请刷新重试");
          return;
        }
        if(!data.Result)
        {
          item.html("获取列表失败，请重试");
          return;
        }
        detail = data.Detail;
        if(typeof detail === 'string')
        {
          item.html("您还没有收藏图书");
          return;
        }
        for(var i in detail)
        {
          html += moban.replace('%Title%',detail[i]['Title'])
                       .replace('%Type%',detail[i]['Type'])
                       .replace('%Date%',detail[i]['Date'])
                       .replace('%Barcode%',detail[i]['Barcode']);
        }
        item.html(html);
      },
      error : function(){
         item.html("ServerError");
      }
  });
}


// 续借功能
function CanRenew(session,data,callback)
{
  // var url = 'http://api.xiyoumobile.com/xiyoulibv2/user/renew?session=' + session + data;
  // document.write(url);
  $.ajax({
      url : 'http://api.xiyoumobile.com/xiyoulibv2/user/renew?session=' + session 
            + '&barcode=' + data['barcode']
            + '&department_id=' + data['department_id']
            + '&library_id=' + data['library_id'],
      type : 'get',
      dataType : 'jsonp',
      success : function(data)
      {
        if(!data)
        {
          callback(false,"数据请求失败");
          return;
        }
        if(!data.Result)
        {
          callback(false,data.Detail);
          return;
        }
        callback(true,data.Detail);
        

      },
      error : function(){
        callback(false);
      }
  })
}


// 删除图书收藏
function delFav(session,id,username,callback)
{
  $.ajax({
      url : 'http://api.xiyoumobile.com/xiyoulibv2/user/delFav?session=' + session 
            + '&id=' + id
            + '&username=' + username,
      type : 'get',
      dataType : 'jsonp',
      success : function(data)
      {
        if(!data)
        {
          windowsShow("Server Error");
          return;
        }
        if(data.Result && data.Detail === "DELETED_SUCCEED")
          callback(true);

        windowsShow(data.Detail,true);
      },
      error :function(){
          windowsShow("删除失败");
      }

  });

}

// 添加图书收藏
function addFav(session,id,callback)
{
  $.ajax({
      url : 'http://api.xiyoumobile.com/xiyoulibv2/user/addFav?session=' + session 
            + '&id=' + id,
      type : 'get',
      dataType : 'jsonp',
      success : function(data)
      {
        if(!data)
        {
          windowsShow("Server Error");
          return;
        }
        if(data.Result)
          callback(true);
        windowsShow(data.Detail,true);

      },
      error : function(){
        windowsShow("Server Error");
      }
  }); 
}


//获取新闻列表
function getNewsList(page,callback,type)
{
  var tabs = '';
  if(type === 'news')
    tabs = '#tab8';
  else
    tabs = '#tab9';
  var content = $(tabs+' .list-block');
  var moban = '<div class="card">'
                    +'<div class="card-header">%Title%</div>'
                    +'<div class="card-footer">%Date%</div>'
                    +'<div class="none">%ID%</div>'
                  +'</div>';
  var html = "";
  var newsData = [];
  if($(tabs)[0].pages && ($(tabs)[0].pages - 0 < page || page < 1))
  {
    callback(false,true);
    return;
  }
  $.ajax({
    url : 'http://api.xiyoumobile.com/xiyoulibv2/news/getList/'+type+'/' + page,
        type : 'get',
        dataType : 'jsonp',
        success : function(data){
          if(!data.Result)
          {
            callback();
            windowsShow("新闻加载失败");
            return;
          }
          $(tabs)[0].pages = data['Detail']['Pages'];
          newsData = data['Detail']['Data'];
          if(!newsData)
          {
            callback(false);
            windowsShow(data['Detail'],true);

            return;
          }
          if(newsData.length < 4)
            $(tabs+' .infinite-scroll-preloader').css("display","none");
          for(var i in newsData)
          {
            html += moban.replace('%Title%',newsData[i]['Title'])
                   .replace('%ID%',newsData[i]['ID'])
                   .replace('%Date%',newsData[i]['Date']);
          }
          // if(is)
          //  content.html(html);
          // else
            content.append(html);
          callback(true);
          // $('#findResult .content').scrollTop(0);
          
        },
        error : function(){
          callback(false);
          windowsShow("新闻加载失败");
        }
  });
}

//获取新闻详情
function getNewsDetail(type,ID,callback)
{
  $.showIndicator();
  var content = $('#newsDetail .card');
  var detail = '';
  var moban = '<div class="card-header">%Title%</div>'
             +'<div class="card-content">'
             +'<div class="card-content-inner">%Passage%</div></div>'
             +'<div class="card-footer">' 
             +'<a href="#" class="link">%Publisher%</a>'
             +'<a href="#" class="link">%Date%</a></div>';
  var html = '';
  $.ajax({
        url : 'http://api.xiyoumobile.com/xiyoulibv2/news/getDetail/'+type+'/html/' + ID,
        type : 'get',
        dataType : 'jsonp',
        success : function(data)
        {
          if(!data)
          {
            callback(false);
            return;
          }
          if(!data.Result)
          {
            callback(false,data.Detail);
            return;
          }
          detail = data.Detail;
          if(typeof detail === 'string')
          {
            callback(false,detail);
            return;
          }
          html += moban.replace('%Title%',detail['Title'])
                       .replace('%Publisher%',detail['Publisher'])
                       .replace('%Date%',detail['Date'])
                       .replace('%Passage%',detail['Passage'].replace(/<img(.*?)src="(.+?)"(.*?)>/g,'<img$1src="http://lib.xupt.edu.cn$2"$3>'));

          content.html(html);
          callback(true);

        },
        error : function()
        {
          callback(false);
        }
  });
}


//侧栏数据填充
function setLeftInfo(Udata,Ydata,Fdata)
{
  if(Udata)
  {
    $('#stuName').html(Udata.Name);
    $('#stuNum').html('学号:' + Udata.ID);
    $('#stuClass').html('班级:' + Udata.Department);
  }
  if(Ydata)
  {
    $('.hasY').html(Ydata + '本');
    
  }
  if(Fdata)
  {
    $('.hasF').html(Fdata + '本');
  }
}

// 修改密码
function changePsw(data,callback)
{
  $.ajax({
        url : 'http://api.xiyoumobile.com/xiyoulibv2/user/modifyPassword',
        type : 'post',
        data : data,
        success : function(data){

        },
        error : function()
        {
          
        }
  });

}