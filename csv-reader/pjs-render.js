var PopUpWindow = function(txt, on) {
    this.on = on;
    this.txt = txt;
    this.maxWidth = 50;
    this.backColor = 0xFFFFFFFF;
}
PopUpWindow.prototype.setColor = function(c) {
    this.backColor = c;
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
        enableContextMenu()//doesn't work :(
        const field_image = loadImage('robotics_field_cropped.jpeg')
        const robot_image = loadImage('top_robot_transparent_.png')
        //loadImage('https://www.chiefdelphi.com/uploads/default/original/3X/5/a/5af55bb7b88f0aad40799c8a4aadf820fb7fa7b4.jpeg')
        PopUpWindow.prototype.draw = function(x, y) {
            if(!this.on) { return }
            let w = 10+Math.min(textWidth(this.txt), this.maxWidth);
            let h = 53;//12*4 = 48
            x-=w;
            y-=h;
            x = constrain(x, 0, width-w);
            y = constrain(y, 0, height-h);
            noStroke();
            textSize(12);
            fill(this.backColor);
            rect(x, y, w, h);
            fill(0);
            text(this.txt, x+w/2, y+h/2);
        }
        smooth();
        var colors = [
            color(255, 0, 0),
            color(0, 255, 0),
            color(0, 0, 255),
            color(255, 255, 0),
            color(0, 255, 255),
            color(255, 0, 255),
            color(255, 100, 0),
            color(0, 100, 255)
        ]//colors for paths/robots
        var color_wash_amount = 0.5;
        var pathThickness = 2;
        var dropSize = 10;
        var robotSize = 50;
        var pvv = 0;//path visibility value
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
        //from https://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately
        var HSBtoRGB = function (hsb) {

            var rgb = { };
            var h = Math.round(hsb.h);
            var s = Math.round(hsb.s * 255 / 100);
            var v = Math.round(hsb.b * 255 / 100);
        
                if (s == 0) {
        
                rgb.r = rgb.g = rgb.b = v;
                } else {
                var t1 = v;
                var t2 = (255 - s) * v / 255;
                var t3 = (t1 - t2) * (h % 60) / 60;
        
                    if (h == 360) h = 0;
        
                        if (h < 60) { rgb.r = t1; rgb.b = t2; rgb.g = t2 + t3 }
                        else if (h < 120) { rgb.g = t1; rgb.b = t2; rgb.r = t1 - t3 }
                        else if (h < 180) { rgb.g = t1; rgb.r = t2; rgb.b = t2 + t3 }
                        else if (h < 240) { rgb.b = t1; rgb.r = t2; rgb.g = t1 - t3 }
                        else if (h < 300) { rgb.b = t1; rgb.g = t2; rgb.r = t2 + t3 }
                        else if (h < 360) { rgb.r = t1; rgb.g = t2; rgb.b = t1 - t3 }
                        else { rgb.r = 0; rgb.g = 0; rgb.b = 0 }
                }
        
            return color(Math.round(rgb.r), Math.round(rgb.g), Math.round(rgb.b) )
        }
        var getColor = function(i) {
            if(i>=colors.length) {
                return HSBtoRGB({h:(i*30)%255, s:255, b:255});
            } else {
                return colors[i];
            }
        }
        var washColor = function(c) {
            return color(
                255*color_wash_amount + red(c)*(1-color_wash_amount),
                255*color_wash_amount + green(c)*(1-color_wash_amount),
                255*color_wash_amount + blue(c)*(1-color_wash_amount),
            )
        }
        var colorToHTML = function(c) {
            return `rgb(${red(c)},${green(c)},${blue(c)})`
        }
        var getRelevance = function(t1, t2) {
            var x = (t1-t2)/1000;
            return Math.pow(1.06, -x*x)*255
        }
        var drawArrow = function(x, y, s, r) {
            r+=pi/2;
            var p1 = [x+Math.cos(r+pi/4)*s, y+Math.sin(r+pi/4)*s];
            var p2 = [x+Math.cos(r+pi*3/4)*s, y+Math.sin(r+pi*3/4)*s];
            triangle(x, y, p1[0], p1[1], p2[0], p2[1])
        }
        var drawPath = function(rob) {
            var col = rob.color;
            var path = rob.path.path;//smort
            var rawPath = rob.path.raw_path;//even smorter
            let x, y;
            let displayMessage = -1;
            if(pvv>0) {
                stroke(col);
                for(let i = 0; i<path.length; i++) {
                    let nx = path[i].x;
                    let ny = path[i].y;
                    if(pvv===1&&i>0) {
                        stroke(col, getRelevance(path[i].time, time));
                    }
                    if(i>0) {
                        line(x, y, nx, ny);
                    }
                    x = nx;
                    y = ny;
                }
            }
            noStroke();
            if(pvv>0&&nubsToggle.checked) {
                fill(col);
                for(let i = 0; i<path.length; i++) {
                    var rel
                    if(pvv===1) {
                        rel = constrain(getRelevance(path[i].time, time), 0, 255)
                        fill(col, rel);
                    }
                    x = path[i].x;
                    y = path[i].y;
                    if(dist(mouseX, mouseY, x, y)<10&&!(pvv==1&&rel<30)) {
                        displayMessage = i;
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
            fill(col)
            for(let j in path) {
                let i = +j
                if(Math.abs(time-path[i].time)<1100) {
                    if(i<path.length-1&&time>path[i].time&&time<path[i+1].time) {
                        let tt = (time-path[i].time)/(path[i+1].time-path[i].time);//interpolating value
                        ellipse(
                            path[i].x+(path[i+1].x-path[i].x)*tt,
                            path[i].y+(path[i+1].y-path[i].y)*tt,
                            pathThickness*5, pathThickness*5)
                    }
                }
            }
            if(displayMessage>=0) {
                mouseText.show();
                mouseText.setText(
                    "-Path-\n"+
                    "x: " + clipNumber(rawPath[displayMessage].x, 2)+"\n"+
                    "y: " + clipNumber(rawPath[displayMessage].y, 2)+"\n"+
                    "t: " + clipNumber(rawPath[displayMessage].time, 0)
                );
                mouseText.setColor(washColor(col))
            }
        }
        var drawDropCollection = function(rob) {
            let col = rob.color;
            let drops = rob.dc.drops;
            let rawdrops = rob.dc.raw_drops;
            fill(col);
            noStroke();
            let moused = -1;
            for(let i in drops) {
                if(rawdrops[i].x<0||rawdrops[i].y<0) { continue; }
                if(Math.abs(time-drops[i].time)<500) {
                    let ds = dropSize*2;
                    rect(drops[i].x-ds/2, drops[i].y-ds/2, ds, ds, -dropSize)
                } else {
                    rect(drops[i].x-dropSize/2, drops[i].y-dropSize/2, dropSize, dropSize, -dropSize)
                }
                if(dist(mouseX, mouseY, drops[i].x, drops[i].y)<dropSize/2) {
                    moused = i;
                }
            }
            if(moused>0) {
                mouseText.show();
                mouseText.setText(`-Drop-\nx: ${clipNumber(drops[moused].x, 2)}\ny: ${clipNumber(drops[moused].y, 2)}\nt: ${drops[moused].time}`)
                mouseText.setColor(washColor(col))
            }
        }
        draw = function() {
            pvv=+pathV.value
            if(loaded) {
                //background(100)
                image(field_image, 0, 0, width, height)
                fill(100, 200);
                rect(0, 0, width, height)
                time = 1000*(+time_set.value/timeScale);
                if(!robotsLoaded) {
                    robots = [];
                    console.log(`${countCSVs} CSVs loaded`)
                    for(var i in raw_csv) {
                        let P = (//what am I doing :p
                            (new Path()).getPathFromCSV(raw_csv[i])
                        )
                        P.flipY();
                        P.rescale(fieldScale, fieldScale);
                        
                        let drop = (
                            (new DropCollection()).getDropsFromCSV(raw_csv[i])
                        )
                        drop.flipY();
                        drop.rescale(fieldScale, fieldScale);

                        let info = (new Info()).getInfoFromCSV(raw_csv[i]);
                        robots.push(new Robot(P, drop, info, getColor(i)));

                        document.getElementById("robot-details").innerHTML += 
                            '<div class="idblockheader" id="idblockheader-'+i+'">'+
                                '<input class="checks" type="checkbox" checked=true id="robot-check-'+i+'">'+
                                info.header+'</div>'+
                            '<div class="idblock" id="idblock-'+i+'"></div>'
                        document.getElementById("idblock-"+i).innerHTML = info.getInfoAsHTML();
                        document.getElementById("idblockheader-"+i).style.backgroundColor = colorToHTML(washColor(getColor(i)));
                    }
                    robotsLoaded = true;
                } else {
                    strokeWeight(pathThickness);
                    for(var i in robots) {
                        let d = document.getElementById("robot-check-"+i);
                        if(!d.checked) { continue }
                        robots[i].getStats(time)
                        drawPath(robots[i])
                        if(dropsToggle.checked) {
                            drawDropCollection(robots[i])
                        }
                        if(robotToggle.checked) {
                            let s = robots[i].stats;
                            stroke(255)
                            pushMatrix();
                            translate(s.x, s.y);
                            rotate(s.rotation);//in radians
                            //image(robot_image, -robotSize/2, -robotSize/2, robotSize, robotSize);
                            triangle( -10, -10, 20, 0, -10, 10);
                            popMatrix();
                        }
                    }
                }
                mouseText.draw(mouseX, mouseY);
                mouseText.hide();
            } else {
                background(255, 0, 0);
                fill(255);
                text("Upload a file first", width/2, height/2)
            }
        }
    }
}
var ProcessingInstance = new Processing(document.getElementById("draw-canvas"), drawField)