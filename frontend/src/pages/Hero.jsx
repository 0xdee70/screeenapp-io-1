import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Video, Monitor, Save } from "lucide-react";

const Hero = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to ScreenCast Pro</h1>
        <p className="text-xl text-muted-foreground">Capture, Record, and Share with Ease</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <Card>
          <CardContent className="pt-6">
            <Video className="w-12 h-12 mb-4 mx-auto text-primary" />
            <h2 className="text-2xl font-semibold mb-2 text-center">Screen Recording</h2>
            <p className="text-center">Capture your entire screen or specific windows with high-quality video.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Monitor className="w-12 h-12 mb-4 mx-auto text-primary" />
            <h2 className="text-2xl font-semibold mb-2 text-center">Webcam Recording</h2>
            <p className="text-center">Record yourself alongside your screen for personalized tutorials.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Save className="w-12 h-12 mb-4 mx-auto text-primary" />
            <h2 className="text-2xl font-semibold mb-2 text-center">Easy Saving</h2>
            <p className="text-center">Save your recordings securely and access them anytime, anywhere.</p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button asChild size="lg" className="mr-4">
          <Link to="/home">Get Started</Link>
        </Button>
      </div>
    </div>
  );
};

export default Hero;