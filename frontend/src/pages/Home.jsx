import React from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogIn, ShieldCheck, UserPlus, ShieldAlert } from "lucide-react";

const Home = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Welcome to The MERN Application</CardTitle>
          <CardDescription className="text-center">Your gateway to seamless web experiences</CardDescription>
        </CardHeader>
        <CardContent>
          <nav className="flex flex-col space-y-4">
            <Button asChild variant="outline" className="w-full">
              <Link to="/login" className="flex items-center justify-center">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/register" className="flex items-center justify-center">
                <UserPlus className="mr-2 h-4 w-4" />
                Register
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full">
              <Link to="/admin-login" className="flex items-center justify-center">
                <ShieldCheck className="mr-2 h-4 w-4" />
                Admin Login
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full">
              <Link to="/master-login" className="flex items-center justify-center">
                <ShieldAlert className="mr-2 h-4 w-4" />
                Master Admin Login
              </Link>
            </Button>
          </nav>
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;