import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "react-toastify";

const Settings = () => {
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    const handleNotificationsChange = (checked) => {
        setNotifications(checked);
        // Implement logic to update notifications setting
        toast.success("Notification settings updated");
    };

    const handleDarkModeChange = (checked) => {
        setDarkMode(checked);
        // Implement logic to update dark mode setting
        toast.success("Dark mode setting updated");
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Settings</h1>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span>Enable Notifications</span>
                    <Switch
                        checked={notifications}
                        onCheckedChange={handleNotificationsChange}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <span>Dark Mode</span>
                    <Switch
                        checked={darkMode}
                        onCheckedChange={handleDarkModeChange}
                    />
                </div>
                {/* Add more settings as needed */}
            </div>
        </div>
    );
};

export default Settings;
