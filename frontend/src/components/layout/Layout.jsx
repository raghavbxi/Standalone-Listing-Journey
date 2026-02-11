import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Button } from '../ui/button';
import { Toaster } from '../ui/sonner';

export const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Mobile Header */}
      <div className="mobile-header lg:hidden">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#C64091] flex items-center justify-center">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <span className="font-semibold text-gray-900">BXI Listing</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          data-testid="mobile-menu-toggle"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Main Content */}
      <main className="main-content" data-testid="main-content">
        {children}
      </main>

      {/* Toast notifications */}
      <Toaster position="top-right" richColors />
    </div>
  );
};

export default Layout;
