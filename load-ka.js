var columns = 5;
var load_rows = 2;
var num_request = columns*load_rows;
const root = "https://www.khanacademy.org"
var ka_table = document.getElementById("khan-loads")
var loading_symbol = '<img src="https://ui-ex.com/images/transparent-background-loading.gif" class="loader">';
const MAX_REQUESTS = 5;
function validateProgram (prgm) {
    //return true;
    let authorCheck = /@author:\s*([\w\,]+)/;
    let txt = prgm.revision.code.toLowerCase();
    let hasAuthor = authorCheck.test(txt)
    let authors, correctAuthor;
    if(hasAuthor) {
        authors = txt.match(authorCheck);
        authors.forEach(e=>{e=e.trim()})
        correctAuthor = authors.includes("jiggs")
    }
    let quality = txt.match(/@quality:\s*(\d)/);
        //0 = <50% done
        //1 = >50% done or something not-user friendly but done
        //2 = 95-100% done and user-friendly
    if(!hasAuthor) {
        correctAuthor = true;
    }
    if(quality!==null) {
        return correctAuthor&&+quality[1]>1
    } else {
        return correctAuthor;
    }
}
async function getGoodScratchpadsAsync (sortType, scratchs, page) {
    if(page===undefined) {
        page = 0;
    }
    if(scratchs===undefined) {
        scratchs = [];
    }
    if(page>MAX_REQUESTS) {
        return scratchs;
    }
    var dat = (await getAPIAsync(
        root+"/api/internal/user/scratchpads?username=dinopappy"+
        "&limit=40"+
        "&sort="+sortType+
        "&page="+page
    ))
    dat = dat.scratchpads;
    if(!dat) {
        return scratchs;
    }
    let missing = 0;
    for(let scratch of dat) {
        let program_id = scratch.url.match(/\/\d+$/)[0];
        let program = await getAPIAsync(root+"/api/internal/scratchpads"+program_id);
        if(scratchs.length>=num_request) {
            break;
        }
        //console.log(program.id)
        if(validateProgram(program)) {
            scratchs.push(scratch)
        } else {
            missing ++;
            //console.log("scratchpad " + scratch.title + " is not a good one\n"+scratch.url)
        }
    }
    if(missing>0&&scratchs.length<num_request) {
        console.log(missing + " missing")
        scratchs = scratchs.concat(await getGoodScratchpadsAsync(sortType, scratchs, page+1))
    }
    return scratchs;
}
async function loadScratchpads (sortType) {
    let dat = await getGoodScratchpadsAsync(sortType);
    ka_table.innerHTML = "";
    let index = 0;
    out:
    for(let row = 0; row<load_rows; row++) {
        var row_string = "";
        for(let column = 0; column < columns; column++) {
            if(index>=dat.length) {
                break out;
            }
            let pad = dat[index]
            row_string += '<td><a class="highlighters" href="'+pad.url+'"><img target="_blank" src="'+root+pad.thumb+'"><br>'+clipString(pad.title, 25)+'</a></td>';
            index++;
        }
        ka_table.innerHTML += "<tr>" + row_string + "</tr>";
    }
    document.getElementById("loading_symbol").style.display = "none";
}
async function loadPrograms (sortType) {
    document.getElementById("loading_symbol").style.display = "initial";
    ka_table.innerHTML = "";
    setTimeout(()=>{loadScratchpads(sortType)}, 2000)
}
loadPrograms(1);
document.getElementById("ka-hot-sort").onclick = function() {
    loadPrograms(1);
}
document.getElementById("ka-new-sort").onclick = function() {
    loadPrograms(2);
}
