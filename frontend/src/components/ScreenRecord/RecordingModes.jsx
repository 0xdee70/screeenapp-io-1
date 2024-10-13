import React from 'react';
import { Button } from "@/components/ui/button";
import { Video, Camera, Monitor, Layers, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { colors } from "@/lib/colors";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const RecordingModes = ({ recordingMode, setRecordingMode, isRecording, quality, setQuality }) => {
    const modes = [
        { name: 'Screen Only', icon: Monitor },
        { name: 'Screen + Camera', icon: Video },
        { name: 'Camera Only', icon: Camera },
        { name: 'Blend Recording', icon: Layers },
    ];

    return (
        <div className="mb-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                {modes.map((mode) => (
                    <RecordingModeButton
                        key={mode.name}
                        mode={mode.name}
                        Icon={mode.icon}
                        recordingMode={recordingMode}
                        setRecordingMode={setRecordingMode}
                        isRecording={isRecording}
                    />
                ))}
            </div>
            <QualityPreferenceDialog quality={quality} setQuality={setQuality} />
        </div>
    );
};

const RecordingModeButton = ({ mode, Icon, recordingMode, setRecordingMode, isRecording }) => (
    <Button
        onClick={() => setRecordingMode(mode)}
        className={cn(
            "h-24 flex flex-col items-center justify-center transition-all",
            recordingMode === mode
                ? cn(colors.accent, "ring-2 ring-offset-2 ring-blue-500")
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
        )}
        disabled={isRecording}
    >
        <Icon className="h-8 w-8 mb-2" />
        <span className="text-sm font-medium">{mode}</span>
    </Button>
);

const QualityPreferenceDialog = ({ quality, setQuality }) => (
    <Dialog>
        <DialogTrigger asChild>
            <Button variant="outline" className="w-full mt-4">
                <Settings className="w-4 h-4 mr-2" />
                Recording Quality: {quality.charAt(0).toUpperCase() + quality.slice(1)}
            </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] text-black">
            <DialogHeader>
                <DialogTitle >Choose Recording Quality</DialogTitle>
            </DialogHeader>
            <RadioGroup value={quality} onValueChange={setQuality} className="grid gap-4">
                {['low', 'medium', 'high'].map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={option} />
                        <Label htmlFor={option} className="flex flex-col">
                            <span className="font-medium capitalize">{option}</span>
                            <span className="text-sm text-gray-500">
                                {option === 'low' && 'Lower quality, smaller file size'}
                                {option === 'medium' && 'Balanced quality and file size'}
                                {option === 'high' && 'Higher quality, larger file size'}
                            </span>
                        </Label>
                    </div>
                ))}
            </RadioGroup>
        </DialogContent>
    </Dialog>
);

export default RecordingModes;