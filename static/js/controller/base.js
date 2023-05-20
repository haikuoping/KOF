export class Controller {
    constructor($canvas) {
        this.$canvas = $canvas;

        this.pressed_keys = new Set();
        this.run1 = false;
        this.run2 = false;
        this.has_pressed_keys = new Map();
        this.start();
    }

    start() {
        let outer = this;
        this.$canvas.keydown((e) => {
            outer.pressed_keys.add(e.key);//这个函数里面的this不是外面的类的this所以要用一个outer保存，这里的this是参数
            let time = new Date().getTime();
            if (outer.has_pressed_keys.size) {
                if (outer.has_pressed_keys.has('a')) {
                    if (time - outer.has_pressed_keys.get('a') < 140) {
                        outer.run1 = true;
                    }
                } else if (outer.has_pressed_keys.has('d')) {
                    console.log(time - outer.has_pressed_keys.get('d'))
                    if (time - outer.has_pressed_keys.get('d') < 140) {
                        outer.run1 = true;
                    }
                } else if (outer.has_pressed_keys.has('ArrowRight')) {
                    if (time - outer.has_pressed_keys.get('ArrowRight') < 140) {
                        outer.run2 = true;
                    }
                } else if (outer.has_pressed_keys.has('ArrowLeft')) {
                    if (time - outer.has_pressed_keys.get('ArrowLeft') < 140) {
                        outer.run2 = true;
                    }
                }
                outer.has_pressed_keys.clear();
                // outer.has_pressed_keys.set(e.key, time);
            }
        });
        this.$canvas.keyup((e) => {
            outer.pressed_keys.delete(e.key);
            outer.has_pressed_keys.delete(e.key)
            let time = new Date().getTime();
            if ((e.key === 'a' || e.key === 'd') && !outer.run1) {
                outer.has_pressed_keys.set(e.key, time);
            } else if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !outer.run2) {
                outer.has_pressed_keys.set(e.key, time);
            }

            outer.run1 = false;
            outer.run2 = false;
        })
    }
}