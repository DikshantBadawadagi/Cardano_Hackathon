// import { useState, useEffect, useRef, useCallback } from "react"
// import { useLocation } from "react-router-dom"
// import { ReactFlowProvider } from "@xyflow/react"

// import { Button } from "@/components/ui/button"
// import { Dialog, DialogContent } from "@/components/ui/dialog"
// import { Separator } from "@/components/ui/separator"
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
// import {
//   ChevronLeft,
//   ChevronRight,
//   Phone,
//   Mic,
//   BarChart3,
//   ScrollText,
//   MessagesSquare,
//   Cog,
//   Wrench,
//   RefreshCw,
//   Briefcase,
//   Workflow,
//   ChevronDown
// } from "lucide-react"

// import WorkflowBuilder from "./Canvas"
// import PhoneNumbers from "./PhoneNumbers"
// import Voices from "./Voices"
// import Metrics from "./Metrics"
// import SessionLogs from "./SessionLogs"
// import Transcripts from "./Transcripts"
// import Settings from "./Settings"
// import UploadPDFs from "./UploadPDFs"
// import EmailTool from "./EmailTool"
// import Call from "./Call"
// import Workspace from "./components/Workspace"
// import WorkflowSelector from "./components/WorkflowSelector"

// import { fetchCurrentUser, setCurrentWorkflow } from "./utils/api"
// import { 
//   getCurrentWorkspace, 
//   getCurrentWorkflow, 
//   setCurrentWorkspace as saveCurrentWorkspace 
// } from "./utils/workspaceApi"

// export default function Dashboard() {
//   const location = useLocation()
//   const [activeTab, setActiveTab] = useState("workflow")
//   const [isToolsOpen, setIsToolsOpen] = useState(false)
//   const [workflowRefresh, setWorkflowRefresh] = useState(null)
  
//   // User state
//   const [currentUser, setCurrentUser] = useState(null)
  
//   // Workspace/Workflow state
//   const [currentWorkspace, setCurrentWorkspace] = useState(null)
//   const [currentWorkflowData, setCurrentWorkflowData] = useState(null)
//   const [workspaceDialogOpen, setWorkspaceDialogOpen] = useState(false)
//   const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false)
  
//   const [assistantTitle, setAssistantTitle] = useState(() => {
//     return localStorage.getItem("assistantTitle") || "Sales Assistant"
//   })
//   const [isEditingTitle, setIsEditingTitle] = useState(false)
//   const [stats, setStats] = useState({
//     totalHours: 0,
//     totalCalls: 0,
//     totalConversations: 0,
//     loading: true,
//   })
//   const userEmail = location.state?.email
//   const toolsRef = useRef(null)

//   const [collapsed, setCollapsed] = useState(false)

//   const BASE_URL = "http://127.0.0.1:5000/api"

//   // Load current user on mount
//   useEffect(() => {
//     loadCurrentUser()
//     loadContextFromStorage()
//   }, [])

//   const loadCurrentUser = async () => {
//     try {
//       const user = await fetchCurrentUser()
//       if (user) {
//         setCurrentUser(user)
//       }
//     } catch (error) {
//       console.error('Failed to load user:', error)
//     }
//   }

//   const loadContextFromStorage = () => {
//     const workspaceId = getCurrentWorkspace()
//     const workflowId = getCurrentWorkflow()
    
//     if (workspaceId) {
//       // Store workspace with just the ID - full details loaded when user interacts
//       setCurrentWorkspace({ _id: workspaceId })
//     }
    
//     if (workflowId) {
//       // Store workflow with just the ID - full details loaded when user interacts
//       setCurrentWorkflowData({ _id: workflowId })
//     }
//   }

//   const handleWorkspaceSelect = (workspace) => {
//     saveCurrentWorkspace(workspace._id) // Save to localStorage
//     setCurrentWorkspace(workspace) // Update React state
//     setCurrentWorkflowData(null) // Clear workflow when switching workspace
//     setWorkspaceDialogOpen(false)
//     setWorkflowDialogOpen(true) // Open workflow selector
//   }

//   const handleWorkflowSelect = (workflow) => {
//     setCurrentWorkflow(workflow._id) // Save to localStorage
//     setCurrentWorkflowData(workflow) // Update React state
//     setWorkflowDialogOpen(false)
//     setActiveTab('workflow') // Switch to workflow tab
//   }

//   // ... (keep all your existing fetch functions)
//   const fetchTimeData = useCallback(async () => {
//     try {
//       const response = await fetch(`${BASE_URL}/timeDate`, {
//         headers: {
//           "ngrok-skip-browser-warning": "true",
//           "Content-Type": "application/json",
//           Accept: "application/json",
//         },
//       })
//       if (!response.ok) throw new Error("Failed to fetch time data")
//       const data = await response.json()

