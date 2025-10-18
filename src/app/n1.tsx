'use client'

import { useTRPC } from '@/trpc/client'
import { useMutation } from '@tanstack/react-query'
import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation';

function N1() {
  const [value, setValue] = useState("");

  const router = useRouter();
  const trpc = useTRPC()
  
  const createProject = useMutation(trpc.projects.create.mutationOptions({
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: (data) => {
      toast.success("Project created");
      router.push(`/projects/${data.id}`);
    }
  }))
   
  return (
    <div className='p-20'>
      <div className='flex flex-col justify-center items-center gap-4'>
        <h1 className='text-2xl font-bold mb-4'>Create New Project</h1>
        
        <input 
          type="text" 
          className='ring-2 ring-black w-full px-4 py-2 rounded' 
          placeholder='Enter your message...'
          value={value}
          onChange={e => setValue(e.target.value)} 
        />
        
        <button 
          className='bg-blue-400 px-6 py-3 rounded-lg text-white font-semibold hover:bg-blue-500 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed'
          disabled={createProject.isPending || !value.trim()}
          onClick={() => {
            createProject.mutate({ value: value })
          }}
        >
          {createProject.isPending ? 'Creating...' : 'Create Project & Run Agent'}
        </button>
      </div>
    </div>
  )
}

export default N1

