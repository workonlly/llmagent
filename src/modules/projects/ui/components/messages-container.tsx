import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { MessageCard } from "./message-card"
import { MessageForm } from "./message-form";
import { useRef } from "react";
import { useEffect } from "react";
interface Props {
    projectId: string;
}
export const MessagesContainer = ({ projectId }: Props) => {
    const bottomRef=useRef<HTMLDivElement>(null)
    const trpc = useTRPC();
    const { data: project } = useSuspenseQuery(trpc.projects.getOne.queryOptions({
        id: projectId,
    }));

    const messages = project.messages;

    useEffect(()=>{
     const LastAssistantMessage=messages.findLast(
        (message)=> message.role ==="ASSISTANT",
     )

     if(LastAssistantMessage && bottomRef.current){}
    },[messages])
       
    useEffect(()=>{
        bottomRef.current?.scrollIntoView({behavior:"smooth"});
    },[messages.length])

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="pt-2 pr-1">
                    {messages.map((message) => (
                        <MessageCard
                            key={message.id}
                            content={message.content}
                            role={message.role}
                            fragment={message.fragment}
                            createdAt={message.createdAt}
                            isActiveFragment={false}
                            onFragmentClick={() => { }}
                            type={message.type}

                        />
                    ))}
                     <div ref={bottomRef}/>
                </div>
                
            </div>
            <div className="relative p-3 pt-1">
                <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-background/70 pointer-events-none"/>
                <MessageForm projectId={projectId} />
            </div>
        </div>
    )
}