//       const totalCalls = data.dates?.reduce((sum, dateObj) => sum + (dateObj.totalCalls || 0), 0) || 0

//       const totalHours = convertTimeToHours(data.totalTime || "0:00:00")
//       return { totalCalls, totalHours }
//     } catch (error) {
//       console.error("Error fetching time data:", error)
//       return { totalCalls: 0, totalHours: 0 }
//     }
//   }, [])

//   const fetchSessionData = useCallback(async () => {
//     try {
//       const response = await fetch(`${BASE_URL}/sessionLogs`, {
//         headers: {
//           "ngrok-skip-browser-warning": "true",
//           "Content-Type": "application/json",
//           Accept: "application/json",
//         },
//       })
//       if (!response.ok) throw new Error("Failed to fetch session data")
//       const sessions = await response.json()

//       const totalConversations = sessions.reduce((sum, session) => {
//         const messagesCount = Array.isArray(session.messages) ? session.messages.length : 0
//         return sum + messagesCount
//       }, 0)

//       return totalConversations
//     } catch (error) {
//       console.error("Error fetching session data:", error)
//       return 0
//     }
//   }, [])

//   const convertTimeToHours = (timeString) => {
//     try {
//       const [hours, minutes, seconds] = timeString.split(":").map(Number)
//       return hours + minutes / 60 + seconds / 3600
//     } catch {
//       return 0
//     }
//   }

//   const fetchStats = useCallback(async () => {
//     setStats((prev) => ({ ...prev, loading: true }))
//     try {
//       const [timeData, conversationsCount] = await Promise.all([fetchTimeData(), fetchSessionData()])
//       setStats({
//         totalHours: Math.round(timeData.totalHours * 100) / 100,
//         totalCalls: timeData.totalCalls,
//         totalConversations: conversationsCount,
//         loading: false,
//       })
//     } catch (error) {
//       console.error("Error fetching stats:", error)
//       setStats({
//         totalHours: 0,
//         totalCalls: 0,
//         totalConversations: 0,
//         loading: false,
//       })
//     }
//   }, [fetchTimeData, fetchSessionData])

//   useEffect(() => {
//     fetchStats()
//   }, [fetchStats])

//   useEffect(() => {
//     function handleClickOutside(event) {
//       if (toolsRef.current && !toolsRef.current.contains(event.target)) {
//         setIsToolsOpen(false)
//       }
//     }
//     document.addEventListener("mousedown", handleClickOutside)
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside)
//     }
//   }, [])

//   const renderMainContent = () => {
//     switch (activeTab) {
//       case "workflow":
//         // Only show workflow if both workspace and workflow are selected
//         if (!currentWorkspace || !currentWorkflowData) {
//           return (
//             <div className="flex items-center justify-center h-full">
//               <div className="text-center">
//                 <Workflow className="h-16 w-16 text-zinc-700 mx-auto mb-4" />
//                 <p className="text-zinc-400 mb-4">
//                   {!currentWorkspace ? 'Please select a workspace first' : 'Please select a workflow to start'}
//                 </p>
//                 <Button 
//                   onClick={() => !currentWorkspace ? setWorkspaceDialogOpen(true) : setWorkflowDialogOpen(true)}
//                   className="bg-zinc-800 hover:bg-zinc-700"
//                 >
//                   {!currentWorkspace ? 'Select Workspace' : 'Select Workflow'}
//                 </Button>
//               </div>
//             </div>
//           )
//         }
//         return (
//           <ReactFlowProvider>
//             <WorkflowBuilder 
//               workspaceId={currentWorkspace._id}
//               workflowId={currentWorkflowData._id}
//               onProvideRefresh={(fn) => setWorkflowRefresh(() => fn)} 
//             />
//           </ReactFlowProvider>
//         )
//       case "phone-numbers":
//         return <PhoneNumbers />
//       case "voices":
//         return <Voices />
//       case "metrics":
//         return <Metrics />
//       case "session-logs":
//         return <SessionLogs />
//       case "transcripts":
//         return <Transcripts />
//       case "settings":
//         return <Settings />
//       case "upload-pdfs":
//         return <UploadPDFs onWorkflowRefresh={workflowRefresh} />
//       case "email-tool":
//         return <EmailTool onWorkflowRefresh={workflowRefresh} />
//       default:
//         return (
//           <div className="flex items-center justify-center h-full">
//             <p className="text-zinc-400">Select a workspace and workflow to begin</p>
//           </div>
//         )
//     }
//   }

//   const handleCreateEmailTool = () => {
//     setIsToolsOpen(false)
//     setActiveTab("email-tool")
//   }

