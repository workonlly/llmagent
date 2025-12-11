'use client'

import FragmentWeb from "../components/fragment-web";
import { useAuth } from "@clerk/nextjs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Suspense, useState } from "react";
import { UserControl } from "@/components/user-control";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"

import Link from "next/link";
import { EyeIcon, CodeIcon, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

import { MessagesContainer } from "../components/messages-container";
import { ProjectHeader } from "../components/project-header";
import { FileExplorer } from "@/components/file-explorer";

type PrismaFragment = {
    id: string;
    messageId: string;
    sandboxUrl: string;
    title: string;
    files: any;
}

interface Props {
    projectId: string;
}

export const ProjectView = ({ projectId }: Props) => {
    const {has} =useAuth();
    const hasProAccess=has?.({plan:"pro"});
    const [tabState, setTabState] = useState<'preview' | 'code'>('preview');

    const [activeFragment, setActiveFragment] = useState<PrismaFragment | null>(null);

    return (
        <div className="h-screen">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel
                    defaultSize={35}
                    minSize={20}
                    className="flex flex-col min-h-0"
                >
                    <Suspense fallback={<div>Loading project header...</div>}>
                        <ProjectHeader projectId={projectId} />
                    </Suspense>
                    <Suspense fallback={<div>Loading messages...</div>}>
                        <MessagesContainer projectId={projectId}
                            activeFragment={activeFragment}
                            setActiveFragment={setActiveFragment}
                        />
                    </Suspense>
                </ResizablePanel>
                <ResizableHandle className="hover:bg-primary transition-colors" />
                <ResizablePanel
                    defaultSize={65}
                    minSize={50}
                >
                    <Tabs
                        className="h-full flex flex-col"
                        defaultValue="preview"
                        value={tabState}
                        onValueChange={(value) => setTabState(value as 'preview' | 'code')}
                    >
                        <div className="w-full flex items-center p-2 border-b gap-x-2">
                            <TabsList className="h-8 p-0 border rounded-md">
                                <TabsTrigger value="preview" className="rounded-md">
                                    <EyeIcon className="size-4" /> <span>Demo</span>
                                </TabsTrigger>
                                <TabsTrigger value="code" className="rounded-md">
                                    <CodeIcon className="size-4" /> <span>Code</span>
                                </TabsTrigger>
                            </TabsList>
                            <div className="ml-auto flex items-center gap-x-2">
                                {!hasProAccess && (
                                <Button asChild size="sm" variant="tertiary">
                                    <Link href="/pricing">
                                        <Crown className="size-4" /> Upgrade
                                    </Link>
                                </Button>
                                )}
                                <UserControl></UserControl>
                            </div>
                        </div>
                        <TabsContent value="preview" className="flex-1 m-0">
                            {!!activeFragment && <FragmentWeb data={activeFragment} />}
                        </TabsContent>

                        <TabsContent value="code" className="flex-1 m-0 min-h-0">
                            {!!activeFragment?.files && (
                                <FileExplorer
                                    files={activeFragment.files as { [path: string]: string }}
                                />
                            )}

                        </TabsContent>
                    </Tabs>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}