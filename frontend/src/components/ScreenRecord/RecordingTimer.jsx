import React, { useState, useEffect } from 'react';

const RecordingTimer = ({ isRecording, isPaused }) => {
    const [time, setTime] = useState(0);

    useEffect(() => {
        let interval = null;
        if (isRecording && !isPaused) {
            interval = setInterval(() => {
                setTime((prevTime) => prevTime + 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isRecording, isPaused]);

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        return [hours, minutes, remainingSeconds]
            .map(v => v < 10 ? "0" + v : v)
            .filter((v, i) => v !== "00" || i > 0)
            .join(":");
    };

    return (
        <div className="text-2xl font-bold mb-4">
            {formatTime(time)}
        </div>
    );
};

export default RecordingTimer;