'use client'

import { useTRPC } from '@/trpc/client'
import { useMutation } from '@tanstack/react-query'
import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation';
import Image from 'next/image'
import { ProjectsList } from '@/modules/home/ui/components/project-lists';
import { ProjectForm } from '@/modules/home/ui/components/project-form';
function N1() {
 
   
  return (
   <div className='flex flex-col max-w-5xl mx-auto w-full'>
    <section className="space-y-6 py-[16vh] 2xl:py-48">
      <div className='flex flex-col items-center'>
        <Image
        src="/logo.png"
        alt="Vibe"
        width={60}
        height={60}
        className="hidden md:block"
        />

      </div>
      <h1 className='text-2xl md:text-5xl font-bold text-center'>
        Build something with Codec
      </h1>
      <p className='text-lg md:text-xl text-muted-foreground text-center'>
        create apps and websites
      </p>
      <div className='max-w-3xl mx-auto w-full'>
        <ProjectForm/>

      </div>

    </section>
    <ProjectsList></ProjectsList>

   </div>
  )
}

export default N1

