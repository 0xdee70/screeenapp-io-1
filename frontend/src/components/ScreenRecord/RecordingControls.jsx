import React from 'react';
import { Button } from "@/components/ui/button";
import { Clock, Database, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { colors } from "@/lib/colors";

const RecordingControls = ({ isRecording, isLoading, recordingMode, handleStart, handleStop, handleSave, saveRecordingLocally, recordedTime, recordingBlobs }) => (
    <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <Button
            onClick={isRecording ? handleStop : handleStart}
            disabled={(!isRecording && !recordingMode) || isLoading}
            className={cn("w-48 h-12 text-lg font-semibold", isRecording ? colors.danger : colors.success)}
        >
            {isLoading ? 'Processing...' : isRecording ? 'Stop Recording' : 'Start Recording'}
        </Button>

        <RecordingTimer recordedTime={recordedTime} />

        {recordingBlobs.length > 0 && (
            <SaveButtons
                handleSave={handleSave}
                saveRecordingLocally={saveRecordingLocally}
                isRecording={isRecording}
                isLoading={isLoading}
                recordingBlobs={recordingBlobs}
            />
        )}
    </div>
);

const RecordingTimer = ({ recordedTime }) => (
    <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
        <Clock className="mr-2 h-6 w-6 text-blue-500" />
        <span className="text-lg font-semibold text-gray-800">
            {recordedTime > 0
                ? new Date(recordedTime * 1000).toISOString().substr(11, 8)
                : "00:00:00"}
        </span>
    </div>
);

const SaveButtons = ({ handleSave, saveRecordingLocally, isRecording, isLoading, recordingBlobs }) => (
    <div className="flex gap-2">
        <Button onClick={handleSave} disabled={isRecording || isLoading} className={cn("h-12 font-semibold", colors.primary)}>
            <Database className="mr-2 h-4 w-4" />{recordingBlobs.length > 1 ? "Save All to DB" : "Save to DB"}
        </Button>
        <Button onClick={saveRecordingLocally} disabled={isRecording || isLoading} className={cn("h-12 font-semibold", colors.secondary)}>
            <Download className="mr-2 h-4 w-4" /> {recordingBlobs.length > 1 ? "Save All Locally" : "Save Locally"}
        </Button>
    </div>
);

export default RecordingControls;