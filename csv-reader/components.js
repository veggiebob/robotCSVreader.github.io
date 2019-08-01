function clipNumber (num, dec) {
    return Math.floor(num*Math.pow(10, dec))/Math.pow(10, dec);
}
var Mix = function(a, b, c) {
    return a+(b-a)*c;
};
var safeInterpolate = function(a1, a2, t) {
    if(Math.abs(a1-a2)>pi) {
        a1+=pi*2;
    }
    return Mix(a1, a2, t);
};

var Node = function(x, y, t) {
    this.x = x;
    this.y = y;
    this.time = t;
}
Node.prototype.setPosition = function(x, y) {
    this.x = x;
    this.y = y;
}
Node.prototype.setTime = function(t) { this.time = t; }
Node.prototype.getPosition = function() {return {x:this.x, y:this.y}}
Node.prototype.getTime = function() { return this.time }
Node.prototype.copy = function() { return new Node(this.x, this.y, this.time) }

var DropCollection = function(d) {
    this.raw_drops = d;
    this.drops = [];
    if(d===undefined) {
        this.raw_drops = [];
        this.drops = [];
    }
};
DropCollection.prototype.getDropsFromCSV = function(rCSV) {
    //info until column 5
    //points start on column 6, end on column 486
    //comments until 523
    //524 drops start, until 583
    for(var i = 524; i<=583; i+=3) {
        this.raw_drops.push(new Node(
            rCSV[i+1],//x
            rCSV[i+2],//y
            rCSV[i]//time
        ))
    }
    for(let i in this.raw_drops) {
        this.drops[i] = this.raw_drops[i].copy();//because js is mean
    }
    return this;
};
DropCollection.prototype.rescale = function(xsc, ysc) {
    for(let i in this.raw_drops) {
        this.drops[i].x = this.drops[i].x*xsc;
        this.drops[i].y = this.drops[i].y*ysc;
    }
}
DropCollection.prototype.flipY = function() {
    for(let i in this.raw_drops) {
        this.drops[i].y = fieldDim.y-this.raw_drops[i].y;
    }
}

var Path = function(p) {
    this.raw_path = p;
    this.path = p;
    if(p===undefined) {
        this.raw_path = [];
        this.path = [];
    }
};
Path.prototype.autoRescale = function(dimX, dimY) {//not used atm
    var minX = Infinity;
    var maxX = -Infinity;
    var minY = Infinity;
    var maxY = -Infinity;
    for(let i in this.raw_path) {
        minX = Math.min(minX, this.raw_path[i].x)
        maxX = Math.max(maxX, this.raw_path[i].x)
        minY = Math.min(minY, this.raw_path[i].y)
        maxY = Math.max(maxY, this.raw_path[i].y)
    }
    console.log(`minX: ${minX}, maxX: ${maxX}, minY: ${minY}, maxY: ${maxY}`)
    for(let i in this.raw_path) {
        this.path[i].x = (this.raw_path[i].x-minX)/(maxX-minX)*dimX;
        this.path[i].y = (this.raw_path[i].y-minY)/(maxY-minY)*dimY;
    }
}
Path.prototype.rescale = function(xsc, ysc) {
    for(let i in this.raw_path) {
        this.path[i].x = this.path[i].x*xsc;
        this.path[i].y = this.path[i].y*ysc;
    }
}
Path.prototype.flipY = function() {
    for(var i = 0; i<this.raw_path.length; i++) {
        this.path[i].y = fieldDim.y - this.raw_path[i].y;
    }
}
Path.prototype.getPathFromCSV = function(rCSV) {
    //fill this.path with Node
    //info until column 5
    //points start on column 6, end on column 486
    //comments until 523
    //524 drops start, until 583
    for(var i = 6; i<486; i+=3) {
        this.raw_path.push(
            new Node(
                json.parse(rCSV[i+1]),//x
                json.parse(rCSV[i+2]),//y
                json.parse(rCSV[i])//time
            )
        )
    }
    for(var i in this.raw_path) {
        this.path[i] = this.raw_path[i].copy();
    }
    return this;
};

var Info = function(num, scn, mn, gr, com, col) {
    this.team = num;//
    this.scoutName = scn;//
    this.matchNumber = mn;//
    this.groupNumber = gr;//
    this.comments = com;//
    this.color = col;//
    this.colorString = "";
    this.header = this.team + " M"+this.matchNumber + "G" + this.groupNumber;
}
Info.prototype.stringToColor = function(str) {
    return this.color.toLowerCase()==="red"?"red":
        this.color.toLowerCase()==="blue"?"blue":
        "black"
}
Info.prototype.getInfoFromCSV = function(rCSV) {
    //fill this.path with Node
    //info until column 5
    //points start on column 6, end on column 486
    //comments until 523
    //524 drops start, until 583
    return new Info(
        +rCSV[0],
        rCSV[2],
        +rCSV[1],
        +rCSV[3].slice(rCSV[3].indexOf(" ")).trim(),//process
        rCSV[522],
        rCSV[4]
    )
}
Info.prototype.getInfoAsHTML = function() {
    return `Team ${this.team}<br>Match ${this.matchNumber}<br>Group ${this.groupNumber}<br>`+
        `<span class="special-text" style="color:${this.stringToColor(this.color)};">`+
        `${this.color} team</span><br>Scout ${this.scoutName}<br>Comments: ${this.comments}`
}

var HeatField = function() {

}

var Robot = function(p, dc, ifn, col) {//Path, DropCollection, Info, Color color
    this.path = p;//Path
    this.dc = dc;//DropCollection
    this.info = ifn;//Info
    this.color = col;
    this.stats = {
        time:-1,
        x: 0,
        y: 0,
        rotation: 0//in degrees
    }
}
Robot.prototype.getStats = function(t) {
    if(t===this.stats.time) { return }
    this.stats.time = t;
    let path = this.path.path;
    for(let i = 0; i<path.length-1; i++) {
        if(t>=path[i].time&&t<path[i+1].time) {
            let tt = (t-path[i].time)/(path[i+1].time-path[i].time);//interpolating value
            this.stats.x = path[i].x+(path[i+1].x-path[i].x)*tt;
            this.stats.y = path[i].y+(path[i+1].y-path[i].y)*tt;
            let x = path[i].x;
            let y = path[i].y;
            let bx = x, by = y;
            if(i>0) {
                bx = path[i-1].x;
                by = path[i-1].y;
            }
            let bbx = bx, bby = by;
            if(i>1) {
                bbx = path[i-2].x;
                bby = path[i-2].y;
            }
            let nx = x, ny = y;
            if(i<path.length-1) {
                nx = path[i+1].x;
                ny = path[i+1].y;
            }
            let nnx = nx, nny = ny;
            if(i<path.length-2) {
                nnx = path[i+2].x;
                nny = path[i+2].y;
            }
            let a1 = safeInterpolate(Math.atan2(y-by, x-bx), Math.atan2(ny-y, nx-x), 0.5)
            let a2 = safeInterpolate(Math.atan2(nny-ny, nnx-nx), Math.atan2(ny-y, nx-x), 0.5)
            this.stats.rotation = safeInterpolate(a1, a2, tt);
        }
    }
}
