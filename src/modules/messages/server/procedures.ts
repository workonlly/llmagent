import prisma  from '../../../lib/prisma'
import { baseProcedure,createTRPCRouter } from '@/trpc/init'
import {z} from "zod"
import { inngest } from '@/inngest/client' 

export const messageRouter=createTRPCRouter({
    getMany:baseProcedure
    .input(
        z.object({
           
            projectId:  z.string().min(1,{message:"Project ID is required"})
        }),
    )
    .query(async({input})=>{
        
        const messages=await prisma.message.findMany({

            where:{
                projectId: input.projectId,
            },
            orderBy:{
               updatedAt: "asc",

            },
            include:{
                fragment:true,
            }

        })
       return messages;
    }),
    create:baseProcedure
    .input(
        z.object({
            value:z.string().min(1,{message:"Message is required"})
            .max(1000,{message:"Message is too long"}),
            projectId:  z.string().min(1,{message:"Project ID is required"})
        }),
    )
    .mutation(async({input})=>{
       const createdMessage=await prisma.message.create({
            data:{
                projectId: input.projectId,
                content :input.value ,
                role:"USER",
                type:"RESULT",
            }
        });
        await inngest.send({
              name: "code-agent/run",
              data: {
                value: input.value,
                projectId: input.projectId,
              }
            });

            return createdMessage;
    })
})
