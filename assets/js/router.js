async function loadPage(page) {

    const response = await fetch(`pages/${page}.html`);

    const html = await response.text();

    $("#app").html(html);

    if (page === "contacts") {
        initContacts();
    }

}