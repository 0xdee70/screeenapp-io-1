import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function MasterAdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [twoFactorToken, setTwoFactorToken] = useState('');
    const [showTwoFactor, setShowTwoFactor] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/master-login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data = await response.json();

            if (data.requireTwoFactor) {
                setShowTwoFactor(true);
                toast.info('Please enter your two-factor authentication code');
                return;
            }

            handleLoginSuccess(data);
        } catch (error) {
            toast.error('Login failed. Please check your credentials.');
        }
    };

    const handleTwoFactorSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-2fa`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, token: twoFactorToken }),
            });

            if (!response.ok) {
                throw new Error('Two-factor authentication failed');
            }

            const data = await response.json();
            handleLoginSuccess(data);
        } catch (error) {
            toast.error('Two-factor authentication failed. Please try again.');
        }
    };

    const handleLoginSuccess = (data) => {
        localStorage.setItem('accessToken', data.token);
        localStorage.setItem('role', data.role);
        toast.success('Logged in successfully');
        navigate('/master-admin');
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Master Admin Login</CardTitle>
                </CardHeader>
                <CardContent>
                    {!showTwoFactor ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full">Login</Button>
                        </form>
                    ) : (
                        <form onSubmit={handleTwoFactorSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="twoFactorToken">Two-Factor Authentication Code</Label>
                                <Input
                                    id="twoFactorToken"
                                    type="text"
                                    value={twoFactorToken}
                                    onChange={(e) => setTwoFactorToken(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full">Verify</Button>
                        </form>
                    )}
                </CardContent>
            </Card>

            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
        </div>
    );
}

export default MasterAdminLogin;