//   const handleTitleClick = () => setIsEditingTitle(true)
//   const handleTitleChange = (e) => {
//     const newTitle = e.target.value
//     setAssistantTitle(newTitle)
//     localStorage.setItem("assistantTitle", newTitle)
//   }
//   const handleTitleBlur = () => setIsEditingTitle(false)
//   const handleTitleKeyPress = (e) => {
//     if (e.key === "Enter") setIsEditingTitle(false)
//   }

//   const sidebarItems = [
//     { id: "workspaces", label: "Workspaces", icon: Briefcase, action: () => setWorkspaceDialogOpen(true) },
//     { id: "phone-numbers", label: "Phone Numbers", icon: Phone },
//     { id: "voices", label: "Voices", icon: Mic },
//     { id: "metrics", label: "Metrics", icon: BarChart3 },
//     { id: "session-logs", label: "Session Logs", icon: ScrollText },
//     { id: "transcripts", label: "Transcripts", icon: MessagesSquare },
//     { id: "settings", label: "Settings", icon: Cog },
//   ]

//   return (
//     <div className="h-screen w-full bg-zinc-950 text-zinc-100 flex">
//       {/* Left Sidebar */}
//       <aside
//         className={[
//           "relative border-r border-zinc-800 bg-zinc-950/80 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/60",
//           "transition-[width] duration-300 ease-in-out",
//           collapsed ? "w-16" : "w-64",
//           "flex flex-col",
//         ].join(" ")}
//       >
//         {/* Header */}
//         <div className="flex items-center justify-between px-3 py-4 border-b border-zinc-800">
//           <div className="flex items-center gap-2 overflow-hidden">
//             <div className="h-8 w-8 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center">
//               <Wrench className="h-4 w-4 text-zinc-200" />
//             </div>
//             {!collapsed && <h1 className="text-lg font-semibold tracking-tight">Maukhikh</h1>}
//           </div>
//           <TooltipProvider>
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   onClick={() => setCollapsed((v) => !v)}
//                   className="text-zinc-200 hover:text-white hover:bg-zinc-800/60"
//                 >
//                   {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
//                 </Button>
//               </TooltipTrigger>
//               <TooltipContent side="right" className="bg-zinc-900 border-zinc-800">
//                 {collapsed ? "Expand" : "Collapse"}
//               </TooltipContent>
//             </Tooltip>
//           </TooltipProvider>
//         </div>

//         {/* User Email */}
//         <div className={["px-3 py-3 border-b border-zinc-800", collapsed ? "px-2" : ""].join(" ")}>
//           {collapsed ? (
//             <div className="text-[10px] text-zinc-400 text-center truncate">{userEmail || "No email"}</div>
//           ) : (
//             <>
//               <p className="text-xs text-zinc-400">Logged in as</p>
//               <p className="text-sm font-medium truncate">{currentUser?.email || userEmail || "No email provided"}</p>
//             </>
//           )}
//         </div>

//         {/* Navigation */}
//         <nav className="flex-1 px-2 py-3">
//           <TooltipProvider delayDuration={200}>
//             <ul className="space-y-1">
//               {sidebarItems.map((item) => {
//                 const Icon = item.icon
//                 const active = activeTab === item.id
//                 return (
//                   <li key={item.id}>
//                     <Tooltip disableHoverableContent={!collapsed}>
//                       <TooltipTrigger asChild>
//                         <Button
//                           onClick={() => {
//                             if (item.action) {
//                               item.action()
//                             } else {
//                               setActiveTab(item.id)
//                             }
//                           }}
//                           variant={active ? "secondary" : "ghost"}
//                           className={[
//                             "w-full justify-start gap-3 overflow-hidden transition-all duration-200",
//                             active
//                               ? "bg-zinc-800/80 hover:bg-zinc-800 text-white"
//                               : "text-zinc-300 hover:text-white hover:bg-zinc-900/60",
//                             collapsed ? "px-2 py-6" : "px-3 py-6",
//                           ].join(" ")}
//                         >
//                           <Icon className="h-5 w-5 shrink-0" />
//                           {!collapsed && <span className="truncate">{item.label}</span>}
//                         </Button>
//                       </TooltipTrigger>
//                       <TooltipContent side="right" className="bg-zinc-900 border-zinc-800">
//                         {item.label}
//                       </TooltipContent>
//                     </Tooltip>
//                   </li>
//                 )
//               })}
//             </ul>
//           </TooltipProvider>
//         </nav>
//       </aside>

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col min-w-0">
//         {/* Top Bar */}
//         <div className="border-b border-zinc-800 bg-zinc-950/60 backdrop-blur px-4 py-2">
//           <div className="flex items-center justify-between gap-4">
//             {/* Workspace/Workflow Selectors */}
//             <div className="flex items-center gap-2">
//               <Button 
//                 variant="outline" 
//                 onClick={() => setWorkspaceDialogOpen(true)}
//                 className="border-zinc-700 hover:bg-zinc-800"
//               >
//                 <Briefcase className="h-4 w-4 mr-2" />
//                 {currentWorkspace?.name || 'Select Workspace'}
//                 <ChevronDown className="h-4 w-4 ml-2" />
//               </Button>
              
