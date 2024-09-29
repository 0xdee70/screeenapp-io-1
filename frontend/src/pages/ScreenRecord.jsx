import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast, ToastContainer } from 'react-toastify';
import { colors } from "@/lib/colors";

// Import custom components
import RecordingControls from "@/components/ScreenRecord/RecordingControls";
import RecordingModes from "@/components/ScreenRecord/RecordingModes";
import Instructions from "@/components/ScreenRecord/Instructions";
import RecordedVideos from "@/components/ScreenRecord/RecordedVideos";
import PreviousRecordings from "@/components/ScreenRecord/PreviousRecordings";
import Header from "@/components/ScreenRecord/Header";
import ErrorAlert from "@/components/ScreenRecord/ErrorAlert";

// Import recording utility functions
import {
    startRecording,
    stopRecording,
    saveRecordingToDatabase,
    saveRecordingLocally,
    fetchPreviousRecordings,
    deleteRecording
} from "@/utils/recordingUtils";

const ScreenRecord = () => {
    // State variables
    const [recordingBlobs, setRecordingBlobs] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [error, setError] = useState("");
    const [recordingMode, setRecordingMode] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showInstructions, setShowInstructions] = useState(true);
    const [recordedTime, setRecordedTime] = useState(0);
    const [previousRecordings, setPreviousRecordings] = useState([]);
    const [activeTab, setActiveTab] = useState("current");
    const [isPreviousLoading, setIsPreviousLoading] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const navigate = useNavigate();

    // Fetch previous recordings when the active tab changes
    useEffect(() => {
        if (activeTab === "previous" && previousRecordings.length === 0) {
            fetchPreviousRecordingsData();
        }
    }, [activeTab]);

    // Fetch previous recordings data
    const fetchPreviousRecordingsData = async () => {
        setIsPreviousLoading(true);
        setError("");
        try {
            const data = await fetchPreviousRecordings();
            setPreviousRecordings(data);
        } catch (error) {
            console.error("Error fetching previous recordings:", error);
            setError("Failed to fetch previous recordings. Please try again.");
        } finally {
            setIsPreviousLoading(false);
        }
    };

    // Refresh previous recordings
    const refreshPreviousRecordings = useCallback(async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/recordings`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error("Failed to fetch recordings");
            }
            const data = await response.json();
            setPreviousRecordings(data);
        } catch (error) {
            console.error("Error fetching previous recordings:", error);
            setError("Failed to refresh recordings. Please try again.");
        }
    }, []);

    // Handle tab change
    const handleTabChange = (value) => {
        setActiveTab(value);
        setError("");
    };

    // Handle logout
    const handleLogout = useCallback(() => {
        localStorage.removeItem("accessToken");
        toast.success("Logging you out");
        setTimeout(() => {
            navigate('/login');
        }, 2000);
    }, [navigate]);

    // Update recorded time
    useEffect(() => {
        let timer;
        if (isRecording) {
            timer = setInterval(() => setRecordedTime((prev) => prev + 1), 1000);
        } else if (!isRecording && recordedTime > 0) {
            setRecordedTime(recordedTime);
        }
        return () => clearInterval(timer);
    }, [isRecording, recordedTime]);

    // Handle start recording
    const handleStart = useCallback(async () => {
        if (!recordingMode) {
            setError("Please select a recording mode.");
            return;
        }

        setIsLoading(true);
        try {
            await startRecording(recordingMode);
            setIsRecording(true);
            setError("");
        } catch (error) {
            console.error("Error starting recording: ", error);
            setError("Failed to start recording. Please check your permissions and try again.");
        } finally {
            setIsLoading(false);
        }
    }, [recordingMode]);

    // Handle stop recording
    const handleStop = useCallback(async () => {
        setIsLoading(true);
        try {
            const blobs = await stopRecording();
            setRecordingBlobs((prev) => [...prev, blobs]);
            setIsRecording(false);
        } catch (error) {
            console.error("Error stopping recording: ", error);
            setError("Failed to stop recording. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Handle save recording to database
    const handleSave = useCallback(async () => {
        if (recordingBlobs.length === 0) {
            setError("No recordings available to save.");
            return;
        }


        setIsLoading(true);
        try {
            const result = await saveRecordingToDatabase(recordingBlobs);
            if (result.success) {
                toast.success(recordingBlobs.length > 1 ? "All recordings saved to database!" : "Recording saved to database!");
                setTimeout(() => {
                    setRecordingBlobs([]);
                }, 2000);
                await refreshPreviousRecordings();

            } else {
                throw new Error(result.message || "Unknown error occurred");
            }
        } catch (error) {
            console.error("Error saving recordings to the database:", error);
            setError(`Failed to save recordings: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [recordingBlobs, refreshPreviousRecordings]);

    // Handle save recording locally
    const handleSaveLocally = useCallback(() => {
        if (recordingBlobs.length === 0) {
            setError("No recordings available to save.");
            return;
        }

        saveRecordingLocally(recordingBlobs);
        toast.success("All recordings saved locally!");
    }, [recordingBlobs]);

    // Handle delete recording
    const handleDelete = async (id) => {
        setIsLoading(true);
        setError("");
        try {
            await deleteRecording(id);
            setPreviousRecordings(prevRecordings => prevRecordings.filter(recording => recording._id !== id));
            toast.success("Recording deleted successfully!");
        } catch (error) {
            console.error("Error deleting recording:", error);
            setError("Failed to delete recording. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle save bulk recordings
    const handleSaveBulk = useCallback(async (videosToSave) => {
        setIsLoading(true);
        try {
            await saveRecordingToDatabase(videosToSave.map(v => recordingBlobs[v.index]));
            toast.success("Selected recordings saved to database!");
            setTimeout(() => {
                setRecordingBlobs(prev => prev.filter((_, i) => !videosToSave.some(v => v.index === i)));
            }, 2000);
            await refreshPreviousRecordings();
        } catch (error) {
            console.error("Error saving recordings to the database:", error);
            setError("Failed to save selected recordings. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [recordingBlobs, refreshPreviousRecordings]);

    // Handle discard bulk recordings
    const handleDiscardBulk = useCallback((videosToDiscard) => {
        setRecordingBlobs(prev => prev.filter((_, i) => !videosToDiscard.some(v => v.index === i)));
        toast.success("Selected recordings discarded!");
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
            <div className="max-w-full mx-auto">
                <Header handleLogout={handleLogout} />

                {error && <ErrorAlert error={error} />}

                <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
                    <TabsList className="grid w-full grid-cols-2 bg-gray-200 p-1 rounded-lg">
                        <TabsTrigger value="current" className={cn("rounded-md", activeTab === "current" ? colors.primary : "bg-transparent text-gray-600")}>New Recording</TabsTrigger>
                        <TabsTrigger value="previous" className={cn("rounded-md", activeTab === "previous" ? colors.primary : "bg-transparent text-gray-600")}>Previous Recordings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="current">
                        <CurrentRecordingTab
                            recordingMode={recordingMode}
                            setRecordingMode={setRecordingMode}
                            isRecording={isRecording}
                            isLoading={isLoading}
                            handleStart={handleStart}
                            handleStop={handleStop}
                            handleSave={handleSave}
                            saveRecordingLocally={handleSaveLocally}
                            recordedTime={recordedTime}
                            recordingBlobs={recordingBlobs}
                            showInstructions={showInstructions}
                            setShowInstructions={setShowInstructions}
                            handleSaveBulk={handleSaveBulk}
                            handleDiscardBulk={handleDiscardBulk}
                        />
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
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
        </div>
    );
};

const CurrentRecordingTab = ({
    recordingMode, setRecordingMode, isRecording, isLoading,
    handleStart, handleStop, handleSave, saveRecordingLocally,
    recordedTime, recordingBlobs, showInstructions, setShowInstructions,
    handleSaveBulk, handleDiscardBulk
}) => (
    <>
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
    </>
);

export default ScreenRecord;