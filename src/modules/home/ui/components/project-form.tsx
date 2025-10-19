'use client'

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextareaAutosize from "react-textarea-autosize";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTRPC } from "@/trpc/client";
import { toast } from "react-hot-toast";
import { Form, FormField } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2Icon, ArrowUpIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { PROJECT_TEMPLATES } from "../../constants";


const formSchema = z.object({
    value: z.string().min(1, { message: "Message is required" })
        .max(1000, { message: "Message is too long" }),
})

export const ProjectForm = () => {
    const router=useRouter();
    const [isFocused, setIsFocused] = useState(false);
    const showUsage = false;
    const queryClient = useQueryClient();
    const trpc = useTRPC();
    
    const createProject = useMutation(trpc.projects.create.mutationOptions({
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: [['projects']]
            });
            router.push(`/projects/${data.id}`);
        },
        onError: (error) => {
            toast.error(error.message);
        }
    }))

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            value: "",
        }
    })
    
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        await createProject.mutateAsync({
            value: values.value,
        })
    }
     
    const onSelect=(value:string)=>{
        form.setValue("value",value,{
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        })
    }
    const isPending = createProject.isPending;
    const isDisabled = isPending;
    
    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}
                    className={cn(
                        "relative border p-4 pt-1 rounded-xl bg-sidebar dark:bg-sidebar transition-all",
                        isFocused && "shadow-xs",
                        showUsage && "rounded-t-none",

                    )}>
                    <FormField
                        control={form.control}
                        name="value"
                        render={({ field }) => (
                            <TextareaAutosize
                                {...field}
                                disabled={isDisabled}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                minRows={2}
                                maxRows={8}
                                className="pt-4 resize-none border-none w-full outline-none bg-transparent"
                                placeholder="what would you like to build"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                                        e.preventDefault();
                                        form.handleSubmit(onSubmit)(e);
                                    }
                                }}
                            />

                        )}

                    />
                    <div className="flex gap-x-2 items-end justify-between pt-2">
                        <div className="text-[10px] text-muted-foreground font-mono">
                            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                                <span>⌘</span>Enter
                            </kbd>
                            &nbsp;to submit
                        </div>
                        <Button
                            disabled={isPending || !form.formState.isValid}
                            className={cn(
                                "size-8 rounded-full",
                                (isPending || !form.formState.isValid) && "bg-muted-foreground border"
                            )}>
                            {isPending ? (
                                <Loader2Icon className="size-4 animate-spin"></Loader2Icon>
                            ) : (
                                <ArrowUpIcon />
                            )}

                        </Button>
                    </div>
                </form>
            </Form>
            <div className="flex flex-wrap justify-center gap-2 hidden md:flex max-w-3xl mt-4">
               {PROJECT_TEMPLATES.map((template) => (
                <Button 
                    key={template.title}
                    variant="outline"
                    size="sm"
                    className="bg-white dark:bg-sidebar"
                    onClick={() => {
                        onSelect(template.prompt);
                    }}
                >
                  {template.emoji} {template.title}
                </Button>
               ))}
            </div>
        </div>
    )
}