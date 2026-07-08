async function loadContacts(){


const {data,error}=await db
.from("contacts")
.select("*")
.order("created_at",{ascending:false});


if(error){

console.error(error);
return;

}


let rows="";


data.forEach(c=>{


rows += `

<tr>

<td>${c.name}</td>

<td>${c.type ?? ""}</td>

<td>${c.platform ?? ""}</td>

<td>${c.email ?? ""}</td>

<td>${c.country ?? ""}</td>

<td>${c.status}</td>

<td>

<button onclick="deleteContact(${c.id})">
🗑
</button>

</td>

</tr>

`;


});


document.querySelector(
"#contactsTable tbody"
).innerHTML=rows;


}



async function deleteContact(id){


if(!confirm("Удалить контакт?"))
return;


await db
.from("contacts")
.delete()
.eq("id",id);


loadContacts();


}


window.loadContacts=loadContacts;