//               {currentWorkspace && (
//                 <Button 
//                   variant="outline" 
//                   onClick={() => setWorkflowDialogOpen(true)}
//                   className="border-zinc-700 hover:bg-zinc-800"
//                 >
//                   <Workflow className="h-4 w-4 mr-2" />
//                   {currentWorkflowData?.name || 'Select Workflow'}
//                   <ChevronDown className="h-4 w-4 ml-2" />
//                 </Button>
//               )}
//             </div>

//             {/* Stats + Actions */}
//             <div className="flex items-center gap-3">
//               {/* Stats cards... (keep existing) */}
//               <div className="flex items-center gap-3">
//                 <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg px-3 py-2 text-center min-w-[90px]">
//                   <p className="text-[11px] text-zinc-400 mb-0.5">Total Hours</p>
//                   <p className="text-base font-semibold text-cyan-300">
//                     {stats.loading ? "..." : stats.totalHours}
//                   </p>
//                 </div>
//                 <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg px-3 py-2 text-center min-w-[90px]">
//                   <p className="text-[11px] text-zinc-400 mb-0.5">Total Calls</p>
//                   <p className="text-base font-semibold text-emerald-300">
//                     {stats.loading ? "..." : stats.totalCalls}
//                   </p>
//                 </div>
//                 <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg px-3 py-2 text-center min-w-[90px]">
//                   <p className="text-[11px] text-zinc-400 mb-0.5">Conversations</p>
//                   <p className="text-base font-semibold text-violet-300">
//                     {stats.loading ? "..." : stats.totalConversations}
//                   </p>
//                 </div>
//               </div>
              
//               <Separator orientation="vertical" className="h-8 bg-zinc-800" />

//               <TooltipProvider>
//                 <Tooltip>
//                   <TooltipTrigger asChild>
//                     <Button
//                       onClick={fetchStats}
//                       disabled={stats.loading}
//                       variant="ghost"
//                       className="h-9 w-9 p-0"
//                     >
//                       <RefreshCw className="h-4 w-4" />
//                     </Button>
//                   </TooltipTrigger>
//                   <TooltipContent>Refresh stats</TooltipContent>
//                 </Tooltip>
//               </TooltipProvider>

//               <Call />

//               <div className="relative" ref={toolsRef}>
//                 <DropdownMenu open={isToolsOpen} onOpenChange={setIsToolsOpen}>
//                   <DropdownMenuTrigger asChild>
//                     <Button className="h-9 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800">Tools</Button>
//                   </DropdownMenuTrigger>
//                   <DropdownMenuContent align="end" className="bg-zinc-900 text-zinc-100 border-zinc-800">
//                     <DropdownMenuItem onClick={() => { setActiveTab("upload-pdfs"); setIsToolsOpen(false) }}>
//                       Upload PDF's
//                     </DropdownMenuItem>
//                     <DropdownMenuItem onClick={handleCreateEmailTool}>
//                       Email
//                     </DropdownMenuItem>
//                   </DropdownMenuContent>
//                 </DropdownMenu>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Main Content Area */}
//         <main className="flex-1 min-h-0 overflow-auto">
//           <div className="h-full">{renderMainContent()}</div>
//         </main>
//       </div>

//       {/* Workspace Dialog */}
//       <Dialog open={workspaceDialogOpen} onOpenChange={setWorkspaceDialogOpen}>
//         <DialogContent className="max-w-6xl h-[80vh] p-0 bg-zinc-950 border-zinc-800">
//           <Workspace 
//             currentUser={currentUser}
//             onWorkspaceSelect={handleWorkspaceSelect}
//             onClose={() => setWorkspaceDialogOpen(false)}
//           />
//         </DialogContent>
//       </Dialog>

//       {/* Workflow Dialog */}
//       <Dialog open={workflowDialogOpen} onOpenChange={setWorkflowDialogOpen}>
//         <DialogContent className="max-w-6xl h-[80vh] p-0 bg-zinc-950 border-zinc-800">
//           {currentWorkspace && (
//             <WorkflowSelector 
//               workspaceId={currentWorkspace._id}
//               workspaceName={currentWorkspace.name}
//               onWorkflowSelect={handleWorkflowSelect}
//               onClose={() => setWorkflowDialogOpen(false)}
//             />
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// }



