// document.getElementById("draw-canvas").style.width = (fieldDim.x*fieldScale) + "px"
// document.getElementById("draw-canvas").style.height = (fieldDim.y*fieldScale) + "px"
document.getElementById("time-selector").style.width = (fieldDim.x*fieldScale) + "px"

function clipNumber (num, dec) {
    return Math.floor(num*Math.pow(10, dec))/Math.pow(10, dec);
}
var Node = function(x, y, t) {
    this.x = x;
    this.y = y;
    this.time = t;
}
Node.prototype.setPosition = function(x, y) {
    this.x = x;
    this.y = y;
}
Node.prototype.setTime = function(t) {this. time = t;}
Node.prototype.getPosition = function() {return {x:this.x, y:this.y}}
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
        this.drops[i].x = this.raw_drops[i].x*xsc;
        this.drops[i].y = this.raw_drops[i].y*ysc;
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
        this.path[i].x = this.raw_path[i].x*xsc;
        this.path[i].y = this.raw_path[i].y*ysc;
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
                json.parse(rCSV[i+1]),
                json.parse(rCSV[i+2]),
                json.parse(rCSV[i])
            )
        )
    }
    for(var i in this.raw_path) {
        this.path[i] = this.raw_path[i].copy();//because js is mean
    }
    return this;
}

