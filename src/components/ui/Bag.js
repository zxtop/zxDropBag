import {Application,Container,Graphics,Sprite, Point, interaction} from 'pixi.js';
import { getAnimation, getSound, load, createSprite,  getTexture} from '../../loader';
import {TweenLite,TimeLine,TweenMax} from 'gsap';
import {AnswerInfo,Loading,Question} from 'xes-answer';
import endAn from './endAn.js';

import { Store} from 'vuex';

class Bag{
    constructor(){
        this.pixiStage = null;
        this.currentTarget = null;
        this.blockArr = [];
        this.manAnimate = []; //人物
        this.manArr = [];
        this.shabao = null; //沙包
        this.isclick = null;
        this.bubble = ['image_aqiu','image_xuduo','image_lili','image_haigui'];  //气泡提示
        this.voice = [
            {
                "wrong":['audio_a_wrong_001','audio_a_wrong_002'],
                "right":['audio_a_right_001','audio_a_right_002']
            },
            {
                "wrong":['audio_c_wrong_001','audio_c_wrong_002'],
                "right":['audio_c_right_001','audio_c_right_002']
            },
            {
                "wrong":['audio_b_wrong_001','audio_b_wrong_002'],
                "right":['audio_b_right_001','audio_b_right_002']
            },
           
            {
                "wrong":['audio_d_wrong_001','audio_d_wrong_002','audio_d_wrong_003'],
                "right":['audio_d_right_001','audio_d_right_002','audio_d_right_003']
            }

        ]
        this.complete = true;
        this.waited = true;
        this.count = 0;
        this.qipao = [];
    }

    exec(){
        let _that = this;
        this.pixiStage = stage.children[store.state.pageNum];
        this.initMan(store.state.pageNum);
        this.initBlock(store.state.pageNum);
        stage.on('pointerup',function(ev){_that.onDragup.bind(_that)(ev,_that.currentTarget,_that)});
    }

    initMan(){ //push人物动画
       let _that = this;

       for(let i=0;i<4;i++){
           let animation = getAnimation('animation_diushabao');
           animation.start = 'start_'+(i+1);
           animation.wait = 'wait_'+(i+1);
           animation.right = 'right_'+(i+1);
           animation.wrong = 'wrong_'+(i+1);
           animation.shoot = 'shoot_'+(i+1);
           animation.isRight = 0;
           animation.info = i;
           _that.manArr.push(animation);
       }

    }
    initShoot(name){ //初始化方法 换沙包皮肤的动画
        let _that = this;
        this.shabao.setSkinByName = function(skinName){
            let skeleton = null;
            skeleton = this.skeleton;
            skeleton.setSkin(null);
            skeleton.setSkinByName(skinName)
        };
        this.shabao.setSkinByName(name);
        this.shabao.state.addListener({
            complete:function(){
                _that.complete = true;
                _that.shabao.state.clearListeners();
            }
        })
    }

    initBlock(pageNum){  //初始化格子
        let _that = this;
        let blocks = question.sources[store.state.pageNum].block;

        blocks.map((item,index)=>{ //初始化空格

            let blockSprite = new PIXI.Sprite.fromImage(res[item.image.name].url);
            blockSprite.x = parseInt(item.image.x);
            blockSprite.y = parseInt(item.image.y);
            blockSprite.interactive = true;
            blockSprite.info = item.image.info;
            blockSprite.default = PIXI.Texture.fromImage(item.image.name);
            blockSprite.hover = PIXI.Texture.fromImage(item.image.fullcolor);
            blockSprite.isdone = false;
            blockSprite.iscolor = false;
            if(item.image.last_info){
                blockSprite.last_info = true
            }else{
                blockSprite.last_info = false;
            }
            _that.blockArr.push(blockSprite);
            _that.pixiStage.addChild(blockSprite);
            
        });
        console.log(_that.blockArr)
        _that.getManSprite(_that.count); //人物走出来后绑定点击格子方法
        
        
        _that.isclick = getAnimation('animation_diushabao');//添加点击效果
        _that.isclick.alpha = 0;
        _that.pixiStage.addChild(_that.isclick);

        _that.shabao = getAnimation('animation_diushabao');
        _that.shabao.alpha = 0;
        _that.pixiStage.addChild(_that.shabao);
    }

    clickBlock(){ //绑定格子的方法
        let _that = this;
        _that.blockArr.map((item,index)=>{
            item.on('pointerdown',function(ev){_that.getCurrentTarget.bind(_that)(ev,item,_that,index)})
            item.on('pointerover',function(ev){_that.overCurrentTarget.bind(_that)(ev,item,_that,index)})
        })
    }

    overCurrentTarget(ev,item,_that,index){ //划上格子变小手
        let target = ev.currentTarget;
        target.cursor = 'pointer';
    }

