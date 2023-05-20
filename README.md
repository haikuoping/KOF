# JavaScript 制作拳皇网页小游戏



[toc]



## 整体框架：![](https://cdn.acwing.com/media/article/image/2022/09/29/161449_6415f6823f-js%E9%80%BB%E8%BE%91%E5%9B%BE.jpg)

![](https://cdn.acwing.com/media/article/image/2022/12/18/211775_b650ebfd7e-1.png)

## 前言

在初始阶段，我觉得比较重要得一点是捋顺项目的逻辑，这个逻辑不仅仅是某一个函数的逻辑，更重要的是宏观层面上的逻辑，它每一个文件做了什么，文件之间如何联系起来的，靠什么联系起来的，这些我觉得也是非常重要的，只有搞懂了这些，项目才是活的，才会有可能去独立的写一个项目，或加一些东西，否则，我们就处于一种“不敢动”的状态，不知道加一些东西，或减一些东西意味着什么. 那么我这篇文章主要就是想讲一下这个小项目，它是怎么动起来的。

## 本项目的结构

本项目一共有两个大文件夹, 分别是static文件夹和template文件夹，前者存放一些静态文件，包括css文件夹，image文件夹还有js文件夹等，可能还会有一些音频或其他的文件夹，在这里主要说一下js夹里的内容，这里面包含了实现本项目的大部分逻辑. 而后者template文件夹里面主要包含一个index.html文件，主要用来生成一个项目对象.

### 1.js文件夹里的内容

1. ac_game_object文件夹
2. controller文件夹

3. game_map文件夹

4. player文件夹

5. utils文件夹

这些文件夹里面都有一个base.js文件来负责项目的某一部分逻辑. 而js文件夹里面本身就有个base.js文件，这个文件里面的类就是生成项目对象的类。

### 2.项目逻辑碎碎念

#### 2.1 index.html文件

首先我们在index.html文件里面，new一个对象出来，这个对象就是项目本身，id号来区分项目，也就是说id号是KOF类中构造函数里面的参数. index.html文件夹里面的内容如下：

```html
<body>

    <div id="kof">
    </div>

    <script type="module">
        import { KOF } from '/static/js/base.js';
        let kof = new KOF('kof');
    </script>

</body>
```

#### 2.2 js/base.js文件

现在，我们的视角转入js/base.js这个文件，这个文件中主要有一个KOF类， KOF类里面的构造函数, 主要是生成地图和角色，或者是其他什么东西. 如果有其他东西，就可以再加一些文件，写入一些逻辑.

就本项目而言，可以看到，我们在该文件里面导入了GameMap和Kyo类. 我们new了一个gamemap，同时也new了一个players数组. 同时我们用jquery的语法，使得我们能够操控某一个id号的div.

代码如下：

```js
import {GameMap} from '/static/js/game_map/base.js';
import { Kyo } from './player/kyo.js';

class KOF {
    constructor(id) {
        this.$kof = $('#' + id);
        // 这里是链接的关键. GameMap(this)使得, this.game_map有GameMap类里面的属性, 
        // 而我们要用到的就是this.game_map.ctx这块canvas画布
        this.game_map = new GameMap(this);
        this.players = [
            new Kyo(this, {
                id: 0,
                x: 200,
                y: 0,
                width: 120,
                height: 200,
                color: 'blue',
            }),
            new Kyo(this, {
                id: 1,
                x: 900,
                y: 0,
                width: 120,
                height: 200,
                color: 'red',
            })
        ];
    }

}


export {
    KOF
}
```

#### 2.3 js/ac_game_object/base.js文件

这个文件夹下有个base.js文件，这个文件是一个基类，是做出动画效果的关键所在，所有需要每帧渲染一次的组件都要继承这个类，比如地图类，比如角色类. 主要用到requestAnimationFrame()函数，浏览器会在刷新的下一帧，执行该函数里的内容. 我们给这个函数传入一个每一帧需要执行一次的函数AC_GAME_OBJECTS_FRAME，且在该函数末尾递归调用该函数requestAnimationFrame(AC_GAME_OBJECTS_FRAME)，就能实现动画的效果. 代码如下：

```js
let AC_GAME_OBJECTS = [];
class AcGameObject {
    constructor() {
        AC_GAME_OBJECTS.push(this);
        this.timedelta = 0;
        this.has_call_start = false;
    }

    start() {  // 初始执行一次

    }

    update() {  // 每一帧执行一次(除了第一帧以外)

    }

    destroy() {  // 删除当前对象
        for (let i in AC_GAME_OBJECTS) {
            if (AC_GAME_OBJECTS[i] === this) {
                AC_GAME_OBJECTS.splice(i, 1);
                break;
            }
        }
    }
}


let last_timestamp;

let AC_GAME_OBJECTS_FRAME = (timestamp) => {
    for (let obj of AC_GAME_OBJECTS) {
        if (!obj.has_call_start) {
            obj.start();
            obj.has_call_start = true;
        } else {
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }
    last_timestamp  = timestamp;
    requestAnimationFrame(AC_GAME_OBJECTS_FRAME);
}

requestAnimationFrame(AC_GAME_OBJECTS_FRAME);

export {
    AcGameObject
}
```

#### 2.4 js/game_map/base.js文件

这是一个关键的js文件，因为游戏的运行不是直接在div盒子上运行的，是在canvas画布上运行的，所以，这个文件里面的GmaeMap类很关键.

首先，我们需要建立一个索引，这个索引指向的是上一个类里面的this，而在这个类里面我们要把它记录下来，代码如下：

```js
this.root = root(这里的root就是上一个类里传入的this);
```

这一点相当重要，这样的话就方便我们在类与类之间建立连接，在这个类里面，我们可以做到对players操作，只需要this.root.players就行了.

然后，它里面的构造函数创建了一个canvas，代码如下：

```js
this.$canvas = $(`<canvas width="1280" height="720" tabindex=0></canvas>`);
```

然后，取出我们要操作的canvas属性，代码如下：

```js
this.ctx = this.$canvas[0].getContext('2d');
```

然后，让div去append上这个canvas，代码如下：

```js
this.root.$kof.append(this.$canvas);
```

然后，让canvas聚焦，代码如下：

```js
this.$canvas.focus();
```

然后，new一个需要接受各种输入的controller对象，代码如下：

```js
this.controller = new Controller(this.$canvas);
```

最后，在已有的div上再装饰一些东西，比如血条和时间，代码如下：

```js
this.root.$kof.append($(
            `<div class="kof-head">
                <div class="kof-head-hp-0"><div><div></div></div></div>
                <div class="kof-head-timer">60</div>
                <div class="kof-head-hp-1"><div><div></div></div></div>
            </div>`
        ))
        this.time_left = 60000;
        this.$timer = this.root.$kof.find(".kof-head-timer");
```

整体代码如下：

```js
import {AcGameObject} from '/static/js/ac_game_object/base.js';
import { Controller } from '../controller/base.js';

export class GameMap extends AcGameObject {
    constructor(root) {
        super();
        this.root = root;

        this.$canvas = $(`<canvas width="1280" height="720" tabindex=0></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        this.root.$kof.append(this.$canvas);
        this.$canvas.focus();
        this.controller = new Controller(this.$canvas);
        this.root.$kof.append($(
            `<div class="kof-head">
                <div class="kof-head-hp-0"><div><div></div></div></div>
                <div class="kof-head-timer">60</div>
                <div class="kof-head-hp-1"><div><div></div></div></div>
            </div>`
        ))

        this.time_left = 60000;
        this.$timer = this.root.$kof.find(".kof-head-timer");

    }

    start() {

    }

    update() {
        this.time_left -= this.timedelta;
        if (this.time_left < 0) {
            this.time_left = 0;
            let [a, b] = this.root.players;
            if (a.status !== 6 && b.status !== 6) {
                a.status = b.status = 6;
                a.frame_current_cnt = b.frame_current_cnt = 0;
                a.vx = b.vx = 0;
            }
        }

        this.$timer.text(parseInt(this.time_left / 1000));

        this.render();
    }

    render() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        // this.ctx.fillStyle = 'black';
        // this.ctx.fillRect(0, 0, this.$canvas.width(), this.$canvas.height());
    }
}
```

#### 2.5 js/player/base.js文件

这个文件里的内容也是这个项目的主要部分，也就是角色的部分，里面定义了很多关于角色的属性，比如血量，为止，速度，等等，其实我更想说明的是下面两句代码：

```js
this.ctx = this.root.game_map.ctx;
this.pressed_keys = this.root.game_map.controller.pressed_keys;
```

这两句代码很关键，也是上个小节里面我所说到的，我们通过this.root定位到上个类里面的this，而上个类里面又有game_map属性，game_map里面又有我们需要操作的画布game_map.ctx，同时里面也有controller. 而controller又有pressed_keys属性，这样的话，我们就可以对角色进行各种操作了.

代码如下：

```js
import { AcGameObject } from "../ac_game_object/base.js";

