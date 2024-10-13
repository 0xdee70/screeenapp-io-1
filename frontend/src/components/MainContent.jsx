import React from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Search, List, Grid, Video, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import VideoCard from './VideoCard';

const MainContent = ({
    isCollapsed,
    isDarkMode,
    setIsSearchActive,
    setViewMode,
    viewMode,
    isProUser,
    videos,
    maxFreeVideos,
    remainingVideos,
    handleUpgradeClick,
    filteredVideos,
    selectedVideos,
    handleSelect,
    handleSelectAll,
    onDeleteVideo,
    onPlayVideo,
    onEditVideo,
    onShareVideo,
    onDownloadVideo,
    onTrimVideo,
    onDuplicateVideo,
    onPinVideo,
    onAnalyticsVideo
}) => {
    const hasSelectedVideos = selectedVideos.length > 0;

    return (
        <main className={cn(
            "flex-1 overflow-auto p-4 transition-all duration-300 ease-in-out",
            isCollapsed ? "ml-0" : "ml-64",
            isDarkMode ? "bg-gray-900" : "bg-gray-50",
            hasSelectedVideos ? "pb-24" : ""
        )}>
            <div className="container mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Your Videos</h2>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            className={cn(
                                "w-64 justify-start text-sm",
                                isDarkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-700"
                            )}
                            onClick={() => setIsSearchActive(true)}
                        >
                            <Search className="mr-2 h-4 w-4" />
                            Search
                            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                                <span className="text-xs">⌘</span>K
                            </kbd>
                        </Button>
                        {hasSelectedVideos && (
                            <Button
                                variant="outline"
                                onClick={handleSelectAll}
                                className={cn(
                                    isDarkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-700"
                                )}
                            >
                                <CheckSquare className="mr-2 h-4 w-4" />
                                Select All
                            </Button>
                        )}
                        <Button variant="outline" onClick={() => setViewMode('list')}>
                            <List className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" onClick={() => setViewMode('grid')}>
                            <Grid className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {!isProUser && (
                    <Alert className="mb-6">
                        <Video className="h-4 w-4" />
                        <AlertTitle>Video Usage</AlertTitle>
                        <AlertDescription className="flex items-center justify-between">
                            <span>
                                You have used {videos.length} out of {maxFreeVideos} free videos. {remainingVideos} remaining.
                            </span>
                            <Button variant="outline" size="sm" onClick={handleUpgradeClick}>
                                Upgrade Now
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

                <div className={cn(
                    "mt-6",
                    viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"
                )}>
                    {filteredVideos.map((video) => (
                        <VideoCard
                            key={video.id}
                            video={video}
                            viewMode={viewMode}
                            isDarkMode={isDarkMode}
                            isSelected={selectedVideos.includes(video.id)}
                            onSelect={handleSelect}
                            onPlay={onPlayVideo}
                            onDelete={onDeleteVideo}
                            onEdit={onEditVideo}
                            onShare={onShareVideo}
                            onDownloadVideo={onDownloadVideo}  // Change this line
                            onTrim={onTrimVideo}
                            onDuplicate={onDuplicateVideo}
                            onPin={onPinVideo}
                            onAnalytics={onAnalyticsVideo}
                            isProUser={isProUser}
                        />
                    ))}
                </div>

                {filteredVideos.length === 0 && (
                    <div className="text-center mt-8">
                        <p className="text-gray-500 dark:text-gray-400">No videos found.</p>
                    </div>
                )}
            </div>
        </main>
    );
};

export default MainContent;