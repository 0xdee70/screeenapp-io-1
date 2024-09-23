import React, { useRef, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RecordRTC from "recordrtc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Video, Camera, Monitor, LogOut, Clock, ChevronDown, ChevronUp, Database, Download, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

// Define a colorful palette
const colors = {
    primary: "bg-blue-500 hover:bg-blue-600 text-white",
    secondary: "bg-purple-500 hover:bg-purple-600 text-white",
    accent: "bg-pink-500 hover:bg-pink-600 text-white",
    success: "bg-green-500 hover:bg-green-600 text-white",
    warning: "bg-yellow-500 hover:bg-yellow-600 text-black",
    danger: "bg-red-500 hover:bg-red-600 text-white",
};

const RecordingControls = ({ isRecording, isLoading, recordingMode, handleStart, handleStop, handleSave, saveRecordingLocally, recordedTime, recordingBlobs }) => (
    <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <Button
            onClick={isRecording ? handleStop : handleStart}
            disabled={(!isRecording && !recordingMode) || isLoading}
            className={cn("w-48 h-12 text-lg font-semibold", isRecording ? colors.danger : colors.success)}
        >
            {isLoading ? 'Processing...' : isRecording ? 'Stop Recording' : 'Start Recording'}
        </Button>

        <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
            <Clock className="mr-2 h-6 w-6 text-blue-500" />
            <span className="text-lg font-semibold text-gray-800">
                {recordedTime > 0
                    ? new Date(recordedTime * 1000).toISOString().substr(11, 8)
                    : "00:00:00"}
            </span>
        </div>

        {recordingBlobs.length > 0 && (
            <div className="flex gap-2">
                <Button onClick={handleSave} disabled={isRecording || isLoading} className={cn("h-12 font-semibold", colors.primary)}>
                    <Database className="mr-2 h-4 w-4" />{recordingBlobs.length > 1 ? "Save All to DB" : "Save to DB"}
                </Button>
                <Button onClick={saveRecordingLocally} disabled={isRecording || isLoading} className={cn("h-12 font-semibold", colors.secondary)}>
                    <Download className="mr-2 h-4 w-4" /> {recordingBlobs.length > 1 ? "Save All Locally" : "Save Locally"}
                </Button>
            </div>
        )}
    </div>
);

const RecordingModes = ({ recordingMode, setRecordingMode, isRecording, isLoading }) => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {['Screen Only', 'Screen + Camera', 'Camera Only'].map((mode) => (
            <Button
                key={mode}
                onClick={() => setRecordingMode(mode)}
                className={cn("h-20", recordingMode === mode ? colors.accent : "bg-gray-200 text-gray-800 hover:bg-gray-300")}
                disabled={isRecording || isLoading}
            >
                <div className="flex flex-col items-center">
                    {mode === 'Screen Only' && <Monitor className="h-6 w-6 mb-2" />}
                    {mode === 'Screen + Camera' && <Video className="h-6 w-6 mb-2" />}
                    {mode === 'Camera Only' && <Camera className="h-6 w-6 mb-2" />}
                    <span className="text-sm">{mode}</span>
                </div>
            </Button>
        ))}
    </div>
);

const Instructions = ({ showInstructions, setShowInstructions }) => (
    <Card className="lg:col-span-1">
        <CardContent className="p-6">
            <Collapsible open={showInstructions} onOpenChange={setShowInstructions}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-primary">Instructions</h2>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                            {showInstructions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                    </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>Select a recording mode from the options above.</li>
                        <li>Click 'Start Recording' to begin capturing your screen and/or camera.</li>
                        <li>When finished, click 'Stop Recording' to end the capture.</li>
                        <li>Preview your recording in the video player(s) below.</li>
                        <li>Click 'Save All to DB' to store your videos in the database or 'Save All Locally' to download.</li>
                    </ol>
                </CollapsibleContent>
            </Collapsible>
        </CardContent>
    </Card>
);

