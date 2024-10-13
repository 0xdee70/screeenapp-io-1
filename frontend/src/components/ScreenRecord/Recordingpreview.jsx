

import React, { useState, useEffect } from 'react';
import { Card, CardBody, Input, Button } from "@nextui-org/react";
import { cn } from "@/lib/utils";
import { colors } from "@/lib/colors";

const RecordingPreview = ({ recordingBlobs, onSave, onDiscard, recordingTitle, setRecordingTitle }) => {
    const [previewUrls, setPreviewUrls] = useState({ screen: null, webcam: null });
    const [totalSize, setTotalSize] = useState(0);

    useEffect(() => {
        if (recordingBlobs.length > 0) {
            const latestRecording = recordingBlobs[recordingBlobs.length - 1];
            setPreviewUrls({
                screen: latestRecording.screenVideo ? URL.createObjectURL(latestRecording.screenVideo) : null,
                webcam: latestRecording.webcamVideo ? URL.createObjectURL(latestRecording.webcamVideo) : null,
            });

            // Calculate total size
            const screenSize = latestRecording.screenVideo ? latestRecording.screenVideo.size : 0;
            const webcamSize = latestRecording.webcamVideo ? latestRecording.webcamVideo.size : 0;
            setTotalSize(screenSize + webcamSize);
        }
    }, [recordingBlobs]);

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleSave = () => {
        onSave(recordingTitle);
    };

    return (
        <Card className="mt-4">
            <CardBody>
                <h3 className="text-lg font-semibold mb-4">Recording Preview</h3>
                <div className="flex flex-wrap gap-4 mb-4">
                    {previewUrls.screen && (
                        <div>
                            <h4 className="text-md font-medium mb-2">Screen Recording</h4>
                            <video src={previewUrls.screen} controls width="320" height="320" />
                        </div>
                    )}
                    {previewUrls.webcam && (
                        <div>
                            <h4 className="text-md font-medium mb-2">Webcam Recording</h4>
                            <video src={previewUrls.webcam} controls width="320" height="320" />
                        </div>
                    )}
                </div>
                <p className="mb-4">Total Size: {formatSize(totalSize)}</p>
                <Input
                    placeholder="Enter a title for your recording"
                    value={recordingTitle}
                    onChange={(e) => setRecordingTitle(e.target.value)}
                    className="mb-4"
                />
                <div className="flex justify-end gap-2">
                    <Button
                        onClick={onDiscard}
                        className={cn(colors.danger, "text-white")}
                    >
                        Discard
                    </Button>
                    <Button
                        onClick={handleSave}
                        className={cn(colors.success, "text-white")}
                        disabled={!recordingTitle.trim()}
                    >
                        Save Recording
                    </Button>
                </div>
            </CardBody>
        </Card>
    );
};

export default RecordingPreview;