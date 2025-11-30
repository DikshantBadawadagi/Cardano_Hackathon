// import { useState, useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Badge } from "@/components/ui/badge"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { Separator } from "@/components/ui/separator"
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
//   DialogFooter,
//   DialogDescription,
// } from "@/components/ui/dialog"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import {
//   Plus,
//   Briefcase,
//   Users,
//   Trash2,
//   MoreVertical,
//   UserPlus,
//   Crown,
//   Edit2,
//   Check,
//   X,
//   Loader2,
//   Settings,
//   ChevronRight,
// } from "lucide-react"

// import {
//   getAllWorkspaces,
//   createWorkspace,
//   deleteWorkspace,
//   updateWorkspace,
//   getWorkspaceMembers,
//   addWorkspaceMember,
//   setCurrentWorkspace,
// } from "../utils/workspaceApi"

// export default function Workspace({ currentUser, onWorkspaceSelect, onClose }) {
//   const [workspaces, setWorkspaces] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
  
//   // Create workspace dialog
//   const [createDialogOpen, setCreateDialogOpen] = useState(false)
//   const [newWorkspaceName, setNewWorkspaceName] = useState("")
//   const [isEditableByCollaborators, setIsEditableByCollaborators] = useState(true)
//   const [creating, setCreating] = useState(false)

//   // Members dialog
//   const [membersDialogOpen, setMembersDialogOpen] = useState(false)
//   const [selectedWorkspace, setSelectedWorkspace] = useState(null)
//   const [members, setMembers] = useState([])
//   const [membersLoading, setMembersLoading] = useState(false)

//   // Add member
//   const [addMemberEmail, setAddMemberEmail] = useState("")
//   const [addMemberRole, setAddMemberRole] = useState("viewer")
//   const [addingMember, setAddingMember] = useState(false)
//   const [addMemberError, setAddMemberError] = useState(null)

//   // Edit workspace name
//   const [editingWorkspaceId, setEditingWorkspaceId] = useState(null)
//   const [editWorkspaceName, setEditWorkspaceName] = useState("")

//   // Delete confirmation
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
//   const [workspaceToDelete, setWorkspaceToDelete] = useState(null)
//   const [deleting, setDeleting] = useState(false)

//   // Load workspaces on mount
//   useEffect(() => {
//     loadWorkspaces()
//   }, [])

//   const loadWorkspaces = async () => {
//     try {
//       setLoading(true)
//       setError(null)
//       const data = await getAllWorkspaces()
//       setWorkspaces(data.workspaces || [])
//     } catch (err) {
//       console.error("Failed to load workspaces:", err)
//       setError(err.message || "Failed to load workspaces")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleCreateWorkspace = async () => {
//     if (!newWorkspaceName.trim()) return
    
//     try {
//       setCreating(true)
//       const result = await createWorkspace(newWorkspaceName.trim(), isEditableByCollaborators)
      
//       // Add to list
//       if (result.workspace) {
//         setWorkspaces(prev => [result.workspace, ...prev])
//       }
      
//       setCreateDialogOpen(false)
//       setNewWorkspaceName("")
//       setIsEditableByCollaborators(true)
//     } catch (err) {
//       console.error("Failed to create workspace:", err)
//       setError(err.message || "Failed to create workspace")
//     } finally {
//       setCreating(false)
//     }
//   }

//   const handleSelectWorkspace = (workspace) => {
//     setCurrentWorkspace(workspace._id)
//     if (onWorkspaceSelect) {
//       onWorkspaceSelect(workspace)
//     }
//   }

//   const handleOpenMembers = async (workspace) => {
//     setSelectedWorkspace(workspace)
//     setMembersDialogOpen(true)
//     setMembersLoading(true)
//     setAddMemberError(null)
    
//     try {
//       const data = await getWorkspaceMembers(workspace._id)
//       setMembers(data.members || [])
//     } catch (err) {
//       console.error("Failed to load members:", err)
//     } finally {
//       setMembersLoading(false)
//     }
//   }

//   const handleAddMember = async () => {
//     if (!addMemberEmail.trim() || !selectedWorkspace) return
    
//     try {
//       setAddingMember(true)
//       setAddMemberError(null)
      
//       const result = await addWorkspaceMember(
//         selectedWorkspace._id,
//         addMemberEmail.trim(),
//         addMemberRole
//       )
      
//       // Refresh members list
//       const data = await getWorkspaceMembers(selectedWorkspace._id)
//       setMembers(data.members || [])
      
//       setAddMemberEmail("")
//       setAddMemberRole("viewer")
//     } catch (err) {
//       console.error("Failed to add member:", err)
//       setAddMemberError(err.message || "Failed to add member")
//     } finally {
//       setAddingMember(false)
//     }
//   }

//   const handleStartEdit = (workspace) => {
//     setEditingWorkspaceId(workspace._id)
//     setEditWorkspaceName(workspace.name)
//   }

//   const handleSaveEdit = async (workspace) => {
//     if (!editWorkspaceName.trim()) return
    
//     try {
//       await updateWorkspace(workspace._id, editWorkspaceName.trim(), workspace.is_editable_by_collaborators)
      
//       // Update local state
//       setWorkspaces(prev => prev.map(ws => 
//         ws._id === workspace._id 
//           ? { ...ws, name: editWorkspaceName.trim() }
//           : ws
//       ))
      
//       setEditingWorkspaceId(null)
//       setEditWorkspaceName("")
//     } catch (err) {
//       console.error("Failed to update workspace:", err)
//     }
//   }

//   const handleCancelEdit = () => {
//     setEditingWorkspaceId(null)
//     setEditWorkspaceName("")
//   }

//   const handleDeleteWorkspace = async () => {
//     if (!workspaceToDelete) return
    
//     try {
//       setDeleting(true)
//       await deleteWorkspace(workspaceToDelete._id)
      
//       // Remove from list
//       setWorkspaces(prev => prev.filter(ws => ws._id !== workspaceToDelete._id))
      
//       setDeleteDialogOpen(false)
//       setWorkspaceToDelete(null)
//     } catch (err) {
//       console.error("Failed to delete workspace:", err)
//       setError(err.message || "Failed to delete workspace")
//     } finally {
//       setDeleting(false)
//     }
//   }

//   const confirmDelete = (workspace) => {
//     setWorkspaceToDelete(workspace)
//     setDeleteDialogOpen(true)
//   }

//   const getRoleBadgeColor = (role) => {
//     switch (role) {
//       case "owner": return "bg-amber-500/20 text-amber-300 border-amber-500/30"
//       case "admin": return "bg-purple-500/20 text-purple-300 border-purple-500/30"
//       case "editor": return "bg-blue-500/20 text-blue-300 border-blue-500/30"
//       case "viewer": return "bg-zinc-500/20 text-zinc-300 border-zinc-500/30"
//       default: return "bg-zinc-500/20 text-zinc-300 border-zinc-500/30"
//     }
//   }

//   const isOwner = (workspace) => {
//     return currentUser && workspace.owner_user_id === currentUser._id
//   }

//   return (
//     <div className="flex flex-col h-full bg-zinc-950 text-zinc-100">
//       {/* Header */}
//       <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
//         <div className="flex items-center gap-3">
//           <Briefcase className="h-6 w-6 text-zinc-400" />
//           <h2 className="text-xl font-semibold">Workspaces</h2>
//         </div>
        
//         <div className="flex items-center gap-2">
//           <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
//             <DialogTrigger asChild>
//               <Button className="bg-zinc-800 hover:bg-zinc-700">
//                 <Plus className="h-4 w-4 mr-2" />
//                 New Workspace
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="bg-zinc-900 border-zinc-800">
//               <DialogHeader>
//                 <DialogTitle>Create New Workspace</DialogTitle>
//                 <DialogDescription className="text-zinc-400">
//                   Create a new workspace to organize your workflows and collaborate with others.
//                 </DialogDescription>
//               </DialogHeader>
//               <div className="space-y-4 mt-4">
//                 <div>
//                   <Label htmlFor="workspaceName">Workspace Name</Label>
//                   <Input
//                     id="workspaceName"
//                     value={newWorkspaceName}
//                     onChange={(e) => setNewWorkspaceName(e.target.value)}
//                     placeholder="My Workspace"
//                     className="bg-zinc-800 border-zinc-700 mt-1"
//                   />
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <input
//                     type="checkbox"
//                     id="editableByCollaborators"
//                     checked={isEditableByCollaborators}
//                     onChange={(e) => setIsEditableByCollaborators(e.target.checked)}
//                     className="rounded border-zinc-600"
//                   />
//                   <Label htmlFor="editableByCollaborators" className="text-sm text-zinc-400">
//                     Allow collaborators to edit workflows
//                   </Label>
//                 </div>
//               </div>
//               <DialogFooter className="mt-6">
//                 <Button
//                   variant="outline"
//                   onClick={() => setCreateDialogOpen(false)}
//                   className="border-zinc-700"
//                 >
//                   Cancel
//                 </Button>
//                 <Button
//                   onClick={handleCreateWorkspace}
//                   disabled={!newWorkspaceName.trim() || creating}
//                   className="bg-blue-600 hover:bg-blue-700"
//                 >
//                   {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
//                   Create
//                 </Button>
//               </DialogFooter>
//             </DialogContent>
//           </Dialog>

