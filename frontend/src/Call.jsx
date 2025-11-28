// Call.jsx
import React, { useState } from 'react';
import { makeCall } from './utils/api'; // updated name
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './components/ui/dialog';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';

const Call = () => {
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [workflowName, setWorkflowName] = useState('');

  const handleCall = async () => {
    if (!phone.trim() || !name.trim()) return;

    try {
      // Get workspace and workflow IDs from localStorage
      const workspaceId = localStorage.getItem('currentWorkspaceId');
      const workflowId = localStorage.getItem('currentWorkflowId');

      if (!workspaceId || !workflowId) {
        alert('Please select a workspace and workflow first');
        return;
      }

      await makeCall(workspaceId, workflowId, phone, name, workflowName);
      alert('Call initiated successfully!');
      setIsCallDialogOpen(false);
      setPhone('');
      setName('');
      setWorkflowName('');
    } catch (error) {
      console.error('Failed to initiate call:', error);
      alert('Failed to initiate call. Please try again.');
    }
  };

  return (
    <Dialog open={isCallDialogOpen} onOpenChange={setIsCallDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-purple-600 hover:bg-purple-700">
          Call
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Initiate Call</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g., +1234567890"
            />
          </div>
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., John Doe"
            />
          </div>
          <div>
            <Label htmlFor="workflowName">Workflow Name *</Label>
            <Input
              id="workflowName"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder="e.g., Sales Call Workflow"
            />
          </div>
          <Button
            onClick={handleCall}
            className="w-full"
            disabled={!phone.trim() || !name.trim()}
          >
            Initiate Call
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Call;
