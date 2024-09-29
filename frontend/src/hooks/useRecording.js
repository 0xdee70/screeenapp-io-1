import { useState, useCallback } from 'react';
import { startRecording, stopRecording, saveRecordingToDatabase, saveRecordingLocally } from '@/utils/recordingUtils';

export const useRecording = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingBlobs, setRecordingBlobs] = useState([]);
    const [error, setError] = useState('');

    const handleStart = useCallback(async (recordingMode) => {
        try {
            await startRecording(recordingMode);
            setIsRecording(true);
            setError('');
        } catch (error) {
            console.error('Error starting recording: ', error);
            setError('Failed to start recording. Please check your permissions and try again.');
        }
    }, []);

    const handleStop = useCallback(async () => {
        try {
            const blobs = await stopRecording();
            setRecordingBlobs((prev) => [...prev, blobs]);
            setIsRecording(false);
        } catch (error) {
            console.error('Error stopping recording: ', error);
            setError('Failed to stop recording. Please try again.');
        }
    }, []);

    const handleSave = useCallback(async () => {
        if (recordingBlobs.length === 0) {
            setError('No recordings available to save.');
            return;
        }

        try {
            const result = await saveRecordingToDatabase(recordingBlobs);
            if (result.success) {
                setRecordingBlobs([]);
                return 'Recording saved to database!';
            } else {
                throw new Error(result.message || 'Unknown error occurred');
            }
        } catch (error) {
            console.error('Error saving recordings to the database:', error);
            setError(`Failed to save recordings: ${error.message}`);
        }
    }, [recordingBlobs]);

    const handleSaveLocally = useCallback(() => {
        if (recordingBlobs.length === 0) {
            setError('No recordings available to save.');
            return;
        }

        saveRecordingLocally(recordingBlobs);
        return 'All recordings saved locally!';
    }, [recordingBlobs]);

    return {
        isRecording,
        recordingBlobs,
        error,
        handleStart,
        handleStop,
        handleSave,
        handleSaveLocally,
    };
};
