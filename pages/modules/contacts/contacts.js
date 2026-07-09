async function addContact(){

    const name=$("#cName").val();

    const email=$("#cEmail").val();

    const platform=$("#cPlatform").val();

    const type=$("#cType").val();

    const country=$("#cCountry").val();

    const {error}=await db
    .from("contacts")
    .insert({

        name,

        email,

        platform,

        type,

        country

    });

    if(error){

        alert(error.message);

        return;

    }

    $("#contactModal").addClass("hidden");

    loadContacts();

}
$("#btnNewContact").click(()=>{

    $("#contactModal").removeClass("hidden");

});

$("#closeModal").click(()=>{

    $("#contactModal").addClass("hidden");

});

$("#saveContact").click(addContact);