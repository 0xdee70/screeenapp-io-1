import React from 'react';
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { colors } from "@/lib/colors";

const Header = ({ handleLogout }) => (
    <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600">Screen Recorder</h1>
        <Button onClick={handleLogout} className={cn(colors.danger)}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
    </div>
);

export default Header;