export class Player extends AcGameObject {
    constructor(root, info) {  // 用root定位到KOF
        super();
        this.root = root;
        this.id = info.id;
        this.x = info.x;
        this.y = info.y;
        this.width = info.width;
        this.height = info.height;
        this.color = info.color;

        this.direction = 1;  // 方向
        this.vx = 0;
        this.vy = 0;

        this.speedx = 400; // 水平速度
        this.speedy = -1000; // 跳起初始速度

        this.gravity = 50;

        this.ctx = this.root.game_map.ctx;
        this.pressed_keys = this.root.game_map.controller.pressed_keys;

        // 角色状态 0: 静止, 1:向前, 2: 向后, 3: 跳跃, 4: 攻击, 5: 被打, 6: 死亡
        this.status = 3;  // 初始时是跳跃状态
        this.animations = new Map();
        this.frame_current_cnt = 0;  // 每过一帧记录一下
        this.frame_rate = 5;

        this.hp = 100;
        this.$hp = this.root.$kof.find(`.kof-head-hp-${this.id}>div`);
        // this.$hp1 = this.root.$kof.find(`.kof-head-hp-${this.id}>div>div`)
        this.$hp1 = this.$hp.find('div');
    }   

    start() {

    }



    update_move() {

        this.vy += this.gravity;


        this.x += this.vx * this.timedelta / 1000;
        this.y += this.vy * this.timedelta / 1000;
        if (this.y > 450) {
            this.y = 450
            this.vy = 0;
            if (this.status === 3) this.status = 0;
        }
        if (this.x < 0) {
            this.x = 0;
        } else if (this.x + this.width > this.root.game_map.$canvas.width()) {
            this.x = this.root.game_map.$canvas.width() - this.width;
        }
    }


