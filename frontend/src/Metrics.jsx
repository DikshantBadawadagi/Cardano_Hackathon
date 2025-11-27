"use client"

/* Metrics.jsx - Dark themed metrics dashboard using shadcn/ui and Recharts (JavaScript) */
import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip as ShTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"

import { ScrollArea } from "@/components/ui/scroll-area"

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  LineChart,
  Line,
} from "recharts"

const API_URL = "http://127.0.0.1:5000/api/timeDate"
const API_HEADERS = {
  "ngrok-skip-browser-warning": "true",
  "Content-Type": "application/json",
  Accept: "application/json",
}

const nf = new Intl.NumberFormat()

function formatDateLabel(iso) {
  // Expecting YYYY-MM-DD
  try {
    const [y, m, d] = iso.split("-").map((x) => Number.parseInt(x, 10))
    const dt = new Date(y, (m || 1) - 1, d || 1)
    return dt.toLocaleDateString(undefined, { month: "short", day: "numeric" })
  } catch {
    return iso
  }
}

function useMetricsData() {
  const [data, setData] = useState({ dates: [], totalTime: "" })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      setRefreshing((prev) => (data?.dates?.length ? true : prev))
      setLoading((prev) => (!data?.dates?.length ? true : prev))

      const res = await fetch(API_URL, { method: "GET", headers: API_HEADERS })
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      const json = await res.json()

      if (!json || !Array.isArray(json.dates)) throw new Error("Invalid response format")
      setData({
        dates: json.dates,
        totalTime: json.totalTime || "",
      })
    } catch (e) {
      setError(e?.message || "Failed to load metrics")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [data?.dates?.length])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refreshing, refetch: fetchData }
}

