
;+function($){  
    //封装一个写轮播图的函数 传参选择器和
    $.fn.xLbt = function(selector,options){

        new Lbt(selector,options);
    }

    function Lbt(selector,options){ 
        this.init(selector,options);
    }

    Lbt.prototype = { //轮播图的原型，指针指向lbt，便可调用lbt函数里的方法
        constructor:Lbt,
        init:function(selector,options){
            this.index = 0;
            // 轮播图外框
            this.LbtWrapper = $(selector);
            //动画模式;  fade是淡入淡出，如果有轮播方式，就取轮播方式，如果没有，就让轮播方式为淡入淡出 
            this.animate = options.animate ? options.animate : "fade"; 
            //每一张图片所在的盒子
            this.LbtItem = this.LbtWrapper.children();
            //随机颜色;
            this.LbtItem.css("background",function(){
                var r = Math.round(Math.random() * 255);
                var g = Math.round(Math.random() * 255);
                var b = Math.round(Math.random() * 255);
                return `rgb(${r},${g},${b})`;
            })

          if (options.loop) {
                this.loop();
              }
            
            this.LbtNum = this.LbtItem.length; 


            //判定是否有pagination传入;
            this.pagination = $(options.pagination ? options.pagination.el : "");
            if(this.pagination.length !== 0){
                for(var i = 0 ; i < this.LbtNum; i++){
                    var span = $("<span></span>");
                    this.pagination.append(span);
                    if(i == this.index){ //如果当前按钮的索引等于当前图片的索引，就给这个按钮添加类名active
                        span.addClass("active");
                    }
                }

                this.item0 = this.pagination.children();

                //鼠标移上去时，先改变索引，再通过索引进行动画
                this.item0.on("mouseover.changeIndex",{"turn":"index0"},$.proxy(this.changeIndex,this));
                this.item0.on("mouseover.animation",$.proxy(this.animation,this));
            }

                //获取左右按钮，当鼠标点上去时，对将要隐藏的图片、正在显示的图片、将要显示的图片的下标进行转换，
                //然后通过这个下标做动画            
                this.btnLeft = $(options.prevBtn)
                this.btnRight = $(options.nextBtn)

                this.btnLeft
                .on("click.changeIndex",{turn:"prev"},$.proxy(this.changeIndex,this))
                .on("click.animation",$.proxy(this.animation,this))
                this.btnRight
                .on("click",{turn:"next"},$.proxy(this.changeIndex,this))
                .on("click",$.proxy(this.animation,this))
        },
        changeIndex:function(event){ //图片下标的转换
            var turnList = {
                "prev":function(){
                    this.prev = this.index;
                    if(this.index  == 0){
                        this.index = this.LbtNum - 1;
                    }else{
                        this.index --;
                    }
                }.bind(this),
                "next":function(){
                    this.prev = this.index;
                    if(this.index == this.LbtNum - 1){
                        this.index = 0;
                    }else{
                        this.index ++;
                    }
                }.bind(this),
                "index0":function(){
                    this.prev = this.index;//this.index是当前显示图片的下标  this.prev是将要隐藏的图片的下标
                    this.index = $(event.target).index();//$(event.target).index()是将要显示图片的下标 
                }.bind(this)
            }
            if(!(typeof turnList[event.data.turn] == "function")) return 0;
            turnList[event.data.turn]();
        },
        animation:function(event){ //图片根据下标动起来

            if(this.prev == this.index) return ;
            
            var animationList = {
                "slide":function(){
                    animationList.slideFadeInit();
                    this.LbtItem.eq(this.index)
                    .stop()
                    .addClass("active")
                    .css({
                        display:"none"
                    })
                    .slideDown()
                    .siblings()
                    .removeClass("active");
                }.bind(this),
                "fade":function(){
                    animationList.slideFadeInit();
                    this.LbtItem.eq(this.index)
                    .stop()
                    .addClass("active")//让当前的图片显示，只不过是瞬间显示，然后通过设置css为display:none;让图片隐藏，然后.fadeIn()淡入
                    .css({
                        display:"none"
                    })
                    .fadeIn()
                    .siblings()
                    .removeClass("active");           
                }.bind(this),
                "scroll":function(){ //推动式的显示两张图片推动，将所有图片隐藏，将推动显示的两张图片显示
                    //初始化;
                    this.LbtItem
                    .css({
                        zIndex:0
                    })
                    .eq(this.prev)
                    .css({
                        zIndex:2
                    })
                    .end()
                    .eq(this.index)
                    .css({
                        zIndex:2
                    })
                    console.log(this.prev,this.index)

                    //判断图片从左向右轮播，还是从右向左轮播
                    if(this.prev > this.index){
                        this.LbtItem.eq(this.prev)
                        .animate({
                            nextBtn:this.LbtItem.outerWidth()
                        })
                        .end()
                        .eq(this.index)
                        .css({
                            nextBtn:-this.LbtItem.outerWidth()
                        })
                        .animate({
                            nextBtn:0
                        })
                    }else{
                        this.LbtItem.eq(this.prev)
                        .animate({
                            nextBtn:-this.LbtItem.width() //从0移动到左边一个宽度
                        })
                        .end()
                        .eq(this.index)
                        .css({
                            nextBtn:this.LbtItem.width() 
                        })
                        .animate({ //从右边一个宽度移动到0
                            nextBtn:0
                        })
                    }
                }.bind(this),
                "slideFadeInit":function(){
                    this.LbtItem.eq(this.prev)//让将要隐藏的图片的zIndex为1，大大于隐藏图片的索引，小于显示图片的索引，否则如果设为0，隐藏图片、显示图片，那么将要隐藏的图片就指不定是哪张图片
                    .css({
                        zIndex:1
                    })
                    .siblings()
                    .css({
                        zIndex:""
                    })
                }.bind(this)
            }
            animationList[this.animate](); //this.animate是slide fade scroll   []相当于点，调用animationList对象里的函数
            this.pagination.children().eq(this.index) //当图片发生动画运动时，设置分页按钮的下标
            .addClass("active")
            .siblings()
            .removeClass("active")
        },

        //自动轮播
        loop:function(){

          this.LbtWrapper.on("mouseenter",function(){
            clearInterval(this.loopTimer)
          }.bind(this))
          this.LbtWrapper.on("mouseleave",function(){
            clearInterval(this.loopTimer);
            this.loopTimer = setInterval(function(){
              this.prev = this.index;
              this.index = ++this.index % this.LbtNum;
              this.animation();
              console.log(1);
            }.bind(this),2000)
          }.bind(this))
          this.LbtWrapper.trigger("mouseleave")
        }
    }
  
}(jQuery);


