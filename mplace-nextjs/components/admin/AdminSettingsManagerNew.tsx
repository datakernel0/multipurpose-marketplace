"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, Form, Input, InputNumber, Switch, Button, Space, message, Spin, Divider } from "antd"
import { SaveOutlined, ReloadOutlined } from "@ant-design/icons"
import { getApiUrl } from "@/utils/paths"

interface SettingRecord {
  key: string
  label: string | null
  description: string | null
  value: string
  type: "STRING" | "TEXT" | "NUMBER" | "BOOLEAN" | "JSON"
  group: string
  updatedAt: string
  updatedBy: {
    id: string
    name: string | null
    email: string | null
  } | null
}

interface SettingsResponse {
  settings: Record<string, SettingRecord[]>
  total: number
  generatedAt: string
}

type DraftsState = Record<string, string>
type DirtyState = Record<string, boolean>
type LoadingState = Record<string, boolean>

const GROUP_LABELS: Record<string, { title: string; description: string }> = {
  GENERAL: {
    title: "General",
    description: "Core marketplace identity and defaults.",
  },
  MARKETPLACE: {
    title: "Marketplace",
    description: "Seller program, commission, and payout cadence.",
  },
  BILLING: {
    title: "Billing",
    description: "Financial policy and taxation thresholds.",
  },
  NOTIFICATIONS: {
    title: "Notifications",
    description: "Email and messaging preferences for the platform.",
  },
  SUPPORT: {
    title: "Support",
    description: "Customer support routing and contact points.",
  },
}

function parseDisplayValue(setting: SettingRecord): string {
  if (setting.type === "BOOLEAN") {
    return setting.value === "true" ? "true" : "false"
  }
  return setting.value ?? ""
}

