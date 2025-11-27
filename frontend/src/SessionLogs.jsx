"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const API_URL = "http://127.0.0.1:5000/api/sessionLogs"

function MessageBubble({ role, text }) {
  // Safety checks for props
  if (typeof role === 'object' || typeof text === 'object') {
    console.warn('MessageBubble received object props:', { role, text })
    return null
  }
  
  const safeRole = role ? String(role) : 'unknown'
  const safeText = text ? String(text) : ''
  
  const isUser = safeRole === "user"
  const isBot = safeRole === "bot"

  const align = isUser ? "justify-end" : "justify-start"
  const bubble = isUser
    ? "bg-cyan-600 text-white shadow-cyan-900/30"
    : isBot
      ? "bg-zinc-900/60 text-zinc-100 border border-zinc-800"
      : "bg-zinc-900/40 text-zinc-300 border border-zinc-800"

  return (
    <div className={`w-full flex ${align}`}>
      <div
        className={[
          "group relative max-w-[90%] rounded-xl px-4 py-3 transition-all duration-200",
          "hover:translate-y-[-2px] hover:shadow-lg",
          bubble,
        ].join(" ")}
        style={{ transformOrigin: isUser ? "right center" : "left center" }}
      >
        <div className="mb-1">
          <Badge
            variant="outline"
            className={isUser ? "border-white/20 text-white/90" : "border-zinc-700 text-zinc-300"}
          >
            {isUser ? "User" : isBot ? "AI" : "Note"}
          </Badge>
        </div>
        <p className="leading-relaxed text-sm whitespace-pre-wrap break-words">{safeText}</p>
        <div
          className={[
            "pointer-events-none absolute inset-0 rounded-xl ring-1 opacity-0 group-hover:opacity-100",
            isUser ? "ring-cyan-400/40" : "ring-zinc-500/30",
            "transition-opacity",
          ].join(" ")}
        />
      </div>
    </div>
  )
}

