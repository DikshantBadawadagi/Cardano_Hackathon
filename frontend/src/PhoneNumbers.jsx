"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

const API_URL = "http://127.0.0.1:5000/api/phoneNumber"

function formatPhone(num) {
  if (!num) return ""
  // Keep E.164 as-is but add a subtle space grouping for readability
  // +12343321393 -> +1 234 332 1393 (basic heuristic)
  const m = String(num).match(/^\+?(\d)(\d{3})(\d{3})(\d+)$/)
  if (m) return `+${m[1]} ${m[2]} ${m[3]} ${m[4]}`
  return num
}

function useCopy() {
  const [copiedKey, setCopiedKey] = useState(null)
  const copy = useCallback(async (text, key) => {
    try {
      await navigator.clipboard.writeText(String(text))
      setCopiedKey(key || text)
      setTimeout(() => setCopiedKey(null), 1600)
    } catch (e) {
      // ignore
    }
  }, [])
  return { copiedKey, copy }
}

function IdRow({ id, onCopy, copied }) {
  return (
    <div
      className="group flex items-center justify-between gap-2 rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-2 transition-colors hover:bg-zinc-900/50"
      role="listitem"
    >
      <code className="text-xs text-zinc-300 break-all overflow-hidden min-w-0 flex-1">{id}</code>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="secondary"
              className="h-7 px-2 text-xs bg-zinc-800 text-zinc-100 hover:bg-zinc-700 flex-shrink-0"
              onClick={() => onCopy(id, `id:${id}`)}
            >
              {copied ? "Copied" : "Copy"}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="bg-zinc-900 text-zinc-100">
            Copy ID
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

function PhoneCard({ item, index, onCopy, copiedKey }) {
  const pretty = useMemo(() => formatPhone(item?.twilioPhoneNumber), [item?.twilioPhoneNumber])
  const copiedPhone = copiedKey === `phone:${item?.twilioPhoneNumber}`

  return (
    <Card className="group border-zinc-800 bg-zinc-950/60 transition-all duration-200 hover:translate-y-[-2px] hover:border-zinc-700 hover:shadow-lg">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-balance text-lg text-zinc-100">Phone {index + 1}</CardTitle>
          <Badge className="bg-zinc-800 text-zinc-200 hover:bg-zinc-700">+ Calls</Badge>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="text-pretty text-xl font-semibold text-zinc-50">{pretty}</div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => onCopy(item?.twilioPhoneNumber, `phone:${item?.twilioPhoneNumber}`)}
                  className="h-8 bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
                >
                  {copiedPhone ? "Copied" : "Copy"}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-zinc-900 text-zinc-100">
                Copy phone number
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/50 p-3">
          <div className="text-sm text-zinc-400">Total Calls</div>
          <div className="text-2xl font-semibold text-zinc-50">{item?.count ?? 0}</div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-zinc-200">IDs</div>
            <Badge variant="outline" className="border-zinc-700 text-zinc-300">
              {item?.ids?.length || 0}
            </Badge>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/40">
            <ScrollArea className="h-[220px]">
              <div className="flex flex-col gap-2 p-2" role="list">
                {(item?.ids || []).map((id) => (
                  <IdRow key={id} id={id} onCopy={onCopy} copied={copiedKey === `id:${id}`} />
                ))}
                {(!item?.ids || item.ids.length === 0) && (
                  <div className="flex items-center justify-center py-8 text-sm text-zinc-500">
                    No IDs available
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function PhoneNumbers() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const { copiedKey, copy } = useCopy()

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      setLoading((prev) => (data.length ? prev : true))
      setRefreshing(data.length > 0)
      const res = await fetch(API_URL, {
          method: "GET",
          headers: {
             "ngrok-skip-browser-warning": "true", 
            "Content-Type": "application/json",     // Tells the server you expect JSON
            "Accept": "application/json",           // Optional, reinforces the above
          },
        });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      const payload = await res.json()
      if (!Array.isArray(payload)) throw new Error("Invalid response format")
      setData(payload)
    } catch (e) {
      setError(e?.message || "Failed to load phone numbers")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [data.length])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="h-full w-full bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex h-full max-w-6xl flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-balance text-xl font-semibold text-zinc-100">Phone Numbers</h2>
            <p className="text-sm text-zinc-400">Manage phone numbers and view call activity</p>
          </div>
          <div className="flex items-center gap-2">
            {error ? (
              <Badge variant="destructive" className="bg-red-600 text-white hover:bg-red-500">
                {error}
              </Badge>
            ) : null}
            <Button
              type="button"
              onClick={fetchData}
              disabled={refreshing}
              className="bg-zinc-800 text-zinc-100 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Skeleton className="h-64 w-full rounded-xl bg-zinc-800/60" />
            <Skeleton className="h-64 w-full rounded-xl bg-zinc-800/60" />
            <Skeleton className="h-64 w-full rounded-xl bg-zinc-800/60" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950/40 p-12 text-sm text-zinc-400">
            No phone numbers found.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.map((item, idx) => (
              <PhoneCard
                key={item.twilioPhoneNumber || idx}
                item={item}
                index={idx}
                onCopy={copy}
                copiedKey={copiedKey}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}