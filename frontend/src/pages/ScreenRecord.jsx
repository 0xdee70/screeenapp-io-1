import React, { useRef, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RecordRTC from "recordrtc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Video, Camera, Monitor, Save, LogOut, Clock, ChevronDown, ChevronUp, Database, Download } from "lucide-react";
import { toast } from "react-toastify";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const ScreenRecord = () => {
  const [recordingBlobs, setRecordingBlobs] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState("");
  const [recordingMode, setRecordingMode] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const webCamRef = useRef(null);
  const screenRef = useRef(null);
  const recorderRef = useRef(null);
  const navigate = useNavigate();
  const [recordedTime, setRecordedTime] = useState(0);
  const startTimeRef = useRef(null);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  }, [navigate]);

  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => setRecordedTime((prev) => prev + 1), 1000);
    } else if (!isRecording && recordedTime > 0) {
      setRecordedTime(recordedTime);
    }
    return () => clearInterval(timer);
  }, [isRecording, recordedTime]);

  const handleStart = useCallback(async () => {
    if (!recordingMode) {
      setError("Please select a recording mode.");
      return;
    }

    setIsLoading(true);
    try {
      let screenStream, cameraStream;

      if (recordingMode !== 'Camera Only') {
        screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { width: 1920, height: 1080, frameRate: 30 },
          audio: true,
        });
      }

      if (recordingMode !== 'Screen Only') {
        cameraStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      }

      const screenRecorder = screenStream ? new RecordRTC(screenStream, { type: "video" }) : null;
      const camRecorder = cameraStream ? new RecordRTC(cameraStream, { type: "video" }) : null;

      if (screenRecorder) screenRecorder.startRecording();
      if (camRecorder) camRecorder.startRecording();

      webCamRef.current = cameraStream;
      screenRef.current = screenStream;
      recorderRef.current = { webcam: camRecorder, screen: screenRecorder };

      setIsRecording(true);
      setError("");
      startTimeRef.current = Date.now();
    } catch (error) {
      console.error("Error starting recording: ", error);
      setError("Failed to start recording. Please check your permissions and try again.");
    } finally {
      setIsLoading(false);
    }
  }, [recordingMode]);

  const handleStop = useCallback(async () => {
    if (!recorderRef.current) return;

    setIsLoading(true);
    const { webcam, screen } = recorderRef.current;

    try {
      const stopPromises = [];
      if (webcam) stopPromises.push(new Promise((resolve) => webcam.stopRecording(resolve)));
      if (screen) stopPromises.push(new Promise((resolve) => screen.stopRecording(resolve)));

      await Promise.all(stopPromises);

      const webcamBlob = webcam ? webcam.getBlob() : null;
      const screenBlob = screen ? screen.getBlob() : null;

      setRecordingBlobs((prev) => [...prev, { webcamVideo: webcamBlob, screenVideo: screenBlob }]);

      setIsRecording(false);
      setRecordedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));

      if (webCamRef.current) webCamRef.current.getTracks().forEach((track) => track.stop());
      if (screenRef.current) screenRef.current.getTracks().forEach((track) => track.stop());
    } catch (error) {
      console.error("Error stopping recording: ", error);
      setError("Failed to stop recording. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveRecordedDataToDB = useCallback(async (usermail) => {
    if (recordingBlobs.length === 0) {
      setError("No recordings available to save.");
      return;
    }

    setIsLoading(true);
    try {
      for (const { webcamVideo, screenVideo } of recordingBlobs) {
        const formData = new FormData();
        if (webcamVideo) formData.append("webcamVideo", webcamVideo, "webcamVideo.webm");
        if (screenVideo) formData.append("screenVideo", screenVideo, "screenVideo.webm");
        formData.append("usermail", usermail);

        const response = await fetch("http://localhost:5000/recordings", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to save recording");
        }
      }
      toast.success("All recordings saved to database!");
    } catch (error) {
      console.error("Error saving recordings to the database:", error);
      setError("Failed to save all recordings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [recordingBlobs]);

  const saveRecordingLocally = useCallback(() => {
    if (recordingBlobs.length === 0) {
      setError("No recordings available to save.");
      return;
    }

    recordingBlobs.forEach(({ webcamVideo, screenVideo }, index) => {
      if (webcamVideo) {
        const url = URL.createObjectURL(webcamVideo);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `webcam-recording-${index + 1}.webm`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
      }

      if (screenVideo) {
        const url = URL.createObjectURL(screenVideo);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `screen-recording-${index + 1}.webm`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
      }
    });

    toast.success("All recordings saved locally!");
  }, [recordingBlobs]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-full mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">Screen Recorder</h1>
          <Button onClick={handleLogout} variant="outline" className="text-red-500 hover:text-red-600">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-3">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {['Screen Only', 'Screen + Camera', 'Camera Only'].map((mode) => (
                  <Button
                    key={mode}
                    onClick={() => setRecordingMode(mode)}
                    variant={recordingMode === mode ? 'default' : 'outline'}
                    className={`h-20 ${recordingMode === mode ? 'bg-blue-500 text-white' : ''}`}
                    disabled={isRecording || isLoading}
                  >
                    <div className="flex flex-col items-center">
                      {mode === 'Screen Only' && <Monitor className="h-6 w-6 mb-2" />}
                      {mode === 'Screen + Camera' && <Video className="h-6 w-6 mb-2" />}
                      {mode === 'Camera Only' && <Camera className="h-6 w-6 mb-2" />}
                      <span className="text-sm">{mode}</span>
                    </div>
                  </Button>
                ))}
              </div>

              <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <Button
                  onClick={isRecording ? handleStop : handleStart}
                  disabled={(!isRecording && !recordingMode) || isLoading}
                  className="w-48 h-12 text-lg font-semibold"
                  variant={isRecording ? "destructive" : "default"}
                >
                  {isLoading ? 'Processing...' : isRecording ? 'Stop Recording' : 'Start Recording'}
                </Button>

                <div className="flex items-center">
                  <Clock className="mr-2 h-6 w-6 text-blue-500" />
                  <span className="text-lg font-semibold">
                    {recordedTime > 0
                      ? new Date(recordedTime * 1000).toISOString().substr(11, 8)
                      : "00:00:00"}
                  </span>
                </div>

                {recordingBlobs.length > 0 && (
                  <div className="flex gap-2">
                    <Button onClick={() => saveRecordedDataToDB("user@example.com")} disabled={isRecording || isLoading} className="h-12 font-semibold bg-green-500 hover:bg-green-600 text-white">
                      <Database className="mr-2 h-4 w-4" /> Save All to DB
                    </Button>
                    <Button onClick={saveRecordingLocally} disabled={isRecording || isLoading} className="h-12 font-semibold bg-blue-500 hover:bg-blue-600 text-white">
                      <Download className="mr-2 h-4 w-4" /> Save All Locally
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardContent className="p-6">
              <Collapsible open={showInstructions} onOpenChange={setShowInstructions}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold text-blue-600">Instructions</h2>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                      {showInstructions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Select a recording mode from the options above.</li>
                    <li>Click 'Start Recording' to begin capturing your screen and/or camera.</li>
                    <li>When finished, click 'Stop Recording' to end the capture.</li>
                    <li>Preview your recording in the video player(s) below.</li>
                    <li>Click 'Save All to DB' to store your videos in the database or 'Save All Locally' to download.</li>
                  </ol>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        </div>

        {recordingBlobs.length > 0 && (
          <div className="mt-8 space-y-6">
            <h2 className="text-2xl font-semibold text-blue-600 mb-4">Recorded Videos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recordingBlobs.map(({ webcamVideo, screenVideo }, index) => (
                <React.Fragment key={index}>
                  {webcamVideo && (
                    <Card>
                      <CardContent className="p-4">
                        <h3 className="text-lg font-medium mb-2">Webcam Video {index + 1}</h3>
                        <video controls className="w-full rounded-lg">
                          <source src={URL.createObjectURL(webcamVideo)} type="video/webm" />
                          Your browser does not support the video tag.
                        </video>
                      </CardContent>
                    </Card>
                  )}
                  {screenVideo && (
                    <Card>
                      <CardContent className="p-4">
                        <h3 className="text-lg font-medium mb-2">Screen Video {index + 1}</h3>
                        <video controls className="w-full rounded-lg">
                          <source src={URL.createObjectURL(screenVideo)} type="video/webm" />
                          Your browser does not support the video tag.
                        </video>
                      </CardContent>
                    </Card>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScreenRecord;