const RecordedVideos = ({ recordingBlobs, handleSaveBulk, handleDiscardBulk }) => {
    const [editMode, setEditMode] = useState(false);
    const [selectedVideos, setSelectedVideos] = useState([]);
    const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
    const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);

    const toggleVideoSelection = (index, type) => {
        const key = `${index}-${type}`;
        setSelectedVideos(prev =>
            prev.includes(key)
                ? prev.filter(item => item !== key)
                : [...prev, key]
        );
    };

    const handleSaveSelected = () => {
        const videosToSave = selectedVideos.map(key => {
            const [index, type] = key.split('-');
            return { index: parseInt(index), type };
        });
        handleSaveBulk(videosToSave);
        setEditMode(false);
        setSelectedVideos([]);
        setIsSaveDialogOpen(false);
    };

    const handleDiscardSelected = () => {
        const videosToDiscard = selectedVideos.map(key => {
            const [index, type] = key.split('-');
            return { index: parseInt(index), type };
        });
        handleDiscardBulk(videosToDiscard);
        setEditMode(false);
        setSelectedVideos([]);
        setIsDiscardDialogOpen(false);
    };

    return (
        <div className="mt-8 space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-blue-600">Recorded Videos</h2>
                <Button onClick={() => setEditMode(!editMode)} className={cn(colors.secondary)}>
                    {editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
                </Button>
            </div>
            {editMode && (
                <div className="flex justify-end space-x-2 mb-4">
                    <AlertDialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
                        <AlertDialogTrigger asChild>
                            <Button disabled={selectedVideos.length === 0} className={cn(colors.success)}>
                                Save Selected
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white border-2 border-blue-500">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-blue-600">Save Selected Recordings</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action will save the selected recordings to the database. Do you want to proceed?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className={cn(colors.secondary)} onClick={() => setIsSaveDialogOpen(false)}>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleSaveSelected} className={cn(colors.success)}>Save</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog open={isDiscardDialogOpen} onOpenChange={setIsDiscardDialogOpen}>
                        <AlertDialogTrigger asChild>
                            <Button disabled={selectedVideos.length === 0} className={cn(colors.danger)}>
                                Discard Selected
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white border-2 border-red-500">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-red-600">Discard Selected Recordings</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action will permanently discard the selected recordings. Do you want to proceed?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className={cn(colors.secondary)} onClick={() => setIsDiscardDialogOpen(false)}>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDiscardSelected} className={cn(colors.danger)}>Discard</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recordingBlobs.map(({ webcamVideo, screenVideo }, index) => (
                    <React.Fragment key={index}>
                        {webcamVideo && (
                            <Card className={cn("border-2", editMode && selectedVideos.includes(`${index}-webcam`) ? 'border-pink-500' : 'border-gray-200')}>
                                <CardContent className="p-4">
                                    <h3 className="text-lg font-medium mb-2 text-purple-600">Webcam Video {index + 1}</h3>
                                    <video controls className="w-full rounded-lg">
                                        <source src={URL.createObjectURL(webcamVideo)} type="video/webm" />
                                        Your browser does not support the video tag.
                                    </video>
                                    {editMode && (
                                        <Button
                                            onClick={() => toggleVideoSelection(index, 'webcam')}
                                            className={cn("mt-2 w-full", selectedVideos.includes(`${index}-webcam`) ? colors.accent : colors.secondary)}
                                        >
                                            {selectedVideos.includes(`${index}-webcam`) ? 'Selected' : 'Select'}
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                        {screenVideo && (
                            <Card className={cn("border-2", editMode && selectedVideos.includes(`${index}-screen`) ? 'border-pink-500' : 'border-gray-200')}>
                                <CardContent className="p-4">
                                    <h3 className="text-lg font-medium mb-2 text-blue-600">Screen Video {index + 1}</h3>
                                    <video controls className="w-full rounded-lg">
                                        <source src={URL.createObjectURL(screenVideo)} type="video/webm" />
                                        Your browser does not support the video tag.
                                    </video>
                                    {editMode && (
                                        <Button
                                            onClick={() => toggleVideoSelection(index, 'screen')}
                                            className={cn("mt-2 w-full", selectedVideos.includes(`${index}-screen`) ? colors.accent : colors.secondary)}
                                        >
                                            {selectedVideos.includes(`${index}-screen`) ? 'Selected' : 'Select'}
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

const PreviousRecordings = ({ previousRecordings, isPreviousLoading, handleDelete, setDeleteId }) => (
    <div className="mt-8 space-y-6">
        <h2 className="text-2xl font-semibold text-blue-600 mb-4">Previous Recordings</h2>
        {isPreviousLoading ? (
            <div className="text-center">
                <p className="text-gray-600">Loading previous recordings...</p>
            </div>
        ) : previousRecordings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {previousRecordings.map((recording, index) => (
                    <Card key={recording._id} className="border-2 border-gray-200">
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-medium text-purple-600">Recording {index + 1}</h3>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button className={cn("p-2", colors.danger)} onClick={() => setDeleteId(recording._id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-white border-2 border-red-500">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="text-red-600">Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete your recording.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className={cn(colors.secondary)}>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(recording._id)} className={cn(colors.danger)}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                            {recording.webcamVideo && (
                                <video controls className="w-full rounded-lg mb-2">
                                    <source src={recording.webcamVideo} type="video/webm" />
                                    Your browser does not support the video tag.
                                </video>
                            )}
                            {recording.screenVideo && (
                                <video controls className="w-full rounded-lg">
                                    <source src={recording.screenVideo} type="video/webm" />
                                    Your browser does not support the video tag.
                                </video>
                            )}
                            <p className="text-sm text-gray-600 mt-2">Recorded on: {new Date(recording.createdAt).toLocaleString()}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        ) : (
            <div className="text-center">
                <p className="text-gray-600">No previous recordings found.</p>
            </div>
        )}
    </div>
);

const ScreenRecord = () => {
    const [recordingBlobs, setRecordingBlobs] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [error, setError] = useState("");
    const [recordingMode, setRecordingMode] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showInstructions, setShowInstructions] = useState(true);
    const webCamRef = useRef(null);
    const screenRef = useRef(null);
    const recorderRef = useRef(null);
    const navigate = useNavigate();
    const [recordedTime, setRecordedTime] = useState(0);
    const startTimeRef = useRef(null);
    const [previousRecordings, setPreviousRecordings] = useState([]);
    const [activeTab, setActiveTab] = useState("current");
    const [isPreviousLoading, setIsPreviousLoading] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        if (activeTab === "previous" && previousRecordings.length === 0) {
            fetchPreviousRecordings();
        }
    }, [activeTab]);

    const fetchPreviousRecordings = async () => {
        setIsPreviousLoading(true);
        setError("");
        try {
            const token = localStorage.getItem("accessToken");
            const response = await fetch("http://localhost:5000/api/recordings", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error("Failed to fetch previous recordings");
            }
            const data = await response.json();
            setPreviousRecordings(data.map(recording => ({
                ...recording,
                webcamVideo: recording.webcamVideo ? URL.createObjectURL(new Blob([new Uint8Array(recording.webcamVideo.data)], { type: 'video/webm' })) : null,
                screenVideo: recording.screenVideo ? URL.createObjectURL(new Blob([new Uint8Array(recording.screenVideo.data)], { type: 'video/webm' })) : null,
            })));
        } catch (error) {
            console.error("Error fetching previous recordings:", error);
            setError("Failed to fetch previous recordings. Please try again.");
        } finally {
            setIsPreviousLoading(false);
        }
    };

    const handleTabChange = (value) => {
        setActiveTab(value);
        setError("");
    };

    const handleLogout = useCallback(() => {
        localStorage.removeItem("accessToken");
        navigate("/login");
    }, [navigate]);

    useEffect(() => {
        let timer;
        if (isRecording) {
            timer = setInterval(() => setRecordedTime((prev) => prev + 1), 1000);
        } else if (!isRecording && recordedTime > 0) {
            setRecordedTime(recordedTime);
        }
        return () => clearInterval(timer);
    }, [isRecording, recordedTime]);

    const handleStart = useCallback(async () => {
        if (!recordingMode) {
            setError("Please select a recording mode.");
            return;
        }

        setIsLoading(true);
        try {
            let screenStream, cameraStream;

            if (recordingMode !== 'Camera Only') {
                screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: { width: 1920, height: 1080, frameRate: 30 },
                    audio: true,
                });
            }

            if (recordingMode !== 'Screen Only') {
                cameraStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });
            }

            const screenRecorder = screenStream ? new RecordRTC(screenStream, { type: "video" }) : null;
            const camRecorder = cameraStream ? new RecordRTC(cameraStream, { type: "video" }) : null;

            if (screenRecorder) screenRecorder.startRecording();
            if (camRecorder) camRecorder.startRecording();

            webCamRef.current = cameraStream;
            screenRef.current = screenStream;
            recorderRef.current = { webcam: camRecorder, screen: screenRecorder };

            setIsRecording(true);
            setError("");
            startTimeRef.current = Date.now();
        } catch (error) {
            console.error("Error starting recording: ", error);
            setError("Failed to start recording. Please check your permissions and try again.");
        } finally {
            setIsLoading(false);
        }
    }, [recordingMode]);

    const handleStop = useCallback(async () => {
        if (!recorderRef.current) return;

        setIsLoading(true);
        const { webcam, screen } = recorderRef.current;

        try {
            const stopPromises = [];
            if (webcam) stopPromises.push(new Promise((resolve) => webcam.stopRecording(resolve)));
            if (screen) stopPromises.push(new Promise((resolve) => screen.stopRecording(resolve)));

            await Promise.all(stopPromises);

            const webcamBlob = webcam ? webcam.getBlob() : null;
            const screenBlob = screen ? screen.getBlob() : null;

            setRecordingBlobs((prev) => [...prev, { webcamVideo: webcamBlob, screenVideo: screenBlob }]);

            setIsRecording(false);
            setRecordedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));

            if (webCamRef.current) webCamRef.current.getTracks().forEach((track) => track.stop());
            if (screenRef.current) screenRef.current.getTracks().forEach((track) => track.stop());
        } catch (error) {
            console.error("Error stopping recording: ", error);
            setError("Failed to stop recording. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleSave = useCallback(async () => {
        if (recordingBlobs.length === 0) {
            setError("No recordings available to save.");
            return;
        }

        setIsLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            for (const { webcamVideo, screenVideo } of recordingBlobs) {
                const formData = new FormData();
                if (webcamVideo) formData.append("webcamVideo", webcamVideo, "webcamVideo.webm");
                if (screenVideo) formData.append("screenVideo", screenVideo, "screenVideo.webm");

                const response = await fetch("http://localhost:5000/api/recordings", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error("Failed to save recording");
                }
            }
            toast.success(recordingBlobs.length > 1 ? "All recordings saved to database!" : "Recording saved to database!");
            setRecordingBlobs([]);
        } catch (error) {
            console.error("Error saving recordings to the database:", error);
            setError("Failed to save all recordings. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [recordingBlobs]);

    const saveRecordingLocally = useCallback(() => {
        if (recordingBlobs.length === 0) {
            setError("No recordings available to save.");
            return;
        }

        recordingBlobs.forEach(({ webcamVideo, screenVideo }, index) => {
            if (webcamVideo) {
                const url = URL.createObjectURL(webcamVideo);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `webcam-recording-${index + 1}.webm`;
                document.body.appendChild(a);
                a.click();
                URL.revokeObjectURL(url);
            }

            if (screenVideo) {
                const url = URL.createObjectURL(screenVideo);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `screen-recording-${index + 1}.webm`;
                document.body.appendChild(a);
                a.click();
                URL.revokeObjectURL(url);
            }
        });

        toast.success("All recordings saved locally!");
    }, [recordingBlobs]);

    const handleDelete = async (id) => {
        setIsLoading(true);
        setError("");
        try {
            const token = localStorage.getItem("accessToken");
            const response = await fetch(`http://localhost:5000/api/recordings/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error("Failed to delete recording");
            }
            setPreviousRecordings(prevRecordings => prevRecordings.filter(recording => recording._id !== id));
            toast.success("Recording deleted successfully!");
        } catch (error) {
            console.error("Error deleting recording:", error);
            setError("Failed to delete recording. Please try again.");
        } finally {
            setIsLoading(false);
            setDeleteId(null);
        }
    };

    const handleSaveBulk = useCallback(async (videosToSave) => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            for (const { index, type } of videosToSave) {
                const { webcamVideo, screenVideo } = recordingBlobs[index];
                const formData = new FormData();
                if (type === 'webcam' && webcamVideo) formData.append("webcamVideo", webcamVideo, "webcamVideo.webm");
                if (type === 'screen' && screenVideo) formData.append("screenVideo", screenVideo, "screenVideo.webm");

                const response = await fetch("http://localhost:5000/api/recordings", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error("Failed to save recording");
                }
            }
            toast.success("Selected recordings saved to database!");
            setRecordingBlobs(prev => prev.filter((_, i) => !videosToSave.some(v => v.index === i)));
        } catch (error) {
            console.error("Error saving recordings to the database:", error);
            setError("Failed to save selected recordings. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [recordingBlobs]);

    const handleDiscardBulk = useCallback((videosToDiscard) => {
        setRecordingBlobs(prev => prev.filter((_, i) => !videosToDiscard.some(v => v.index === i)));
        toast.success("Selected recordings discarded!");
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
            <div className="max-w-full mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-blue-600">Screen Recorder</h1>
                    <Button onClick={handleLogout} className={cn(colors.danger)}>
                        <LogOut className="mr-2 h-4 w-4" /> Logout
                    </Button>
                </div>

                {error && (
                    <Alert variant="destructive" className="mb-6 bg-red-100 border-2 border-red-500 text-red-700">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
                    <TabsList className="grid w-full grid-cols-2 bg-gray-200 p-1 rounded-lg">
                        <TabsTrigger value="current" className={cn("rounded-md", activeTab === "current" ? colors.primary : "bg-transparent text-gray-600")}>New Recording</TabsTrigger>
                        <TabsTrigger value="previous" className={cn("rounded-md", activeTab === "previous" ? colors.primary : "bg-transparent text-gray-600")}>Previous Recordings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="current">
                        <Card className="border-2 border-blue-200">
                            <CardContent className="p-6">
                                <RecordingModes
                                    recordingMode={recordingMode}
                                    setRecordingMode={setRecordingMode}
                                    isRecording={isRecording}
                                    isLoading={isLoading}
                                />
                                <RecordingControls
                                    isRecording={isRecording}
                                    isLoading={isLoading}
                                    recordingMode={recordingMode}
                                    handleStart={handleStart}
                                    handleStop={handleStop}
                                    handleSave={handleSave}
                                    saveRecordingLocally={saveRecordingLocally}
                                    recordedTime={recordedTime}
                                    recordingBlobs={recordingBlobs}
                                />
                            </CardContent>
                        </Card>

                        <Instructions
                            showInstructions={showInstructions}
                            setShowInstructions={setShowInstructions}
                        />

                        {recordingBlobs.length > 0 && (
                            <RecordedVideos
                                recordingBlobs={recordingBlobs}
                                handleSaveBulk={handleSaveBulk}
                                handleDiscardBulk={handleDiscardBulk}
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="previous">
                        <PreviousRecordings
                            previousRecordings={previousRecordings}
                            isPreviousLoading={isPreviousLoading}
                            handleDelete={handleDelete}
                            setDeleteId={setDeleteId}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default ScreenRecord;