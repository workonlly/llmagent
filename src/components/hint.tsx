"use client"

import{
 Tooltip,
 TooltipContent,
 TooltipProvider,
 TooltipTrigger,
}from "@/components/tooltip";
import { Children } from "react";

interface HintProps{

    children:React.ReactNode;
    text:string;
    side?: "top" | "bottom" | "left" | "right";
    align?: "start" | "center" | "end";
}
export const Hint = ({children,text,side="top",align="center"}:HintProps) => {
    return(
       <div>
        <TooltipProvider>

            <Tooltip>
             <TooltipTrigger asChild>
               {children}
             </TooltipTrigger>
             <TooltipContent side={side} align={align} >
                 <p>{text}</p>
             </TooltipContent>
            </Tooltip>
        </TooltipProvider>
       </div>
            )};