    update_control() {
        let w, a, d, space;
        if (this.id === 0) {
            w = this.pressed_keys.has('w');
            a = this.pressed_keys.has('a');
            d = this.pressed_keys.has('d');
            space = this.pressed_keys.has(' ');
        } else {
            w = this.pressed_keys.has('ArrowUp');
            a = this.pressed_keys.has('ArrowLeft');
            d = this.pressed_keys.has('ArrowRight');
            space = this.pressed_keys.has('Enter');
        }
        if (this.status === 0 || this.status === 1) {
            if (space) {
                this.status = 4;
                this.vx = 0;
                this.frame_current_cnt = 0;
            } else if (w) {
                if (d) {
                    this.vx = this.speedx;
                } else if (a) {
                    this.vx = -this.speedx;
                } else {
                    this.vx = 0;
                }
                this.vy = this.speedy;
                this.status = 3;
                this.frame_current_cnt = 0;
            } else if (d) {
                this.vx = this.speedx;
                this.status = 1;
            } else if (a) {
                this.vx = -this.speedx;
                this.status = 1;
            } else {
                this.vx = 0; 
                this.status = 0;
            }
        }
    }

    update_direction() {
        if (this.direction === 6) return;

        let players = this.root.players;
        if (players[0] && players[1]) {
            let me = this, you = players[1 - this.id];
            if (me.x < you.x) me.direction = 1;
            else me.direction = -1;
        }
    }

