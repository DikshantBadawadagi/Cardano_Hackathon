// import { useState, useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { ScrollArea } from "@/components/ui/scroll-area"
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
//   Workflow,
//   Trash2,
//   MoreVertical,
//   Edit2,
//   Check,
//   X,
//   Loader2,
//   ChevronRight,
//   Calendar,
//   GitBranch,
//   ArrowLeft,
// } from "lucide-react"

// import {
//   getAllWorkflows,
//   createWorkflow,
//   deleteWorkflow,
//   updateWorkflowName,
//   setCurrentWorkflow,
// } from "../utils/api"

// export default function WorkflowSelector({ 
//   workspaceId, 
//   workspaceName, 
//   onWorkflowSelect, 
//   onClose,
//   onBack 
// }) {
//   const [workflows, setWorkflows] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
  
//   // Create workflow dialog
//   const [createDialogOpen, setCreateDialogOpen] = useState(false)
//   const [newWorkflowName, setNewWorkflowName] = useState("")
//   const [creating, setCreating] = useState(false)

//   // Edit workflow name
//   const [editingWorkflowId, setEditingWorkflowId] = useState(null)
//   const [editWorkflowName, setEditWorkflowName] = useState("")

//   // Delete confirmation
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
//   const [workflowToDelete, setWorkflowToDelete] = useState(null)
//   const [deleting, setDeleting] = useState(false)

//   // Load workflows on mount or when workspaceId changes
//   useEffect(() => {
//     if (workspaceId) {
//       loadWorkflows()
//     }
//   }, [workspaceId])

//   const loadWorkflows = async () => {
//     try {
//       setLoading(true)
//       setError(null)
//       const data = await getAllWorkflows(workspaceId)
//       setWorkflows(data.workflows || [])
//     } catch (err) {
//       console.error("Failed to load workflows:", err)
//       setError(err.message || "Failed to load workflows")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleCreateWorkflow = async () => {
//     if (!newWorkflowName.trim()) return
    
//     try {
//       setCreating(true)
//       const result = await createWorkflow(workspaceId, newWorkflowName.trim())
      
//       // Add to list
//       if (result.workflow) {
//         setWorkflows(prev => [result.workflow, ...prev])
//       }
      
//       setCreateDialogOpen(false)
//       setNewWorkflowName("")
//     } catch (err) {
//       console.error("Failed to create workflow:", err)
//       setError(err.message || "Failed to create workflow")
//     } finally {
//       setCreating(false)
//     }
//   }

//   const handleSelectWorkflow = (workflow) => {
//     setCurrentWorkflow(workflow._id)
//     if (onWorkflowSelect) {
//       onWorkflowSelect(workflow)
//     }
//   }

//   const handleStartEdit = (workflow) => {
//     setEditingWorkflowId(workflow._id)
//     setEditWorkflowName(workflow.name)
//   }

//   const handleSaveEdit = async (workflow) => {
//     if (!editWorkflowName.trim()) return
    
//     try {
//       await updateWorkflowName(workspaceId, workflow._id, editWorkflowName.trim())
      
//       // Update local state
//       setWorkflows(prev => prev.map(wf => 
//         wf._id === workflow._id 
//           ? { ...wf, name: editWorkflowName.trim() }
//           : wf
//       ))
      
//       setEditingWorkflowId(null)
//       setEditWorkflowName("")
//     } catch (err) {
//       console.error("Failed to update workflow:", err)
//     }
//   }

//   const handleCancelEdit = () => {
//     setEditingWorkflowId(null)
//     setEditWorkflowName("")
//   }

//   const handleDeleteWorkflow = async () => {
//     if (!workflowToDelete) return
    
//     try {
//       setDeleting(true)
//       await deleteWorkflow(workspaceId, workflowToDelete._id)
      
//       // Remove from list
//       setWorkflows(prev => prev.filter(wf => wf._id !== workflowToDelete._id))
      
//       setDeleteDialogOpen(false)
//       setWorkflowToDelete(null)
//     } catch (err) {
//       console.error("Failed to delete workflow:", err)
//       setError(err.message || "Failed to delete workflow")
//     } finally {
//       setDeleting(false)
//     }
//   }

//   const confirmDelete = (workflow) => {
//     setWorkflowToDelete(workflow)
//     setDeleteDialogOpen(true)
//   }

//   const formatDate = (dateString) => {
//     if (!dateString) return "Unknown"
//     try {
//       return new Date(dateString).toLocaleDateString("en-US", {
//         month: "short",
//         day: "numeric",
//         year: "numeric",
//       })
//     } catch {
//       return "Unknown"
//     }
//   }

//   const getNodeCount = (workflow) => {
//     return workflow.body_json?.nodes?.length || 0
//   }

//   const getEdgeCount = (workflow) => {
//     return workflow.body_json?.edges?.length || 0
//   }

