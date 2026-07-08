document.addEventListener(
"DOMContentLoaded",
()=>{


    loadPage("contacts");


    document
    .querySelectorAll("[data-page]")
    .forEach(btn=>{


        btn.onclick=()=>{

            loadPage(
                btn.dataset.page
            );

        };


    });


});