    is_attack() {
        if (this.status === 6) return;
        this.status = 5;
        this.frame_current_cnt = 0;
        this.hp = Math.max(this.hp - 10, 0);
        // this.$hp.width(this.$hp.parent().width() * this.hp / 100);
        // 渐变效果
        this.$hp1.animate({
            width: this.$hp.parent().width() * this.hp / 100
        }, 500);
        this.$hp.animate({
            width: this.$hp.parent().width() * this.hp / 100
        }, 800);
        if (this.hp <= 0) {
            this.status = 6;
            this.frame_current_cnt = 0;
            this.vx = 0;
        }
    }


    is_collision(r1, r2) {
        if (Math.max(r1.x1, r2.x1) > Math.min(r1.x2, r2.x2))
            return false;
        if (Math.max(r1.y1, r2.y1) > Math.min(r1.y2, r2.y2))
            return false;
        return true;
    }

    update_attack() {
        if (this.status === 4 && this.frame_current_cnt === 18) {
            let me = this, you = this.root.players[1 - this.id];
            let r1;
            if (this.direction > 0) {
                r1 = {
                    x1: me.x + 120,
                    y1: me.y + 40,
                    x2: me.x + 120 + 100,
                    y2: me.y + 40 + 20,
                };
            } else {
                r1 = {
                    x1: me.x + me.width - 120 - 100,
                    y1: me.y + 40,
                    x2: me.x + me.width - 120 - 100 + 100,
                    y2: me.y + 40 + 20,
                };
            }

            let r2 = {
                x1: you.x,
                y1: you.y,
                x2: you.x + you.width,
                y2: you.y + you.height
            };

            if (this.is_collision(r1, r2)) {
                you.is_attack();
            }
        }
    }




    update() {
        this.update_control();
        this.update_move();
        this.update_direction();
        this.update_attack();

        this.render();
    }

    render() {
        // this.ctx.fillStyle = 'blue';
        // this.ctx.fillRect(this.x, this.y, this.width, this.height);

        // if (this.direction > 0) {
        //     this.ctx.fillStyle = 'red';
        //     this.ctx.fillRect(this.x + 120, this.y + 40, 100, 20);
        // } else {
        //     this.ctx.fillStyle = 'red';
        //     this.ctx.fillRect(this.x + this.width - 120 - 100, this.y + 40, 100, 20);
        // }

        let status = this.status;
        if (this.status === 1 && this.direction * this.vx < 0) status = 2;

        let obj = this.animations.get(status);
        if (obj && obj.loaded) {
            if (this.direction > 0) {
                let k = parseInt(this.frame_current_cnt / obj.frame_rate) % obj.frame_cnt;
                let image = obj.gif.frames[k].image;
                this.ctx.drawImage(image, this.x, this.y + obj.offset_y, image.width * obj.scale, image.height * obj.scale);
            } else {
                this.ctx.save(); 
                this.ctx.scale(-1, 1);
                this.ctx.translate(-this.root.game_map.$canvas.width(), 0);
                let k = parseInt(this.frame_current_cnt / obj.frame_rate) % obj.frame_cnt;
                let image = obj.gif.frames[k].image;
                this.ctx.drawImage(image, this.root.game_map.$canvas.width() - this.x - this.width, this.y + obj.offset_y, image.width * obj.scale, image.height * obj.scale);               
                this.ctx.restore();
            }

        }

        if (status === 4 || status == 5 || status === 6) {
            if (this.frame_current_cnt === obj.frame_rate * (obj.frame_cnt - 1)) {
                if (status === 6) {
                    this.frame_current_cnt--;
                } else {
                    this.status = 0;
                }
            }
        }
        this.frame_current_cnt++;
    }
}
```

#### 2.6 js/player/kyo.js文件

这些文件是某个具体角色的文件，它们需要继承Player，但是因为每个人都有自己各自的动画，所以，需要单独开个类，来展示独特的效果. kyo的代码如下：

```js
import { Player } from "./base.js";
import { GIF } from "../utils/gif.js";

