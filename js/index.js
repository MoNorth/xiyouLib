
// $.config.swipePanel = false;
// 刷新初始化

var Userlogin = {
	logined : false,
	userID : '',
	userName : '',
	Department : '',
	Debt : '',
	Session : ''
};

(function(){
	// $.init();
	window.location.hash = '#search';
	var use = returnUserCookie(false);
	if(use)
		submitLogin(use.ID,use.psw,function(ok,data){
			if(ok){
				loginOkIdChange(true);
			}
			else
			{
				delUserCookie();
				windowsShow("记住密码失效，请重新登陆");
			}

	});
})();



// 跳转登陆，以及退出登录
function loginPageAndExit(){
	if(Userlogin.logined)
	{
		Userlogin.logined = false;
		var item = $("#myLib");
		var item2 = $("#RmyLib");
		item.attr('id','RmyLib');
		item2.attr('id','myLib');
		$.router.loadPage("#myLib");
	}
}
$("#exitLogin").click(function(){
	loginPageAndExit();
	delUserCookie();
});



// $("#a").click(function(){

// 		$.popup('.my-popup');
		
	
// });
// $("#b").click(function(){
// 	$.closeModal('.my-popup');
// });

$(document).on('click','.openCard .card',function(e){
	$.showPreloader();
	var title = $(this).find('span').eq(2).html().replace('分类号:','');
	getBookInfo(title,function(ok){
		$.hidePreloader();
		if(ok)
		{
			$.router.loadPage("#bookInfo");
		}
		
	});	
});

$('#getFind').click(function(){
	$.showPreloader();
	var oldKeyword = $('#searchword').val();
	var keyword = encodeURIComponent(oldKeyword);
	// alert(keyword);

	//做输入校验
	// if(!keyword)
	// {
	// 	 $.hidePreloader();
	// 	windowsShow('加载错误');

	// 	return;
	// }	
	$('#findResult .content .list-block').html('');
	$('#findResult .title').html(oldKeyword);
	$('#findResult')[0].page = 1;
	if($('#findResult .infinite-scroll-preloader').css("display") === "none")
		$('#findResult .infinite-scroll-preloader').css("display","block");
	addFindResult(keyword,1,function(ok){
		 $.hidePreloader();
		 if(ok)
		 {
		 	$.router.loadPage("#findResult");
			$('#findResult .content').scrollTop(0);
		 }
		 
	});
	
});

// $('#findResult .lastPage').click(function(){
	
// 		var keyword = $('#findResult .title').html();
// 		var page = $('#findResult')[0].page - 0 - 1;
// 		addFindResult(keyword,page,function(is,en){
// 			$.hidePreloader();
// 			if(is)
// 			{
// 				$('#findResult')[0].page = page;
				
// 			}
// 			if(en && !is)
// 			{
// 				windowsShow("没有上一页了");
                
// 			}
			
			
// 		},true);

// });
// $('#findResult .nextPage').click(function(){

// 		var keyword = $('#findResult .title').html();
// 		var page = $('#findResult')[0].page - 0 + 1;
// 		addFindResult(keyword,page,function(is,en){
// 			$.hidePreloader();
// 			if(is)
// 			{
// 				$('#findResult')[0].page = page;

// 			}
// 			if(en && !is)
// 			{
// 				windowsShow("没有下一页了");
                
// 			}
			
			
// 		},true);

// });
//无限滚动事件
(function(){
	var loading = false;
	$(document).on('infinite','#findResult .infinite-scroll',function(){
		if(loading) return;
		loading = true;
		var keyword = encodeURIComponent($('#findResult .title').html());
		var page = $('#findResult')[0].page - 0 + 1;
		addFindResult(keyword,page,function(is,en){
			if(is)
			{
				$('#findResult')[0].page = page;
				$.refreshScroller();
			}
			if(en && !is)
			{
				// $.detachInfiniteScroll($('#findResult .infinite-scroll'));
                // 删除加载提示符
                $('#findResult .infinite-scroll-preloader').css("display","none");
			}
			loading = false;
		});
	});
})();


(function(){
	getNewsList(1,function(ok){
		if(!ok)
		{
			$('#tab8').html("新闻加载失败");
		}
		else
		{
			$('#tab8')[0].page = 1;
		}
	},'news');
	getNewsList(1,function(ok){
		if(!ok)
		{
			$('#tab9').html("新闻加载失败");
		}
		else
		{
			$('#tab9')[0].page = 1;
		}
	},'announce');

	var loading = false;
	$(document).on('infinite','#news .infinite-scroll',function(){
		var tabs = '';
		var type = '';
		if($('#tab8').hasClass('active'))
		{
			tabs = '#tab8';
			type = 'news';
		}
		else
		{
			tabs = '#tab9';
			type = 'announce';
		}
		if(loading) return;
		loading = true;
		var page = $(tabs)[0].page - 0 + 1;
		getNewsList(page,function(is,en){
			if(is)
			{
				$(tabs)[0].page = page;
				$.refreshScroller();
			}
			if(en && !is)
			{
				// $.detachInfiniteScroll($('#findResult .infinite-scroll'));
                // 删除加载提示符
                $(tabs+' .infinite-scroll-preloader').css("display","none");
			}
			loading = false;
		},type);
	});




})();



