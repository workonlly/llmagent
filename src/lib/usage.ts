import { auth } from '@clerk/nextjs/server';
import {RateLimiterPrisma} from 'rate-limiter-flexible';
import prisma from './prisma';

export async function getUsageTracker(){
    const {has} =await auth();
    const hasProAcess=has({plan:"pro"})
    const usageTracker=new RateLimiterPrisma({

        storeClient:prisma,
        tableName:"Usage",
        points:hasProAcess ?100:5,
        duration:30*24*60*60,
    })
   return usageTracker;
}

export async function consumeCredits(){
    const {userId}= await auth();
    if(!userId){
        throw new Error("Unauthorized");
    }
    const usageTracker=await getUsageTracker();
    const result =await usageTracker.consume(userId,1);
    return result;
}


export async function getUsageStatus() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const usageTracker = await getUsageTracker();
  const result = await usageTracker.get(userId);

  return result;
}