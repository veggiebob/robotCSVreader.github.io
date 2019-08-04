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
        let shaderHTML = `<a href="https://www.shadertoy.com/view/${pkey}">`+
            `<img src="${shaderThumb}">${shader.info.name}</a>`+
            `: <span title="${shader.info.description}">${clipString(shader.info.description, 50)}</span>`+
            ` &bull; <span class="views">${shader.info.viewed}</span> &bull; <span class="likes">${shader.info.likes}</span>`
        shaderTable.innerHTML += "<td>"+shaderHTML+"</td>"
    }
}
loadShaderProjects()