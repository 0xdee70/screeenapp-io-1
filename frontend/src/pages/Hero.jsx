import React from "react";
import { Link } from "react-router-dom";
import { VideoIcon, MonitorIcon, SaveIcon } from "lucide-react";

const Hero = () => {
  return (
    <div className="container mx-auto px-4 py-16 min-h-screen flex flex-col justify-center">
      <div className="flex flex-col md:flex-row items-center mb-16">
        <div className="md:w-1/2 mb-8 md:mb-0 text-left">
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
            Create Engaging Videos with ScreenCast Pro
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Boost your communication with personalized screen recordings. Easy to create, share, and track.
          </p>
          <Link
            to="/login"
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 px-6 rounded-full hover:shadow-lg transition duration-300"
          >
            Get Started
          </Link>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <video
            src="https://www.covideo.com/wp-content/uploads/2023/08/hero_section_covideo_5.mp4"
            alt="Video creation illustration"
            className="rounded-lg shadow-2xl max-w-full h-auto"
            autoPlay
            loop
            muted
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <FeatureCard
          icon={<VideoIcon className="w-12 h-12 mb-4 text-blue-500" />}
          title="Screen Recording"
          description="Capture your entire screen or specific windows with high-quality video."
        />
        <FeatureCard
          icon={<MonitorIcon className="w-12 h-12 mb-4 text-purple-500" />}
          title="Webcam Recording"
          description="Record yourself alongside your screen for personalized tutorials."
        />
        <FeatureCard
          icon={<SaveIcon className="w-12 h-12 mb-4 text-pink-500" />}
          title="Easy Saving"
          description="Save your recordings securely and access them anytime, anywhere."
        />
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition duration-300">
    <div className="flex flex-col items-center">
      {icon}
      <h2 className="text-2xl font-semibold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">{title}</h2>
      <p className="text-center text-gray-600">{description}</p>
    </div>
  </div>
);

export default Hero;