import { Player } from "./base.js";
import { GIF } from "../utils/gif.js";
export class Kyo extends Player {
    constructor(root, info) {
        super(root, info);
        this.init_animation();
    }
    init_animation() {
        let outer = this;
        let offsets = [0, -22, -22, -140, 0, 0, 0];
        for (let i = 0; i < 7; i++) {
            let gif = GIF();
            gif.load(`/static/images/player/kyo/${i}.gif`);
            this.animation.set(i, {
                gif: gif,
                offset_y: offsets[i],
                frame_cnt: 0,  // 总图片数
                frame_rate: 10,  // 每10帧过度一次
                loaded: false,  // 是否加载完整
                scale: 2,  // 放大多少倍
            });
            gif.onload = function () {
                let obj = outer.animation.get(i);
                obj.frame_cnt = gif.frames.length;
                obj.loaded = true;
                if (i === 3) {
                    obj.frame_rate = 11;
                }
            }
        }
    }
}