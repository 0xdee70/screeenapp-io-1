import React, { useState, useCallback } from "react";
import { Card, CardBody } from "@nextui-org/react";
import { toast, ToastContainer } from 'react-toastify';
import { cn } from "@/lib/utils";
import { colors } from "@/lib/colors";


// Import custom components
import RecordingModes from "@/components/ScreenRecord/RecordingModes";
import ErrorAlert from "@/components/ScreenRecord/ErrorAlert";
import RecordingPreview from "@/components/ScreenRecord/Recordingpreview";
import RecordingTimer from "@/components/ScreenRecord/RecordingTimer";

// Import recording utility functions
import {
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    saveRecordingToDatabase,
} from "@/utils/recordingUtils";
import { Button } from "@/components/ui/button";

const ScreenRecord = ({ onFinish }) => {
    const [error, setError] = useState("");
    const [recordingMode, setRecordingMode] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [quality, setQuality] = useState("medium");
    const [recordingBlobs, setRecordingBlobs] = useState([]);
    const [recordingTitle, setRecordingTitle] = useState("");

    const handleStart = useCallback(async () => {
        if (!recordingMode) {
            setError("Please select a recording mode.");
            return;
        }

        try {
            await startRecording(recordingMode, quality);
            setIsRecording(true);
            setIsPaused(false);
            setError("");
            toast.success("Recording started!");
        } catch (error) {
            console.error("Error starting recording: ", error);
            setError("Failed to start recording. Please check your permissions and try again.");
        }
    }, [recordingMode, quality]);

    const handleStop = useCallback(async () => {
        try {
            const blobs = await stopRecording();
            setRecordingBlobs([...recordingBlobs, blobs]);
            setIsRecording(false);
            setIsPaused(false);
            toast.success("Recording stopped!");
        } catch (error) {
            console.error("Error stopping recording: ", error);
            setError("Failed to stop recording. Please try again.");
        }
    }, [recordingBlobs]);

    const handlePauseResume = useCallback(() => {
        if (isPaused) {
            resumeRecording();
            setIsPaused(false);
            toast.info("Recording resumed.");
        } else {
            pauseRecording();
            setIsPaused(true);
            toast.info("Recording paused.");
        }
    }, [isPaused]);

    const handleSave = useCallback(async () => {
        if (recordingBlobs.length === 0) {
            setError("No recordings available to save.");
            return;
        }

        if (!recordingTitle) {
            setError("Please enter a title for the recording.");
            return;
        }

        try {
            const result = await saveRecordingToDatabase(recordingBlobs, recordingTitle);
            if (result.success) {
                toast.success("Recording saved successfully!");
                setRecordingBlobs([]);
                setRecordingTitle(""); // Clear the title after saving
            } else {
                throw new Error(result.message || "Failed to save recording");
            }
        } catch (error) {
            console.error("Error saving recording: ", error);
            setError("Failed to save recording. Please try again.");
        }
    }, [recordingBlobs, recordingTitle]);

    const handleDiscard = useCallback(() => {
        setRecordingBlobs([]);
        toast.info("Recording discarded.");
    }, []);

    return (

        <div className="container mx-auto p-4 flex flex-col" style={{ marginLeft: '16rem' }}>
            <Button onClick={onFinish} className="mt-4">Back to Library</Button>


            {error && <ErrorAlert error={error} />}

            <Card className="mt-4">
                <CardBody>
                    <RecordingModes
                        recordingMode={recordingMode}
                        setRecordingMode={setRecordingMode}
                        isRecording={isRecording}
                        quality={quality}
                        setQuality={setQuality}
                    />
                    {isRecording && (
                        <div className="flex justify-center mt-4">
                            <RecordingTimer isRecording={isRecording} isPaused={isPaused} />
                        </div>
                    )}
                    <div className="mt-4 flex justify-center space-x-4">
                        <button
                            onClick={isRecording ? handleStop : handleStart}
                            className={cn(
                                "px-6 py-3 rounded-full font-semibold text-white transition-all",
                                isRecording ? colors.danger : colors.success
                            )}
                        >
                            {isRecording ? 'Stop Recording' : 'Start Recording'}
                        </button>
                        {isRecording && (
                            <button
                                onClick={handlePauseResume}
                                className={cn(
                                    "px-6 py-3 rounded-full font-semibold text-white transition-all",
                                    colors.warning
                                )}
                            >
                                {isPaused ? 'Resume' : 'Pause'}
                            </button>
                        )}
                    </div>
                </CardBody>
            </Card>

            {recordingBlobs.length > 0 && (
                <RecordingPreview
                    recordingBlobs={recordingBlobs}
                    onSave={handleSave}
                    onDiscard={handleDiscard}
                    recordingTitle={recordingTitle}
                    setRecordingTitle={setRecordingTitle}
                />
            )}

            <ToastContainer />


        </div>
    );
};

export default ScreenRecord;