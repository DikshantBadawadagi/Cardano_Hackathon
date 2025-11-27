import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  Briefcase,
  Users,
  Trash2,
  MoreVertical,
  UserPlus,
  Crown,
  Edit2,
  Check,
  X,
  Loader2,
  Settings,
  ChevronRight,
} from "lucide-react"

import {
  getAllWorkspaces,
  createWorkspace,
  deleteWorkspace,
  updateWorkspace,
  getWorkspaceMembers,
  addWorkspaceMember,
  setCurrentWorkspace,
} from "../utils/workspaceApi"

export default function Workspace({ currentUser, onWorkspaceSelect, onClose }) {
  const [workspaces, setWorkspaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Create workspace dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState("")
  const [isEditableByCollaborators, setIsEditableByCollaborators] = useState(true)
  const [creating, setCreating] = useState(false)

  // Members dialog
  const [membersDialogOpen, setMembersDialogOpen] = useState(false)
  const [selectedWorkspace, setSelectedWorkspace] = useState(null)
  const [members, setMembers] = useState([])
  const [membersLoading, setMembersLoading] = useState(false)

  // Add member
  const [addMemberEmail, setAddMemberEmail] = useState("")
  const [addMemberRole, setAddMemberRole] = useState("viewer")
  const [addingMember, setAddingMember] = useState(false)
  const [addMemberError, setAddMemberError] = useState(null)

  // Edit workspace name
  const [editingWorkspaceId, setEditingWorkspaceId] = useState(null)
  const [editWorkspaceName, setEditWorkspaceName] = useState("")

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [workspaceToDelete, setWorkspaceToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Load workspaces on mount
  useEffect(() => {
    loadWorkspaces()
  }, [])

  const loadWorkspaces = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAllWorkspaces()
      setWorkspaces(data.workspaces || [])
    } catch (err) {
      console.error("Failed to load workspaces:", err)
      setError(err.message || "Failed to load workspaces")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return
    
    try {
      setCreating(true)
      const result = await createWorkspace(newWorkspaceName.trim(), isEditableByCollaborators)
      
      // Add to list
      if (result.workspace) {
        setWorkspaces(prev => [result.workspace, ...prev])
      }
      
      setCreateDialogOpen(false)
      setNewWorkspaceName("")
      setIsEditableByCollaborators(true)
    } catch (err) {
      console.error("Failed to create workspace:", err)
      setError(err.message || "Failed to create workspace")
    } finally {
      setCreating(false)
    }
  }

  const handleSelectWorkspace = (workspace) => {
    setCurrentWorkspace(workspace._id)
    if (onWorkspaceSelect) {
      onWorkspaceSelect(workspace)
    }
  }

  const handleOpenMembers = async (workspace) => {
    setSelectedWorkspace(workspace)
    setMembersDialogOpen(true)
    setMembersLoading(true)
    setAddMemberError(null)
    
    try {
      const data = await getWorkspaceMembers(workspace._id)
      setMembers(data.members || [])
    } catch (err) {
      console.error("Failed to load members:", err)
    } finally {
      setMembersLoading(false)
    }
  }

  const handleAddMember = async () => {
    if (!addMemberEmail.trim() || !selectedWorkspace) return
    
    try {
      setAddingMember(true)
      setAddMemberError(null)
      
      const result = await addWorkspaceMember(
        selectedWorkspace._id,
        addMemberEmail.trim(),
        addMemberRole
      )
      
      // Refresh members list
      const data = await getWorkspaceMembers(selectedWorkspace._id)
      setMembers(data.members || [])
      
      setAddMemberEmail("")
      setAddMemberRole("viewer")
    } catch (err) {
      console.error("Failed to add member:", err)
      setAddMemberError(err.message || "Failed to add member")
    } finally {
      setAddingMember(false)
    }
  }

  const handleStartEdit = (workspace) => {
    setEditingWorkspaceId(workspace._id)
    setEditWorkspaceName(workspace.name)
  }

  const handleSaveEdit = async (workspace) => {
    if (!editWorkspaceName.trim()) return
    
    try {
      await updateWorkspace(workspace._id, editWorkspaceName.trim(), workspace.is_editable_by_collaborators)
      
      // Update local state
      setWorkspaces(prev => prev.map(ws => 
        ws._id === workspace._id 
          ? { ...ws, name: editWorkspaceName.trim() }
          : ws
      ))
      
      setEditingWorkspaceId(null)
      setEditWorkspaceName("")
    } catch (err) {
      console.error("Failed to update workspace:", err)
    }
  }

  const handleCancelEdit = () => {
    setEditingWorkspaceId(null)
    setEditWorkspaceName("")
  }

  const handleDeleteWorkspace = async () => {
    if (!workspaceToDelete) return
    
    try {
      setDeleting(true)
      await deleteWorkspace(workspaceToDelete._id)
      
      // Remove from list
      setWorkspaces(prev => prev.filter(ws => ws._id !== workspaceToDelete._id))
      
      setDeleteDialogOpen(false)
      setWorkspaceToDelete(null)
    } catch (err) {
      console.error("Failed to delete workspace:", err)
      setError(err.message || "Failed to delete workspace")
    } finally {
      setDeleting(false)
    }
  }

  const confirmDelete = (workspace) => {
    setWorkspaceToDelete(workspace)
    setDeleteDialogOpen(true)
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "owner": return "bg-amber-500/20 text-amber-300 border-amber-500/30"
      case "admin": return "bg-purple-500/20 text-purple-300 border-purple-500/30"
      case "editor": return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "viewer": return "bg-zinc-500/20 text-zinc-300 border-zinc-500/30"
      default: return "bg-zinc-500/20 text-zinc-300 border-zinc-500/30"
    }
  }

  const isOwner = (workspace) => {
    return currentUser && workspace.owner_user_id === currentUser._id
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <Briefcase className="h-6 w-6 text-zinc-400" />
          <h2 className="text-xl font-semibold">Workspaces</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-zinc-800 hover:bg-zinc-700">
                <Plus className="h-4 w-4 mr-2" />
                New Workspace
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800">
              <DialogHeader>
                <DialogTitle>Create New Workspace</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Create a new workspace to organize your workflows and collaborate with others.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="workspaceName">Workspace Name</Label>
                  <Input
                    id="workspaceName"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    placeholder="My Workspace"
                    className="bg-zinc-800 border-zinc-700 mt-1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="editableByCollaborators"
                    checked={isEditableByCollaborators}
                    onChange={(e) => setIsEditableByCollaborators(e.target.checked)}
                    className="rounded border-zinc-600"
                  />
                  <Label htmlFor="editableByCollaborators" className="text-sm text-zinc-400">
                    Allow collaborators to edit workflows
                  </Label>
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                  className="border-zinc-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateWorkspace}
                  disabled={!newWorkspaceName.trim() || creating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-6">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-40 gap-4">
            <p className="text-red-400">{error}</p>
            <Button onClick={loadWorkspaces} variant="outline" className="border-zinc-700">
              Retry
            </Button>
          </div>
        ) : workspaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-4">
            <Briefcase className="h-12 w-12 text-zinc-700" />
            <p className="text-zinc-500">No workspaces yet</p>
            <Button onClick={() => setCreateDialogOpen(true)} className="bg-zinc-800 hover:bg-zinc-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Workspace
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workspaces.map((workspace) => (
              <div
                key={workspace._id}
                className="group bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  {editingWorkspaceId === workspace._id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={editWorkspaceName}
                        onChange={(e) => setEditWorkspaceName(e.target.value)}
                        className="bg-zinc-800 border-zinc-700 h-8"
                        autoFocus
                      />
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleSaveEdit(workspace)}>
                        <Check className="h-4 w-4 text-green-400" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCancelEdit}>
                        <X className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-zinc-500" />
                        <h3 className="font-medium truncate">{workspace.name}</h3>
                        {isOwner(workspace) && (
                          <Crown className="h-4 w-4 text-amber-400" title="You own this workspace" />
                        )}
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
                          <DropdownMenuItem
                            onClick={() => handleOpenMembers(workspace)}
                            className="cursor-pointer"
                          >
                            <Users className="h-4 w-4 mr-2" />
                            Manage Members
                          </DropdownMenuItem>
                          {isOwner(workspace) && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleStartEdit(workspace)}
                                className="cursor-pointer"
                              >
                                <Edit2 className="h-4 w-4 mr-2" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => confirmDelete(workspace)}
                                className="cursor-pointer text-red-400 focus:text-red-400"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-zinc-500 mb-4">
                  <Users className="h-3 w-3" />
                  <span>Click to view workflows</span>
                </div>

                <Button
                  onClick={() => handleSelectWorkspace(workspace)}
                  className="w-full bg-zinc-800 hover:bg-zinc-700"
                >
                  Open Workspace
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Members Dialog */}
      <Dialog open={membersDialogOpen} onOpenChange={setMembersDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Members of {selectedWorkspace?.name}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Manage who has access to this workspace and their permissions.
            </DialogDescription>
          </DialogHeader>

          {/* Add Member Form */}
          <div className="space-y-3 mt-4">
            <Label>Add New Member</Label>
            <div className="flex gap-2">
              <Input
                value={addMemberEmail}
                onChange={(e) => setAddMemberEmail(e.target.value)}
                placeholder="Email address"
                className="bg-zinc-800 border-zinc-700 flex-1"
              />
              <select
                value={addMemberRole}
                onChange={(e) => setAddMemberRole(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded-md px-3 text-sm"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
              <Button
                onClick={handleAddMember}
                disabled={!addMemberEmail.trim() || addingMember}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {addingMember ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
              </Button>
            </div>
            {addMemberError && (
              <p className="text-red-400 text-sm">{addMemberError}</p>
            )}
          </div>

          <Separator className="my-4 bg-zinc-800" />

          {/* Members List */}
          <div className="space-y-2">
            <Label>Current Members</Label>
            {membersLoading ? (
              <div className="flex items-center justify-center h-20">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
              </div>
            ) : members.length === 0 ? (
              <p className="text-zinc-500 text-sm py-4 text-center">No members yet</p>
            ) : (
              <ScrollArea className="max-h-60">
                <div className="space-y-2">
                  {members.map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center justify-between bg-zinc-800/50 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-medium">
                          {member.user_id?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{member.user_id}</p>
                          <p className="text-xs text-zinc-500">
                            Joined {new Date(member.invited_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge className={getRoleBadgeColor(member.role)}>
                        {member.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle>Delete Workspace</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Are you sure you want to delete "{workspaceToDelete?.name}"? This action cannot be undone.
              All workflows and data in this workspace will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-zinc-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteWorkspace}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
