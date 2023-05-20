import { AcGameObject } from '/static/js/ac_game_object/base.js';
import { Controller } from '../controller/base.js';

export class GameMap extends AcGameObject {
    constructor(root) {//这里传入的root即为地图所在的区域，在此处指定义的div
        super();
        this.root = root;
        this.$canvas = $('<canvas width="1280" height="720" tabindex=0></canvas>');
        this.ctx = this.$canvas[0].getContext('2d');
        this.root.$kof.append(this.$canvas);
        this.$canvas.focus();
        this.Controller = new Controller(this.$canvas);
        this.root.$kof.append($(`<div class="kof-head">
        <div class="kof-head-hp-0"><div><div></div></div></div>
        <div class="kof-head-timer">60</div>
        <div class="kof-head-hp-1"><div><div></div></div></div>
    </div>`));
        this.time_left = 60000;//ms
        this.$timer = this.root.$kof.find(`.kof-head-timer`);
    }
    start() {

    }
    update() {
        this.time_left -= this.timedelta;
        if (this.time_left <= 0) {
            this.time_left = 0;
            let [a, b] = this.root.players;
            if (a.status !== 6 && b.status !== 6) {
                a.status = b.status = 6;
                a.frame_current_cnt = 0;
                b.frame_current_cnt = 0;
                a.vx = b.vx = 0;
            }
        }
        this.$timer.text(parseInt(this.time_left / 1000));
        this.render();
    }//地图每一帧都要清空，否则画面会存留运动轨迹
    render() {//渲染地图
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);//先清空
        // this.ctx.fillStyle = "black";
        // this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    }
}
