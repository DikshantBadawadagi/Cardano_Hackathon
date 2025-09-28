// import { useState, useRef, useEffect,useCallback } from 'react'
// import { useLocation } from 'react-router-dom'
// import { ReactFlowProvider } from '@xyflow/react'
// import WorkflowBuilder from './Canvas'
// import PhoneNumbers from './PhoneNumbers'
// import Voices from './Voices'
// import Metrics from './Metrics'
// import SessionLogs from './SessionLogs'
// import Transcripts from './Transcripts'
// import Settings from './Settings'
// import UploadPDFs from './UploadPDFs'
// import EmailTool from './EmailTool'
// import Call from './Call'

// export default function Dashboard() {
//   const location = useLocation()
//   const [activeTab, setActiveTab] = useState('workflow')
//   const [isToolsOpen, setIsToolsOpen] = useState(false)
//   const [workflowRefresh, setWorkflowRefresh] = useState(null)
//   const [assistantTitle, setAssistantTitle] = useState(() => {
//     return localStorage.getItem('assistantTitle') || 'Sales Assistant'
//   })
//   const [isEditingTitle, setIsEditingTitle] = useState(false)
//   const [stats, setStats] = useState({
//     totalHours: 0,
//     totalCalls: 0,
//     totalConversations: 0,
//     loading: true
//   })
//   const userEmail = location.state?.email
//   const toolsRef = useRef(null)

//   const BASE_URL = 'https://plugin-administrator-angela-ser.trycloudflare.com'

//   // Fetch time and date data
// const fetchTimeData = useCallback(async () => {
//   try {
//     const response = await fetch(`${BASE_URL}/timeDate`, {
//       headers: {
//         'ngrok-skip-browser-warning': 'true',
//         'Content-Type': 'application/json',
//         'Accept': 'application/json'
//       }
//     })
//     if (!response.ok) throw new Error('Failed to fetch time data')
//     const data = await response.json()
    
//     // Calculate total calls from dates array
//     const totalCalls = data.dates?.reduce((sum, dateObj) => sum + (dateObj.totalCalls || 0), 0) || 0
    
//     // Convert totalTime from HH:MM:SS to decimal hours
//     const totalHours = convertTimeToHours(data.totalTime || '0:00:00')
    
//     return { totalCalls, totalHours }
//   } catch (error) {
//     console.error('Error fetching time data:', error)
//     return { totalCalls: 0, totalHours: 0 }
//   }
// }, [])

// // Fetch session logs data
// const fetchSessionData = useCallback(async () => {
//   try {
//     const response = await fetch(`${BASE_URL}/sessionLogs`, {
//       headers: {
//         'ngrok-skip-browser-warning': 'true',
//         'Content-Type': 'application/json',
//         'Accept': 'application/json'
//       }
//     })
//     if (!response.ok) throw new Error('Failed to fetch session data')
//     const sessions = await response.json()
    
//     // Count total messages across all sessions
//     const totalConversations = sessions.reduce((sum, session) => {
//       const messagesCount = Array.isArray(session.messages) ? session.messages.length : 0
//       return sum + messagesCount
//     }, 0)
    
//     return totalConversations
//   } catch (error) {
//     console.error('Error fetching session data:', error)
//     return 0
//   }
// }, [])

// // Convert time string (HH:MM:SS) to decimal hours
// const convertTimeToHours = (timeString) => {
//   try {
//     const [hours, minutes, seconds] = timeString.split(':').map(Number)
//     return hours + (minutes / 60) + (seconds / 3600)
//   } catch (error) {
//     return 0
//   }
// }

// // Fetch all stats
// const fetchStats = useCallback(async () => {
//   setStats(prev => ({ ...prev, loading: true }))
  
//   try {
//     const [timeData, conversationsCount] = await Promise.all([
//       fetchTimeData(),
//       fetchSessionData()
//     ])
    
//     setStats({
//       totalHours: Math.round(timeData.totalHours * 100) / 100, // Round to 2 decimal places
//       totalCalls: timeData.totalCalls,
//       totalConversations: conversationsCount,
//       loading: false
//     })
//   } catch (error) {
//     console.error('Error fetching stats:', error)
//     setStats({
//       totalHours: 0,
//       totalCalls: 0,
//       totalConversations: 0,
//       loading: false
//     })
//   }
// }, [fetchTimeData, fetchSessionData])

// // Fetch stats on component mount
// useEffect(() => {
//   fetchStats()
// }, [fetchStats])

