import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Video } from "lucide-react";
import { cn } from "@/lib/utils";

const SearchOverlay = ({ isSearchActive, searchQuery, handleSearchChange, closeSearch, filteredVideos, searchInputRef, isDarkMode }) => {
    if (!isSearchActive) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
            <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={closeSearch}></div>
            <div className={cn(
                "w-full max-w-2xl rounded-lg shadow-lg overflow-hidden relative",
                isDarkMode ? "bg-gray-800" : "bg-white"
            )}>
                <div className="relative">
                    <Search className={cn(
                        "absolute left-4 top-3.5 h-5 w-5",
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                    )} />
                    <Input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search videos..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className={cn(
                            "w-full pl-11 pr-16 py-3 focus:outline-none text-lg border-none",
                            isDarkMode ? "bg-gray-800 text-white placeholder-gray-400" : "bg-white text-gray-800 placeholder-gray-500"
                        )}
                    />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={closeSearch}
                        className={cn(
                            "absolute right-2 top-2",
                            isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-800"
                        )}
                    >
                        Esc
                    </Button>
                </div>
                {searchQuery && (
                    <div className={cn(
                        "p-4",
                        isDarkMode ? "bg-gray-700" : "bg-gray-100"
                    )}>
                        {filteredVideos.length > 0 ? (
                            <ul className="space-y-2">
                                {filteredVideos.map(video => (
                                    <li key={video.id} className="flex items-center space-x-2">
                                        <Video className={cn(
                                            "h-4 w-4",
                                            isDarkMode ? "text-gray-400" : "text-gray-600"
                                        )} />
                                        <span className={cn(
                                            "text-sm",
                                            isDarkMode ? "text-gray-200" : "text-gray-700"
                                        )}>{video.title}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className={cn(
                                "text-sm",
                                isDarkMode ? "text-gray-400" : "text-gray-600"
                            )}>No results found for "{searchQuery}"</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchOverlay;