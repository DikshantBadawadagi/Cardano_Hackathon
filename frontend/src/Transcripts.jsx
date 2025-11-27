/* transcript.jsx */
/* Dark-themed Transcripts view with shadcn/ui, animations, and nice formatting */
import React, { useEffect, useMemo, useState, useCallback } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const API_URL = "http://127.0.0.1:5000/api/transcript"

function parseTranscript(raw) {
  // Split by newline, trim, and map AI/User prefixes
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const m = line.match(/^(AI|User)\s*:\s*(.*)$/i)
      if (m) {
        const role = m[1].toLowerCase() === "ai" ? "ai" : "user"
        const text = m[2]
        return { role, text }
      }
      return { role: "note", text: line }
    })
}

function MessageBubble({ role, text, index }) {
  const isAI = role === "ai"
  const isUser = role === "user"

  // Colors: grayscale + cyan accent for user
  const alignClass = isUser ? "justify-end" : "justify-start"
  const bubbleColors = isUser
    ? "bg-cyan-600 text-white shadow-cyan-900/30"
    : isAI
      ? "bg-zinc-900/60 text-zinc-100 border border-zinc-800"
      : "bg-zinc-900/40 text-zinc-300 border border-zinc-800"

  return (
    <div className={`w-full flex ${alignClass}`}>
      <div
        className={[
          "group relative max-w-[90%] rounded-xl px-4 py-3 transition-all duration-200",
          "hover:translate-y-[-2px] hover:shadow-lg",
          bubbleColors,
        ].join(" ")}
        style={{ transformOrigin: isUser ? "right center" : "left center" }}
      >
        <div className="mb-1">
          <Badge
            variant="outline"
            className={isUser ? "border-white/20 text-white/90" : "border-zinc-700 text-zinc-300"}
          >
            {isUser ? "User" : isAI ? "AI" : "Note"}
          </Badge>
        </div>
        <p className="leading-relaxed text-sm whitespace-pre-wrap break-words">{text}</p>
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

function TranscriptItem({ item, index, onCopy }) {
  const messages = useMemo(() => parseTranscript(item.transcript), [item.transcript])
  const preview = useMemo(() => {
    const first = messages.find((m) => m.text)?.text || ""
    return first.length > 64 ? first.slice(0, 64) + "..." : first
  }, [messages])

  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async (e) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(item.transcript)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
      onCopy?.(item.id)
    } catch (e) {
      // noop
    }
  }, [item, onCopy])

  return (
    <AccordionItem
      value={item.id}
      className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-2 transition-colors hover:bg-zinc-900/40 data-[state=open]:bg-zinc-900/50"
    >
      <div className="relative">
        <AccordionTrigger className="px-2 py-3 text-left hover:no-underline">
          <div className="flex w-full items-center justify-between gap-4 pr-16">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Badge className="bg-zinc-800 text-zinc-200 hover:bg-zinc-700">Transcript {index + 1}</Badge>
                <span className="text-xs text-zinc-400">{messages.length} messages</span>
              </div>
              <div className="mt-1 truncate text-sm text-zinc-300">{preview || "No preview available"}</div>
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
                  onClick={handleCopy}
                  className="h-8 bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
                >
                  {copied ? "Copied" : "Copy"}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" align="center" className="bg-zinc-900 text-zinc-100">
                Copy entire transcript
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <AccordionContent className="pb-3 overflow-visible">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
          <ScrollArea className="h-[50vh] w-full">
            <div className="flex flex-col gap-3">
              {messages.map((m, i) => (
                <MessageBubble key={i} role={m.role} text={m.text} index={i} />
              ))}
            </div>
          </ScrollArea>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export default function Transcripts() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchTranscripts = useCallback(async () => {
    try {
      setError(null)
      setLoading((prev) => (items.length === 0 ? true : prev))
      setRefreshing(items.length > 0)
      const res = await fetch(API_URL, {
          method: "GET",
          headers: {
             "ngrok-skip-browser-warning": "true", 
            "Content-Type": "application/json",     // Tells the server you expect JSON
            "Accept": "application/json",           // Optional, reinforces the above
          },
        });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      const data = await res.json()
      if (!Array.isArray(data)) throw new Error("Invalid response format")
      setItems(data)
    } catch (e) {
      setError(e?.message || "Failed to load transcripts")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [items.length])

  useEffect(() => {
    fetchTranscripts()
  }, [fetchTranscripts])

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-4 p-4">
        <Card className="border-zinc-800 bg-zinc-950/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-balance text-xl font-semibold text-zinc-100">Transcripts</CardTitle>
            <div className="flex items-center gap-2">
              {error && (
                <Badge variant="destructive" className="bg-red-600 text-white hover:bg-red-500">
                  {error}
                </Badge>
              )}
              <Button
                type="button"
                onClick={fetchTranscripts}
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
                <Skeleton className="h-14 w-full rounded-xl bg-zinc-800/60" />
                <Skeleton className="h-14 w-full rounded-xl bg-zinc-800/60" />
                <Skeleton className="h-14 w-full rounded-xl bg-zinc-800/60" />
              </div>
            ) : items.length === 0 ? (
              <div className="flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950/40 p-12 text-sm text-zinc-400">
                No transcripts yet.
              </div>
            ) : (
              <ScrollArea className="h-[70vh] w-full pr-4">
                <Accordion type="single" collapsible className="w-full space-y-3">
                  {items.map((item, idx) => (
                    <TranscriptItem key={item.id || idx} item={item} index={idx} />
                  ))}
                </Accordion>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}