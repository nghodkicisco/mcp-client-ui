
import React, { useState } from 'react';
import { SidebarProvider, Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarGroup, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { MessageSquare, Settings, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarHeader className="flex items-center px-6 py-4">
            <div className="font-bold text-xl">MCP Client</div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.pathname === '/'}>
                    <Link to="/" className="flex items-center gap-2">
                      <MessageSquare size={18} />
                      <span>Chat</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.pathname === '/config'}>
                    <Link to="/config" className="flex items-center gap-2">
                      <Settings size={18} />
                      <span>Configuration</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          
          <SidebarFooter className="px-4 py-3">
            <Button variant="ghost" size="sm" className="w-full flex items-center gap-2" asChild>
              <a href="https://github.com/modelcontextprotocol" target="_blank" rel="noopener noreferrer">
                <Github size={16} />
                <span>MCP GitHub</span>
              </a>
            </Button>
          </SidebarFooter>
        </Sidebar>
        
        <main className="flex-1 p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center mb-4">
              <SidebarTrigger className="md:hidden mr-4" />
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
