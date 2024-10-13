import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MainContent from '@/components/MainContent';
import SearchOverlay from '@/components/SearchOverlay';
import { cn } from "@/lib/utils";
import { Video, FileText, UserPlus, AlertCircle, CheckCircle, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import Footer from '@/components/Footer';
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';



import ScreenRecord from '@/pages/ScreenRecord'; // Import the ScreenRecord component

const navItems = [
    {
        title: "General",
        children: [
            { title: "Videos", icon: Video },
            { title: "Files", icon: FileText },
            { title: "Invite Friends", icon: UserPlus },
        ],
    },
];

const Dashboard = () => {
    const [userProfile, setUserProfile] = useState(null);
    const [recordings, setRecordings] = useState([]);
    const [selectedVideos, setSelectedVideos] = useState([]);
    const [viewMode, setViewMode] = useState('grid');
    const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const searchInputRef = useRef(null);
    const [isProUser, setIsProUser] = useState(false);
    const navigate = useNavigate();

    const maxFreeVideos = 10;
    const remainingVideos = Math.max(0, maxFreeVideos - recordings.length);
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [uploadError, setUploadError] = useState(null);
    const [uploadProgress, setUploadProgress] = useState({});
    const fileInputRef = useRef(null);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
    const [videoCount, setVideoCount] = useState(0);
    const [isRecording, setIsRecording] = useState(false); // New state to track recording mode
    const [isUploading, setIsUploading] = useState(false);
    const [currentView, setCurrentView] = useState('library'); // Add this line

    useEffect(() => {
        fetchUserProfile();
        fetchRecordings();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                toast.error("Please log in again");
                navigate('/login');
                return;
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },


            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('accessToken');
                    navigate('/login');
                    return;
                }
                throw new Error(`Failed to fetch user profile: ${response.statusText}`);
            }

            const data = await response.json();
            setUserProfile(data);
        } catch (error) {
            toast.error("Failed to fetch user profile: " + error.message);
        }
    };

    const fetchRecordings = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/recordings`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch recordings');
            }
            const data = await response.json();
            setRecordings(data);
            setVideoCount(data.length);
        } catch (error) {
            toast.error("Failed to fetch recordings");
        }
    };

    const handleDeleteVideo = async (videoId) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/recordings/${videoId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to delete video');
            }
            setRecordings(prevRecordings => prevRecordings.filter(video => video.id !== videoId));
            setVideoCount(prevCount => prevCount - 1);
            toast.success(`Video ${videoId} deleted successfully!`);
        } catch (error) {
            toast.error("Failed to delete video");
        }
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                setIsSearchActive(true);
            } else if (event.key === "Escape") {
                setIsSearchActive(false);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        if (isSearchActive) {
            searchInputRef.current?.focus();
        }
    }, [isSearchActive]);

    useEffect(() => {
        const handleMouseMove = (event) => {
            if (event.clientX <= 10 && isCollapsed) {
                setIsCollapsed(false);
            }
        };

        document.addEventListener("mousemove", handleMouseMove);
        return () => document.removeEventListener("mousemove", handleMouseMove);
    }, [isCollapsed]);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const closeSearch = () => {
        setIsSearchActive(false);
        setSearchQuery("");
    };

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    const handleSelectAll = () => {
        if (selectedVideos.length === filteredVideos.length) {
            setSelectedVideos([]);
        } else {
            setSelectedVideos(filteredVideos.map(video => video._id));
        }
    };

    const handleSelect = (videoId) => {
        setSelectedVideos(prev =>
            prev.includes(videoId)
                ? prev.filter(id => id !== videoId)
                : [...prev, videoId]
        );
    };

    const handleAction = (action) => {
        // Implement the actual action logic here
    };

    const handleUpgradeClick = () => {
        setIsUpgradeDialogOpen(true);
    };

    const handleUpgradeConfirm = () => {
        setIsUpgradeDialogOpen(false);
        navigate('/billing'); // Navigate to the billing page
    };

    const filteredVideos = searchQuery
        ? recordings.filter(video =>
            (video.title && video.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (video.tags && video.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))))
        : recordings;

    const handleUploadClick = () => {
        if (!isProUser && videoCount >= maxFreeVideos) {
            toast.error("You've reached the maximum number of free videos. Please upgrade to continue uploading.");
            return;
        }
        setIsUploadDialogOpen(true);
        setUploadedFiles([]);
        setUploadError(null);
        setUploadProgress({});
    };

    const validateFiles = (files) => {
        const validFiles = [];
        const errors = [];

        Array.from(files).forEach(file => {
            if (file.type.startsWith('video/')) {
                if (file.size <= 100 * 1024 * 1024) { // 100MB limit
                    validFiles.push(file);
                } else {
                    errors.push(`${file.name} exceeds the 100MB size limit.`);
                }
            } else {
                errors.push(`${file.name} is not a valid video file.`);
            }
        });

        return { validFiles, errors };
    };

    const handleFileSelect = (event) => {
        const { validFiles, errors } = validateFiles(event.target.files);
        setUploadedFiles(validFiles);
        setUploadError(errors.length > 0 ? errors.join('\n') : null);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const { validFiles, errors } = validateFiles(event.dataTransfer.files);
        setUploadedFiles(validFiles);
        setUploadError(errors.length > 0 ? errors.join('\n') : null);
    };

    const handleUploadConfirm = async () => {
        setIsUploading(true);
        setUploadError(null);

        for (const file of uploadedFiles) {
            const formData = new FormData();
            formData.append('uploaded', file);
            formData.append('title', file.name); // Use the full filename as the title

            try {
                const token = localStorage.getItem('accessToken');
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/recordings/upload`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                console.log("Upload result:", result);

                // Update the recordings state with the new videos
                if (result.recordings && result.recordings.length > 0) {
                    setRecordings(prevRecordings => [...prevRecordings, ...result.recordings]);
                    setVideoCount(prevCount => prevCount + result.recordings.length);
                    result.recordings.forEach(recording => {
                        toast.success(`${recording.title} uploaded successfully!`);
                    });
                } else {
                    throw new Error('No recordings data in the response');
                }
            } catch (error) {
                console.error("Error uploading file:", error);
                setUploadError(`Failed to upload ${file.name}. Please try again.`);
                toast.error(`Failed to upload ${file.name}`);
            }
        }

        setIsUploading(false);
        setUploadedFiles([]);
        setIsUploadDialogOpen(false);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleRemoveFile = (indexToRemove) => {
        setUploadedFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
        if (uploadedFiles.length === 1) {
            setUploadError(null);
            setUploadProgress({});
        }
    };

    const handlePlayVideo = (video) => {
        console.log("Full video object:", video);
        const token = localStorage.getItem('accessToken');
        let videoKey = video.uploadedKey || video.screenVideoKey || video.webcamVideoKey;

        if (!videoKey) {
            toast.error("No video key available for this recording");
            return;
        }

        let videoUrl = `${import.meta.env.VITE_API_URL}/api/recordings/stream/${videoKey}?token=${token}`;

        console.log("Selected video URL:", videoUrl);

        setSelectedVideo({ ...video, url: videoUrl });
        setIsVideoDialogOpen(true);
    };

    const closeVideoDialog = () => {
        setIsVideoDialogOpen(false);
        setSelectedVideo(null);
    };



    const handleEditVideo = (video) => {
        toast.info("Edit functionality coming soon!");
        console.log("Editing video:", video);
    };

    const handleShareVideo = (video) => {
        toast.info("Share functionality coming soon!");
        console.log("Sharing video:", video);
    };

    const handleDownloadVideo = async (video) => {
        try {
            console.log("Video object received:", video);
            const token = localStorage.getItem('accessToken');
            const videoKey = video.uploadedKey || video.screenVideoKey || video.webcamVideoKey;

            console.log("Extracted videoKey:", videoKey);

            if (!videoKey) {
                throw new Error('No video key available');
            }

            const url = `${import.meta.env.VITE_API_URL}/api/recordings/download/${encodeURIComponent(videoKey)}`;
            console.log("Request URL:", url);

            console.log("Attempting to download video with key:", videoKey);

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log("Response status:", response.status);
            console.log("Response headers:", response.headers);

            if (!response.ok) {
                const errorText = await response.text();
                console.log("Error response text:", errorText);
                throw new Error(`Failed to download video: ${response.statusText}. Server response: ${errorText}`);
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = downloadUrl;
            a.download = videoKey;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(a);

            toast.success(`Video ${videoKey} downloaded successfully!`);
        } catch (error) {
            console.error("Error downloading video:", error);
            toast.error(`Failed to download video: ${error.message}`);
        }
    };

    const handleTrimVideo = (video) => {
        toast.info("Video trimming feature coming soon!");
        console.log("Trimming video:", video);
    };

    const handleDuplicateVideo = (video) => {
        toast.info("Duplicate video feature coming soon!");
        console.log("Duplicating video:", video);
    };

    const handlePinVideo = (videoId) => {
        // Implement pin logic here
        toast.success(`Video ${videoId} pinned successfully!`);
        console.log("Pinning video:", videoId);
        // You might want to update the video list or user preferences here
    };

    const handleAnalyticsVideo = (video) => {
        toast.info("Video analytics feature coming soon!");
        console.log("Viewing analytics for video:", video);
    };

    const handleLibraryClick = () => {
        setCurrentView('library');
    };

    const handleRecordClick = () => {
        if (!isProUser && videoCount >= maxFreeVideos) {
            toast.error("You've reached the maximum number of free videos. Please upgrade to continue recording.");
            return;
        }
        setCurrentView('record');
    };

    return (
        <div className={cn(
            "flex flex-col min-h-screen transition-all duration-300 ease-in-out",
            isDarkMode ? "bg-gray-900 text-white" : "bg-white text-gray-800"
        )}>
            <Header
                isDarkMode={isDarkMode}
                toggleSidebar={toggleSidebar}
                isProUser={isProUser}
                handleUpgradeClick={handleUpgradeClick}
                handleUploadClick={handleUploadClick}
                handleRecordClick={handleRecordClick}
                handleLibraryClick={handleLibraryClick} // Add this line
                userProfile={userProfile}
                videoCount={videoCount}
                maxFreeVideos={maxFreeVideos}
                currentView={currentView} // Add this line
            />

            <div className="flex flex-1 pt-16">
                <Sidebar
                    isCollapsed={isCollapsed}
                    isDarkMode={isDarkMode}
                    navItems={navItems}
                    handleUpgradeClick={handleUpgradeClick}
                    toggleDarkMode={toggleDarkMode}
                    toggleSidebar={toggleSidebar}
                />

                <div className="flex-1 overflow-auto">
                    {currentView === 'record' ? (
                        <ScreenRecord onFinish={() => setCurrentView('library')} />
                    ) : (
                        <MainContent
                            isCollapsed={isCollapsed}
                            isDarkMode={isDarkMode}
                            setIsSearchActive={setIsSearchActive}
                            setViewMode={setViewMode}
                            viewMode={viewMode}
                            isProUser={isProUser}
                            videos={recordings}
                            maxFreeVideos={maxFreeVideos}
                            remainingVideos={remainingVideos}
                            handleUpgradeClick={handleUpgradeClick}
                            filteredVideos={filteredVideos}
                            selectedVideos={selectedVideos}
                            handleSelect={handleSelect}
                            handleSelectAll={handleSelectAll}
                            onDeleteVideo={handleDeleteVideo}
                            onPlayVideo={handlePlayVideo}
                            onEditVideo={handleEditVideo}
                            onShareVideo={handleShareVideo}
                            onDownloadVideo={handleDownloadVideo}
                            onTrimVideo={handleTrimVideo}
                            onDuplicateVideo={handleDuplicateVideo}
                            onPinVideo={handlePinVideo}
                            onAnalyticsVideo={handleAnalyticsVideo}
                        />
                    )}
                </div>
            </div>

            <Footer
                isCollapsed={isCollapsed}
                isDarkMode={isDarkMode}
                selectedVideos={selectedVideos}
                handleAction={handleAction}
                isProUser={isProUser}
            />

            <SearchOverlay
                isSearchActive={isSearchActive}
                searchQuery={searchQuery}
                handleSearchChange={handleSearchChange}
                closeSearch={closeSearch}
                filteredVideos={filteredVideos}
                searchInputRef={searchInputRef}
            />

            {/* Upgrade to Pro Dialog */}
            <AlertDialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
                <AlertDialogContent className={isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Upgrade to Pro</AlertDialogTitle>
                        <AlertDialogDescription>
                            Unlock advanced features and remove limits by upgrading to our Pro plan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <h3 className="font-semibold mb-2">Pro Plan Features:</h3>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Unlimited video uploads</li>
                            <li>Advanced analytics</li>
                            <li>Team collaboration tools</li>
                            <li>Priority support</li>
                        </ul>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsUpgradeDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpgradeConfirm}>Upgrade Now</Button>
                    </div>
                </AlertDialogContent>
            </AlertDialog>

            {/* Upload Dialog */}
            <Dialog open={isUploadDialogOpen} onOpenChange={(open) => {
                if (!isUploading) {
                    setIsUploadDialogOpen(open);
                }
            }}>
                <DialogContent className={cn(
                    "sm:max-w-[425px]",
                    isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
                )}>
                    <DialogHeader>
                        <DialogTitle>Upload Video</DialogTitle>
                    </DialogHeader>
                    {uploadedFiles.length === 0 ? (
                        <div
                            className="border-2 border-dashed rounded-lg p-8 text-center"
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                className="hidden"
                                accept="video/*"
                                multiple
                            />
                            <p className="mb-4">Drag and drop your video files here</p>
                            <p className="mb-4">or</p>
                            <Button onClick={() => fileInputRef.current?.click()}>
                                Choose from device
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {uploadedFiles.map((file, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                        <video className="w-20 h-20 object-cover rounded">
                                            <source src={URL.createObjectURL(file)} type={file.type} />
                                        </video>
                                        <div className="flex-grow">
                                            <p className="font-semibold">{file.name}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveFile(index)}
                                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                            disabled={isUploading}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {uploadProgress[file.name] !== undefined && (
                                        <div className="space-y-1">
                                            <Progress value={uploadProgress[file.name]} className="w-full" />
                                            <p className="text-sm text-right">{uploadProgress[file.name].toFixed(2)}% Uploaded</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    {uploadError && (
                        <div className="mt-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-100">
                            <AlertCircle className="inline-block mr-2" />
                            {uploadError}
                        </div>
                    )}
                    <DialogFooter>
                        {uploadedFiles.length > 0 && (
                            <Button
                                onClick={handleUploadConfirm}
                                disabled={isUploading}
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    'Confirm Upload'
                                )}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Video Playback Dialog */}
            <Dialog open={isVideoDialogOpen} onOpenChange={closeVideoDialog}>
                <DialogContent className={cn(
                    "sm:max-w-[80vw] sm:max-h-[80vh]",
                    isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
                )}>
                    <DialogHeader>
                        <DialogTitle>{selectedVideo?.title}</DialogTitle>
                    </DialogHeader>
                    <div className="w-full">
                        {selectedVideo && (
                            <>
                                <video
                                    controls
                                    className="w-3/4"
                                    onError={(e) => {
                                        console.error("Video error event:", e);
                                        console.error("Video error object:", e.target.error);
                                        console.error("Video element:", e.target);
                                        console.error("Current src:", e.target.src);
                                        console.error("Network state:", e.target.networkState);
                                        console.error("Ready state:", e.target.readyState);
                                    }}
                                >
                                    <source
                                        src={selectedVideo.url}
                                        type="video/mp4"
                                    />
                                    Your browser does not support the video tag.
                                </video>

                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
};

export default Dashboard;