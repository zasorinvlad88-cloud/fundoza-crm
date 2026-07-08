async function loadPage(page){


    const response = await fetch(
        `pages/${page}.html`
    );


    const html = await response.text();


    document.querySelector("#app").innerHTML = html;


    if(page==="contacts"){

        loadContacts();

    }


}


window.loadPage = loadPage;