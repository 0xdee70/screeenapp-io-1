import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

const Instructions = ({ showInstructions, setShowInstructions }) => (
    <Card className="lg:col-span-1">
        <CardContent className="p-6">
            <Collapsible open={showInstructions} onOpenChange={setShowInstructions}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-primary">Instructions</h2>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="bg-inherit">
                            {showInstructions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                    </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>Select a recording mode from the options above.</li>
                        <li>Click 'Start Recording' to begin capturing your screen and/or camera.</li>
                        <li>When finished, click 'Stop Recording' to end the capture.</li>
                        <li>Preview your recording in the video player(s) below.</li>
                        <li>Click 'Save All to DB' to store your videos in the database or 'Save All Locally' to download.</li>
                        <li>Also You'll Find a another button as 'Enter Edit Mode' to discard or save videos manually</li>
                    </ol>
                </CollapsibleContent>
            </Collapsible>
        </CardContent>
    </Card>
);

export default Instructions;