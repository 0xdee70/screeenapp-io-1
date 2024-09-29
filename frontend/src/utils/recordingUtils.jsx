import RecordRTC from "recordrtc";

let screenRecorder = null;
let camRecorder = null;
let screenStream = null;
let cameraStream = null;

export const startRecording = async (recordingMode) => {
    if (recordingMode !== 'Camera Only') {
        screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: { width: 1920, height: 1080, frameRate: 30 },
            audio: true,
        });
        screenRecorder = new RecordRTC(screenStream, { type: "video" });
        screenRecorder.startRecording();
    }

    if (recordingMode !== 'Screen Only') {
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        });
        camRecorder = new RecordRTC(cameraStream, { type: "video" });
        camRecorder.startRecording();
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

export const saveRecordingToDatabase = async (recordingBlobs) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
        throw new Error("No access token found");
    }

    try {
        for (const { webcamVideo, screenVideo } of recordingBlobs) {
            const formData = new FormData();
            if (webcamVideo) formData.append("webcamVideo", webcamVideo, "webcamVideo.webm");
            if (screenVideo) formData.append("screenVideo", screenVideo, "screenVideo.webm");

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

export const saveRecordingLocally = (recordingBlobs) => {
    recordingBlobs.forEach((blob, index) => {
        if (blob.screenVideo) {
            const screenUrl = URL.createObjectURL(blob.screenVideo);
            const screenLink = document.createElement("a");
            screenLink.href = screenUrl;
            screenLink.download = `screen_recording_${index}.webm`;
            screenLink.click();
        }
        if (blob.webcamVideo) {
            const webcamUrl = URL.createObjectURL(blob.webcamVideo);
            const webcamLink = document.createElement("a");
            webcamLink.href = webcamUrl;
            webcamLink.download = `webcam_recording_${index}.webm`;
            webcamLink.click();
        }
    });
};

export const fetchPreviousRecordings = async () => {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/recordings`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Failed to fetch previous recordings");
    }

    const data = await response.json();
    return data.map(recording => ({
        ...recording,
        webcamVideo: recording.webcamVideo ? URL.createObjectURL(new Blob([new Uint8Array(recording.webcamVideo.data)], { type: 'video/webm' })) : null,
        screenVideo: recording.screenVideo ? URL.createObjectURL(new Blob([new Uint8Array(recording.screenVideo.data)], { type: 'video/webm' })) : null,
    }));
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
