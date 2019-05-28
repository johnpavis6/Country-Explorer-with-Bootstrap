function main() {
    document.getElementById("loader").style.display = "flex";
    document.getElementById("invalid-country").classList.add("d-none");
    document.getElementById("content").classList.add("d-none");
    var slownetwork = setTimeout(function () {
        /*
        Show slow network if the time taken for response is more than threshold
        */
        document.getElementById("slow-network").classList.remove("d-none");
    }, 5000);
    var code = location.hash.substr(1);
    document.querySelector("title").innerHTML = "Country Explorer - " + code;
    //Fetch API used to fetch the countries
    var myRequest = new Request("https://restcountries.eu/rest/v2/alpha/" + code);
    fetch(
        myRequest
    ).then(function (res) {
        return res.json();
    }).then(function (res) {
        clearInterval(slownetwork);
        console.log(res);
        start(res);
    }).catch(function () {
        start(null);
    });
}
main();
window.onhashchange = main;
function start(data) {
    /*
    Displays the fetched country detail
    */
    document.getElementById("loader").style.display = "none";
    if (data == null || data.status == 400) {
        document.getElementById("invalid-country").classList.remove("d-none");
        return;
    }
    document.getElementById("content").classList.remove("d-none");
    try {
        document.getElementById("country-name").innerHTML = data.name;
    } catch (e) { }
    try {
        document.getElementById("flag").src = data.flag;
    } catch (e) { }
    var keys = ["nativeName", "name", "capital", "subregion",
        "region", "population", "demonym", "area", "alpha2Code",
        "alpha3Code", "callingCodes", "latlng", "topLevelDomain",
        "numericCode", "timezones", "gini"
    ];
    keys.forEach(key => {
        try {
            document.getElementById(key).innerHTML = data[key] || '-';
        } catch (e) { }
    });
    document.getElementById("borders").innerHTML = "";
    document.getElementById("languages").innerHTML = "";
    document.getElementById("altSpellings").innerHTML = "";
    document.getElementById("translations").innerHTML = "";
    data.borders.forEach(border => {
        try {
            document.getElementById("borders").innerHTML += `<tr><td><a href='#${border}'>${border}</a></td></tr>`;
        } catch (e) { }
    });
    if (data.borders.length == 0) {
        document.getElementById("borders").innerHTML += `<tr><td>No Borders Found</td></tr>`;
    }
    data.languages.forEach(lang => {
        try {
            document.getElementById("languages").innerHTML += `<tr><td>${lang.name}</td></tr>`;
        } catch (e) { }
    });
    if (data.languages.length == 0) {
        document.getElementById("languages").innerHTML += `<tr><td>No languages Found</td></tr>`;
    }
    data.altSpellings.forEach(alt => {
        try {
            document.getElementById("altSpellings").innerHTML += `<tr><td>${alt}</td></tr>`;
        } catch (e) { }
    });
    if (data.altSpellings.length == 0) {
        document.getElementById("altSpellings").innerHTML += `<tr><td>No Alternate Spellings Found</td></tr>`;
    }
    for (key in data.translations) {
        try {
            document.getElementById("translations").innerHTML += `<tr><td class="h6">${key}</td><td>${data.translations[key]}</td></tr>`;
        } catch (e) { }
    }
}