function SessionItem({ session, index }) {
  // Add defensive checks for session data
  if (!session || typeof session !== 'object') {
    return null
  }
  
  const { id, customer, messages, summary } = session
  
  // Ensure customer is an object
  const customerObj = customer && typeof customer === 'object' ? customer : {}
  const name = customerObj.name ? String(customerObj.name) : "Unknown"
  const number = customerObj.number ? String(customerObj.number) : "N/A"
  
  // Ensure messages is an array
  const messageArray = Array.isArray(messages) ? messages : []
  
  // Ensure summary is a string
  const summaryText = summary ? String(summary) : ""

  const preview = useMemo(() => {
    const first = messageArray.find((m) => m && typeof m === 'object' && m.message)?.message || summaryText || ""
    const firstStr = String(first)
    return firstStr.length > 80 ? firstStr.slice(0, 80) + "..." : firstStr
  }, [messageArray, summaryText])

  const [copiedId, setCopiedId] = useState(false)
  const [copiedJSON, setCopiedJSON] = useState(false)

  const copyId = useCallback(async (e) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(String(id || ""))
      setCopiedId(true)
      setTimeout(() => setCopiedId(false), 1500)
    } catch (err) {
      console.error('Failed to copy ID:', err)
    }
  }, [id])

  const copyJSON = useCallback(async (e) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(JSON.stringify(session, null, 2))
      setCopiedJSON(true)
      setTimeout(() => setCopiedJSON(false), 1500)
    } catch (err) {
      console.error('Failed to copy JSON:', err)
    }
  }, [session])

  return (
    <AccordionItem
      value={String(id || `session-${index}`)}
      className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-2 transition-colors hover:bg-zinc-900/40 data-[state=open]:bg-zinc-900/50"
    >
      <div className="relative">
        <AccordionTrigger className="px-2 py-3 text-left hover:no-underline">
          <div className="flex w-full items-center justify-between gap-4 pr-16">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-zinc-800 text-zinc-200 hover:bg-zinc-700">Session {index + 1}</Badge>
                <Badge variant="outline" className="border-zinc-700 text-zinc-300">
                  {String(name)}
                </Badge>
                <Badge variant="outline" className="border-zinc-700 text-zinc-300">
                  {String(number)}
                </Badge>
                <span className="text-xs text-zinc-400">{messageArray.length} messages</span>
              </div>
              <div className="mt-1 truncate text-sm text-zinc-300">{preview || "No preview available"}</div>
              <div className="mt-1 text-xs text-zinc-500">ID: {String(id || "").slice(0, 8)}…</div>
            </div>
          </div>
        </AccordionTrigger>
        
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex shrink-0 items-center gap-2 z-10">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={copyId}
                  className="h-8 bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
                >
                  {copiedId ? "Copied ID" : "Copy ID"}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-zinc-900 text-zinc-100">
                Copy session ID
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={copyJSON}
                  className="h-8 bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
                >
                  {copiedJSON ? "Copied JSON" : "Copy JSON"}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-zinc-900 text-zinc-100">
                Copy full session JSON
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <AccordionContent className="pb-3 overflow-visible">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
          {summaryText ? (
            <>
              <div className="mb-2 text-sm text-zinc-300">{summaryText}</div>
              <Separator className="my-3 bg-zinc-800" />
            </>
          ) : null}

          <div className="rounded-lg border border-zinc-800 bg-zinc-950/30">
            <ScrollArea className="h-[400px] w-full">
              <div className="flex flex-col gap-3 p-3">
                {messageArray.length === 0 ? (
                  <div className="text-sm text-zinc-400">No messages</div>
                ) : (
                  messageArray.map((m, idx) => {
                    // Ensure message object is valid
                    if (!m || typeof m !== 'object') {
                      return <div key={idx} className="text-sm text-zinc-400">Invalid message</div>
                    }
                    return (
                      <MessageBubble key={idx} role={m.role} text={m.message} />
                    )
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export default function SessionLogs() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchSessions = useCallback(async () => {
    try {
      setError(null)
      setLoading((prev) => (sessions.length === 0 ? true : prev))
      setRefreshing(sessions.length > 0)
      const res = await fetch(API_URL, {
        method: "GET",
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      const data = await res.json()
      if (!Array.isArray(data)) throw new Error("Invalid response format")
      setSessions(data)
    } catch (e) {
      setError(e?.message || "Failed to load session logs")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [sessions.length])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-4 p-4">
        <Card className="border-zinc-800 bg-zinc-950/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-balance text-xl font-semibold text-zinc-100">Session Logs</CardTitle>
            <div className="flex items-center gap-2">
              {error && (
                <Badge variant="destructive" className="bg-red-600 text-white hover:bg-red-500">
                  {String(error)}
                </Badge>
              )}
              <Button
                type="button"
                onClick={fetchSessions}
                disabled={refreshing}
                className="bg-zinc-800 text-zinc-100 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {refreshing ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col gap-3">
                <Skeleton className="h-16 w-full rounded-xl bg-zinc-800/60" />
                <Skeleton className="h-16 w-full rounded-xl bg-zinc-800/60" />
                <Skeleton className="h-16 w-full rounded-xl bg-zinc-800/60" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950/40 p-12 text-sm text-zinc-400">
                No session logs available.
              </div>
            ) : (
              <ScrollArea className="h-[70vh] w-full pr-4">
                <Accordion type="single" collapsible className="w-full space-y-3">
                  {sessions.map((s, idx) => {
                    // Add safety check for each session
                    if (!s || typeof s !== 'object') {
                      return <div key={idx} className="text-sm text-zinc-400 p-4">Invalid session data</div>
                    }
                    return (
                      <SessionItem key={s.id || `session-${idx}`} session={s} index={idx} />
                    )
                  })}
                </Accordion>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}