"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useLocation } from "react-router-dom"
import { ReactFlowProvider } from "@xyflow/react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  ChevronLeft,
  ChevronRight,
  Phone,
  Mic,
  BarChart3,
  ScrollText,
  MessagesSquare,
  Cog,
  Wrench,
  RefreshCw,
  Briefcase,
  Workflow,
  ChevronDown,
  Loader2,
} from "lucide-react"
import { FileText } from "lucide-react"

import WorkflowBuilder from "./Canvas"
import PhoneNumbers from "./PhoneNumbers"
import Voices from "./Voices"
import Metrics from "./Metrics"
import SessionLogs from "./SessionLogs"
import Transcripts from "./Transcripts"
import Settings from "./Settings"
import UploadPDFs from "./UploadPDFs"
import EmailTool from "./EmailTool"
import Call from "./Call"
import Workspace from "./components/Workspace"
import WorkflowSelector from "./components/WorkflowSelector"

import { fetchCurrentUser, setCurrentWorkflow } from "./utils/api"
import {
  getCurrentWorkspace,
  getCurrentWorkflow,
  setCurrentWorkspace as saveCurrentWorkspace,
  getAllWorkspaces,
} from "./utils/workspaceApi"
import { getAllWorkflows } from "./utils/api"

export default function Dashboard() {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState("workflow")
  const [isToolsOpen, setIsToolsOpen] = useState(false)
  const [workflowRefresh, setWorkflowRefresh] = useState(null)

  // User state
  const [currentUser, setCurrentUser] = useState(null)

  // Workspace/Workflow state
  const [currentWorkspace, setCurrentWorkspace] = useState(null)
  const [currentWorkflowData, setCurrentWorkflowData] = useState(null)
  const [workspaceDialogOpen, setWorkspaceDialogOpen] = useState(false)
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false)

  const [expandedWorkspace, setExpandedWorkspace] = useState(false)
  const [expandedWorkflows, setExpandedWorkflows] = useState({})
  const [sidebarWorkspaces, setSidebarWorkspaces] = useState([])
  const [sidebarWorkflows, setSidebarWorkflows] = useState({})
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(false)
  const [loadingWorkflows, setLoadingWorkflows] = useState({})

  const [assistantTitle, setAssistantTitle] = useState(() => {
    return localStorage.getItem("assistantTitle") || "Sales Assistant"
  })
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [stats, setStats] = useState({
    totalHours: 0,
    totalCalls: 0,
    totalConversations: 0,
    loading: true,
  })
  const userEmail = location.state?.email
  const toolsRef = useRef(null)

  const [collapsed, setCollapsed] = useState(false)

  const BASE_URL = "http://127.0.0.1:5000/api"

  // Load current user on mount
  useEffect(() => {
    loadCurrentUser()
    loadContextFromStorage()
  }, [])

  const loadCurrentUser = async () => {
    try {
      const user = await fetchCurrentUser()
      if (user) {
        setCurrentUser(user)
      }
    } catch (error) {
      console.error("Failed to load user:", error)
    }
  }

  const loadContextFromStorage = () => {
    const workspaceId = getCurrentWorkspace()
    const workflowId = getCurrentWorkflow()

    if (workspaceId) {
      setCurrentWorkspace({ _id: workspaceId })
    }

    if (workflowId) {
      setCurrentWorkflowData({ _id: workflowId })
    }
  }

  const loadSidebarWorkspaces = async () => {
    try {
      setLoadingWorkspaces(true)
      const response = await getAllWorkspaces()
      setSidebarWorkspaces(response.workspaces || [])
    } catch (error) {
      console.error("Failed to load workspaces for sidebar:", error)
    } finally {
      setLoadingWorkspaces(false)
    }
  }

  const loadSidebarWorkflows = async (workspaceId) => {
    try {
      setLoadingWorkflows((prev) => ({ ...prev, [workspaceId]: true }))
      const response = await getAllWorkflows(workspaceId)
      setSidebarWorkflows((prev) => ({ ...prev, [workspaceId]: response.workflows || [] }))
    } catch (error) {
      console.error("Failed to load workflows for sidebar:", error)
    } finally {
      setLoadingWorkflows((prev) => ({ ...prev, [workspaceId]: false }))
    }
  }

  const handleWorkspaceToggle = async () => {
    if (!expandedWorkspace) {
      await loadSidebarWorkspaces()
    }
    setExpandedWorkspace(!expandedWorkspace)
  }

  const handleWorkflowToggle = async (workspaceId) => {
    if (!expandedWorkflows[workspaceId]) {
      await loadSidebarWorkflows(workspaceId)
    }
    setExpandedWorkflows((prev) => ({
      ...prev,
      [workspaceId]: !prev[workspaceId],
    }))
  }

  const handleWorkspaceSelectFromSidebar = (workspace) => {
    saveCurrentWorkspace(workspace._id)
    setCurrentWorkspace(workspace)
    setCurrentWorkflowData(null)
  }

  const handleWorkflowSelectFromSidebar = (workflow) => {
    setCurrentWorkflow(workflow._id)
    setCurrentWorkflowData(workflow)
    setActiveTab("workflow")
  }

  const handleWorkspaceSelect = (workspace) => {
    saveCurrentWorkspace(workspace._id)
    setCurrentWorkspace(workspace)
    setCurrentWorkflowData(null)
    setWorkspaceDialogOpen(false)
    setWorkflowDialogOpen(true)
  }

  const handleWorkflowSelect = (workflow) => {
    setCurrentWorkflow(workflow._id)
    setCurrentWorkflowData(workflow)
    setWorkflowDialogOpen(false)
    setActiveTab("workflow")
  }

  const fetchTimeData = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/timeDate`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      if (!response.ok) throw new Error("Failed to fetch time data")
      const data = await response.json()

      const totalCalls = data.dates?.reduce((sum, dateObj) => sum + (dateObj.totalCalls || 0), 0) || 0

      const totalHours = convertTimeToHours(data.totalTime || "0:00:00")
      return { totalCalls, totalHours }
    } catch (error) {
      console.error("Error fetching time data:", error)
      return { totalCalls: 0, totalHours: 0 }
    }
  }, [])

  const fetchSessionData = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/sessionLogs`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      if (!response.ok) throw new Error("Failed to fetch session data")
      const sessions = await response.json()

      const totalConversations = sessions.reduce((sum, session) => {
        const messagesCount = Array.isArray(session.messages) ? session.messages.length : 0
        return sum + messagesCount
      }, 0)

      return totalConversations
    } catch (error) {
      console.error("Error fetching session data:", error)
      return 0
    }
  }, [])

  const convertTimeToHours = (timeString) => {
    try {
      const [hours, minutes, seconds] = timeString.split(":").map(Number)
      return hours + minutes / 60 + seconds / 3600
    } catch {
      return 0
    }
  }

  const fetchStats = useCallback(async () => {
    setStats((prev) => ({ ...prev, loading: true }))
    try {
      const [timeData, conversationsCount] = await Promise.all([fetchTimeData(), fetchSessionData()])
      setStats({
        totalHours: Math.round(timeData.totalHours * 100) / 100,
        totalCalls: timeData.totalCalls,
        totalConversations: conversationsCount,
        loading: false,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
      setStats({
        totalHours: 0,
        totalCalls: 0,
        totalConversations: 0,
        loading: false,
      })
    }
  }, [fetchTimeData, fetchSessionData])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    function handleClickOutside(event) {
      if (toolsRef.current && !toolsRef.current.contains(event.target)) {
        setIsToolsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const renderMainContent = () => {
    switch (activeTab) {
      case "workflow":
        if (!currentWorkspace || !currentWorkflowData) {
          return (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Workflow className="h-16 w-16 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-400 mb-4">
                  {!currentWorkspace ? "Please select a workspace first" : "Please select a workflow to start"}
                </p>
                <Button
                  onClick={() => (!currentWorkspace ? setWorkspaceDialogOpen(true) : setWorkflowDialogOpen(true))}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {!currentWorkspace ? "Select Workspace" : "Select Workflow"}
                </Button>
              </div>
            </div>
          )
        }
        return (
          <ReactFlowProvider>
            <WorkflowBuilder
              workspaceId={currentWorkspace._id}
              workflowId={currentWorkflowData._id}
              onProvideRefresh={(fn) => setWorkflowRefresh(() => fn)}
            />
          </ReactFlowProvider>
        )
      case "phone-numbers":
        return <PhoneNumbers />
      case "voices":
        return <Voices />
      case "metrics":
        return <Metrics />
      case "session-logs":
        return <SessionLogs />
      case "transcripts":
        return <Transcripts />
      case "settings":
        return <Settings />
      case "upload-pdfs":
        return <UploadPDFs onWorkflowRefresh={workflowRefresh} />
      case "email-tool":
        return <EmailTool onWorkflowRefresh={workflowRefresh} />
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-zinc-400">Select a workspace and workflow to begin</p>
          </div>
        )
    }
  }

  const handleCreateEmailTool = () => {
    setIsToolsOpen(false)
    setActiveTab("email-tool")
  }

  const handleTitleClick = () => setIsEditingTitle(true)
  const handleTitleChange = (e) => {
    const newTitle = e.target.value
    setAssistantTitle(newTitle)
    localStorage.setItem("assistantTitle", newTitle)
  }
  const handleTitleBlur = () => setIsEditingTitle(false)
  const handleTitleKeyPress = (e) => {
    if (e.key === "Enter") setIsEditingTitle(false)
  }

  const sidebarItems = [
    { id: "phone-numbers", label: "Phone Numbers", icon: Phone },
    { id: "voices", label: "Voices", icon: Mic },
    { id: "metrics", label: "Metrics", icon: BarChart3 },
    { id: "session-logs", label: "Session Logs", icon: ScrollText },
    { id: "transcripts", label: "Transcripts", icon: MessagesSquare },
    { id: "settings", label: "Settings", icon: Cog },
  ]

  return (
    <div className="h-screen w-full bg-zinc-950 text-zinc-100 flex">
      {/* Left Sidebar */}
      <aside
        className={[
          "relative border-r border-zinc-800 bg-zinc-950/80 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/60",
          "transition-[width] duration-300 ease-in-out",
          collapsed ? "w-16" : "w-64",
          "flex flex-col overflow-hidden",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-4 border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="h-8 w-8 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
              <Wrench className="h-4 w-4 text-zinc-200" />
            </div>
            {!collapsed && <h1 className="text-lg font-semibold tracking-tight truncate">Maukhikh</h1>}
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCollapsed((v) => !v)}
                  className="text-zinc-200 hover:text-white hover:bg-zinc-800/60 flex-shrink-0"
                >
                  {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-zinc-900 border-zinc-800">
                {collapsed ? "Expand" : "Collapse"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* User Email */}
        <div className={["px-3 py-3 border-b border-zinc-800 flex-shrink-0", collapsed ? "px-2" : ""].join(" ")}>
          {collapsed ? (
            <div className="text-[10px] text-zinc-400 text-center truncate">{userEmail || "No email"}</div>
          ) : (
            <>
              <p className="text-xs text-zinc-400">Logged in as</p>
              <p className="text-sm font-medium truncate text-zinc-100">
                {currentUser?.email || userEmail || "No email provided"}
              </p>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-3 overflow-y-auto">
          <TooltipProvider delayDuration={200}>
            <ul className="space-y-1">
              <li>
                <Tooltip disableHoverableContent={!collapsed}>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleWorkspaceToggle}
                      variant="ghost"
                      className={[
                        "w-full justify-start gap-3 overflow-hidden transition-all duration-200",
                        expandedWorkspace
                          ? "bg-zinc-800/80 hover:bg-zinc-800 text-white"
                          : "text-zinc-300 hover:text-white hover:bg-zinc-900/60",
                        collapsed ? "px-2 py-6" : "px-3 py-6",
                      ].join(" ")}
                    >
                      <Briefcase className="h-5 w-5 shrink-0" />
                      {!collapsed && <span className="truncate flex-1">Workspaces</span>}
                      {!collapsed && (
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 transition-transform duration-300 ${expandedWorkspace ? "rotate-180" : ""}`}
                        />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-zinc-900 border-zinc-800">
                    Workspaces
                  </TooltipContent>
                </Tooltip>

                {expandedWorkspace && !collapsed && (
                  <div className="mt-2 ml-2 border-l-2 border-zinc-800 pl-2 space-y-1 overflow-hidden">
                    {loadingWorkspaces ? (
                      <div className="flex items-center gap-2 px-3 py-2 text-zinc-500 text-sm">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading...</span>
                      </div>
                    ) : sidebarWorkspaces.length > 0 ? (
                      sidebarWorkspaces.map((workspace) => (
                        <div key={workspace._id} className="space-y-1">
                          <Button
                            onClick={() => handleWorkspaceSelectFromSidebar(workspace)}
                            variant="ghost"
                            className={[
                              "w-full justify-start gap-2 text-xs py-2 h-auto",
                              currentWorkspace?._id === workspace._id
                                ? "bg-blue-600/20 text-blue-300 hover:bg-blue-600/30"
                                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50",
                            ].join(" ")}
                          >
                            <div className="h-2 w-2 rounded-full bg-current flex-shrink-0" />
                            <span className="truncate">{workspace.name}</span>
                            <ChevronDown
                              className={`h-3 w-3 ml-auto flex-shrink-0 transition-transform duration-200 ${expandedWorkflows[workspace._id] ? "rotate-180" : ""}`}
                            />
                          </Button>

                          {expandedWorkflows[workspace._id] && (
                            <div className="ml-2 border-l border-zinc-800 pl-2 space-y-1">
                              {loadingWorkflows[workspace._id] ? (
                                <div className="flex items-center gap-2 px-2 py-1 text-zinc-600 text-xs">
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  <span>Loading...</span>
                                </div>
                              ) : (sidebarWorkflows[workspace._id] || []).length > 0 ? (
                                (sidebarWorkflows[workspace._id] || []).map((workflow) => (
                                  <Button
                                    key={workflow._id}
                                    onClick={() => handleWorkflowSelectFromSidebar(workflow)}
                                    variant="ghost"
                                    size="sm"
                                    className={[
                                      "w-full justify-start gap-2 text-xs py-1 h-auto",
                                      currentWorkflowData?._id === workflow._id
                                        ? "bg-green-600/20 text-green-300 hover:bg-green-600/30"
                                        : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40",
                                    ].join(" ")}
                                  >
                                    <FileText className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">{workflow.name}</span>
                                  </Button>
                                ))
                              ) : (
                                <p className="text-xs text-zinc-600 px-2 py-1">No workflows</p>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-600 px-3 py-2">No workspaces</p>
                    )}
                  </div>
                )}
              </li>

              {/* Other sidebar items */}
              {sidebarItems.map((item) => {
                const Icon = item.icon
                const active = activeTab === item.id
                return (
                  <li key={item.id}>
                    <Tooltip disableHoverableContent={!collapsed}>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => setActiveTab(item.id)}
                          variant={active ? "secondary" : "ghost"}
                          className={[
                            "w-full justify-start gap-3 overflow-hidden transition-all duration-200",
                            active
                              ? "bg-zinc-800/80 hover:bg-zinc-800 text-white"
                              : "text-zinc-300 hover:text-white hover:bg-zinc-900/60",
                            collapsed ? "px-2 py-6" : "px-3 py-6",
                          ].join(" ")}
                        >
                          <Icon className="h-5 w-5 shrink-0" />
                          {!collapsed && <span className="truncate">{item.label}</span>}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-zinc-900 border-zinc-800">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  </li>
                )
              })}
            </ul>
          </TooltipProvider>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="border-b border-zinc-800 bg-zinc-950/60 backdrop-blur px-4 py-2">
          <div className="flex items-center justify-between gap-4">
            <div></div>

            {/* Stats + Actions */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg px-3 py-2 text-center min-w-[90px]">
                  <p className="text-[11px] text-zinc-400 mb-0.5">Total Hours</p>
                  <p className="text-base font-semibold text-cyan-300">{stats.loading ? "..." : stats.totalHours}</p>
                </div>
                <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg px-3 py-2 text-center min-w-[90px]">
                  <p className="text-[11px] text-zinc-400 mb-0.5">Total Calls</p>
                  <p className="text-base font-semibold text-emerald-300">{stats.loading ? "..." : stats.totalCalls}</p>
                </div>
                <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg px-3 py-2 text-center min-w-[90px]">
                  <p className="text-[11px] text-zinc-400 mb-0.5">Conversations</p>
                  <p className="text-base font-semibold text-violet-300">
                    {stats.loading ? "..." : stats.totalConversations}
                  </p>
                </div>
              </div>

              <Separator orientation="vertical" className="h-8 bg-zinc-800" />

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={fetchStats}
                      disabled={stats.loading}
                      variant="ghost"
                      className="h-9 w-9 p-0 text-zinc-300 hover:text-white hover:bg-zinc-800/60"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-zinc-900 border-zinc-800">Refresh stats</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Call />

              <div className="relative" ref={toolsRef}>
                <DropdownMenu open={isToolsOpen} onOpenChange={setIsToolsOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button className="h-9 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-100">
                      Tools
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-zinc-900 text-zinc-100 border-zinc-800">
                    <DropdownMenuItem
                      onClick={() => {
                        setActiveTab("upload-pdfs")
                        setIsToolsOpen(false)
                      }}
                    >
                      Upload PDF's
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleCreateEmailTool}>Email</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 min-h-0 overflow-auto">
          <div className="h-full">{renderMainContent()}</div>
        </main>
      </div>

      {/* Workspace Dialog */}
      <Dialog open={workspaceDialogOpen} onOpenChange={setWorkspaceDialogOpen}>
        <DialogContent className="max-w-6xl h-[80vh] p-0 bg-zinc-950 border-zinc-800">
          <Workspace
            currentUser={currentUser}
            onWorkspaceSelect={handleWorkspaceSelect}
            onClose={() => setWorkspaceDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Workflow Dialog */}
      <Dialog open={workflowDialogOpen} onOpenChange={setWorkflowDialogOpen}>
        <DialogContent className="max-w-6xl h-[80vh] p-0 bg-zinc-950 border-zinc-800">
          {currentWorkspace && (
            <WorkflowSelector
              workspaceId={currentWorkspace._id}
              workspaceName={currentWorkspace.name}
              onWorkflowSelect={handleWorkflowSelect}
              onClose={() => setWorkflowDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
