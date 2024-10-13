import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Play, Share2, BarChart2, MoreHorizontal, Pencil, Scissors, Copy, Merge, FolderInput, Download, Pin, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const VideoCard = ({
    video,
    isSelected,
    onSelect,
    viewMode,
    isDarkMode,
    onDelete,
    onPlay,
    onEdit,
    onShare,
    onDownloadVideo,
    onTrim,
    onDuplicate,
    onPin,
    onAnalytics,
    isProUser
}) => {
    const handleAction = (action, videoData) => {
        if (typeof action === 'function') {
            action(videoData);
        } else {
            console.warn(`Action is not a function for ${videoData.title}`);
        }
    };

    // Determine which key to use for playing the video
    const playVideoKey = video.webcamVideoKey || video.screenVideoKey;

    return (
        <Card className={cn(
            "overflow-hidden",
            viewMode === 'tile' ? "flex" : "",
            isDarkMode ? "bg-gray-800 text-white" : "bg-white"
        )}>
            <CardContent className={cn("p-0", viewMode === 'tile' ? "flex" : "")}>
                <div className={`relative ${viewMode === 'tile' ? 'w-1/3' : ''}`}>
                    {video.thumbnailUrl ? (
                        <img src={video.thumbnailUrl} alt={video.title} className="w-full h-auto" />
                    ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500">No Thumbnail Available</span>
                        </div>
                    )}
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                        {video.duration}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-black bg-opacity-50 text-white"
                        onClick={() => onPlay(video)} // Pass the entire video object
                    >
                        <Play className="h-4 w-4" />
                    </Button>
                    <div className="absolute top-2 left-2">
                        <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => onSelect(video.id)}
                            className="bg-white bg-opacity-70"
                        />
                    </div>
                </div>
                <div className={`p-4 ${viewMode === 'tile' ? 'w-2/3' : ''}`}>
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg">{video.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                        Created at {new Date(video.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handleAction(onShare, video)}>
                                <Share2 className="h-4 w-4 mr-2" />
                                Share
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleAction(onAnalytics, video)}>
                                <BarChart2 className="h-4 w-4 mr-2" />
                                Analytics
                            </Button>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={() => handleAction(onEdit, video)}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleAction(onTrim, video)}>
                                    <Scissors className="h-4 w-4 mr-2" />
                                    Trim
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleAction(onDuplicate, video)}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem disabled={!isProUser}>
                                    <Merge className="h-4 w-4 mr-2" />
                                    Merge
                                    {!isProUser && <Badge variant="secondary" className="ml-2">PRO</Badge>}
                                </DropdownMenuItem>
                                <DropdownMenuItem disabled={!isProUser}>
                                    <FolderInput className="h-4 w-4 mr-2" />
                                    Move/Copy
                                    {!isProUser && <Badge variant="secondary" className="ml-2">PRO</Badge>}
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleAction(onDownloadVideo, video)}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleAction(onPin, video)}>
                                    <Pin className="h-4 w-4 mr-2" />
                                    Pin
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600" onSelect={() => handleAction(onDelete, video.id)}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default VideoCard;
