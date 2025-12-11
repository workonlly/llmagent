import prisma  from '../../../lib/prisma'
import { protectedProcedure,createTRPCRouter, TRPCError } from '@/trpc/init'
import {z} from "zod"
import { inngest } from '@/inngest/client' 
import {generateSlug} from 'random-word-slugs'
import { consumeCredits } from '@/lib/usage'
export const projectsRouter=createTRPCRouter({
    getMany:protectedProcedure
    .query(async({ctx})=>{
        const projects=await prisma.project.findMany({
            where:{
                userId: ctx.auth.userId,
            },
            orderBy:{
                createdAt: 'desc',
            },
            include:{
                messages: {
                    take: 1,
                    orderBy: {
                        createdAt: 'desc',
                    },
                }
            }
        })
        return projects;
    }),
    getOne:protectedProcedure
    .input(z.object({
        id:z.string().min(1,{message:"Project ID is required"})
    }))

    .query(async({input,ctx})=>{
        const existingProject=await prisma.project.findUnique({
           where:{
            id:input.id,
            userId: ctx.auth.userId,
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
    create:protectedProcedure
    .input(
        z.object({
            value:z.string().min(1,{message:"Message is required"})
            .max(1000,{message:"Message is too long"}),
        }),
    )
    .mutation(async({input, ctx})=>{
         try{
              await consumeCredits();
           }catch (error){
               console.error("Error consuming credits:", error);
               if (error instanceof Error) {
                throw new TRPCError({
                code: "TOO_MANY_REQUESTS",
                message: error.message || "You have run out of credits",
                });
            } else {
                throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Something went wrong",
                });
            }

           }
        const createdProject=await prisma.project.create({
            data:{
                userId:ctx.auth.userId,
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

        try {
          await inngest.send({
                name: "code-agent/run",
                data: {
                  value: input.value,
                  projectId: createdProject.id,
                }
              });
        } catch (error) {
          console.error("Error sending to Inngest:", error);
          // Don't throw - project was created successfully
        }

            return createdProject;
    })
})
