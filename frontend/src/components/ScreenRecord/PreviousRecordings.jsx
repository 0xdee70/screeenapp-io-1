import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { colors } from "@/lib/colors";

const PreviousRecordings = ({ previousRecordings, isPreviousLoading, handleDelete, setDeleteId }) => (
    <div className="mt-8 space-y-6">
        <h2 className="text-2xl font-semibold text-blue-600 mb-4">Previous Recordings</h2>
        {isPreviousLoading ? (
            <LoadingMessage />
        ) : previousRecordings.length > 0 ? (
            <PreviousRecordingsGrid
                previousRecordings={previousRecordings}
                handleDelete={handleDelete}
                setDeleteId={setDeleteId}
            />
        ) : (
            <NoRecordingsMessage />
        )}
    </div>
);

const LoadingMessage = () => (
    <div className="text-center">
        <p className="text-gray-600">Loading previous recordings...</p>
    </div>
);

const NoRecordingsMessage = () => (
    <div className="text-center">
        <p className="text-gray-600">No previous recordings found.</p>
    </div>
);

const PreviousRecordingsGrid = ({ previousRecordings, handleDelete, setDeleteId }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {previousRecordings.map((recording, index) => (
            <PreviousRecordingCard
                key={recording._id}
                recording={recording}
                index={index}
                handleDelete={handleDelete}
                setDeleteId={setDeleteId}
            />
        ))}
    </div>
);

const PreviousRecordingCard = ({ recording, index, handleDelete, setDeleteId }) => (
    <Card className="border-2 border-gray-200">
        <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium text-purple-600">Recording {index + 1}</h3>
                <DeleteRecordingButton recording={recording} handleDelete={handleDelete} setDeleteId={setDeleteId} />
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
);

const DeleteRecordingButton = ({ recording, handleDelete, setDeleteId }) => (
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
);

export default PreviousRecordings;