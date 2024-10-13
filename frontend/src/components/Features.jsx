import React from 'react';
import { Card, Button } from '@nextui-org/react';
import { Video, Monitor, Share2, BarChart2, Edit3, Cloud } from 'lucide-react';

const FeatureCard = ({ icon, title, description }) => (
    <Card className="p-6 max-w-sm">
        <div className="flex items-center mb-4">
            {icon}
            <h4 className="text-xl font-semibold ml-4 text-blue-600">{title}</h4>
        </div>
        <p className="text-gray-600">{description}</p>
    </Card>
);

const Features = () => {
    return (
        <div className="container mx-auto px-4 py-40  ">
            <h2 className="text-4xl font-bold text-center mb-12 text-blue-600">
                Powerful Features for Seamless Screen Recording
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <FeatureCard
                    icon={<Video size={40} className="text-blue-500" />}
                    title="Screen Capture"
                    description="Record your entire screen or select specific windows with high-quality video output."
                />
                <FeatureCard
                    icon={<Monitor size={40} className="text-purple-500" />}
                    title="Webcam Recording"
                    description="Add a personal touch by recording yourself alongside your screen content."
                />
                <FeatureCard
                    icon={<Share2 size={40} className="text-yellow-500" />}
                    title="Easy Sharing"
                    description="Share your recordings instantly with customizable privacy settings and link expiration."
                />
                <FeatureCard
                    icon={<BarChart2 size={40} className="text-red-500" />}
                    title="Analytics Dashboard"
                    description="Track viewer engagement with comprehensive analytics and insights."
                />
                <FeatureCard
                    icon={<Edit3 size={40} className="text-green-500" />}
                    title="Video Editing"
                    description="Edit your recordings with our built-in tools. Trim, crop, and add annotations with ease."
                />
                <FeatureCard
                    icon={<Cloud size={40} className="text-indigo-500" />}
                    title="Cloud Storage"
                    description="Store your recordings securely in the cloud and access them from anywhere, anytime."
                />
            </div>
            <div className="mt-12 text-center">
                <Button onClick={() => {
                    window.location.href = '/register';
                }} color="primary" size="lg">
                    Start Recording Now
                </Button>
            </div>
        </div>
    );
};

export default Features;