$(document).on('click','#search .item-link', function (e) {   
      // var that = $(e.target)[0].localName === 'li' ? $(e.target) : $(e.target).parent('li');
      var target = e.target.localName === 'li' ? e.target : ($(e.target).parents('li'))[0];
      var that = $(target);
      if(target.isopen)
      {
      	that.find('.item-after').html('展开');
      	target.isopen = false;
      	that.next().css('display','none');
      	return;
      }
      $.showIndicator();
      var type = that.find('.item-title').html();
     
      switch(type)
      {
      	case '借阅排行':
      		type = 1;
      		break;
      	case '收藏排行':
      		type = 3;
      		break;
      	case '检索排行':
      		type = 2;
      		break;
      	case '查看排行':
      		type = 5;
      		break;
      	default:
      		type = 1;
      }
     getPaihang(type,that,target);


          // $.hideIndicator();

  });

$(document).on('click','#tab4 .card,#findResult .card,#tab6 .card',function(e){
	var ID = $(e.target).parents('.card').find('.card-footer').html().replace('控制号:','');
	if(e.target.className === 'icon icon-remove pull-right remove')
	{
		//删除收藏
		var buttons1 = [
	        {
	          text: '请选择',
	          label: true
	        },
	        {
	          text: '确认删除',
	          bold: true,
	          color: 'danger',
	          onClick: function() {
	            delFav(Userlogin.Session,ID,Userlogin.userID,function(ok){
	            	if(ok)
	            	{
	            		$(e.target).parents('.card').remove();
	            	}
	            });
	          }
	        }
	      ];
	      var buttons2 = [
	        {
	          text: '取消',
	          bg: 'danger'
	        }
	      ];
	      var groups = [buttons1, buttons2];
	      $.actions(groups);
		return;
	}
	$.showPreloader();
	
	getBookInfo(ID,function(ok){
		$.hidePreloader();
		if(ok)
		{
			$.router.loadPage("#bookInfo");
		}
	});
});

$(document).on('click','#tab5 .card,#tab7 .card',function(e){
	if(e.target.className === 'button CanRenew')
	{
		e.target.className = 'button disabled';
		//续借
		var data = JSON.parse($(e.target).next().html());
		CanRenew(Userlogin.Session,data,function(ok,d){
			if(ok)
			{
				$(e.target).parent().last().find('p').eq(2).html('到期时间:' + d);
				var day = $(e.target).next().next().html().replace('剩','').replace('天到期','') - 0;
				$(e.target).next().next().html('剩' + (day + 7) + '天到期');
				windowsShow("续借成功");
			}
			else{
				e.target.className = 'button CanRenew';
				if(d)
				{
					windowsShow(d,true);
				}
				else
					windowsShow("Server Error");
			}
		});
		return;
	}
	$.showPreloader();
	var barcode = $(e.target).parents('.card').find('p.none').html();
	getBookInfo(true,function(ok){
		$.hidePreloader();
		if(ok)
		{
			$.router.loadPage("#bookInfo");
		}
	},barcode);
});

$('#showLoginInfo').click(function(){
	$.alert('如果您未曾使用过西邮图书馆，请使用初始密码登陆');
});
$('.reset').click(function(){
	$('input[name=id]').val('');
	$('input[name=psw]').val('');
	$('input[name=id]').focus();
	return false;
});

$('input[name=id]').blur(function(){
	var text = $('input[name=id]').val();
	if(text === '')
	{
		windowsShow("请输入学号");
		return;
	}
	if(text.charAt(0) === 's')
	{
		text = 'S' + text.substr(1,text.length-1);
		$('input[name=id]').val(text);

	}
	if(text.charAt(0) != 'S')
	{
		text = 'S' + text;
		$('input[name=id]').val(text);

	}
	
	if(!text.match(/^S\d{8}$/))
	{
		$('input[name=id]').val('');
		windowsShow("请输入合法ID");
		$('input[name=id]').focus();	
	}
});




//登陆
function submitLogin(ID,psw,callback)
{
	
	// 登陆
	Ulogin(ID,psw,function(ok,data){
		if(ok)
		{
			Userlogin.logined = true;
			Userlogin.userID = ID;
			Userlogin.Session = data;
		}
		else
		{
			Userlogin.logined = false;
			if(data)
				callback(false,data);
			else
				callback(false,'Server Error!');
		}
		if(Userlogin.logined)
		{
			//查询个人信息并记录
			getUserInfo(Userlogin.Session,function(ok,data){
				if(ok)
				{
					Userlogin.userName = data.Name;
					Userlogin.Department = data.Department;
					Userlogin.Debt = data.Debt;
					setLeftInfo(data,false,false);
					callback(true);
				}
				else
				{
					if(data)
						callback(false,data);
					else
						callback(false,'Server Error!');
				}
			});

		}
	});
}


