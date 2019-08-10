//https://www.shadertoy.com/api/v1/shaders/query/veggiebob?sort=newest&key=NtHKMN
/*
{
    Shaders: 3,
    Results: [
        "shader id",
        "shader id",
        "shader id",
        ....
    ]
}
*/
let SAK = "NtHKMN";//shadertoy app key
async function loadShaderProjects () {
    let shaderTable = document.getElementById("shadertoy-loads")
    let data = await getAPIAsync("https://www.shadertoy.com/api/v1/shaders/query/veggiebob?sort=newest&key="+SAK)
    data = data.Results;
    if(data.length>10) {
        data = data.slice(0, 10);
    }
    for(let pkey of data) {
        let shader = await getAPIAsync("https://www.shadertoy.com/api/v1/shaders/"+pkey+"?key="+SAK)
        let shaderThumb = "https://www.shadertoy.com/media/shaders/"+pkey+".jpg"
        console.log(shader)
        console.log(shaderThumb)
        shader = shader.Shader;
        let shaderHTML = `<a href="https://www.shadertoy.com/view/${pkey}" class="highlighters">`+
            `<img src="${shaderThumb}"><br>${shader.info.name}</a>`+
            `<span style="font-size:50px;color:white;margin-right:5px;">|</span> <span title="${shader.info.description}" style="margin-right:10px">${clipString(shader.info.description.replace(/[\n\r]/g, "<br>"), 200)}</span>`+
            `<span class="views">${shader.info.viewed}</span> &bull; <span class="likes">${shader.info.likes}</span>`
        shaderTable.innerHTML += "<td>"+shaderHTML+"</td>"
    }
}
loadShaderProjects()