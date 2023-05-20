import { AcGameObject } from "../ac_game_object/base.js";

class Player extends AcGameObject {
    constructor(root, info) {
        super();
        this.root = root;
        this.id = info.id;//用以区分两名的角色
        this.x = info.x;
        this.y = info.y;
        this.width = info.width;
        this.height = info.height;
        this.color = info.color;
        this.direction = 1;//角色朝向右1左-1
        this.status = 3;//0：空闲状态，1：向前，2：向后，3：跳跃，4：攻击，5：被打，6：die
        //状态机：0=>1,2,3循环
        //1,2=>0,3循环
        //3=>0不循环  
        this.animation = new Map();
        this.pressed_keys = this.root.game_map.Controller.pressed_keys;
        this.has
        this.vx = 0;
        this.vy = 0;
        this.gravity = 18;
        this.speedx = 400;//初始水平速度
        this.speedy = 1000;//初始跳跃速度
        this.ctx = this.root.game_map.ctx;
        this.frame_current_cnt = 0;//记录帧数
        this.hp = 100;
        this.$hp = this.root.$kof.find(`.kof-head>.kof-head-hp-${this.id}>div`);
        this.$hp_div = this.root.$kof.find(`.kof-head>.kof-head-hp-${this.id}>div>div`);

    }
    start() {

    }
    update() {
        this.control();
        this.move();
        this.update_direction();
        this.update_attack();
        this.render();
    }
    is_collision(r1, r2) {
        if (Math.max(r1.x1, r2.x1) > Math.min(r1.x2, r2.x2)) {
            return false;
        }
        if (Math.max(r1.y1, r2.y1) > Math.min(r1.y2, r2.y2)) {
            return false;
        }
        return true;
    }
    update_attack() {
        if (this.status === 4 && this.frame_current_cnt === 31) {
            let me = this, you = this.root.players[1 - this.id];
            let r1;
            if (this.direction > 0) {
                r1 = {
                    x1: me.x + 120,
                    y1: me.y + 40,
                    x2: me.x + 120 + 100,
                    y2: me.y + 40 + 20,
                }
            } else {
                r1 = {
                    x1: me.x - 100,
                    y1: me.y + 40,
                    x2: me.x - 100 + 100,
                    y2: me.y + 40 + 20
                }
            };
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
    is_attack() {
        if (this.status === 6) return;
        this.status = 5;
        this.frame_current_cnt = 0;
        if (this.id === 1) {
            this.hp -= 20;
        } else {
            this.hp -= 15;
        }

        this.hp = Math.max(this.hp, 0);
        if (this.hp === 0) {
            this.status = 6;
            this.frame_current_cnt = 0;
            this.vx = 0;
        }
        this.$hp.animate({
            width: this.$hp.parent().width() * this.hp / 100
        }, 500)//实现血量渐变效果
        // width(this.$hp.parent().width() * this.hp / 100);
        this.$hp_div.animate({
            width: this.$hp.parent().width() * this.hp / 100
        }, 300)
    }

    update_direction() {
        if (this.status === 6) return;
        let players = this.root.players;
        if (players[0] && players[1]) {
            let me = this, you = players[1 - this.id];
            if (me.x < you.x) {
                me.direction = 1;
            } else {
                me.direction = -1;
            }
        }
    }
    move() {
        this.vy += this.gravity;
        this.x += this.vx * this.timedelta / 1000;
        this.y += this.vy * this.timedelta / 1000;
        if (this.y > 450) {
            this.y = 450;
            this.vy = 0;
            if (this.status === 3) this.status = 0;
        }
        if (this.x < 0) {
            this.x = 0;
        }
        if (this.x + this.width > this.root.game_map.$canvas.width()) {
            this.x = this.root.game_map.$canvas.width() - this.width;
        }
    };
    control() {
        let w, a, d, space;
        let run = false;
        if (this.id === 0) {
            w = this.pressed_keys.has('w')
            a = this.pressed_keys.has('a')
            d = this.pressed_keys.has('d')
            space = this.pressed_keys.has(' ')
            run = this.root.game_map.Controller.run1;
        } else {
            w = this.pressed_keys.has('ArrowUp')
            a = this.pressed_keys.has('ArrowLeft')
            d = this.pressed_keys.has('ArrowRight')
            space = this.pressed_keys.has('Enter')
            run = this.root.game_map.Controller.run2;
        }


        if (this.status === 0 || this.status === 1 || this.status === 2) {
            if (space) {
                this.status = 4;
                this.vx = 0;
                this.frame_current_cnt = 0//保证攻击动画从第一帧开始播放
            } else if (w) {

                if (d) {
                    this.vx = this.speedx;
                } else if (a) {
                    this.vx = -this.speedx;
                } else {
                    this.vx = 0;
                }
                this.vy = -this.speedy;
                this.status = 3;
                this.frame_current_cnt = 0;
            } else if (d) {
                this.vx = this.speedx;
                this.status = 1;
                if (run) {
                    this.vx = this.speedx * 1.5;
                }

            } else if (a) {
                this.vx = -this.speedx;
                this.status = 2;
                if (run) {
                    this.vx = -this.speedx * 1.5;
                }
            } else {
                this.vx = 0;
                this.status = 0;
            }
        }
    }
    render() {//渲染角色
        // this.ctx.fillStyle = this.color;
        // this.ctx.fillRect(this.x, this.y, this.width, this.height);
        // // if (this.direction === 1) {
        // //     // this.ctx.fillStyle = "black";
        // //     // this.ctx.fillRect(this.x + 120, this.y + 40, 100, 20);
        // // } else {
        // //     // this.ctx.fillStyle = "black";
        // //     // this.ctx.fillRect(this.x - 100, this.y + 40, 100, 20);
        // // }

        // // console.log()
        let status = this.status;
        if (status === 1 && this.direction * this.vx < 0) status = 2;
        else if (status === 2 && this.direction * this.vx > 0) status = 1;
        let obj = this.animation.get(status);

        if (obj && obj.loaded) {
            if (this.direction === 1) {
                let k = parseInt(this.frame_current_cnt / obj.frame_rate) % obj.frame_cnt;
                // console.log(k)
                let image = obj.gif.frames[k].image;//找到gif中对应帧的图片
                let y = obj.offset_y
                this.ctx.drawImage(image, this.x, this.y + y, image.width * obj.scale, image.height * obj.scale);
                // this.ctx.drawImage(image, this.root.game_map.$canvas.width() - this.x - this.width, this.y + obj.offset_y, image.width * obj.scale, image.height * obj.scale);
            } else {
                this.ctx.save();
                this.ctx.translate(this.root.game_map.$canvas.width(), 0);
                this.ctx.scale(-1, 1);
                let k = parseInt(this.frame_current_cnt / obj.frame_rate) % obj.frame_cnt;
                let image = obj.gif.frames[k].image;//找到gif中对应帧的图片
                let y = obj.offset_y
                this.ctx.drawImage(image, this.root.game_map.$canvas.width() - this.width - this.x, this.y + y, image.width * obj.scale, image.height * obj.scale);
                // this.ctx.drawImage(image, this.root.game_map.$canvas.width() - this.x - this.width, this.y + obj.offset_y, image.width * obj.scale, image.height * obj.scale);
                this.ctx.restore();//将设置变回来，即将坐标系翻转回来
            }

        }
        if (status === 5 || status === 4 || this.status === 6) {
            if (parseInt(this.frame_current_cnt / obj.frame_rate) === obj.frame_cnt - 1) {//在framme_current_cnt-1到最后的几帧应该是播放静止状态的动画而不是应该播放攻击的第零帧动画
                if (status === 6) {
                    this.frame_current_cnt--;
                } else {
                    this.status = 0;
                }
            }
        }
        this.frame_current_cnt++;
        // console.log(this.frame_current_cnt)
        // console.log(this.vy)
    }
}
export { Player }