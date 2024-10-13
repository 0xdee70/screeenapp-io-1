import React from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, Upload, Video, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";

const ProFeatureButton = ({ children, feature, isProUser, handleUpgradeClick }) => {
    if (isProUser) {
        return <Button variant="ghost">{children}</Button>;
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span>
                        <Button variant="ghost" disabled>
                            {children}
                        </Button>
                    </span>
                </TooltipTrigger>
                <TooltipContent className="w-64 p-4">
                    <p className="mb-2">Upgrade to Pro to access {feature}</p>
                    <Button onClick={handleUpgradeClick} size="sm" className="w-full">
                        Upgrade Now
                    </Button>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

const Header = ({
    isDarkMode,
    toggleSidebar,
    isProUser,
    handleUpgradeClick,
    handleUploadClick,
    handleRecordClick,
    handleLibraryClick,
    userProfile,
    videoCount,
    maxFreeVideos,
    currentView
}) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        toast.success("Logged out successfully");
        setTimeout(() => {
            navigate('/login');
        }, 1500);
    };

    const isUploadDisabled = !isProUser && videoCount >= maxFreeVideos;
    const isRecordDisabled = !isProUser && videoCount >= maxFreeVideos;

    const ActionButton = ({ onClick, disabled, title, children }) => {
        if (disabled) {
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span>
                                <Button variant="outline" disabled className="hidden md:flex">
                                    {children}
                                </Button>
                            </span>
                        </TooltipTrigger>
                        <TooltipContent className="w-64 p-4">
                            <p className="mb-2">{title}</p>
                            <Button onClick={handleUpgradeClick} size="sm" className="w-full">
                                Upgrade Now
                            </Button>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        }

        return (
            <Button variant="outline" onClick={onClick} className="hidden md:flex">
                {children}
            </Button>
        );
    };

    return (
        <header className={cn(
            "fixed top-0 left-0 right-0 z-50 border-b",
            isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        )}>
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden">
                            <Menu className="h-6 w-6" />
                        </Button>
                        <h1 className="ml-2 lg:ml-4 text-lg lg:text-xl font-bold">VOID</h1>
                    </div>
                    <nav className="hidden lg:flex items-center space-x-4">
                        <Button
                            variant={currentView === 'library' ? "default" : "ghost"}
                            onClick={handleLibraryClick}
                        >
                            Library
                        </Button>
                        <ProFeatureButton
                            feature="Reports"
                            isProUser={isProUser}
                            handleUpgradeClick={handleUpgradeClick}
                        >
                            Reports
                        </ProFeatureButton>
                        <ProFeatureButton
                            feature="Conversations"
                            isProUser={isProUser}
                            handleUpgradeClick={handleUpgradeClick}
                        >
                            Conversations
                        </ProFeatureButton>
                        <Button variant="ghost">Team</Button>
                        <Button variant="ghost">Help</Button>
                    </nav>
                    <div className="flex items-center space-x-2 md:space-x-4">
                        <ActionButton
                            onClick={handleUploadClick}
                            disabled={isUploadDisabled}
                            title="Upgrade to Pro to upload more videos"
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            <span className="hidden lg:inline">Upload</span>
                        </ActionButton>
                        <ActionButton
                            onClick={handleRecordClick}
                            disabled={isRecordDisabled}
                            title="Upgrade to Pro to record more videos"
                        >
                            <Video className="mr-2 h-4 w-4" />
                            <span className="hidden lg:inline">Record</span>
                        </ActionButton>
                        <MobileMenu
                            handleUploadClick={handleUploadClick}
                            handleRecordClick={handleRecordClick}
                            isUploadDisabled={isUploadDisabled}
                            isRecordDisabled={isRecordDisabled}
                            handleUpgradeClick={handleUpgradeClick}
                        />
                        <UserMenu userProfile={userProfile} handleLogout={handleLogout} />
                    </div>
                </div>
            </div>
        </header>
    );
};

const MobileMenu = ({ handleUploadClick, handleRecordClick, isUploadDisabled, isRecordDisabled, handleUpgradeClick }) => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
                <MoreVertical className="h-5 w-5" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            {isUploadDisabled ? (
                <DropdownMenuItem onClick={handleUpgradeClick}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upgrade to Upload
                </DropdownMenuItem>
            ) : (
                <DropdownMenuItem onClick={handleUploadClick}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                </DropdownMenuItem>
            )}
            {isRecordDisabled ? (
                <DropdownMenuItem onClick={handleUpgradeClick}>
                    <Video className="mr-2 h-4 w-4" />
                    Upgrade to Record
                </DropdownMenuItem>
            ) : (
                <DropdownMenuItem onClick={handleRecordClick}>
                    <Video className="mr-2 h-4 w-4" />
                    Record
                </DropdownMenuItem>
            )}
        </DropdownMenuContent>
    </DropdownMenu>
);

const UserMenu = ({ userProfile, handleLogout }) => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={userProfile?.avatarUrl || "/placeholder.svg?height=32&width=32"} alt={userProfile?.name || "User"} />
                    <AvatarFallback>{userProfile?.name ? userProfile.name[0].toUpperCase() : "U"}</AvatarFallback>
                </Avatar>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userProfile?.name || "Loading..."}</p>
                    <p className="text-xs leading-none text-muted-foreground">{userProfile?.email || "Loading..."}</p>
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
);

export default Header;