//   useEffect(() => {
//     function handleClickOutside(event) {
//       if (toolsRef.current && !toolsRef.current.contains(event.target)) {
//         setIsToolsOpen(false)
//       }
//     }
//     document.addEventListener('mousedown', handleClickOutside)
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside)
//     }
//   }, [])

//   const renderMainContent = () => {
//     switch (activeTab) {
//       case 'workflow':
//         return (
//           <ReactFlowProvider>
//             <WorkflowBuilder onProvideRefresh={(fn) => setWorkflowRefresh(() => fn)} />
//           </ReactFlowProvider>
//         )
//       case 'phone-numbers':
//         return <PhoneNumbers />
//       case 'voices':
//         return <Voices />
//       case 'metrics':
//         return <Metrics />
//       case 'session-logs':
//         return <SessionLogs />
//       case 'transcripts':
//         return <Transcripts />
//       case 'settings':
//         return <Settings />
//       case 'upload-pdfs':
//         return <UploadPDFs onWorkflowRefresh={workflowRefresh} />
//       case 'email-tool':
//         return <EmailTool onWorkflowRefresh={workflowRefresh} />
//       default:
//         return (
//           <ReactFlowProvider>
//             <WorkflowBuilder onProvideRefresh={(fn) => setWorkflowRefresh(() => fn)} />
//           </ReactFlowProvider>
//         )
//     }
//   }
//   const handleCreateEmailTool = () => {
//     setIsToolsOpen(false)
//     setActiveTab('email-tool')
//   }

//   const handleTitleClick = () => {
//     setIsEditingTitle(true)
//   }

//   const handleTitleChange = (e) => {
//     const newTitle = e.target.value
//     setAssistantTitle(newTitle)
//     localStorage.setItem('assistantTitle', newTitle)
//   }

//   const handleTitleBlur = () => {
//     setIsEditingTitle(false)
//   }

//   const handleTitleKeyPress = (e) => {
//     if (e.key === 'Enter') {
//       setIsEditingTitle(false)
//     }
//   }

//   const sidebarItems = [
//     { id: 'phone-numbers', label: 'Phone Numbers', icon: '📞' },
//     { id: 'voices', label: 'Voices', icon: '🎤' },
//     { id: 'workflow', label: 'Workflow', icon: '⚡' },
//     { id: 'metrics', label: 'Metrics', icon: '📊' },
//     { id: 'session-logs', label: 'Session Logs', icon: '📝' },
//     { id: 'transcripts', label: 'Transcripts', icon: '📄' },
//     { id: 'settings', label: 'Settings', icon: '⚙️' },
//   ]

//   return (
//     <div className="h-screen bg-gray-900 flex">
//       {/* Left Sidebar */}
//       <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
//         {/* Logo */}
//         <div className="p-6 border-b border-gray-700">
//           <h1 className="text-2xl font-bold text-white">Maukhikh</h1>
//         </div>

//         {/* User Email */}
//         <div className="p-4 border-b border-gray-700">
//           <p className="text-sm text-gray-400">Logged in as:</p>
//           <p className="text-white text-sm font-medium truncate">
//             {userEmail || 'No email provided'}
//           </p>
//         </div>

//         {/* Navigation Items */}
//         <nav className="flex-1 p-4">
//           <ul className="space-y-2">
//             {sidebarItems.map((item) => (
//               <li key={item.id}>
//                 <button
//                   onClick={() => setActiveTab(item.id)}
//                   className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 hover:bg-gray-700 ${
//                     activeTab === item.id
//                       ? 'bg-blue-600 text-white shadow-lg transform scale-105'
//                       : 'text-gray-300 hover:text-white'
//                   }`}
//                 >
//                   <span className="text-lg">{item.icon}</span>
//                   <span className="font-medium">{item.label}</span>
//                 </button>
//               </li>
//             ))}
//           </ul>
//         </nav>
//       </div>

