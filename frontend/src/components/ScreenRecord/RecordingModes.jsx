import React from 'react';
import { Button } from "@/components/ui/button";
import { Video, Camera, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { colors } from "@/lib/colors";

const RecordingModes = ({ recordingMode, setRecordingMode, isRecording, isLoading }) => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {['Screen Only', 'Screen + Camera', 'Camera Only'].map((mode) => (
            <RecordingModeButton
                key={mode}
                mode={mode}
                recordingMode={recordingMode}
                setRecordingMode={setRecordingMode}
                isRecording={isRecording}
                isLoading={isLoading}
            />
        ))}
    </div>
);

const RecordingModeButton = ({ mode, recordingMode, setRecordingMode, isRecording, isLoading }) => (
    <Button
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
);

export default RecordingModes;