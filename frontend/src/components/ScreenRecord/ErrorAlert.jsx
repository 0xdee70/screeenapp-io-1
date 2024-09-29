import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";

const ErrorAlert = ({ error }) => (
    <Alert variant="destructive" className="mb-6 bg-red-100 border-2 border-red-500 text-red-700">
        <AlertDescription>{error}</AlertDescription>
    </Alert>
);

export default ErrorAlert;