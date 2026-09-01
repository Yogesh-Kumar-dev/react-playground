'use client'

import { useLocation, NavLink, Outlet } from 'react-router-dom'
import { NuqsAdapter } from 'nuqs/adapters/react-router/v7'
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarRail,
    SidebarTrigger,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { BookOpenText, Code, House, Image, Puzzle, TextCursorInput } from 'lucide-react'

const navItems = [
    { to: '/', label: 'Home', icon: House },
    { to: '/animechan', label: 'AnimeChan', icon: BookOpenText },
    { to: '/imgflip', label: 'Imgflip', icon: Image },
    { to: '/tanstack-highlight', label: 'Tanstack Highlight', icon: Code },
    { to: '/web-components', label: 'Web Components', icon: Puzzle },
    { to: '/dynamic-form', label: 'Dynamic Form', icon: TextCursorInput },
    { to: '/form-builder', label: 'Form Builder', icon: Image },
    // { to: '/', label: 'Charts', icon: Image },
    // { to: '/', label: 'File upload', icon: Image },
    // { to: '/', label: 'WYSIWYG', icon: Image },
    // { to: '/', label: 'Email Editor', icon: Image },
    // { to: '/', label: 'Json renderer', icon: Image },
    // { to: '/', label: 'Data tables', icon: Image },
    // { to: '/', label: '', icon: Image },
    // { to: '/', label: 'Excel data handling', icon: Image },
    // { to: '/', label: 'react-grid-layout', icon: Image },
]

export default function MainLayout() {
    const { pathname } = useLocation()

    return (
        <SidebarProvider>
            <Sidebar collapsible="icon">
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                size="lg"
                                isActive={pathname === '/'}
                                render={<NavLink to="/" />}
                            >
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <BookOpenText className="size-4" />
                                </div>
                                <div className="group-data-[collapsible=icon]:hidden grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate text-xs text-muted-foreground">
                                        Playground
                                    </span>
                                </div>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {navItems.map(({ to, label, icon: Icon }) => (
                                    <SidebarMenuItem key={to}>
                                        <SidebarMenuButton
                                            isActive={pathname === to}
                                            tooltip={label}
                                            render={<NavLink to={to} />}
                                        >
                                            <Icon />
                                            <span>{label}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>

                <SidebarRail />
            </Sidebar>

            <SidebarInset>
                <header className="flex h-12 items-center gap-2 border-b px-4">
                    <SidebarTrigger />
                    <Separator orientation="vertical" className="h-4" />
                    {/* <span className="text-sm font-medium">Playground</span> */}
                </header>
                <div className="flex flex-1 flex-col">
                    <NuqsAdapter>
                        <Outlet />
                    </NuqsAdapter>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
