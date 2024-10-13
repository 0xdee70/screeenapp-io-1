import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Input, Button } from '@nextui-org/react';
import { Label } from '@/components/ui/label';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BusinessSSO = () => {
    const [businessId, setBusinessId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (!businessId) {
            toast.error('Please provide a Business ID');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/business-sso`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ businessId }),
            });

            if (!response.ok) {
                throw new Error('Business SSO failed');
            }

            const data = await response.json();
            localStorage.setItem('accessToken', data.token);
            localStorage.setItem('role', data.role);

            toast.success('Business SSO successful!');
            setTimeout(() => {
                navigate('/screen');
            }, 1500);
        } catch (error) {
            toast.error(error.message || 'Business SSO failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-0 items-center justify-center py-44 min-h-screen">
            <div className="w-full p-6">
                <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-center">Business SSO Login</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="businessId">Business ID</Label>
                                <Input
                                    id="businessId"
                                    type="text"
                                    placeholder="Enter your Business ID"
                                    value={businessId}
                                    onChange={(e) => setBusinessId(e.target.value)}
                                    classNames={{
                                        input: [
                                            "bg-transparent",
                                            "text-black/90 dark:text-white/90",
                                            "placeholder:text-default-700/50 dark:placeholder:text-white/60",
                                            "rounded-md",
                                            "px-3",
                                            "py-2",
                                        ],
                                        innerWrapper: "bg-transparent",
                                    }}
                                />
                            </div>
                            <Button type="submit" color="primary" className="w-full text-white" disabled={isLoading}>
                                {isLoading ? "Logging in..." : "Login with Business ID"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
            <ToastContainer />
        </div>
    );
};

export default BusinessSSO;
