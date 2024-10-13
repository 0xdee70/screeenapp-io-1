import React from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CreditCard, Sun, Moon, Layout } from "lucide-react";
import { cn } from "@/lib/utils";

const Sidebar = ({ isCollapsed, isDarkMode, navItems, handleUpgradeClick, toggleDarkMode, toggleSidebar }) => {
    return (
        <>
            <div
                className={cn(
                    "fixed left-0 top-16 bottom-0 z-40 flex flex-col border-r transition-all duration-300 ease-in-out",
                    isCollapsed ? "w-0 overflow-hidden" : "w-64",
                    isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                )}
            >
                <ScrollArea className="flex-1">
                    <nav className="p-4">
                        {navItems.map((section, index) => (
                            <div key={index} className="mb-4">
                                <h2 className="text-sm font-semibold mb-2">{section.title}</h2>
                                {section.children && (
                                    <ul className="space-y-2">
                                        {section.children.map((item, itemIndex) => (
                                            <li key={itemIndex}>
                                                <Button
                                                    variant="ghost"
                                                    className={cn(
                                                        "w-full justify-start",
                                                        isDarkMode
                                                            ? "text-gray-300 hover:text-white hover:bg-gray-700"
                                                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                                    )}
                                                >
                                                    {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                                                    {item.title}
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </nav>
                </ScrollArea>
                <div className="p-4">
                    <Button
                        variant="outline"
                        className={cn(
                            "w-full",
                            isDarkMode
                                ? "bg-gray-700 text-gray-100 hover:bg-gray-600"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        )}
                        onClick={handleUpgradeClick}
                    >
                        <CreditCard className="mr-2 h-4 w-4" /> Upgrade to Pro
                    </Button>
                </div>
                <div className="mt-auto p-4 flex justify-between items-center border-t border-gray-700">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleDarkMode}
                        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                    >
                        {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleSidebar}
                        aria-label="Collapse sidebar"
                    >
                        <Layout className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <Button
                variant="ghost"
                size="icon"
                className={cn(
                    "fixed left-0 bottom-0 z-50 m-4 transition-opacity duration-300",
                    isCollapsed ? "opacity-100" : "opacity-0 pointer-events-none",
                    isDarkMode ? "text-white hover:bg-gray-700" : "text-black hover:bg-gray-200"
                )}
                onClick={toggleSidebar}
                aria-label="Open sidebar"
            >
                <Layout className="h-4 w-4" />
            </Button>
        </>
    );
};

export default Sidebar;