//           {onClose && (
//             <Button variant="ghost" size="icon" onClick={onClose}>
//               <X className="h-5 w-5" />
//             </Button>
//           )}
//         </div>
//       </div>

//       {/* Content */}
//       <ScrollArea className="flex-1 p-6">
//         {loading ? (
//           <div className="flex items-center justify-center h-40">
//             <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
//           </div>
//         ) : error ? (
//           <div className="flex flex-col items-center justify-center h-40 gap-4">
//             <p className="text-red-400">{error}</p>
//             <Button onClick={loadWorkspaces} variant="outline" className="border-zinc-700">
//               Retry
//             </Button>
//           </div>
//         ) : workspaces.length === 0 ? (
//           <div className="flex flex-col items-center justify-center h-40 gap-4">
//             <Briefcase className="h-12 w-12 text-zinc-700" />
//             <p className="text-zinc-500">No workspaces yet</p>
//             <Button onClick={() => setCreateDialogOpen(true)} className="bg-zinc-800 hover:bg-zinc-700">
//               <Plus className="h-4 w-4 mr-2" />
//               Create Your First Workspace
//             </Button>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {workspaces.map((workspace) => (
//               <div
//                 key={workspace._id}
//                 className="group bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors"
//               >
//                 <div className="flex items-start justify-between mb-3">
//                   {editingWorkspaceId === workspace._id ? (
//                     <div className="flex items-center gap-2 flex-1">
//                       <Input
//                         value={editWorkspaceName}
//                         onChange={(e) => setEditWorkspaceName(e.target.value)}
//                         className="bg-zinc-800 border-zinc-700 h-8"
//                         autoFocus
//                       />
//                       <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleSaveEdit(workspace)}>
//                         <Check className="h-4 w-4 text-green-400" />
//                       </Button>
//                       <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCancelEdit}>
//                         <X className="h-4 w-4 text-red-400" />
//                       </Button>
//                     </div>
//                   ) : (
//                     <>
//                       <div className="flex items-center gap-2">
//                         <Briefcase className="h-5 w-5 text-zinc-500" />
//                         <h3 className="font-medium truncate">{workspace.name}</h3>
//                         {isOwner(workspace) && (
//                           <Crown className="h-4 w-4 text-amber-400" title="You own this workspace" />
//                         )}
//                       </div>
                      
//                       <DropdownMenu>
//                         <DropdownMenuTrigger asChild>
//                           <Button
//                             variant="ghost"
//                             size="icon"
//                             className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
//                           >
//                             <MoreVertical className="h-4 w-4" />
//                           </Button>
//                         </DropdownMenuTrigger>
//                         <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
//                           <DropdownMenuItem
//                             onClick={() => handleOpenMembers(workspace)}
//                             className="cursor-pointer"
//                           >
//                             <Users className="h-4 w-4 mr-2" />
//                             Manage Members
//                           </DropdownMenuItem>
//                           {isOwner(workspace) && (
//                             <>
//                               <DropdownMenuItem
//                                 onClick={() => handleStartEdit(workspace)}
//                                 className="cursor-pointer"
//                               >
//                                 <Edit2 className="h-4 w-4 mr-2" />
//                                 Rename
//                               </DropdownMenuItem>
//                               <DropdownMenuItem
//                                 onClick={() => confirmDelete(workspace)}
//                                 className="cursor-pointer text-red-400 focus:text-red-400"
//                               >
//                                 <Trash2 className="h-4 w-4 mr-2" />
//                                 Delete
//                               </DropdownMenuItem>
//                             </>
//                           )}
//                         </DropdownMenuContent>
//                       </DropdownMenu>
//                     </>
//                   )}
//                 </div>

//                 <div className="flex items-center gap-2 text-xs text-zinc-500 mb-4">
//                   <Users className="h-3 w-3" />
//                   <span>Click to view workflows</span>
//                 </div>

//                 <Button
//                   onClick={() => handleSelectWorkspace(workspace)}
//                   className="w-full bg-zinc-800 hover:bg-zinc-700"
//                 >
//                   Open Workspace
//                   <ChevronRight className="h-4 w-4 ml-2" />
//                 </Button>
//               </div>
//             ))}
//           </div>
//         )}
//       </ScrollArea>

//       {/* Members Dialog */}
//       <Dialog open={membersDialogOpen} onOpenChange={setMembersDialogOpen}>
//         <DialogContent className="bg-zinc-900 border-zinc-800 max-w-lg">
//           <DialogHeader>
//             <DialogTitle>
//               Members of {selectedWorkspace?.name}
//             </DialogTitle>
//             <DialogDescription className="text-zinc-400">
//               Manage who has access to this workspace and their permissions.
//             </DialogDescription>
//           </DialogHeader>

//           {/* Add Member Form */}
//           <div className="space-y-3 mt-4">
//             <Label>Add New Member</Label>
//             <div className="flex gap-2">
//               <Input
//                 value={addMemberEmail}
//                 onChange={(e) => setAddMemberEmail(e.target.value)}
//                 placeholder="Email address"
//                 className="bg-zinc-800 border-zinc-700 flex-1"
//               />
//               <select
//                 value={addMemberRole}
//                 onChange={(e) => setAddMemberRole(e.target.value)}
//                 className="bg-zinc-800 border border-zinc-700 rounded-md px-3 text-sm"
//               >
//                 <option value="viewer">Viewer</option>
//                 <option value="editor">Editor</option>
//                 <option value="admin">Admin</option>
//               </select>
//               <Button
//                 onClick={handleAddMember}
//                 disabled={!addMemberEmail.trim() || addingMember}
//                 className="bg-blue-600 hover:bg-blue-700"
//               >
//                 {addingMember ? (
//                   <Loader2 className="h-4 w-4 animate-spin" />
//                 ) : (
//                   <UserPlus className="h-4 w-4" />
//                 )}
//               </Button>
//             </div>
//             {addMemberError && (
//               <p className="text-red-400 text-sm">{addMemberError}</p>
//             )}
//           </div>

//           <Separator className="my-4 bg-zinc-800" />

//           {/* Members List */}
//           <div className="space-y-2">
//             <Label>Current Members</Label>
//             {membersLoading ? (
//               <div className="flex items-center justify-center h-20">
//                 <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
//               </div>
//             ) : members.length === 0 ? (
//               <p className="text-zinc-500 text-sm py-4 text-center">No members yet</p>
//             ) : (
//               <ScrollArea className="max-h-60">
//                 <div className="space-y-2">
//                   {members.map((member) => (
//                     <div
//                       key={member._id}
//                       className="flex items-center justify-between bg-zinc-800/50 rounded-lg p-3"
//                     >
//                       <div className="flex items-center gap-3">
//                         <div className="h-8 w-8 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-medium">
//                           {member.user_id?.charAt(0)?.toUpperCase() || "U"}
//                         </div>
//                         <div>
//                           <p className="text-sm font-medium">{member.user_id}</p>
//                           <p className="text-xs text-zinc-500">
//                             Joined {new Date(member.invited_at).toLocaleDateString()}
//                           </p>
//                         </div>
//                       </div>
//                       <Badge className={getRoleBadgeColor(member.role)}>
//                         {member.role}
//                       </Badge>
//                     </div>
//                   ))}
//                 </div>
//               </ScrollArea>
//             )}
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Delete Confirmation Dialog */}
//       <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
//         <DialogContent className="bg-zinc-900 border-zinc-800">
//           <DialogHeader>
//             <DialogTitle>Delete Workspace</DialogTitle>
//             <DialogDescription className="text-zinc-400">
//               Are you sure you want to delete "{workspaceToDelete?.name}"? This action cannot be undone.
//               All workflows and data in this workspace will be permanently deleted.
//             </DialogDescription>
//           </DialogHeader>
//           <DialogFooter className="mt-6">
//             <Button
//               variant="outline"
//               onClick={() => setDeleteDialogOpen(false)}
//               className="border-zinc-700"
//             >
//               Cancel
//             </Button>
//             <Button
//               onClick={handleDeleteWorkspace}
//               disabled={deleting}
//               className="bg-red-600 hover:bg-red-700"
//             >
//               {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
//               Delete
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// }


