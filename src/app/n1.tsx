'use client'

import { useTRPC } from '@/trpc/client'
import { useMutation } from '@tanstack/react-query'
import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'

function N1() {
   const [value,setvalue]=useState("");
  const trpc=useTRPC()
  const {data:messages}=useQuery(trpc.messages.getMany.queryOptions())
  const createMessage=useMutation(trpc.messages.create.mutationOptions({
    onSuccess:()=>{
    toast.success("message created");
    }
  }))
 

  

  return (
         <div className='p-20'>
            <div className='flex flex-col justify-center items-center'>
                <input type="text" className='ring-2 ring-black w-full ' onChange={e=> setvalue(e.target.value)} />
            <button className='bg-blue-400 px-6 py-3 rounded-lg text-white font-semibold hover:bg-blue-500 transition-colors m-3'
            disabled={createMessage.isPending}
            onClick={()=>{
                createMessage.mutate({value: value})
            }}>
                invoke background jobs
            </button>
            {JSON.stringify(messages ,null,2)}
            </div>
         </div>
  )
}

export default N1