var PopUpWindow = function(txt, on) {
    this.on = on;
    this.txt = txt;
    this.maxWidth = 50;
}
PopUpWindow.prototype.show = function() {
    this.on = true;
}
PopUpWindow.prototype.hide = function() {
    this.on = false;
}
PopUpWindow.prototype.setText = function(t) {
    this.txt = t;
}
var mouseText = new PopUpWindow("testing", true);
var drawField = function(processingInstance) {
    with(processingInstance) {
        const field_image = loadImage('robotics_field_cropped.jpeg')
        //loadImage('https://www.chiefdelphi.com/uploads/default/original/3X/5/a/5af55bb7b88f0aad40799c8a4aadf820fb7fa7b4.jpeg')
        PopUpWindow.prototype.draw = function(x, y) {
            if(!this.on) { return }
            let w = 10+Math.min(textWidth(this.txt), this.maxWidth);
            let h = 40;//12*3 = 36
            x-=w;
            y-=h;
            x = constrain(x, 0, width-w);
            y = constrain(y, 0, height-h);
            noStroke();
            textSize(12);
            fill(255);
            rect(x, y, w, h);
            fill(0);
            text(this.txt, x+w/2, y+h/2);
        }
        smooth();
        var colors = [color(255, 0, 0), color(0, 255, 0), color(0, 0, 255)];
        var pathThickness = 2;
        var dropSize = 10;
        var paths = [];
        var pathDrops = [];//DropColletion[]
        var pathsLoaded = false;
        const pi = 3.1415926535;
        size(fieldDim.x*fieldScale, fieldDim.y*fieldScale);
        var mouseIsPressed = false
        mousePressed = function() {
            mouseIsPressed = true
        }
        mouseReleased = function() {
            mouseIsPressed = false
        }
        textAlign(3, 3)
        textSize(20)
        var getRelevance = function(t1, t2) {
            var x = (t1-t2)/1000;
            return Math.pow(1.01, -x*x)*255
        }
        var drawArrow = function(x, y, s, r) {
            r+=pi/2;
            var p1 = [x+Math.cos(r+pi/4)*s, y+Math.sin(r+pi/4)*s];
            var p2 = [x+Math.cos(r+pi*3/4)*s, y+Math.sin(r+pi*3/4)*s];
            // line(x, y, p1[0], p1[1])
            // line(x, y, p2[0], p2[1])
            triangle(x, y, p1[0], p1[1], p2[0], p2[1])
        }
        var drawPath = function(ath, col) {
            var fog = !fogToggle.checked;
            var path = ath.path;//smort
            var rawPath = ath.raw_path;//even smorter
            let x, y;
            let displayMessage = -1;
            if(!fog) {
                stroke(col);
            }
            for(let i = 0; i<path.length; i++) {
                let nx = path[i].x;
                let ny = path[i].y;
                if(fog&&i>0) {
                    stroke(col, getRelevance(path[i].time, time));
                }
                if(dist(mouseX, mouseY, nx, ny)<10) {
                    displayMessage = i;
                }
                if(i>0) {
                    line(x, y, nx, ny);
                }
                x = nx;
                y = ny;
            }
            if(!fog) {
                fill(col);
            }
            noStroke();
            if(!fog) {
                fill(col);
            }
            for(let i = 0; i<path.length; i++) {
                if(fog) {
                    fill(col, getRelevance(path[i].time, time));
                }
                x = path[i].x;
                y = path[i].y;
                if(Math.abs(time-path[i].time)<1100) {
                    if(i<path.length-1&&time>path[i].time&&time<path[i+1].time) {
                        let tt = (time-path[i].time)/(path[i+1].time-path[i].time);//interpolating value
                        ellipse(
                            path[i].x+(path[i+1].x-path[i].x)*tt,
                            path[i].y+(path[i+1].y-path[i].y)*tt,
                            pathThickness*5, pathThickness*5)
                    }
                }
                //no longer conditional
                {
                    if(!nubsToggle.checked) {
                        continue;
                    }
                    if(i<path.length-1&&i>0) {
                        let bx = path[i-1].x;
                        let by = path[i-1].y;
                        let nx = path[i+1].x;
                        let ny = path[i+1].y;
                        if(Math.min(dist(bx, by, x, y), dist(x, y, nx, ny))>25) {
                            var a1 = atan2(y-by, x-bx)
                            var a2 = atan2(ny-y, nx-x)
                            if(Math.abs(a1-a2)<pi/3) {
                                drawArrow(x, y, pathThickness*4, (a1+a2)/2)
                                continue;
                            }
                        }
                    }
                    ellipse(x, y, pathThickness*3, pathThickness*3)
                }
            }
            if(displayMessage>=0) {
                mouseText.show();
                mouseText.setText(`${
                    clipNumber(rawPath[displayMessage].x, 2)
                }\n${
                    clipNumber(rawPath[displayMessage].y, 2)
                }\n${
                    clipNumber(rawPath[displayMessage].time, 0)
                }`)
            } else {
                mouseText.hide();
            }
        }
        var drawDropCollection = function(dc, col) {
            let drops = dc.drops;
            let rawdrops = dc.raw_drops;
            fill(col);
            noStroke();
            let moused = -1;
            for(let i in drops) {
                if(Math.abs(time-drops[i].time)<500) {
                    let ds = dropSize*2;
                    rect(drops[i].x-ds/2, drops[i].y-ds/2, ds, ds, -ds)
                } else {
                    rect(drops[i].x-dropSize/2, drops[i].y-dropSize/2, dropSize, dropSize, -dropSize)
                }
            }
        }
        draw = function() {
            if(loaded) {
                //background(100)
                image(field_image, 0, 0, width, height)
                fill(100, 200);
                rect(0, 0, width, height)
                time = 1000*(+time_set.value/timeScale);
                if(!pathsLoaded) {
                    console.log(`${countCSVs} CSVs loaded`)
                    for(var i in raw_csv) {
                        paths.push(//what am I doing :p
                            (new Path()).getPathFromCSV(raw_csv[i])
                        );
                        paths[i].rescale(fieldScale, fieldScale);
                        pathDrops.push(
                            (new DropCollection()).getDropsFromCSV(raw_csv[i])
                        );
                        pathDrops[i].rescale(fieldScale, fieldScale);
                    }
                    pathsLoaded = true;
                } else {
                    strokeWeight(pathThickness)
                    for(var i in paths) {
                        drawPath(paths[i], colors[i])
                    }
                    if(dropsToggle.checked) {
                        for(let i in pathDrops) {
                            drawDropCollection(pathDrops[i], colors[i])
                        }
                    }
                }
                mouseText.draw(mouseX, mouseY);
            } else {
                background(255, 0, 0);
                fill(255);
                text("Upload a file first", width/2, height/2)
            }
        }
    }
}
var ProcessingInstance = new Processing(document.getElementById("draw-canvas"), drawField)