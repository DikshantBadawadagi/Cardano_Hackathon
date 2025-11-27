import { useState, useEffect } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './components/ui/dialog';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Switch } from './components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';
import { 
  Plus, 
  Settings, 
  Users, 
  Trash2, 
  UserPlus, 
  Crown,
  Shield,
  Edit3,
  Eye,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import {
  getAllWorkspaces,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getWorkspaceMembers,
  addWorkspaceMember,
  updateMemberRole,
  removeMember,
  setCurrentWorkspace
} from './utils/workspaceApi';

export default function Workspace({ currentUser, onWorkspaceSelect, onClose }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('workspaces');
  
  // Dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  
  // Form states
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isEditable, setIsEditable] = useState(true);
  const [editWorkspaceName, setEditWorkspaceName] = useState('');
  const [editIsEditable, setEditIsEditable] = useState(true);
  const [workspaceToDelete, setWorkspaceToDelete] = useState(null);
  
  // Add member form
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('viewer');

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      const response = await getAllWorkspaces();
      setWorkspaces(response.workspaces || []);
    } catch (error) {
      console.error('Failed to load workspaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async (workspaceId) => {
    try {
      const response = await getWorkspaceMembers(workspaceId);
      setMembers(response.members || []);
    } catch (error) {
      console.error('Failed to load members:', error);
    }
  };

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;
    
    try {
      const response = await createWorkspace(newWorkspaceName, isEditable);
      setWorkspaces([...workspaces, response.workspace]);
      setCreateDialogOpen(false);
      setNewWorkspaceName('');
      setIsEditable(true);
    } catch (error) {
      console.error('Failed to create workspace:', error);
      alert('Failed to create workspace: ' + error.message);
    }
  };

  const handleEditWorkspace = async () => {
    if (!selectedWorkspace || !editWorkspaceName.trim()) return;
    
    try {
      await updateWorkspace(selectedWorkspace._id, editWorkspaceName, editIsEditable);
      await loadWorkspaces();
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Failed to update workspace:', error);
      alert('Failed to update workspace: ' + error.message);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!workspaceToDelete) return;
    
    try {
      await deleteWorkspace(workspaceToDelete._id);
      setWorkspaces(workspaces.filter(w => w._id !== workspaceToDelete._id));
      setDeleteDialogOpen(false);
      setWorkspaceToDelete(null);
      if (selectedWorkspace?._id === workspaceToDelete._id) {
        setSelectedWorkspace(null);
      }
    } catch (error) {
      console.error('Failed to delete workspace:', error);
      alert('Failed to delete workspace: ' + error.message);
    }
  };

  const handleAddMember = async () => {
    if (!selectedWorkspace || !memberEmail.trim()) return;
    
    try {
      await addWorkspaceMember(selectedWorkspace._id, memberEmail, memberRole);
      await loadMembers(selectedWorkspace._id);
      setAddMemberDialogOpen(false);
      setMemberEmail('');
      setMemberRole('viewer');
    } catch (error) {
      console.error('Failed to add member:', error);
      alert('Failed to add member: ' + error.message);
    }
  };

  const handleUpdateMemberRole = async (userId, newRole) => {
    if (!selectedWorkspace) return;
    
    try {
      await updateMemberRole(selectedWorkspace._id, userId, newRole);
      await loadMembers(selectedWorkspace._id);
    } catch (error) {
      console.error('Failed to update member role:', error);
      alert('Failed to update role: ' + error.message);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!selectedWorkspace) return;
    
    if (!confirm('Are you sure you want to remove this member?')) return;
    
    try {
      await removeMember(selectedWorkspace._id, userId);
      await loadMembers(selectedWorkspace._id);
    } catch (error) {
      console.error('Failed to remove member:', error);
      alert('Failed to remove member: ' + error.message);
    }
  };

  const handleSelectWorkspace = (workspace) => {
    setSelectedWorkspace(workspace);
    loadMembers(workspace._id);
    setActiveTab('details');
  };

  const handleWorkspaceAction = (workspace) => {
    setCurrentWorkspace(workspace._id);
    if (onWorkspaceSelect) {
      onWorkspaceSelect(workspace);
    }
    if (onClose) {
      onClose();
    }
  };

  const openEditDialog = () => {
    if (!selectedWorkspace) return;
    setEditWorkspaceName(selectedWorkspace.name);
    setEditIsEditable(selectedWorkspace.is_editable_by_collaborators);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (workspace) => {
    setWorkspaceToDelete(workspace);
    setDeleteDialogOpen(true);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'admin': return <Shield className="h-4 w-4 text-blue-500" />;
      case 'editor': return <Edit3 className="h-4 w-4 text-green-500" />;
      case 'viewer': return <Eye className="h-4 w-4 text-zinc-400" />;
      default: return null;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'owner': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'admin': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'editor': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'viewer': return 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30';
      default: return 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-zinc-400">Loading workspaces...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-zinc-100">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b border-zinc-800 px-6 py-4">
          <TabsList className="bg-zinc-900 border border-zinc-800">
            <TabsTrigger value="workspaces" className="data-[state=active]:bg-zinc-800">
              Workspaces
            </TabsTrigger>
            <TabsTrigger value="details" disabled={!selectedWorkspace} className="data-[state=active]:bg-zinc-800">
              Details & Members
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <TabsContent value="workspaces" className="mt-0 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Your Workspaces</h2>
                <p className="text-sm text-zinc-400 mt-1">Select a workspace to manage workflows</p>
              </div>
              <Button onClick={() => setCreateDialogOpen(true)} className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800">
                <Plus className="h-4 w-4 mr-2" />
                New Workspace
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workspaces.map((workspace) => {
                const isOwner = workspace.owner_user_id === currentUser?._id;
                
                return (
                  <Card key={workspace._id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">{workspace.name}</CardTitle>
                          <CardDescription className="text-xs text-zinc-500 mt-1">
                            {new Date(workspace.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        {isOwner && (
                          <Badge variant="outline" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 ml-2">
                            Owner
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-xs text-zinc-400 mb-4">
                        {workspace.is_editable_by_collaborators ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            <span>Collaborators can edit</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 text-red-500" />
                            <span>Owner only</span>
                          </>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleWorkspaceAction(workspace)}
                          className="flex-1 bg-zinc-800 hover:bg-zinc-700"
                          size="sm"
                        >
                          Select
                        </Button>
                        <Button
                          onClick={() => handleSelectWorkspace(workspace)}
                          variant="outline"
                          size="sm"
                          className="border-zinc-700 hover:bg-zinc-800"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        {isOwner && (
                          <Button
                            onClick={() => openDeleteDialog(workspace)}
                            variant="outline"
                            size="sm"
                            className="border-red-900/50 hover:bg-red-950/50 text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {workspaces.length === 0 && (
              <div className="text-center py-12">
                <p className="text-zinc-400 mb-4">No workspaces yet</p>
                <Button onClick={() => setCreateDialogOpen(true)} variant="outline" className="border-zinc-700">
                  Create your first workspace
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="details" className="mt-0">
            {selectedWorkspace && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedWorkspace.name}</h2>
                    <p className="text-sm text-zinc-400 mt-1">Workspace settings and members</p>
                  </div>
                  {selectedWorkspace.owner_user_id === currentUser?._id && (
                    <div className="flex gap-2">
                      <Button onClick={openEditDialog} variant="outline" className="border-zinc-700">
                        <Settings className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  )}
                </div>

                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Members ({members.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-sm text-zinc-400">Manage workspace collaborators</p>
                      {selectedWorkspace.owner_user_id === currentUser?._id && (
                        <Button onClick={() => setAddMemberDialogOpen(true)} size="sm" className="bg-zinc-800 hover:bg-zinc-700">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add Member
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2">
                      {members.map((member) => {
                        const isCurrentUser = member.user_id === currentUser?._id;
                        const isOwner = selectedWorkspace.owner_user_id === currentUser?._id;
                        
                        return (
                          <div key={member._id} className="flex items-center justify-between p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                            <div className="flex items-center gap-3">
                              {getRoleIcon(member.role)}
                              <div>
                                <p className="text-sm font-medium">
                                  User ID: {member.user_id.slice(-8)}
                                  {isCurrentUser && <span className="text-zinc-500 ml-2">(You)</span>}
                                </p>
                                <p className="text-xs text-zinc-500">
                                  Joined {new Date(member.invited_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={getRoleBadgeColor(member.role)}>
                                {member.role}
                              </Badge>
                              
                              {isOwner && member.role !== 'owner' && !isCurrentUser && (
                                <>
                                  <Select
                                    value={member.role}
                                    onValueChange={(newRole) => handleUpdateMemberRole(member.user_id, newRole)}
                                  >
                                    <SelectTrigger className="w-28 h-8 bg-zinc-900 border-zinc-800">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-800">
                                      <SelectItem value="admin">Admin</SelectItem>
                                      <SelectItem value="editor">Editor</SelectItem>
                                      <SelectItem value="viewer">Viewer</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  
                                  <Button
                                    onClick={() => handleRemoveMember(member.user_id)}
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>

      {/* Create Workspace Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle>Create New Workspace</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Set up a new workspace for your team
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="workspace-name">Workspace Name</Label>
              <Input
                id="workspace-name"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                placeholder="e.g., Sales Team, Support"
                className="bg-zinc-950 border-zinc-800"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Collaborators to Edit</Label>
                <p className="text-xs text-zinc-500">Let members edit workflows in this workspace</p>
              </div>
              <Switch checked={isEditable} onCheckedChange={setIsEditable} />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} className="border-zinc-700">
              Cancel
            </Button>
            <Button onClick={handleCreateWorkspace} className="bg-zinc-800 hover:bg-zinc-700">
              Create Workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Workspace Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle>Edit Workspace</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Update workspace settings
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-workspace-name">Workspace Name</Label>
              <Input
                id="edit-workspace-name"
                value={editWorkspaceName}
                onChange={(e) => setEditWorkspaceName(e.target.value)}
                className="bg-zinc-950 border-zinc-800"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Collaborators to Edit</Label>
                <p className="text-xs text-zinc-500">Let members edit workflows</p>
              </div>
              <Switch checked={editIsEditable} onCheckedChange={setEditIsEditable} />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="border-zinc-700">
              Cancel
            </Button>
            <Button onClick={handleEditWorkspace} className="bg-zinc-800 hover:bg-zinc-700">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Workspace Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle>Delete Workspace</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Are you sure you want to delete "{workspaceToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="border-zinc-700">
              Cancel
            </Button>
            <Button onClick={handleDeleteWorkspace} className="bg-red-900 hover:bg-red-800 text-white">
              Delete Workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Invite a user to this workspace by email
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="member-email">Email</Label>
              <Input
                id="member-email"
                type="email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="user@example.com"
                className="bg-zinc-950 border-zinc-800"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="member-role">Role</Label>
              <Select value={memberRole} onValueChange={setMemberRole}>
                <SelectTrigger className="bg-zinc-950 border-zinc-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="admin">Admin - Full access</SelectItem>
                  <SelectItem value="editor">Editor - Can edit workflows</SelectItem>
                  <SelectItem value="viewer">Viewer - Read only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMemberDialogOpen(false)} className="border-zinc-700">
              Cancel
            </Button>
            <Button onClick={handleAddMember} className="bg-zinc-800 hover:bg-zinc-700">
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}