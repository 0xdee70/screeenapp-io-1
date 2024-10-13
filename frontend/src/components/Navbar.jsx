import React, { useState } from 'react';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NavItem = ({ href, children }) => (
    <a href={href} className="text-gray-400 hover:text-white transition-colors">
        {children}
    </a>
);

const Navbar = ({ isDarkMode, toggleDarkMode }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className={cn(
            "fixed top-0 left-0 right-0 z-50 py-4 px-6 flex items-center justify-between",
            isDarkMode ? "bg-[#0f0f0f] text-white" : "bg-white text-black"
        )}>
            <div className="flex items-center">
                <a href="/" className="text-xl font-bold mr-8">EasyDocs</a>
                <div className="hidden md:flex space-x-6">
                    <NavItem href="/product">Product</NavItem>
                    <NavItem href="/features">Features</NavItem>
                    <NavItem href="/about">About</NavItem>
                    <NavItem href="/contact">Contact</NavItem>
                    <NavItem href="/pricing">Pricing</NavItem>
                </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
                <Button variant="ghost" onClick={toggleDarkMode} className="text-gray-400 hover:text-white transition-colors">
                    {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                <Button variant="ghost" className="text-gray-400 hover:text-white transition-colors">
                    Sign Up
                </Button>
                <Button variant="outline" className="text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                    Join for Free
                </Button>
            </div>
            <div className="md:hidden">
                <Button variant="ghost" onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-400 hover:text-white transition-colors">
                    {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
            </div>
            {isMenuOpen && (
                <div className={cn(
                    "absolute top-full left-0 right-0 p-4 flex flex-col space-y-4 md:hidden",
                    isDarkMode ? "bg-[#0f0f0f]" : "bg-white"
                )}>
                    <NavItem href="/product">Product</NavItem>
                    <NavItem href="/features">Features</NavItem>
                    <NavItem href="/about">About</NavItem>
                    <NavItem href="/contact">Contact</NavItem>
                    <NavItem href="/pricing">Pricing</NavItem>
                    <Button variant="ghost" onClick={toggleDarkMode} className="text-gray-400 hover:text-white transition-colors">
                        {isDarkMode ? "Light Mode" : "Dark Mode"}
                    </Button>
                    <Button variant="ghost" className="text-gray-400 hover:text-white transition-colors">
                        Sign Up
                    </Button>
                    <Button variant="outline" className="text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                        Join for Free
                    </Button>
                </div>
            )}
        </nav>
    );
}

const NavbarApp = () => {
    return (
        <>
            <Navbar />
            <div className="container mx-auto">
                <h1>Navbar</h1>
            </div>
        </>

    )
}

export default NavbarApp;
