var slownetwork = setTimeout(function () {
    /*
    Show slow network if the time taken for response is more than threshold
    */
    document.getElementById("slow-network").classList.remove("d-none");
}, 5000);
var countries = [];
//Fetch API used to fetch the details of specific country
var myRequest = new Request("https://restcountries.eu/rest/v2/all");
fetch(
    myRequest
).then(function (res) {
    return res.json();
}).then(function (res) {
    clearTimeout(slownetwork);
    countries = res;
    start();
}).catch(function () {
    // start(null);
});
var keywords = {};
function start() {
    /*
    Displays the fetched country details as cards
    */
    document.getElementById("loader").style.display = "none";
    document.getElementById("content").classList.remove("d-none");
    var cardDeck = document.getElementById("card-deck");
    var html = `
    <div class="card">
        <div class="card-header d-flex">
            <div>
                <div class="font-weight-bold">{{name}}</div>
                <small>{{region}}</small>
            </div>
            <img src="{{flag}}" class="flag ml-auto">
        </div>
        <div class="card-body">
            <table class="table-bordered" width="100%">
                <tr>
                    <td class="h6">Capital</td>
                    <td>{{capital}}</td>
                </tr>
                <tr>
                    <td class="h6">Native Name</td>
                    <td>{{nativeName}}</td>
                </tr>
                <tr>
                    <td class="h6">Population</td>
                    <td>{{population}}</td>
                </tr>
                <tr>
                    <td class="h6">Code</td>
                    <td>{{alpha3Code}}</td>
                </tr>
            </table>
        </div>
        <!-- <div class="card-footer"></div> -->
    </div>`;
    // html = html.replace("d-none", "");
    var tags = ["name", "flag", "capital", "nativeName", "population", "alpha3Code"];
    for (var i = 0; i < countries.length; i++) {
        var code = html;
        tags.forEach(tag => {
            code = code.replace(`{{${tag}}}`, countries[i][tag] || '-');
        });
        var _region = [];
        if (countries[i].subregion) {
            _region.push(countries[i].subregion);
        }
        if (countries[i].region) {
            _region.push(countries[i].region);
        }
        code = code.replace('{{region}}', _region);
        var div = document.createElement("div");
        div.onclick = function () {
            redirect(this.id);
        }
        div.classList.add('country');
        div.classList.add('col-md-6');
        div.id = countries[i]['alpha3Code'];
        div.innerHTML = code;
        cardDeck.appendChild(div);
        // cardDeck.innerHTML += code;
        /*inserting specific values like country name,region,etc. to Trie node*/
        buildTrie(countries[i].name.toLowerCase() || '', keywords, i);
        buildTrie(countries[i].subregion.toLowerCase() || '', keywords, i);
        buildTrie(countries[i].region.toLowerCase() || '', keywords, i);
        buildTrie(countries[i].capital.toLowerCase() || '', keywords, i);
        buildTrie(countries[i].alpha3Code.toLowerCase() || '', keywords, i);
    }
    console.log(keywords);
}
function search(str, keywords, res, i = 0) {
    /*
    Search the string in Trie data structure node for fast retrival
    */
    if (i == str.length) {
        return 200;
    }
    var c = str[i];
    if (!(c in keywords)) {
        return 404;
    }
    res.inds = keywords[c][1];
    return search(str, keywords[c][0], res, i + 1);
}
function filter(str) {
    /*
    Get results from Trie node for corresponding user query and show results if any,or show the suggestions if any
    */
    str = str.trim().toLowerCase(); //string trimming
    document.getElementById("alert-invalid-text").classList.add('d-none');
    document.getElementById('suggestions-tab').classList.add('d-none');
    if (str.length == 0) {
        //On empty string,show all fetched results 
        var elements = document.getElementsByClassName("country");
        for (var i = 0; i < elements.length; i++) {
            elements[i].style.display = "inline";
        }
        return;
    }
    var res = { inds: [] };
    var rcode = search(str, keywords, res);//start search in Trie node
    var elements = document.getElementsByClassName("country");
    for (var i = 0; i < elements.length; i++) {
        elements[i].style.display = "none";
    }
    if (rcode == 404) {
        document.getElementById("invalid-text").innerHTML = str;
        document.getElementById("alert-invalid-text").classList.remove('d-none');
        return showSuggestions(res.inds);
    }
    console.info("Results", res);
    res.inds.forEach(ind => {
        document.getElementById(countries[ind].alpha3Code).style.display = "inline";
    });
}

function buildTrie(name, dic, ind, i = 0) {
    /*
    Insert the string to Trie data structure node for fast retrival
    */
    if (i == name.length) {
        return;
    }
    var c = name[i];
    if (!(c in dic)) {
        dic[c] = [{}, new Set()];
    }
    dic[c][1].add(ind);
    buildTrie(name, dic[c][0], ind, i + 1);
}
function redirect(code) {
    /*
    On click filtered results, redirect to country.html with coutry code
    */
    location.assign("country.html#" + code);
}
function showSuggestions(inds) {
    /*
    Show suggestions on invalid text entered
    */
    if (inds.length == 0) {
        return;
    }
    document.getElementById("suggestions-tab").classList.remove('d-none');
    document.getElementById("suggestions").innerHTML = "";
    var html = [], i = 0;
    inds.forEach(ind => {
        if (i == 6) return;
        html.push(` <a href=javascript:change('${countries[ind].name}')>${countries[ind].name}</a>`);
        i++;
    });
    document.getElementById("suggestions").innerHTML = html;
}
function change(str) {
    /*
    Set clicked suggestion as input and start filter results
    */
    document.getElementById("search-bar").value = str;
    filter(str);
}