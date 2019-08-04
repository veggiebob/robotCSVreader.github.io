var displayVar = function(input, str, indents){
    if(!indents){
        indents = 0;
    }
    if(!str){
        str = "";
    }
    var inp = input.constructor;
    if(inp === String){
        str+='"'+input+'"';
    } else 
    if(typeof input === "boolean" || inp === Number){
        str+=input;
    } else
    if (inp === Array){
        str+="[";
        for(var i = 0; i<input.length; i++){
            str+=displayVar(input[i], "", indents);
            if(i<input.length-1){
                str+=", ";
            }
        }
        str+="]";
    } else
    if (inp === Object){
        var illegals = "~`!@#%^&*(){}?+|\\=/.',";
        str += "{\n";
        indents++;
        var ind = 0;
        for(var i in input){
            var illegalCharacter = false;
            var si = String(i);
            var c = si.charAt(0);
            var y = + c;
            if(!isNaN(y)){
                illegalCharacter = true;
            }
            for(var j = 0; j<illegals.length; j++){
                for(var k = 0; k<si.length; k++){
                    if(si.charAt(k)===illegals.charAt(j)){
                        illegalCharacter = true;
                        break;
                    }
                }
                if(illegalCharacter){
                    break;
                }
            }
            var di = i;
            if(illegalCharacter){
                di = displayVar(si, "");
            }
            for(var indentsa = 0; indentsa<indents; indentsa++){
                str+="    ";
            }
            str+=di+":"+displayVar(input[i], "", indents);
            str+=",\n";
            ind++;
        }
        if(ind>0){
            str = str.slice(0, str.length-2);
        } else {
            str = str.slice(0, str.length-1);
        }
        indents--;
        str+="\n";
        for(var indentsa = 0; indentsa<indents; indentsa++){
            str+="    ";
        }
        str+="}";
        indents--;
    } else
    if (typeof input === "function"){
        str+=input;
    } else {
        throw({message:"An Error Occurred: could not read\n" + inp});
    }
    //return str.replace(/\n/g, "<br>").replace(/ /g, " ").replace(/"/g, '');
    return str.replace(/\n/g, "<br>").replace(/ /g, " ");
};
var key = "sx6QV9xPH8OQRY11K4luiXbAal6ewdXTQBjiPW3BkivVRRYDBiEyD5K1U5jbq1hH"; 
var url_root = "https://www.thebluealliance.com/api/v3/";
var default_path = "team/frc2122"
document.getElementById("custom_url").placeholder = default_path;
function accessAPI(){ 
    var xmlHttp = new XMLHttpRequest();
    var url = url_root+default_path;
    var ev = document.getElementById("custom_url").value
    if(ev.length>0) {
        url = url_root+ev;
    }
    try {
    xmlHttp.open("GET", url, false);
    xmlHttp.setRequestHeader("X-TBA-Auth-Key", key);
        xmlHttp.send(null);
    } catch (e) { return undefined; }
    var data = xmlHttp.responseText;
    return data;
}
document.getElementById("update").onclick = function() {
    var data = accessAPI();
    if(data===undefined||data===null) {
        dispStr = "This field does not exist";
    } else {
        data = JSON.parse(data);
        console.log(data);
        var dispStr = "";
        for(var i in data) {
            var output = data[i];
            try {
                output = displayVar(output);
            } catch (e) {}
            if(output!==null) {
                var catch_url = /((https?|ftp|smtp):\/\/)?(www.)?[a-z0-9]+\.[a-z]+(\/[a-zA-Z0-9#]+\/?)*/;
                var mm = output.match(catch_url);
                if(mm!==null) {
                    output = "<a style=\"color:lightGray\" href=\""+mm[0]+"\" target=\"blank\">"+output+"</a>"
                    console.log("found website");
                }
            }
            dispStr += "<span class=\"data-key\">" + i + "</span>: <span class=\"data-value\">" + output + "</span><br>";
        }
        if(dispStr.length===0) {
            dispStr = "This field exists but is empty";
        }
    }
    document.getElementById("data").innerHTML = dispStr;
    var prop = document.getElementById("custom_property").value;
    console.log(prop);
    if(prop.length>0) {
        var output = data[prop];
        try {
            output = displayVar(output)
        } catch (e) {}
        document.getElementById("property_output").innerHTML = ">> " + prop+": " + output;
    } else {
        document.getElementById("property_output").innerHTML = "";
    }
}
document.getElementById("custom_property").onchange = function() {
    document.getElementById("update").click();
}
document.getElementById("custom_url").onchange = function() {
    document.getElementById("update").click();
}