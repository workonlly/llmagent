import prisma  from '../../../lib/prisma'
import { baseProcedure,createTRPCRouter } from '@/trpc/init'
import {z} from "zod"
import { inngest } from '@/inngest/client' 
import {generateSlug} from 'random-word-slugs'
export const projectsRouter=createTRPCRouter({
    getOne:baseProcedure
    .input(z.object({
        id:z.string().min(1,{message:"Project ID is required"})
    }))

    .query(async({input})=>{
        const existingProject=await prisma.project.findUnique({
           where:{
            id:input.id,
           },
            include:{
                messages: {
                    include: {
                        fragment: true,
                    }
                }
            }

        })
        if(!existingProject){
            throw new Error("Project not found");
        }
       return existingProject;
    }),
    create:baseProcedure
    .input(
        z.object({
            value:z.string().min(1,{message:"Message is required"})
            .max(1000,{message:"Message is too long"}),
        }),
    )
    .mutation(async({input})=>{
        const createdProject=await prisma.project.create({
            data:{
                name: generateSlug(2,{
                    format: "kebab",
                }),
                messages:{
                    create:{
                         content :input.value ,
                        role:"USER",
                        type:"RESULT",

                    }
                }
            }
        })

        await inngest.send({
              name: "code-agent/run",
              data: {
                value: input.value,
                projectId: createdProject.id,
              }
            });

            return createdProject;
    })
})