export class Kyo extends Player {
    constructor (root, info) {
        super(root, info);
        this.init_animations();
    }
    init_animations() {
        let outer = this;
        let offsets = [0, -22, -22, -140, 0, 0, 0];
        for (let i = 0; i < 7; i++) {
            let gif = GIF();
            gif.load(`/static/images/player/kyo/${i}.gif`);
            this.animations.set(i, {
                gif: gif,
                frame_cnt: 0,  // 总图片数
                frame_rate: 5,  // 防止人物抖动过快
                offset_y: offsets[i],  // y方向偏移量
                loaded: false,  // 是否加载完整
                scale: 2,  // 放大多少倍
            });
            gif.onload = function() {
                let obj = outer.animations.get(i);
                obj.frame_cnt = gif.frames.length;
                obj.loaded = true;
                if (i === 3) {
                    obj.frame_rate = 4;
                } 
            }
        }
    }
}
```

#### 2.7 js/utils/gif.js文件

这个utils文件夹里面存的都是我们需要用到的辅助工具，比如如何在canvas上加上gif动图. 代码就在gif.js文件里面. 这里就不展示了.

#### 2.8 js/controller/base.js文件

这里面存的都是用户的案件输入，我们需要根据输入进行相应处理，代码如下：

```js
export class Controller {
    constructor($canvas) {
        this.$canvas = $canvas;
        // 因为会重复摁无数次, 所以Set来存储用户按的键
        this.pressed_keys = new Set();
        this.start();
    }

    start() {
        let outer = this;
        this.$canvas.keydown( (e) => {
            outer.pressed_keys.add(e.key);
            console.log(e.key);
        });

        this.$canvas.keyup( (e) => {
            outer.pressed_keys.delete(e.key);
        })
    }

}
```



## 心得：

![](https://pic1.zhimg.com/80/v2-05317a54d05efb07cb2c6787efc8cfbc_1440w.webp)

![](https://pic2.zhimg.com/80/v2-bc43cdd6d8dd229a985309a26c77811d_1440w.webp)

![](https://pic2.zhimg.com/80/v2-69bce4fc89d497539b149e6cd89aa891_1440w.webp)

![](https://pic3.zhimg.com/80/v2-c1718e8c0597ed0bcba8adfc9b6323da_1440w.webp)

![](https://pic3.zhimg.com/80/v2-40cf890c0c71cab9aaf15cd493b86cb2_1440w.webp)

![](https://pic2.zhimg.com/80/v2-aee465995b0859b8de409a7437480e6d_1440w.webp)

![](https://pic3.zhimg.com/80/v2-01cf61d91ecb28325ca35a812e6b3efa_1440w.webp)

![](https://pic4.zhimg.com/80/v2-3e36fc2941b4bdee44169ca5434ce93f_1440w.webp)

![](https://pic4.zhimg.com/80/v2-428406c38605811e19068c839e5b11df_1440w.webp)

![](https://pic1.zhimg.com/80/v2-0c2554d15c17cf6d150fa2c8f2606108_1440w.webp)

![](https://pic3.zhimg.com/80/v2-9c6a5cce57e8496e0ff73ded3bad4006_1440w.webp)

![](https://pic2.zhimg.com/80/v2-172d64c69d47b5f1a5e8eeb159fd75a5_1440w.webp)

![](https://pic1.zhimg.com/80/v2-fc8e2537485ada60a3c500b97dbdba90_1440w.webp)

![](https://pic4.zhimg.com/80/v2-dd7d475fa73666abc4b5f14571549487_1440w.webp)

![](https://pic2.zhimg.com/80/v2-09c2f46ea67c19d204c234f51908293d_1440w.webp)

![](https://pic4.zhimg.com/80/v2-b456604e811030d57c60c995440492a3_1440w.webp)

![](https://pic1.zhimg.com/80/v2-fad5ab53014d1441c84db739ca435d3c_1440w.webp)

![](https://pic4.zhimg.com/80/v2-bfc7382b2593017080618cf463118b5f_1440w.webp)