//   return (
//     <div className="flex flex-col h-full bg-zinc-950 text-zinc-100">
//       {/* Header */}
//       <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
//         <div className="flex items-center gap-3">
//           {onBack && (
//             <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
//               <ArrowLeft className="h-5 w-5" />
//             </Button>
//           )}
//           <Workflow className="h-6 w-6 text-zinc-400" />
//           <div>
//             <h2 className="text-xl font-semibold">Workflows</h2>
//             <p className="text-sm text-zinc-500">{workspaceName || "Workspace"}</p>
//           </div>
//         </div>
        
//         <div className="flex items-center gap-2">
//           <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
//             <DialogTrigger asChild>
//               <Button className="bg-zinc-800 hover:bg-zinc-700">
//                 <Plus className="h-4 w-4 mr-2" />
//                 New Workflow
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="bg-zinc-900 border-zinc-800">
//               <DialogHeader>
//                 <DialogTitle>Create New Workflow</DialogTitle>
//                 <DialogDescription className="text-zinc-400">
//                   Create a new workflow to build your voice AI assistant.
//                 </DialogDescription>
//               </DialogHeader>
//               <div className="space-y-4 mt-4">
//                 <div>
//                   <Label htmlFor="workflowName">Workflow Name</Label>
//                   <Input
//                     id="workflowName"
//                     value={newWorkflowName}
//                     onChange={(e) => setNewWorkflowName(e.target.value)}
//                     placeholder="My Workflow"
//                     className="bg-zinc-800 border-zinc-700 mt-1"
//                     onKeyDown={(e) => {
//                       if (e.key === "Enter") handleCreateWorkflow()
//                     }}
//                   />
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
//                   onClick={handleCreateWorkflow}
//                   disabled={!newWorkflowName.trim() || creating}
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
//             <Button onClick={loadWorkflows} variant="outline" className="border-zinc-700">
//               Retry
//             </Button>
//           </div>
//         ) : workflows.length === 0 ? (
//           <div className="flex flex-col items-center justify-center h-40 gap-4">
//             <Workflow className="h-12 w-12 text-zinc-700" />
//             <p className="text-zinc-500">No workflows yet</p>
//             <Button onClick={() => setCreateDialogOpen(true)} className="bg-zinc-800 hover:bg-zinc-700">
//               <Plus className="h-4 w-4 mr-2" />
//               Create Your First Workflow
//             </Button>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {workflows.map((workflow) => (
//               <div
//                 key={workflow._id}
//                 className="group bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors"
//               >
//                 <div className="flex items-start justify-between mb-3">
//                   {editingWorkflowId === workflow._id ? (
//                     <div className="flex items-center gap-2 flex-1">
//                       <Input
//                         value={editWorkflowName}
//                         onChange={(e) => setEditWorkflowName(e.target.value)}
//                         className="bg-zinc-800 border-zinc-700 h-8"
//                         autoFocus
//                         onKeyDown={(e) => {
//                           if (e.key === "Enter") handleSaveEdit(workflow)
//                           if (e.key === "Escape") handleCancelEdit()
//                         }}
//                       />
//                       <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleSaveEdit(workflow)}>
//                         <Check className="h-4 w-4 text-green-400" />
//                       </Button>
//                       <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCancelEdit}>
//                         <X className="h-4 w-4 text-red-400" />
//                       </Button>
//                     </div>
//                   ) : (
//                     <>
//                       <div className="flex items-center gap-2">
//                         <Workflow className="h-5 w-5 text-blue-400" />
//                         <h3 className="font-medium truncate">{workflow.name}</h3>
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
//                             onClick={() => handleStartEdit(workflow)}
//                             className="cursor-pointer"
//                           >
//                             <Edit2 className="h-4 w-4 mr-2" />
//                             Rename
//                           </DropdownMenuItem>
//                           <DropdownMenuItem
//                             onClick={() => confirmDelete(workflow)}
//                             className="cursor-pointer text-red-400 focus:text-red-400"
//                           >
//                             <Trash2 className="h-4 w-4 mr-2" />
//                             Delete
//                           </DropdownMenuItem>
//                         </DropdownMenuContent>
//                       </DropdownMenu>
//                     </>
//                   )}
//                 </div>

//                 {/* Workflow Stats */}
//                 <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4">
//                   <div className="flex items-center gap-1">
//                     <GitBranch className="h-3 w-3" />
//                     <span>{getNodeCount(workflow)} nodes</span>
//                   </div>
//                   <div className="flex items-center gap-1">
//                     <Calendar className="h-3 w-3" />
//                     <span>{formatDate(workflow.created_at)}</span>
//                   </div>
//                 </div>

//                 <Button
//                   onClick={() => handleSelectWorkflow(workflow)}
//                   className="w-full bg-zinc-800 hover:bg-zinc-700"
//                 >
//                   Open Workflow
//                   <ChevronRight className="h-4 w-4 ml-2" />
//                 </Button>
//               </div>
//             ))}
//           </div>
//         )}
//       </ScrollArea>

