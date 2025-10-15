import prisma  from '../../../lib/prisma'
import { baseProcedure,createTRPCRouter } from '@/trpc/init'
import {z} from "zod"
import { inngest } from '@/inngest/client' 

export const messageRouter=createTRPCRouter({
    getMany:baseProcedure.query(async()=>{
        const messages=await prisma.message.findMany({
            orderBy:{
               updatedAt: "desc",

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
        }),
    )
    .mutation(async({input})=>{
       const createdMessage=await prisma.message.create({
            data:{
                content :input.value ,
                role:"USER",
                type:"RESULT",
            }
        });
        await inngest.send({
              name: "code-agent/run",
              data: {
                value: input.value,
              }
            });

            return createdMessage;
    })
})
