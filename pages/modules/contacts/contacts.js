async function loadContacts(){


    const {
        data,
        error
    } = await db
        .from("contacts")
        .select("*")
        .order("created_at",{ascending:false});


    if(error){

        console.error(error);
        return;

    }



    let html="";


    data.forEach(contact=>{


        html += `

        <tr>

        <td>${contact.name}</td>

        <td>${contact.type ?? ""}</td>

        <td>${contact.platform ?? ""}</td>

        <td>${contact.email ?? ""}</td>

        <td>${contact.country ?? ""}</td>

        <td>${contact.status}</td>

        </tr>

        `;


    });



    document.querySelector("#contactsTable").innerHTML = html;


}



window.loadContacts = loadContacts;