//       {/* Delete Confirmation Dialog */}
//       <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
//         <DialogContent className="bg-zinc-900 border-zinc-800">
//           <DialogHeader>
//             <DialogTitle>Delete Workflow</DialogTitle>
//             <DialogDescription className="text-zinc-400">
//               Are you sure you want to delete "{workflowToDelete?.name}"? This action cannot be undone.
//               All nodes, edges, and configurations will be permanently deleted.
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
//               onClick={handleDeleteWorkflow}
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
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Edit3, FileText, Clock, CheckCircle2 } from "lucide-react"
import { getAllWorkflows, createWorkflow, updateWorkflowName, deleteWorkflow } from "../utils/api"

export default function WorkflowSelector({ workspaceId, workspaceName, onWorkflowSelect, onClose }) {
  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(true)

  // Dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Form states
  const [newWorkflowName, setNewWorkflowName] = useState("")
  const [selectedWorkflow, setSelectedWorkflow] = useState(null)
  const [editWorkflowName, setEditWorkflowName] = useState("")
  const [workflowToDelete, setWorkflowToDelete] = useState(null)

  // Function declarations
  const handleSelectWorkflow = (workflow) => {
    onWorkflowSelect(workflow)
  }

  const openEditDialog = (workflow) => {
    setSelectedWorkflow(workflow)
    setEditWorkflowName(workflow.name)
    setEditDialogOpen(true)
  }

  const openDeleteDialog = (workflow) => {
    setWorkflowToDelete(workflow)
    setDeleteDialogOpen(true)
  }

  const handleCreateWorkflow = async () => {
    if (newWorkflowName.trim()) {
      const createdWorkflow = await createWorkflow(workspaceId, newWorkflowName)
      setWorkflows([...workflows, createdWorkflow])
      setNewWorkflowName("")
      setCreateDialogOpen(false)
    }
  }

  const handleEditWorkflow = async () => {
    if (selectedWorkflow && editWorkflowName.trim()) {
      await updateWorkflowName(selectedWorkflow._id, editWorkflowName)
      setWorkflows(workflows.map((w) => (w._id === selectedWorkflow._id ? { ...w, name: editWorkflowName } : w)))
      setEditDialogOpen(false)
    }
  }

  const handleDeleteWorkflow = async () => {
    if (workflowToDelete) {
      await deleteWorkflow(workflowToDelete._id)
      setWorkflows(workflows.filter((w) => w._id !== workflowToDelete._id))
      setDeleteDialogOpen(false)
    }
  }

  useEffect(() => {
    const fetchWorkflows = async () => {
      const fetchedWorkflows = await getAllWorkflows(workspaceId)
      setWorkflows(fetchedWorkflows)
      setLoading(false)
    }

    fetchWorkflows()
  }, [workspaceId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-zinc-400">Loading workflows...</div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-zinc-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Workflows</h2>
          <p className="text-sm text-zinc-400 mt-1">
            in <span className="text-blue-400 font-semibold">{workspaceName}</span>
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          New Workflow
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workflows.map((workflow) => (
          <Card
            key={workflow._id}
            className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all duration-200 hover:shadow-lg"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate flex items-center gap-2 text-white">
                    <FileText className="h-4 w-4 text-blue-400" />
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
                <Badge variant="outline" className="bg-zinc-800/50 border-zinc-700 text-zinc-300">
                  {workflow.body_json?.nodes?.length || 0} nodes
                </Badge>
                <Badge variant="outline" className="bg-zinc-800/50 border-zinc-700 text-zinc-300">
                  {workflow.body_json?.edges?.length || 0} edges
                </Badge>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleSelectWorkflow(workflow)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Open
                </Button>
                <Button
                  onClick={() => openEditDialog(workflow)}
                  variant="outline"
                  size="sm"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
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
          <Button
            onClick={() => setCreateDialogOpen(true)}
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            Create your first workflow
          </Button>
        </div>
      )}

      {/* Create Workflow Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Workflow</DialogTitle>
            <DialogDescription className="text-zinc-400">Create a new workflow in {workspaceName}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="workflow-name" className="text-zinc-100">
                Workflow Name
              </Label>
              <Input
                id="workflow-name"
                value={newWorkflowName}
                onChange={(e) => setNewWorkflowName(e.target.value)}
                placeholder="e.g., Sales Onboarding, Customer Support"
                className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
                onKeyPress={(e) => e.key === "Enter" && handleCreateWorkflow()}
              />
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
            <Button onClick={handleCreateWorkflow} className="bg-blue-600 hover:bg-blue-700 text-white">
              Create Workflow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Workflow Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Workflow</DialogTitle>
            <DialogDescription className="text-zinc-400">Update workflow name</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-workflow-name" className="text-zinc-100">
                Workflow Name
              </Label>
              <Input
                id="edit-workflow-name"
                value={editWorkflowName}
                onChange={(e) => setEditWorkflowName(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-zinc-100"
                onKeyPress={(e) => e.key === "Enter" && handleEditWorkflow()}
              />
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
            <Button onClick={handleEditWorkflow} className="bg-blue-600 hover:bg-blue-700 text-white">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Workflow Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Workflow</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Are you sure you want to delete "{workflowToDelete?.name}"? This action cannot be undone.
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
            <Button onClick={handleDeleteWorkflow} className="bg-red-900 hover:bg-red-800 text-white">
              Delete Workflow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