function SummaryStat({ label, value, accentClass = "text-cyan-400" }) {
  return (
    <Card className="border-zinc-800 bg-zinc-950/60 transition-all duration-200 hover:translate-y-[-2px] hover:shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-zinc-400">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-semibold ${accentClass}`}>{value}</div>
      </CardContent>
    </Card>
  )
}

function ChartTooltipContent({ active, payload, label, unit = "calls" }) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 shadow">
      <div className="font-medium">{label}</div>
      <div className="text-zinc-300">
        {nf.format(item?.value ?? 0)} {unit}
      </div>
    </div>
  )
}

export default function Metrics() {
  const { data, loading, error, refreshing, refetch } = useMetricsData()

  const chartData = useMemo(() => {
    const arr = Array.isArray(data?.dates) ? data.dates : []
    // sort by date ascending
    const sorted = [...arr].sort((a, b) => (a.date > b.date ? 1 : -1))
    return sorted.map((d) => ({
      date: d.date,
      label: formatDateLabel(d.date),
      totalCalls: Number(d.totalCalls || 0),
    }))
  }, [data])

  const totalCalls = useMemo(
    () => chartData.reduce((acc, cur) => acc + (Number.isFinite(cur.totalCalls) ? cur.totalCalls : 0), 0),
    [chartData],
  )

  // const uniqueDays = chartData.length
  const uniqueDays = data?.dates?.length || 0
  const totalTime = data?.totalTime || "-"

  return (
    <div className="w-full bg-zinc-950 text-zinc-100">
      <ScrollArea className="h-[90vh]">
        <div className="mx-auto max-w-7xl p-4">
          <div className="flex flex-col gap-4">
            {/* Header */}
            <Card className="border-zinc-800 bg-zinc-950/60">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-balance text-xl font-semibold">Metrics</CardTitle>
                <div className="flex items-center gap-2">
                  {error && (
                    <Badge variant="destructive" className="bg-red-600 text-white hover:bg-red-500">
                      {error}
                    </Badge>
                  )}
                  <TooltipProvider>
                    <ShTooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          onClick={refetch}
                          disabled={refreshing}
                          className="bg-zinc-800 text-zinc-100 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {refreshing ? "Refreshing..." : "Refresh"}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-zinc-900 text-zinc-100">Re-fetch metrics</TooltipContent>
                    </ShTooltip>
                  </TooltipProvider>
                </div>
              </CardHeader>
              <CardContent>
                {/* Summary stats */}
                {loading ? (
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Skeleton className="h-24 w-full rounded-xl bg-zinc-800/60" />
                    <Skeleton className="h-24 w-full rounded-xl bg-zinc-800/60" />
                    <Skeleton className="h-24 w-full rounded-xl bg-zinc-800/60" />
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-3">
                    <SummaryStat label="Total Calls" value={nf.format(totalCalls)} accentClass="text-cyan-400" />
                    <SummaryStat label="Unique Days" value={nf.format(uniqueDays)} accentClass="text-emerald-400" />
                    <SummaryStat label="Total Time" value={totalTime} accentClass="text-zinc-200" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Bar Chart */}
              <Card className="border-zinc-800 bg-zinc-950/60 transition-all duration-200 hover:translate-y-[-2px] hover:shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-300">Calls per Day (Bar)</CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  {loading ? (
                    <Skeleton className="h-64 w-full rounded-xl bg-zinc-800/60" />
                  ) : chartData.length === 0 ? (
                    <div className="flex h-64 items-center justify-center text-sm text-zinc-400">No data</div>
                  ) : (
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartData}
                          margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
                          className="transition-transform duration-200"
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                          <XAxis
                            dataKey="label"
                            tick={{ fill: "#a1a1aa", fontSize: 12 }}
                            stroke="#52525b"
                            axisLine={{ stroke: "#52525b" }}
                            tickLine={{ stroke: "#52525b" }}
                          />
                          <YAxis
                            tick={{ fill: "#a1a1aa", fontSize: 12 }}
                            stroke="#52525b"
                            axisLine={{ stroke: "#52525b" }}
                            tickLine={{ stroke: "#52525b" }}
                            tickFormatter={(v) => nf.format(v)}
                          />
                          <RechartsTooltip content={<ChartTooltipContent unit="calls" />} />
                          <Bar
                            dataKey="totalCalls"
                            name="Calls"
                            fill="#06b6d4" /* cyan-500 */
                            radius={[6, 6, 0, 0]}
                            isAnimationActive
                            animationBegin={80}
                            animationDuration={500}
                            className="cursor-pointer"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Line Chart */}
              <Card className="border-zinc-800 bg-zinc-950/60 transition-all duration-200 hover:translate-y-[-2px] hover:shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-300">Calls over Time (Line)</CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  {loading ? (
                    <Skeleton className="h-64 w-full rounded-xl bg-zinc-800/60" />
                  ) : chartData.length === 0 ? (
                    <div className="flex h-64 items-center justify-center text-sm text-zinc-400">No data</div>
                  ) : (
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                          <XAxis
                            dataKey="label"
                            tick={{ fill: "#a1a1aa", fontSize: 12 }}
                            stroke="#52525b"
                            axisLine={{ stroke: "#52525b" }}
                            tickLine={{ stroke: "#52525b" }}
                          />
                          <YAxis
                            tick={{ fill: "#a1a1aa", fontSize: 12 }}
                            stroke="#52525b"
                            axisLine={{ stroke: "#52525b" }}
                            tickLine={{ stroke: "#52525b" }}
                            tickFormatter={(v) => nf.format(v)}
                          />
                          <RechartsTooltip content={<ChartTooltipContent unit="calls" />} />
                          <Line
                            type="monotone"
                            dataKey="totalCalls"
                            name="Calls"
                            stroke="#22d3ee" /* cyan-400 */
                            strokeWidth={2}
                            dot={{ r: 3, stroke: "#22d3ee", fill: "#0c4a6e" }}
                            activeDot={{ r: 6, stroke: "#67e8f9", strokeWidth: 2 }}
                            isAnimationActive
                            animationBegin={100}
                            animationDuration={600}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
