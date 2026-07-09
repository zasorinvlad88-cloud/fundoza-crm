'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TracksPage() {

const [tracks,setTracks]=useState([])

useEffect(()=>{
load()
},[])

async function load(){

const {data}=await supabase
.from('tracks')
.select('*')
.order('created_at',{ascending:false})

setTracks(data||[])
}

return(

<div className="p-8">

<h1 className="text-3xl font-bold mb-6">
Tracks
</h1>

<table className="w-full">

<thead>

<tr className="border-b">

<th>Artist</th>
<th>Title</th>
<th>Genre</th>
<th>Status</th>

</tr>

</thead>

<tbody>

{tracks.map((track:any)=>(

<tr key={track.id} className="border-b h-12">

<td>{track.artist}</td>

<td>{track.title}</td>

<td>{track.genre}</td>

<td>{track.status}</td>

</tr>

))}

</tbody>

</table>

</div>

)

}