    getCurrentTarget(ev,item,_that,index){  //绑定格子点击事件

        if(_that.complete && !item.isdone && _that.waited ){
            _that.waited = false;
            _that.currentTarget = ev.target;


            _that.isclick.state.setAnimation(1,'click',false); //添加点击效果
            _that.isclick.x = _that.currentTarget.width/2 + _that.currentTarget.x;
            _that.isclick.y = _that.currentTarget.height/2 + _that.currentTarget.y;
            _that.isclick.alpha = 1;
            
            _that.manAnimate[_that.count].state.setAnimation(1,_that.manAnimate[_that.count].shoot,false);
            setTimeout(()=>{
                _that.getShabao(String(_that.manAnimate[_that.count].info)); //丢沙包                

            },400)
            
            setTimeout(()=>{

                if(item.info == String(_that.manAnimate[_that.count].info)){
                    
                    console.log(Math.round(Math.random()*((_that.voice[_that.count].right.length-1)-0)+0))
                    let random = Math.round(Math.random()*((_that.voice[_that.count].right.length-1)-0)+0);
                    console.log('正确',_that.voice[_that.count].right[random]);
                    
                    res[_that.voice[_that.count].right[random]].sound.play(); //播放正确声音

                    _that.currentTarget.isdone = true;
                    // _that.currentTarget.iscolor = true;
                    
                    _that.manAnimate[_that.count].isRight++;
                    _that.manAnimate[_that.count].state.setAnimation(1,_that.manAnimate[_that.count].right,false);
                    setTimeout(()=>{
                        _that.currentTarget.texture = _that.currentTarget.hover; //改变颜色
                    },80)
                    setTimeout(()=>{

                        if(_that.manAnimate[_that.count].isRight == 2){
                           
                            if(_that.count == 3){
                                console.log('提交答案');
                                // 撒花动效
                                res['audio_shahua'].sound.play(); //播放正确声音

                                document.getElementById('success-canvas').style.display = 'block';
                                new endAn();
                                setTimeout(() => {
                                    document.getElementById('success-canvas').style.display = 'none';
                                },3600);
                                setTimeout(()=>{

                                    let answer = new AnswerInfo();
                                    answer.init({type: 0, useranswer:'', answer:'', id:0, rightnum: 1, wrongnum: 0});                                
                                    store.dispatch('pushToPostArr', answer);
                                    store.dispatch('postAnswer');

                                },3000)

                            }else{

                                console.log('进入下一个了要');
                                _that.complete = false;
                                _that.waited = true;
                                console.log('6666',_that.complete);
                                // _that.manAnimate[_that.count].alpha = 0;
                                TweenLite.to(_that.manAnimate[_that.count],.3,{alpha:0})
                                
                                _that.qipao[_that.count].alpha = 0;
                                _that.count++;
                                // _that.blockArr.map((item,index)=>{ //过场后是否可以再次点击
                                //     item.isdone = false;
                                // })

                                _that.getManSprite(_that.count);

                            }
                        }else{
                            _that.manAnimate[_that.count].state.setAnimation(1,_that.manAnimate[_that.count].wait,true)
                            _that.waited = true;

                        }
                    },1500)
                   
                }else{
                
                    console.log(Math.round(Math.random()*((_that.voice[_that.count].wrong.length-1)-0)+0))
                    let random = Math.round(Math.random()*((_that.voice[_that.count].wrong.length-1)-0)+0);
                    console.log('错误',_that.voice[_that.count].wrong[random]);
                    res[_that.voice[_that.count].wrong[random]].sound.play(); //播放错误声音

                    _that.manAnimate[_that.count].state.setAnimation(1,_that.manAnimate[_that.count].wrong,false);
                    setTimeout(()=>{
                        _that.manAnimate[_that.count].state.setAnimation(1,_that.manAnimate[_that.count].wait,true);
                        // if(item.iscolor){
                        //     // item.texture = item.hover;
                        // }else{
                        //     item.texture = item.default;
                        // }
                        _that.waited = true;

                        item.texture = item.default;

                    },1500)
                }

                
            },1300)
            _that.complete = false;
            
            // console.log(index)
        }

    }


    onDragup(ev,item,_that){  //鼠标抬起
        if(_that.currentTarget){
            // _that.complete = true
        }
    }

