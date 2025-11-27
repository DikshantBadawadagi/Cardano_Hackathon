import { useState, useEffect } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Badge } from './components/ui/badge';
import { 
  Plus, 
  Trash2, 
  Edit3,
  FileText,
  Clock,
  CheckCircle2
} from 'lucide-react';
import {
  getAllWorkflows,
  createWorkflow,
  updateWorkflowName,
  deleteWorkflow,
  setCurrentWorkflow
} from './utils/api';

export default function WorkflowSelector({ workspaceId, workspaceName, onWorkflowSelect, onClose }) {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Form states
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [editWorkflowName, setEditWorkflowName] = useState('');
  const [workflowToDelete, setWorkflowToDelete] = useState(null);

  useEffect(() => {
    if (workspaceId) {
      loadWorkflows();
    }
  }, [workspaceId]);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const response = await getAllWorkflows(workspaceId);
      setWorkflows(response.workflows || []);
    } catch (error) {
      console.error('Failed to load workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkflow = async () => {
    if (!newWorkflowName.trim()) return;
    
    try {
      const response = await createWorkflow(workspaceId, newWorkflowName);
      setWorkflows([...workflows, response.workflow]);
      setCreateDialogOpen(false);
      setNewWorkflowName('');
    } catch (error) {
      console.error('Failed to create workflow:', error);
      alert('Failed to create workflow: ' + error.message);
    }
  };

  const handleEditWorkflow = async () => {
    if (!selectedWorkflow || !editWorkflowName.trim()) return;
    
    try {
      await updateWorkflowName(workspaceId, selectedWorkflow._id, editWorkflowName);
      await loadWorkflows();
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Failed to update workflow:', error);
      alert('Failed to update workflow: ' + error.message);
    }
  };

  const handleDeleteWorkflow = async () => {
    if (!workflowToDelete) return;
    
    try {
      await deleteWorkflow(workspaceId, workflowToDelete._id);
      setWorkflows(workflows.filter(w => w._id !== workflowToDelete._id));
      setDeleteDialogOpen(false);
      setWorkflowToDelete(null);
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      alert('Failed to delete workflow: ' + error.message);
    }
  };

  const handleSelectWorkflow = (workflow) => {
    setCurrentWorkflow(workflow._id);
    if (onWorkflowSelect) {
      onWorkflowSelect(workflow);
    }
    if (onClose) {
      onClose();
    }
  };

  const openEditDialog = (workflow) => {
    setSelectedWorkflow(workflow);
    setEditWorkflowName(workflow.name);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (workflow) => {
    setWorkflowToDelete(workflow);
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-zinc-400">Loading workflows...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-zinc-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Workflows</h2>
          <p className="text-sm text-zinc-400 mt-1">
            in <span className="text-zinc-300 font-medium">{workspaceName}</span>
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800">
          <Plus className="h-4 w-4 mr-2" />
          New Workflow
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workflows.map((workflow) => (
          <Card key={workflow._id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate flex items-center gap-2">
                    <FileText className="h-4 w-4 text-zinc-400" />
                    {workflow.name}
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-500 mt-2 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(workflow.updated_at).toLocaleDateString()}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-xs text-zinc-400 mb-4">
                <Badge variant="outline" className="bg-zinc-800 border-zinc-700 text-zinc-300">
                  {workflow.body_json?.nodes?.length || 0} nodes
                </Badge>
                <Badge variant="outline" className="bg-zinc-800 border-zinc-700 text-zinc-300">
                  {workflow.body_json?.edges?.length || 0} edges
                </Badge>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => handleSelectWorkflow(workflow)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700"
                  size="sm"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Open
                </Button>
                <Button
                  onClick={() => openEditDialog(workflow)}
                  variant="outline"
                  size="sm"
                  className="border-zinc-700 hover:bg-zinc-800"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => openDeleteDialog(workflow)}
                  variant="outline"
                  size="sm"
                  className="border-red-900/50 hover:bg-red-950/50 text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {workflows.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-400 mb-4">No workflows yet</p>
          <Button onClick={() => setCreateDialogOpen(true)} variant="outline" className="border-zinc-700">
            Create your first workflow
          </Button>
        </div>
      )}

      {/* Create Workflow Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle>Create New Workflow</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Create a new workflow in {workspaceName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="workflow-name">Workflow Name</Label>
              <Input
                id="workflow-name"
                value={newWorkflowName}
                onChange={(e) => setNewWorkflowName(e.target.value)}
                placeholder="e.g., Sales Onboarding, Customer Support"
                className="bg-zinc-950 border-zinc-800"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateWorkflow()}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} className="border-zinc-700">
              Cancel
            </Button>
            <Button onClick={handleCreateWorkflow} className="bg-zinc-800 hover:bg-zinc-700">
              Create Workflow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Workflow Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle>Edit Workflow</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Update workflow name
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-workflow-name">Workflow Name</Label>
              <Input
                id="edit-workflow-name"
                value={editWorkflowName}
                onChange={(e) => setEditWorkflowName(e.target.value)}
                className="bg-zinc-950 border-zinc-800"
                onKeyPress={(e) => e.key === 'Enter' && handleEditWorkflow()}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="border-zinc-700">
              Cancel
            </Button>
            <Button onClick={handleEditWorkflow} className="bg-zinc-800 hover:bg-zinc-700">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Workflow Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle>Delete Workflow</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Are you sure you want to delete "{workflowToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="border-zinc-700">
              Cancel
            </Button>
            <Button onClick={handleDeleteWorkflow} className="bg-red-900 hover:bg-red-800 text-white">
              Delete Workflow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}