export default function AdminSettingsManagerNew() {
  const [data, setData] = useState<SettingsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [drafts, setDrafts] = useState<DraftsState>({})
  const [dirty, setDirty] = useState<DirtyState>({})
  const [saving, setSaving] = useState<LoadingState>({})

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true)
      setError("")
      const response = await fetch(getApiUrl("/api/admin/settings"), {
        cache: "no-store",
        credentials: "include",
      })
      const json = await response.json()
      if (!response.ok) {
        throw new Error(json.error || "Failed to load settings")
      }
      setData(json)
      const nextDrafts: DraftsState = {}
      const nextDirty: DirtyState = {}
      const settings = json.settings as Record<string, SettingRecord[]>
      Object.values(settings).forEach((group) => {
        group.forEach((setting) => {
          nextDrafts[setting.key] = parseDisplayValue(setting)
          nextDirty[setting.key] = false
        })
      })
      setDrafts(nextDrafts)
      setDirty(nextDirty)
    } catch (err: any) {
      setError(err?.message || "Failed to load settings")
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const groupedSettings = (data?.settings ?? {}) as Record<string, SettingRecord[]>

  const handleChange = useCallback((key: string, value: string) => {
    setDrafts((prev) => ({ ...prev, [key]: value }))
    setDirty((prev) => ({ ...prev, [key]: true }))
  }, [])

  const handleToggle = useCallback((key: string, checked: boolean) => {
    handleChange(key, checked ? "true" : "false")
  }, [handleChange])

  const saveSetting = useCallback(
    async (setting: SettingRecord) => {
      setSaving((prev) => ({ ...prev, [setting.key]: true }))
      try {
        const draftValue = drafts[setting.key]
        let payload: unknown = draftValue
        if (setting.type === "BOOLEAN") {
          payload = draftValue === "true"
        } else if (setting.type === "NUMBER") {
          payload = draftValue === "" ? null : Number(draftValue)
        } else if (setting.type === "JSON") {
          payload = draftValue
        }

        const response = await fetch(`${getApiUrl(`/api/admin/settings/${encodeURIComponent(setting.key)}`)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ value: payload }),
        })
        const json = await response.json()
        if (!response.ok) {
          throw new Error(json.error || "Failed to update setting")
        }
        setDirty((prev) => ({ ...prev, [setting.key]: false }))
        message.success(`${setting.label || setting.key} updated successfully`)
        setData((prev) => {
          if (!prev) return prev
          const updatedGroups = { ...prev.settings }
          const groupList = updatedGroups[setting.group]?.map((record: SettingRecord) =>
            record.key === setting.key
              ? {
                  ...record,
                  value: json.setting.value,
                  updatedAt: json.setting.updatedAt,
                  updatedBy: json.setting.updatedBy,
                }
              : record,
          )
          if (groupList) {
            updatedGroups[setting.group] = groupList
          }
          return {
            ...prev,
            settings: updatedGroups,
            generatedAt: json.setting.updatedAt,
          }
        })
      } catch (err: any) {
        message.error(err?.message || "Failed to update setting")
      } finally {
        setSaving((prev) => ({ ...prev, [setting.key]: false }))
      }
    },
    [drafts],
  )

  const resetSetting = useCallback((setting: SettingRecord) => {
    setDrafts((prev) => ({ ...prev, [setting.key]: parseDisplayValue(setting) }))
    setDirty((prev) => ({ ...prev, [setting.key]: false }))
  }, [])

  const hasSettings = useMemo(() => Object.keys(groupedSettings).length > 0, [groupedSettings])

  if (loading) {
    return (
      <div style={{ padding: "30px", background: "#f4f5f7", minHeight: "calc(100vh - 64px)", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Spin size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: "30px", background: "#f4f5f7", minHeight: "calc(100vh - 64px)" }}>
        <div style={{ padding: 12, background: "#fff2f0", border: "1px solid #ffccc7", borderRadius: 4, color: "#a8071a" }}>
          {error}
        </div>
      </div>
    )
  }

  if (!hasSettings) {
    return (
      <div style={{ padding: "30px", background: "#f4f5f7", minHeight: "calc(100vh - 64px)" }}>
        <Card>
          <div style={{ textAlign: "center", padding: 40, color: "#868eae" }}>No configurable settings have been defined yet.</div>
        </Card>
      </div>
    )
  }

  return (
    <div style={{ padding: "30px", background: "#f4f5f7", minHeight: "calc(100vh - 64px)" }}>
      {Object.entries(groupedSettings).map(([group, settings], groupIndex) => {
        const groupMeta = GROUP_LABELS[group] ?? { title: group, description: "" }
        return (
          <Card
            key={group}
            title={
              <div>
                <div style={{ fontSize: 18, fontWeight: 500 }}>{groupMeta.title}</div>
                {groupMeta.description && <div style={{ fontSize: 14, color: "#868eae", marginTop: 4 }}>{groupMeta.description}</div>}
              </div>
            }
            style={{ marginBottom: 24 }}
          >
            {settings.map((setting, index) => {
              const isDirty = dirty[setting.key]
              const isSaving = saving[setting.key]
              const value = drafts[setting.key] ?? ""

              return (
                <div key={setting.key} style={{ marginBottom: index < settings.length - 1 ? 24 : 0 }}>
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 4 }}>{setting.label || setting.key}</div>
                    {setting.description && <div style={{ fontSize: 14, color: "#868eae", marginBottom: 8 }}>{setting.description}</div>}
                    <div style={{ fontSize: 12, color: "#868eae" }}>
                      Updated {new Date(setting.updatedAt).toLocaleString()}
                      {setting.updatedBy?.name || setting.updatedBy?.email
                        ? ` by ${setting.updatedBy?.name || setting.updatedBy?.email}`
                        : ""}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 12, alignItems: setting.type === "BOOLEAN" ? "center" : "flex-start" }}>
                    {setting.type === "BOOLEAN" ? (
                      <Switch checked={value === "true"} onChange={(checked) => handleToggle(setting.key, checked)} disabled={isSaving} />
                    ) : setting.type === "TEXT" ? (
                      <Input.TextArea
                        rows={3}
                        value={value}
                        onChange={(e) => handleChange(setting.key, e.target.value)}
                        disabled={isSaving}
                        style={{ flex: 1 }}
                      />
                    ) : setting.type === "NUMBER" ? (
                      <InputNumber
                        value={value ? Number(value) : undefined}
                        onChange={(val) => handleChange(setting.key, val ? String(val) : "")}
                        disabled={isSaving}
                        style={{ flex: 1 }}
                      />
                    ) : setting.type === "JSON" ? (
                      <Input.TextArea
                        rows={6}
                        value={value}
                        onChange={(e) => handleChange(setting.key, e.target.value)}
                        disabled={isSaving}
                        placeholder='Enter valid JSON (e.g. {"key": "value"})'
                        style={{ flex: 1, fontFamily: "monospace" }}
                      />
                    ) : (
                      <Input
                        value={value}
                        onChange={(e) => handleChange(setting.key, e.target.value)}
                        disabled={isSaving}
                        style={{ flex: 1 }}
                      />
                    )}

                    {setting.type !== "BOOLEAN" && (
                      <Space>
                        <Button
                          type="primary"
                          icon={<SaveOutlined />}
                          disabled={!isDirty || isSaving}
                          loading={isSaving}
                          onClick={() => saveSetting(setting)}
                        >
                          Save
                        </Button>
                        <Button
                          icon={<ReloadOutlined />}
                          disabled={!isDirty || isSaving}
                          onClick={() => resetSetting(setting)}
                        >
                          Reset
                        </Button>
                      </Space>
                    )}
                    {setting.type === "BOOLEAN" && (
                      <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        disabled={!isDirty || isSaving}
                        loading={isSaving}
                        onClick={() => saveSetting(setting)}
                      >
                        Save
                      </Button>
                    )}
                  </div>

                  {index < settings.length - 1 && <Divider style={{ margin: "24px 0 0 0" }} />}
                </div>
              )
            })}
          </Card>
        )
      })}
    </div>
  )
}

