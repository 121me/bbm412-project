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

    set health(newHealth){this._health = newHealth;}


}

export {Cell};
