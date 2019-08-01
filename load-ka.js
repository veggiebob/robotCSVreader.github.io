var columns = 5;
var load_rows = 5;
var num_request = columns*load_rows;
let root = "https://www.khanacademy.org"
function accessAPI(url){ 
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url, false);
    //xmlHttp.setRequestHeader("X-TBA-Auth-Key", key);
    xmlHttp.send(null);
    var data = xmlHttp.responseText;
    return JSON.parse(data);
}
function clipString (str, len) {
    return str.length>len?str.substring(0, len)+"...":str;
}
function loadScratchpads (sortType) {
    var dat = accessAPI(root+"/api/internal/user/scratchpads?username=dinopappy&limit="+num_request+"&sort="+sortType).scratchpads;
    var ka_table = document.getElementById("khan-loads")
    ka_table.innerHTML = "";
    let index = 0;
    console.log(dat);
    for(let row = 0; row<load_rows; row++) {
        var row_string = "";
        for(let column = 0; column < columns; column++) {
            let pad = dat[index]
            row_string += '<td><a href="'+pad.url+'"><img target="_blank" src="'+root+pad.thumb+'"><br>'+clipString(pad.title, 25)+'</a></td>';
            index++;
        }
        ka_table.innerHTML += "<tr>" + row_string + "</tr>";
    }
}
loadScratchpads(1)
document.getElementById("ka-hot-sort").onclick = function() {
    loadScratchpads(1);
}
document.getElementById("ka-new-sort").onclick = function() {
    loadScratchpads(2);
}