    getShabao(info){  //初始化沙包的位置和对应正确的动画
        let _that = this;
        switch(info){

            case "0":
            
                _that.shabao.alpha = 1;
                _that.shabao.state.setAnimation(1,'shabao',false);
                _that.initShoot('shabao_1');
                
                if(_that.currentTarget.last_info){
                    console.log("最后一个",_that.manAnimate[_that.count].x+50)
                    TweenLite.fromTo(
                        _that.shabao,
                        0.6,
                        {
                            x:_that.manAnimate[_that.count].x+100,
                            y:_that.manAnimate[_that.count].y-50
                        },
                        {
                            x:_that.currentTarget.x-300,
                            y:_that.currentTarget.y
                        }
                    )
                }else{
                    TweenLite.fromTo(
                        _that.shabao,
                        0.8,
                        {
                            x:_that.manAnimate[_that.count].x+50,
                            y:_that.manAnimate[_that.count].y+50
                        },
                        {
                            x:_that.currentTarget.x - 300,
                            y:_that.currentTarget.y
                        }
                    )
                }
               
            break;

            case "1":
           
                _that.shabao.alpha = 1;
                _that.shabao.state.setAnimation(1,'shabao',false);
                _that.initShoot('shabao_2');
               
                _that.pixiStage.setChildIndex(_that.shabao,_that.pixiStage.children.length-1)

                if(_that.currentTarget.last_info){
                    console.log("最后一个",_that.manAnimate[_that.count].x+50)
                    TweenLite.fromTo(
                        _that.shabao,
                        0.6,
                        {
                            x:_that.manAnimate[_that.count].x+150,
                            y:_that.manAnimate[_that.count].y-80
                        },
                        {
                            x:_that.currentTarget.x-300,
                            y:_that.currentTarget.y
                        }
                    )
                }else{
                    TweenLite.fromTo(
                        _that.shabao,
                        0.8,
                        {
                            x:_that.manAnimate[_that.count].x+50,
                            y:_that.manAnimate[_that.count].y+50
                        },
                        {
                            x:_that.currentTarget.x - 300,
                            y:_that.currentTarget.y
                        }
                    )
                }
            break;

            case "2":
          
                _that.shabao.alpha = 1;
                _that.shabao.state.setAnimation(1,'shabao',false);
                _that.initShoot('shabao_3');
               
                _that.pixiStage.setChildIndex(_that.shabao,_that.pixiStage.children.length-1)

                if(_that.currentTarget.last_info){
                    console.log("最后一个",_that.manAnimate[_that.count].x+50)
                    TweenLite.fromTo(
                        _that.shabao,
                        0.6,
                        {
                            x:_that.manAnimate[_that.count].x+100,
                            y:_that.manAnimate[_that.count].y-50
                        },
                        {
                            x:_that.currentTarget.x-300,
                            y:_that.currentTarget.y
                        }
                    )
                }else{
                    TweenLite.fromTo(
                        _that.shabao,
                        0.8,
                        {
                            x:_that.manAnimate[_that.count].x+50,
                            y:_that.manAnimate[_that.count].y+50
                        },
                        {
                            x:_that.currentTarget.x - 300,
                            y:_that.currentTarget.y
                        }
                    )
                }
            break;

            case "3":
     
                _that.shabao.alpha = 1;
                _that.shabao.state.setAnimation(1,'shabao',false);
                _that.initShoot('shabao_4');
                
                _that.pixiStage.setChildIndex(_that.shabao,_that.pixiStage.children.length-1)

                if(_that.currentTarget.last_info){
                    console.log("最后一个",_that.manAnimate[_that.count].x+50)
                    TweenLite.fromTo(
                        _that.shabao,
                        0.6,
                        {
                            x:_that.manAnimate[_that.count].x+100,
                            y:_that.manAnimate[_that.count].y-50
                        },
                        {
                            x:_that.currentTarget.x-300,
                            y:_that.currentTarget.y
                        }
                    )
                }else{
                    TweenLite.fromTo(
                        _that.shabao,
                        0.8,
                        {
                            x:_that.manAnimate[_that.count].x+50,
                            y:_that.manAnimate[_that.count].y+50
                        },
                        {
                            x:_that.currentTarget.x - 300,
                            y:_that.currentTarget.y
                        }
                    )
                }
            break;

        }
    }


    getManSprite(count){ //人物气泡走进  和  回调
        let _that = this;

        _that.qipao[count] = new PIXI.Sprite.fromImage(res[this.bubble[count]].url); //进入气泡
        if(count == 1 || count == 2){
            _that.qipao[count].x = 1080;
            _that.qipao[count].y = 180;
        }else{
            _that.qipao[count].x = 1080;
            _that.qipao[count].y = 180;
        }
        _that.qipao[count].alpha = 0;
        _that.pixiStage.addChild(_that.qipao[count]);
        

        _that.manAnimate[count] = _that.manArr[count];
        console.log(_that.manArr[count].start);
        _that.manAnimate[count].state.setAnimation(1,_that.manArr[count].start,false);

        // _that.manAnimate[count].x = 987;
        // _that.manAnimate[count].y = 555;

        _that.manAnimate[count].x = 1000;
        _that.manAnimate[count].y = 575;

        setTimeout(()=>{
            console.log('第'+count+'个回调');
            _that.complete = true;

            _that.qipao[count].alpha = 1;
            _that.manAnimate[count].state.setAnimation(1,_that.manArr[count].wait,true);
            _that.clickBlock();

        },1500)

        _that.pixiStage.addChild(_that.manAnimate[count]);
    }
}
export {Bag}