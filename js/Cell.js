class Cell{

    constructor(id, x, y, flag, health) {
        this._id = id;
        this._x = x;
        this._y = y;
        this.flag = flag;
        this._health = health;
    }

    get id(){return this._id;}
    get x(){return this._x;}
    get y(){return this._y;}
    get health(){return this._health}


}

export {Cell};

//
// export function CreateMatrix() {
//
//     let rows = 5;
//     let columns = 5;
//
//     let activities = [];
//     for (let i = 0; i < rows; i++) {
//
//         //console.log("i = " + i)
//         for (let j = 0; j < columns; j++) {
//             activities.push(Math.random());
//             //console.log("i = " + i + "j = " + j);
//             //console.log('[' + i + ',' + j + ']');
//         }
//     }
//
//     console.table(activities);
// }