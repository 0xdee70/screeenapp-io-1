import RecordRTC from "recordrtc";

let screenRecorder = null;
let camRecorder = null;
let screenStream = null;
let cameraStream = null;

const getVideoConstraints = (quality) => {
    switch (quality) {
        case 'low':
            return { width: 640, height: 480, frameRate: 15 };
        case 'medium':
            return { width: 1280, height: 720, frameRate: 30 };
        case 'high':
            return { width: 1920, height: 1080, frameRate: 60 };
        default:
            return { width: 1280, height: 720, frameRate: 30 }; // Default to medium
    }
};

export const startRecording = async (recordingMode, quality) => {
    const videoConstraints = getVideoConstraints(quality);

    if (recordingMode !== 'Camera Only') {
        screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: videoConstraints,
            audio: true,
        });
        screenRecorder = new RecordRTC(screenStream, { type: "video" });
        screenRecorder.startRecording();
    }

    if (recordingMode !== 'Screen Only') {
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: videoConstraints,
            audio: true,
        });
        camRecorder = new RecordRTC(cameraStream, { type: "video" });
        camRecorder.startRecording();
    }

    if (recordingMode === 'Blend Recording') {
        const manualRecordingOption = prompt("Choose a manual recording option: \n1. Screen + Mic\n2. Camera + Screen (Audio Only)\nPlease enter 1 or 2.");

        if (manualRecordingOption === "1") {
            screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: videoConstraints,
                audio: true,
            });
            screenRecorder = new RecordRTC(screenStream, { type: "video" });
            screenRecorder.startRecording();
        } else if (manualRecordingOption === "2") {
            cameraStream = await navigator.mediaDevices.getUserMedia({
                video: videoConstraints,
                audio: false,
            });
            camRecorder = new RecordRTC(cameraStream, { type: "video" });
            camRecorder.startRecording();

            screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: videoConstraints,
                audio: true,
            });
            screenRecorder = new RecordRTC(screenStream, { type: "video" });
            screenRecorder.startRecording();
        }
    }
};

export const stopRecording = async () => {
    const stopRecorder = async (recorder) => {
        return new Promise((resolve) => {
            if (recorder) {
                recorder.stopRecording(() => {
                    const blob = recorder.getBlob();
                    resolve(blob);
                });
            } else {
                resolve(null);
            }
        });
    };

    const screenBlob = await stopRecorder(screenRecorder);
    const camBlob = await stopRecorder(camRecorder);

    if (screenStream) screenStream.getTracks().forEach(track => track.stop());
    if (cameraStream) cameraStream.getTracks().forEach(track => track.stop());

    // Reset the recorders and streams
    screenRecorder = null;
    camRecorder = null;
    screenStream = null;
    cameraStream = null;

    return { screenVideo: screenBlob, webcamVideo: camBlob };
};

export const saveRecordingToDatabase = async (recordingBlobs, title) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
        throw new Error("No access token found");
    }

    try {
        for (const { webcamVideo, screenVideo } of recordingBlobs) {
            const formData = new FormData();
            if (webcamVideo) formData.append("webcamVideo", webcamVideo, "webcamVideo.webm");
            if (screenVideo) formData.append("screenVideo", screenVideo, "screenVideo.webm");
            formData.append("title", title); // Ensure title is included

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/recordings`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message);
            }
        }
        return { success: true };
    } catch (error) {
        console.error("Error in saveRecordingToDatabase:", error);
        return { success: false, message: error.message };
    }
};

export const deleteRecording = async (id) => {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/recordings/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Failed to delete recording");
    }

    return await response.json();
};

export const streamVideo = async (key) => {
    if (!key) {
        console.error("Attempted to stream video with undefined key");
        throw new Error("Video key is missing");
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
        throw new Error("No access token found");
    }

    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/recordings/stream/${key}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response;
    } catch (error) {
        console.error("Error streaming video:", error);
        throw error;
    }
};

export const pauseRecording = () => {
    if (screenRecorder) screenRecorder.pauseRecording();
    if (camRecorder) camRecorder.pauseRecording();
};

export const resumeRecording = () => {
    if (screenRecorder) screenRecorder.resumeRecording();
    if (camRecorder) camRecorder.resumeRecording();
};