"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, Settings, Users, Trash2, UserPlus, Crown, Shield, Edit3, Eye, CheckCircle2, XCircle } from "lucide-react"
import { getAllWorkspaces } from "../utils/workspaceApi"

export default function Workspace({ currentUser, onWorkspaceSelect, onClose }) {
  const [workspaces, setWorkspaces] = useState([])
  const [selectedWorkspace, setSelectedWorkspace] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("workspaces")

  // Dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false)

  // Form states
  const [newWorkspaceName, setNewWorkspaceName] = useState("")
  const [isEditable, setIsEditable] = useState(true)
  const [editWorkspaceName, setEditWorkspaceName] = useState("")
  const [editIsEditable, setEditIsEditable] = useState(true)
  const [workspaceToDelete, setWorkspaceToDelete] = useState(null)

  // Add member form
  const [memberEmail, setMemberEmail] = useState("")
  const [memberRole, setMemberRole] = useState("viewer")

  // Declare missing functions
  const handleWorkspaceAction = (workspace) => {
    setSelectedWorkspace(workspace)
    onWorkspaceSelect(workspace)
  }

  const handleSelectWorkspace = (workspace) => {
    setSelectedWorkspace(workspace)
    setEditDialogOpen(true)
  }

  const openDeleteDialog = (workspace) => {
    setWorkspaceToDelete(workspace)
    setDeleteDialogOpen(true)
  }

  const openEditDialog = () => {
    setEditDialogOpen(true)
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case "owner":
        return <Crown className="h-5 w-5" />
      case "admin":
        return <Shield className="h-5 w-5" />
      case "editor":
        return <Edit3 className="h-5 w-5" />
      default:
        return <Eye className="h-5 w-5" />
    }
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "owner":
        return "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
      case "admin":
        return "bg-blue-500/20 text-blue-300 border border-blue-500/30"
      case "editor":
        return "bg-green-500/20 text-green-300 border border-green-500/30"
      default:
        return "bg-zinc-500/20 text-zinc-300 border border-zinc-500/30"
    }
  }

  const handleUpdateMemberRole = (userId, newRole) => {
    // Implementation for updating member role
  }

  const handleRemoveMember = (userId) => {
    // Implementation for removing member
  }

  const handleCreateWorkspace = () => {
    // Implementation for creating workspace
  }

  const handleEditWorkspace = () => {
    // Implementation for editing workspace
  }

  const handleDeleteWorkspace = () => {
    // Implementation for deleting workspace
  }

  const handleAddMember = () => {
    // Implementation for adding member
  }

  useEffect(() => {
    const fetchWorkspaces = async () => {
      const workspacesData = await getAllWorkspaces()
      setWorkspaces(workspacesData)
      setLoading(false)
    }

    fetchWorkspaces()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-zinc-400">Loading workspaces...</div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-zinc-100">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b border-zinc-800 px-6 py-4">
          <TabsList className="bg-zinc-900/50 border border-zinc-800">
            <TabsTrigger
              value="workspaces"
              className="data-[state=active]:bg-zinc-800 text-zinc-300 data-[state=active]:text-zinc-100"
            >
              Workspaces
            </TabsTrigger>
            <TabsTrigger
              value="details"
              disabled={!selectedWorkspace}
              className="data-[state=active]:bg-zinc-800 text-zinc-300 data-[state=active]:text-zinc-100 disabled:opacity-50"
            >
              Details & Members
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <TabsContent value="workspaces" className="mt-0 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Your Workspaces</h2>
                <p className="text-sm text-zinc-400 mt-1">Select a workspace to manage workflows</p>
              </div>
              <Button onClick={() => setCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                New Workspace
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workspaces.map((workspace) => {
                const isOwner = workspace.owner_user_id === currentUser?._id

                return (
                  <Card
                    key={workspace._id}
                    className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all duration-200 hover:shadow-lg"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate text-white">{workspace.name}</CardTitle>
                          <CardDescription className="text-xs text-zinc-500 mt-1">
                            {new Date(workspace.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        {isOwner && (
                          <Badge className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 ml-2">
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
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                          size="sm"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Select
                        </Button>
                        <Button
                          onClick={() => handleSelectWorkspace(workspace)}
                          variant="outline"
                          size="sm"
                          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
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
                )
              })}
            </div>

            {workspaces.length === 0 && (
              <div className="text-center py-12">
                <p className="text-zinc-400 mb-4">No workspaces yet</p>
                <Button
                  onClick={() => setCreateDialogOpen(true)}
                  variant="outline"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
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
                    <h2 className="text-2xl font-bold text-white">{selectedWorkspace.name}</h2>
                    <p className="text-sm text-zinc-400 mt-1">Workspace settings and members</p>
                  </div>
                  {selectedWorkspace.owner_user_id === currentUser?._id && (
                    <div className="flex gap-2">
                      <Button
                        onClick={openEditDialog}
                        variant="outline"
                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white bg-transparent"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  )}
                </div>

                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Users className="h-5 w-5" />
                      Members ({members.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-sm text-zinc-400">Manage workspace collaborators</p>
                      {selectedWorkspace.owner_user_id === currentUser?._id && (
                        <Button
                          onClick={() => setAddMemberDialogOpen(true)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add Member
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2">
                      {members.map((member) => {
                        const isCurrentUser = member.user_id === currentUser?._id
                        const isOwner = selectedWorkspace.owner_user_id === currentUser?._id

                        return (
                          <div
                            key={member._id}
                            className="flex items-center justify-between p-3 bg-zinc-950/50 rounded-lg border border-zinc-800"
                          >
                            <div className="flex items-center gap-3">
                              {getRoleIcon(member.role)}
                              <div>
                                <p className="text-sm font-medium text-zinc-100">
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

                              {isOwner && member.role !== "owner" && !isCurrentUser && (
                                <>
                                  <Select
                                    value={member.role}
                                    onValueChange={(newRole) => handleUpdateMemberRole(member.user_id, newRole)}
                                  >
                                    <SelectTrigger className="w-28 h-8 bg-zinc-900/50 border-zinc-800 text-zinc-100">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
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
                        )
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
            <DialogTitle className="text-white">Create New Workspace</DialogTitle>
            <DialogDescription className="text-zinc-400">Set up a new workspace for your team</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="workspace-name" className="text-zinc-100">
                Workspace Name
              </Label>
              <Input
                id="workspace-name"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                placeholder="e.g., Sales Team, Support"
                className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-zinc-100">Allow Collaborators to Edit</Label>
                <p className="text-xs text-zinc-500">Let members edit workflows in this workspace</p>
              </div>
              <Switch checked={isEditable} onCheckedChange={setIsEditable} />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button onClick={handleCreateWorkspace} className="bg-blue-600 hover:bg-blue-700 text-white">
              Create Workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Workspace Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Workspace</DialogTitle>
            <DialogDescription className="text-zinc-400">Update workspace settings</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-workspace-name" className="text-zinc-100">
                Workspace Name
              </Label>
              <Input
                id="edit-workspace-name"
                value={editWorkspaceName}
                onChange={(e) => setEditWorkspaceName(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-zinc-100"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-zinc-100">Allow Collaborators to Edit</Label>
                <p className="text-xs text-zinc-500">Let members edit workflows in this workspace</p>
              </div>
              <Switch checked={editIsEditable} onCheckedChange={setEditIsEditable} />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button onClick={handleEditWorkspace} className="bg-blue-600 hover:bg-blue-700 text-white">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Workspace Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Workspace</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Are you sure you want to delete "{workspaceToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
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
            <DialogTitle className="text-white">Add Member</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Invite someone to collaborate on this workspace
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="member-email" className="text-zinc-100">
                Email Address
              </Label>
              <Input
                id="member-email"
                type="email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="member@example.com"
                className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="member-role" className="text-zinc-100">
                Role
              </Label>
              <Select value={memberRole} onValueChange={setMemberRole}>
                <SelectTrigger id="member-role" className="bg-zinc-950 border-zinc-800 text-zinc-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddMemberDialogOpen(false)}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button onClick={handleAddMember} className="bg-blue-600 hover:bg-blue-700 text-white">
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
