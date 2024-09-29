import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'react-toastify';

function TwoFactorSetup() {
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [token, setToken] = useState('');

    const setupTwoFactor = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/setup-2fa`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to set up two-factor authentication');
            }

            const data = await response.json();
            setQrCode(data.qrCode);
            setSecret(data.secret);
            toast.success('2FA setup initiated. Scan the QR code with your authenticator app.');
        } catch (error) {
            console.error('Setup 2FA error:', error);
            toast.error('Failed to set up two-factor authentication');
        }
    };

    const enableTwoFactor = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/enable-2fa`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            });

            if (!response.ok) {
                throw new Error('Failed to enable two-factor authentication');
            }

            toast.success('Two-factor authentication enabled successfully');
            setQrCode('');
            setSecret('');
            setToken('');
        } catch (error) {
            console.error('Enable 2FA error:', error);
            toast.error('Failed to enable two-factor authentication');
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Two-Factor Authentication Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button onClick={setupTwoFactor}>Set Up Two-Factor Authentication</Button>
                {qrCode && (
                    <div>
                        <img src={qrCode} alt="QR Code" />
                        <p>Secret: {secret}</p>
                    </div>
                )}
                <div>
                    <Label htmlFor="token">Verification Token</Label>
                    <Input
                        id="token"
                        type="text"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                    />
                </div>
                <Button onClick={enableTwoFactor}>Enable Two-Factor Authentication</Button>
            </CardContent>
        </Card>
    );
}

export default TwoFactorSetup;
