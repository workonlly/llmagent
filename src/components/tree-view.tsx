import { TreeItem } from "@/type";
import { FileIcon, FolderIcon } from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarProvider,
    SidebarRail,
} from "@/components/ui/sidebar";

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronRightIcon } from "lucide-react";

interface TreeViewProps {
  data: TreeItem[];
  value: string | null;
  onSelect?: (value: string) => void;
}

export const TreeView = ({
    data,
    value,
    onSelect
}: TreeViewProps) => {
    return (
        <SidebarProvider>
            <Sidebar collapsible="none" className="w-full">
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {data.map((item, index) => (
                                    <TreeNode
                                        key={index}
                                        item={item}
                                        selectedValue={value}
                                        onSelect={onSelect}
                                        parentPath=""
                                    />
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarRail />
            </Sidebar>
        </SidebarProvider>

    );
};

interface TreeProps {
    item: TreeItem;
    selectedValue?: string | null;
    onSelect?: (value: string) => void;
    parentPath?: string;
}

const TreeNode = ({ item, selectedValue, onSelect, parentPath = "" }: TreeProps) => {
    const [name, ...items] = Array.isArray(item) ? item : [item];
    const currentPath = parentPath ? `${parentPath}/${name}` : name;

    if (items.length === 0) {
        const isSelected = selectedValue === currentPath;

        return (
            <SidebarMenuItem>
                <SidebarMenuButton
                    isActive={isSelected}
                    className="data-[active=true]:bg-transparent"
                    onClick={() => onSelect?.(currentPath)}
                >
                    <FileIcon className="size-4" />
                    <span className="truncate">
                        {name}
                    </span>

                </SidebarMenuButton>
            </SidebarMenuItem>
        )

    }

    return (
        <SidebarMenuItem>
            <Collapsible
                className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
                defaultOpen
            >
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                        <ChevronRightIcon className="transition-transform" />
                        <FolderIcon className="size-4" />
                        <span className="truncate">
                            {name}
                        </span>
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {items.map((subItem, index) => (
                            <TreeNode
                                key={index}
                                item={subItem}
                                selectedValue={selectedValue}
                                onSelect={onSelect}
                                parentPath={currentPath}
                            />
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </Collapsible>
        </SidebarMenuItem>
    )
}