//登陆成功后的id改变，别问我为什么这么写 我也不知道
function loginOkIdChange(frist)
{

	getMyRent(Userlogin.Session,function(ok,data){
		if(!frist)
		{
			if(!ok)
			{
				if(data)
					windowsShow(data,true);
				else
					windowsShow("Server Error");
			}
			else
			{
				var item = $("#myLib");
				var item2 = $("#RmyLib");
				item.attr('id','RmyLib');
				item2.attr('id','myLib');
				$.router.loadPage("#myLib");
				setMyFavorite(Userlogin.Session);
				setUserHistory(Userlogin.Session);
			}
		}
		else
		{
			if(ok)
			{
				var item = $("#myLib");
				var item2 = $("#RmyLib");
				item.attr('id','RmyLib');
				item2.attr('id','myLib');
				setMyFavorite(Userlogin.Session);
				setUserHistory(Userlogin.Session);
			}
		}

	});


	

}




$('.submit').click(function(){
	var ID = $('input[name=id]').val();
	var psw = $('input[name=psw]').val();
	if(ID === '')
	{
		windowsShow("请输入学号");
		return;
	}
	if(psw === '')
	{
		windowsShow("请输入密码");
		return;
	}
	 var buttons1 = [
        {
          text: '是否保存您的密码',
          label: true
        },
        {
          text: '记住密码',
          bold: true,
          color: 'danger',
          onClick: function() {

            submitLogin(ID,psw,function(ok,data){
            	if(ok)
            	{
            		saveUser(ID,psw);
            		loginOkIdChange();
            	}
            	else{
            		if(data)
            			windowsShow(data,true);
            		else
            			windowsShow("Server Error");
            	}
            });
            
          }
        },
        {
          text: '不了，谢谢',
          onClick: function() {
            submitLogin(ID,psw,function(ok){
            	if(ok)
            	{
            		delUserCookie();
            		loginOkIdChange();
            	}
            	else{
            		if(data)
            			windowsShow(data,true);
            		else
            			windowsShow("Server Error");
            	}
            });
          }
        }
      ];
      var buttons2 = [
        {
          text: '取消',
          bg: 'danger'
        }
      ];
      var groups = [buttons1, buttons2];
      $.actions(groups);
});
// (function(){
// 	var oldtext = '';
// 	$('input[name=id]').keyup(function(){
// 		var text = $('input[name=id]').val();

// 		if(oldtext != text && text != '')
// 		{
// 			if(!text.charAt(text.length - 1).match(/^\d$/))
// 			{
// 				$('input[name=id]').val(oldtext);
// 				windowsShow('只允许输入数字');
// 			}else
// 			{
// 				oldtext = text;
// 			}
// 		}
// 	});
// })();
// alert($.smConfig.swipePanelOnlyClose=true);
// alert($.smConfig.swipePanel=false);
$("#addFav").click(function(){
	var id = $('#tab1').find('.none').html();
	addFav(Userlogin.Session,id,function(ok){
		if(ok)
		 	setMyFavorite(Userlogin.Session);
	});
	
});

$(document).on('click','#news .card',function(){
	var ID = $(this).find('.none').html();
	var type = '';
	if($('#tab8').hasClass('active'))
		type = 'news';
	else
		type = 'announce';
	getNewsDetail(type,ID,function(ok,data)
	{
		$.hideIndicator();
		if(ok)
		{
			$.router.loadPage('#newsDetail');
		}
		else if(data)
		{
			windowsShow(data,true);
		}
		else
			windowsShow("加载失败");


	});


	
});


// 主题切换
(function(){
	var html = document.getElementsByTagName('html')[0];
	var c = html.className;
	$('#button-light').click(function(){
		html.className = c;
	});
	$('#button-dark').click(function(){
		html.className = c + ' theme-dark';
	});
	$('#button-danger').click(function(){
		html.className = c + ' theme-pink';
	});
	$('#button-success').click(function(){
		html.className = c + ' theme-green';
	});
	$('#button-warning').click(function(){
		html.className = c + ' theme-yellow';
	});

})();


$('#changepswBtn,#forgiveChangPsw').click(function(){
	removeChangPsw();
});

function removeChangPsw(){
	var zhuti = $('#zhuti');
	if(!zhuti.hasClass('none'))
	{
		zhuti.addClass('none');
		$('#changepsw').removeClass('none');
	}
	else
	{
		zhuti.removeClass('none');
		$('#changepsw').addClass('none');
	}
}