//       {/* Main Content Area */}
//       <div className="flex-1 flex flex-col">
//         {/* Top Bar */}
//         <div className="bg-gray-800 border-b border-gray-700 p-4">
//           <div className="flex items-center justify-between">
//             <div>
//               {isEditingTitle ? (
//                 <input
//                   type="text"
//                   value={assistantTitle}
//                   onChange={handleTitleChange}
//                   onBlur={handleTitleBlur}
//                   onKeyPress={handleTitleKeyPress}
//                   className="text-xl font-semibold text-white bg-transparent border border-gray-600 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
//                   autoFocus
//                 />
//               ) : (
//                 <h2 
//                   className="text-xl font-semibold text-white cursor-pointer hover:text-blue-300 transition-colors"
//                   onClick={handleTitleClick}
//                   title="Click to edit"
//                 >
//                   {assistantTitle}
//                 </h2>
//               )}
//             </div>
//             <div className="flex items-center space-x-8">
//               <div className="text-center">
//                 <p className="text-2xl font-bold text-blue-400">
//                   {stats.loading ? '...' : stats.totalHours}
//                 </p>
//                 <p className="text-sm text-gray-400">Total Hours</p>
//               </div>
//               <div className="text-center">
//                 <p className="text-2xl font-bold text-green-400">
//                   {stats.loading ? '...' : stats.totalCalls.toLocaleString()}
//                 </p>
//                 <p className="text-sm text-gray-400">Total Calls</p>
//               </div>
//               <div className="text-center">
//                 <p className="text-2xl font-bold text-purple-400">
//                   {stats.loading ? '...' : stats.totalConversations.toLocaleString()}
//                 </p>
//                 <p className="text-sm text-gray-400">Conversations</p>
//               </div>
//               {/* Refresh Stats Button */}
//               <div>
//                 <button
//                   onClick={fetchStats}
//                   disabled={stats.loading}
//                   className="px-3 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-600 transition-colors disabled:opacity-50 text-sm"
//                   title="Refresh stats"
//                 >
//                   {stats.loading ? '⟳' : '↻'}
//                 </button>
//               </div>
//               {/* Call Button */}
//               <div>
//                 <Call />
//               </div>
//               {/* Tools Dropdown */}
//               <div className="relative" ref={toolsRef}>
//                 <button
//                   onClick={() => setIsToolsOpen((prev) => !prev)}
//                   className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-500 transition-colors"
//                 >
//                   Tools
//                 </button>
//                 {isToolsOpen && (
//                   <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10">
//                     <button
//                       className="w-full text-left px-4 py-2 hover:bg-gray-700 text-gray-200"
//                       onClick={() => { setActiveTab('upload-pdfs'); setIsToolsOpen(false) }}
//                     >
//                       Upload PDF's
//                     </button>
//                     <button
//                       className="w-full text-left px-4 py-2 hover:bg-gray-700 text-gray-200"
//                       onClick={handleCreateEmailTool}
//                     >
//                       Email
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Main Content */}
//         <div className="flex-1 overflow-hidden">
//           {renderMainContent()}
//         </div>
//       </div>
//     </div>
//   )
// }


"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useLocation } from "react-router-dom"
import { ReactFlowProvider } from "@xyflow/react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  ChevronLeft,
  ChevronRight,
  Phone,
  Mic,
  Zap,
  BarChart3,
  ScrollText,
  MessagesSquare,
  Cog,
  Wrench,
  RefreshCw,
} from "lucide-react"

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

