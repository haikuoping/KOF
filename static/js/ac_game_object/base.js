let AC_GAME_OBJECTS = [];//所有每帧都会变化的对象都会被放进这个数组
class AcGameObject {//所有每帧有变化的对象皆继承在这里
    constructor() {
        AC_GAME_OBJECTS.push(this);
        this.timedelta = 0;//用来存储相邻两帧的时间间隔
        this.has_call_start = false;//用来表示当前对象是否被执行过
    }
    start() {
        //初始执行，用来进行初始化

    }
    update() {
        //每帧都会执行，用来更新（除了第一帧）

    }
    // destroy() {//用来删除当前对象
    //     for (let i in AC_GAME_OBJECTS) {
    //         if (AC_GAME_OBJECTS[i] === this) {
    //             AC_GAME_OBJECTS.splice(i, 1);
    //             break;
    //         }
    //     }
    // }
}
let last_timestamp;//为了计算时间间隔，记录上一帧的执行时间
let AC_GAME_OBJECTS_FRAME = (timestamp/* 表示当前函数的执行时刻*/) => {
    for (let obj of AC_GAME_OBJECTS) {
        if (!obj.has_call_start) {
            obj.start();
            obj.has_call_start = true;
        } else {
            obj.timedelta = timestamp - last_timestamp;

            obj.update();
        }
    }
    last_timestamp = timestamp;
    requestAnimationFrame(AC_GAME_OBJECTS_FRAME);
}
requestAnimationFrame(AC_GAME_OBJECTS_FRAME);

export { AcGameObject }