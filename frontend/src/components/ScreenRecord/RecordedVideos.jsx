import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { colors } from "@/lib/colors";
import { Fragment } from 'react';
import RecordedVideosSkeleton from "@/components/ScreenRecord/ScreenRecordSkeleton";
const RecordedVideos = ({ recordingBlobs, handleSaveBulk, handleDiscardBulk, isLoading }) => {

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

    if (isLoading) {
        return <RecordedVideosSkeleton />;
    }

    return (
        <div className="mt-8 space-y-6">
            <RecordedVideosHeader editMode={editMode} setEditMode={setEditMode} />
            {editMode && (
                <EditModeButtons
                    selectedVideos={selectedVideos}
                    isSaveDialogOpen={isSaveDialogOpen}
                    setIsSaveDialogOpen={setIsSaveDialogOpen}
                    isDiscardDialogOpen={isDiscardDialogOpen}
                    setIsDiscardDialogOpen={setIsDiscardDialogOpen}
                    handleSaveSelected={handleSaveSelected}
                    handleDiscardSelected={handleDiscardSelected}
                />
            )}
            <RecordedVideoGrid
                recordingBlobs={recordingBlobs}
                editMode={editMode}
                selectedVideos={selectedVideos}
                toggleVideoSelection={toggleVideoSelection}
            />
        </div>
    );
};

const RecordedVideosHeader = ({ editMode, setEditMode }) => (
    <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-blue-600">Recorded Videos</h2>
        <Button onClick={() => setEditMode(!editMode)} className={cn(colors.secondary)}>
            {editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
        </Button>
    </div>
);

const EditModeButtons = ({ selectedVideos, isSaveDialogOpen, setIsSaveDialogOpen, isDiscardDialogOpen, setIsDiscardDialogOpen, handleSaveSelected, handleDiscardSelected }) => (
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
);

const RecordedVideoGrid = ({ recordingBlobs, editMode, selectedVideos, toggleVideoSelection }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recordingBlobs.map(({ webcamVideo, screenVideo }, index) => (
            <Fragment key={index}>
                {webcamVideo && (
                    <RecordedVideoCard
                        video={webcamVideo}
                        type="webcam"
                        index={index}
                        editMode={editMode}
                        isSelected={selectedVideos.includes(`${index}-webcam`)}
                        toggleSelection={toggleVideoSelection}
                    />
                )}
                {screenVideo && (
                    <RecordedVideoCard
                        video={screenVideo}
                        type="screen"
                        index={index}
                        editMode={editMode}
                        isSelected={selectedVideos.includes(`${index}-screen`)}
                        toggleSelection={toggleVideoSelection}
                    />
                )}
            </Fragment>
        ))}
    </div>
);

const RecordedVideoCard = ({ video, type, index, editMode, isSelected, toggleSelection }) => (
    <Card className={cn("border-2", editMode && isSelected ? 'border-pink-500' : 'border-gray-200')}>
        <CardContent className="p-4">
            <h3 className="text-lg font-medium mb-2 text-purple-600">{type === 'webcam' ? 'Webcam' : 'Screen'} Video {index + 1}</h3>
            <video controls className="w-full rounded-lg">
                <source src={URL.createObjectURL(video)} type="video/webm" />
                Your browser does not support the video tag.
            </video>
            {editMode && (
                <Button
                    onClick={() => toggleSelection(index, type)}
                    className={cn("mt-2 w-full", isSelected ? colors.accent : colors.secondary)}
                >
                    {isSelected ? 'Selected' : 'Select'}
                </Button>
            )}
        </CardContent>
    </Card>
);

export default RecordedVideos;