export default function Dashboard() {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState("workflow")
  const [isToolsOpen, setIsToolsOpen] = useState(false)
  const [workflowRefresh, setWorkflowRefresh] = useState(null)
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

  const BASE_URL = "https://plugin-administrator-angela-ser.trycloudflare.com"

  // Fetch time and date data
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

  // Fetch session logs data
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

  // Convert time string (HH:MM:SS) to decimal hours
  const convertTimeToHours = (timeString) => {
    try {
      const [hours, minutes, seconds] = timeString.split(":").map(Number)
      return hours + minutes / 60 + seconds / 3600
    } catch {
      return 0
    }
  }

  // Fetch all stats
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
        return (
          <ReactFlowProvider>
            <WorkflowBuilder onProvideRefresh={(fn) => setWorkflowRefresh(() => fn)} />
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
          <ReactFlowProvider>
            <WorkflowBuilder onProvideRefresh={(fn) => setWorkflowRefresh(() => fn)} />
          </ReactFlowProvider>
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
    { id: "workflow", label: "Workflow", icon: Zap },
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
          "flex flex-col",
        ].join(" ")}
      >
        {/* Header + Collapse */}
        <div className="flex items-center justify-between px-3 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="h-8 w-8 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <Wrench className="h-4 w-4 text-zinc-200" />
              <span className="sr-only">Logo</span>
            </div>
            {!collapsed && <h1 className="text-lg font-semibold tracking-tight text-pretty">Maukhikh</h1>}
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCollapsed((v) => !v)}
                  aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                  className="text-zinc-200 hover:text-white hover:bg-zinc-800/60"
                >
                  {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-zinc-900 border-zinc-800 text-zinc-100">
                {collapsed ? "Expand" : "Collapse"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* User Email */}
        <div className={["px-3 py-3 border-b border-zinc-800", collapsed ? "px-2" : ""].join(" ")}>
          {collapsed ? (
            <div className="text-[10px] text-zinc-400 text-center truncate">{userEmail || "No email"}</div>
          ) : (
            <>
              <p className="text-xs text-zinc-400">Logged in as</p>
              <p className="text-sm font-medium truncate">{userEmail || "No email provided"}</p>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-3">
          <TooltipProvider delayDuration={200}>
            <ul className="space-y-1">
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
                            "w-full justify-start gap-3 overflow-hidden",
                            "transition-all duration-200 group",
                            active
                              ? "bg-zinc-800/80 hover:bg-zinc-800 text-white"
                              : "text-zinc-300 hover:text-white hover:bg-zinc-900/60",
                            collapsed ? "px-2 py-6" : "px-3 py-6",
                          ].join(" ")}
                        >
                          <Icon className="h-5 w-5 shrink-0 text-zinc-200" />
                          {!collapsed && <span className="truncate">{item.label}</span>}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-zinc-900 border-zinc-800 text-zinc-100">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  </li>
                )
              })}
            </ul>
          </TooltipProvider>
        </nav>

        {/* Footer spacer */}
        <div className="p-2" />
      </aside>

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="border-b border-zinc-800 bg-zinc-950/60 backdrop-blur px-4 py-2">
          <div className="flex items-center justify-between gap-4">
            {/* Title (editable) */}
            <div className="min-w-0">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={assistantTitle}
                  onChange={handleTitleChange}
                  onBlur={handleTitleBlur}
                  onKeyPress={handleTitleKeyPress}
                  className="w-full max-w-md bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-md px-2 py-1 outline-none focus:border-zinc-600"
                  autoFocus
                />
              ) : (
                <h2
                  className="text-lg md:text-xl font-semibold text-pretty cursor-pointer transition-colors hover:text-zinc-200"
                  onClick={handleTitleClick}
                  title="Click to edit"
                >
                  {assistantTitle}
                </h2>
              )}
            </div>

            {/* Stats + Actions */}
            <div className="flex items-center gap-3 flex-wrap gap-y-2">
              {/* Stat Cards */}
              {/* Stat Cards - Compact */}
              <div className="flex items-center gap-3">
                <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg px-3 py-2 text-center min-w-[90px]">
                  <p className="text-[11px] text-zinc-400 mb-0.5 leading-tight">Total Hours</p>
                  <p className="text-base font-semibold text-cyan-300 leading-tight">
                    {stats.loading ? "..." : stats.totalHours}
                  </p>
                </div>
                <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg px-3 py-2 text-center min-w-[90px]">
                  <p className="text-[11px] text-zinc-400 mb-0.5 leading-tight">Total Calls</p>
                  <p className="text-base font-semibold text-emerald-300 leading-tight">
                    {stats.loading ? "..." : stats.totalCalls.toLocaleString()}
                  </p>
                </div>
                <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg px-3 py-2 text-center min-w-[90px]">
                  <p className="text-[11px] text-zinc-400 mb-0.5 leading-tight">Conversations</p>
                  <p className="text-base font-semibold text-violet-300 leading-tight">
                    {stats.loading ? "..." : stats.totalConversations.toLocaleString()}
                  </p>
                </div>
              </div>
              {/* Separator */}
              <Separator orientation="vertical" className="h-8 bg-zinc-800" />

              {/* Refresh */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={fetchStats}
                      disabled={stats.loading}
                      variant="ghost"
                      className="h-9 w-9 p-0 text-zinc-200 hover:text-white hover:bg-zinc-800/60 disabled:opacity-50"
                      aria-label="Refresh stats"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-zinc-900 border-zinc-800 text-zinc-100">Refresh stats</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Call */}
              <Call />

              {/* Tools Dropdown */}
              <div className="relative" ref={toolsRef}>
                <DropdownMenu open={isToolsOpen} onOpenChange={setIsToolsOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button className="h-9 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800">Tools</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-zinc-900 text-zinc-100 border-zinc-800 min-w-40">
                    <DropdownMenuItem
                      className="focus:bg-zinc-800"
                      onClick={() => {
                        setActiveTab("upload-pdfs")
                        setIsToolsOpen(false)
                      }}
                    >
                      Upload PDF&apos;s
                    </DropdownMenuItem>
                    <DropdownMenuItem className="focus:bg-zinc-800" onClick={handleCreateEmailTool}>
                      Email
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 min-h-0 overflow-auto">
          <div className="p-4 text-black">{renderMainContent()}</div>
        </main>
      </div>
    </div>
  )
}
