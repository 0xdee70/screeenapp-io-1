import React from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Download, Copy, Merge, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Footer = ({
    isCollapsed,
    isDarkMode,
    selectedVideos,
    handleAction,
    isProUser
}) => {
    if (selectedVideos.length === 0) return null;

    return (
        <div className={cn(
            "fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 transition-all duration-300 ease-in-out",
            isCollapsed ? "ml-0" : "ml-64",
            isDarkMode ? "text-white" : "text-gray-800"
        )}>
            <div className="container mx-auto flex justify-between items-center">
                <div>
                    <span className="font-semibold">{selectedVideos.length} video{selectedVideos.length > 1 ? 's' : ''} selected</span>
                </div>
                <div className="flex space-x-2">
                    <Button size="sm" onClick={() => handleAction('download')}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                    </Button>
                    <Button size="sm" onClick={() => handleAction('duplicate')}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                    </Button>
                    {selectedVideos.length >= 2 && (
                        <Button size="sm" disabled={!isProUser} onClick={() => handleAction('merge')}>
                            <Merge className="h-4 w-4 mr-2" />
                            Merge
                            {!isProUser && <Badge variant="secondary" className="ml-2">PRO</Badge>}
                        </Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={() => handleAction('delete')}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Footer;