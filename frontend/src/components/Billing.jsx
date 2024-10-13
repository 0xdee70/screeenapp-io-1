import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

const Billing = () => {
    const [plan, setPlan] = useState('free');
    const [billingInfo, setBillingInfo] = useState(null);

    useEffect(() => {
        fetchBillingInfo();
    }, []);

    const fetchBillingInfo = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/billing`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch billing info');
            const data = await response.json();
            setPlan(data.plan);
            setBillingInfo(data);
        } catch (error) {
            toast.error("Failed to fetch billing information");
        }
    };

    const handleUpgrade = async () => {
        // Implement upgrade logic
        toast.info("Upgrade functionality not implemented yet");
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Billing</h1>
            <div className="mb-4">
                <p>Current Plan: {plan.charAt(0).toUpperCase() + plan.slice(1)}</p>
                {plan === 'free' && (
                    <Button onClick={handleUpgrade} className="mt-2">Upgrade to Pro</Button>
                )}
            </div>
            {billingInfo && (
                <div>
                    <h2 className="text-xl font-semibold mb-2">Billing Information</h2>
                    {/* Display billing information here */}
                </div>
            )}
        </div>
    );
};

export default Billing;
