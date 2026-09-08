"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

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
type MessageState = { type: "success" | "error"; message: string }

type ControlType = "text" | "textarea" | "number" | "toggle" | "json"

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

function getControlType(setting: SettingRecord): ControlType {
  switch (setting.type) {
    case "TEXT":
      return "textarea"
    case "NUMBER":
      return "number"
    case "BOOLEAN":
      return "toggle"
    case "JSON":
      return "json"
    case "STRING":
    default:
      return "text"
  }
}

function parseDisplayValue(setting: SettingRecord): string {
  if (setting.type === "BOOLEAN") {
    return setting.value === "true" ? "true" : "false"
  }
  return setting.value ?? ""
}

export default function AdminSettingsManager() {
  const [data, setData] = useState<SettingsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [drafts, setDrafts] = useState<DraftsState>({})
  const [dirty, setDirty] = useState<DirtyState>({})
  const [saving, setSaving] = useState<LoadingState>({})
  const [toast, setToast] = useState<MessageState | null>(null)

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true)
      setError("")
      const response = await fetch("/api/admin/settings", { cache: "no-store", credentials: "include" })
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

  useEffect(() => {
    if (!toast) return
    const timeout = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(timeout)
  }, [toast])

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

        const response = await fetch(`/api/admin/settings/${encodeURIComponent(setting.key)}`, {
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
        setToast({ type: "success", message: `${setting.label || setting.key} updated successfully` })
        setData((prev) => {
          if (!prev) return prev
          const updatedGroups = { ...prev.settings }
          const groupList = updatedGroups[setting.group]?.map((record: SettingRecord) =>
            record.key === setting.key ? { ...record, value: json.setting.value, updatedAt: json.setting.updatedAt, updatedBy: json.setting.updatedBy } : record,
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
        setToast({ type: "error", message: err?.message || "Failed to update setting" })
      } finally {
        setSaving((prev) => ({ ...prev, [setting.key]: false }))
      }
    },
    [drafts],
  )

  const renderControl = useCallback(
    (setting: SettingRecord) => {
      const value = drafts[setting.key] ?? ""
      const controlType = getControlType(setting)
      const baseProps = {
        id: setting.key,
        value,
        onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleChange(setting.key, event.target.value),
        className: "admin-settings__input",
        disabled: Boolean(saving[setting.key]),
      }

      switch (controlType) {
        case "textarea":
          return <textarea rows={3} {...baseProps} />
        case "number":
          return <input type="number" {...baseProps} />
        case "toggle":
          return (
            <label className="admin-settings__toggle">
              <input
                type="checkbox"
                checked={value === "true"}
                onChange={(event) => handleToggle(setting.key, event.target.checked)}
                disabled={Boolean(saving[setting.key])}
              />
              <span className="admin-settings__toggle-slider" />
            </label>
          )
        case "json":
          return (
            <textarea
              rows={6}
              {...baseProps}
              placeholder='Enter valid JSON (e.g. {"key": "value"})'
            />
          )
        case "text":
        default:
          return <input type="text" {...baseProps} />
      }
    },
    [drafts, handleChange, handleToggle, saving],
  )

  const hasSettings = useMemo(() => Object.keys(groupedSettings).length > 0, [groupedSettings])

  return (
    <div className="admin-settings">
      <header className="admin-page__header">
        <div>
          <h2>Admin Settings</h2>
          <p>Update platform-wide configuration without deploying new code.</p>
        </div>
        {data && <span className="admin-page__meta">Snapshot {new Date(data.generatedAt).toLocaleString()}</span>}
      </header>

      {toast && <div className={`admin-alert admin-alert--${toast.type}`}>{toast.message}</div>}
      {error && <div className="admin-alert admin-alert--error">{error}</div>}

      {loading ? (
        <div className="admin-loading">
          <div className="spinner"></div>
          <p>Loading settings...</p>
        </div>
      ) : !hasSettings ? (
        <div className="admin-alert">No configurable settings have been defined yet.</div>
      ) : (
        <div className="admin-settings__groups">
          {Object.entries(groupedSettings).map(([group, settings]) => {
            const groupMeta = GROUP_LABELS[group] ?? { title: group, description: "" }
            return (
              <section key={group} className="admin-settings__group">
                <div className="admin-settings__group-header">
                  <h3>{groupMeta.title}</h3>
                  {groupMeta.description && <p>{groupMeta.description}</p>}
                </div>
                <div className="admin-settings__list">
                  {settings.map((setting) => {
                    const isDirty = dirty[setting.key]
                    const isSaving = saving[setting.key]
                    return (
                      <div key={setting.key} className={`admin-settings__item${isDirty ? " admin-settings__item--dirty" : ""}`}>
                        <div className="admin-settings__item-header">
                          <div>
                            <label htmlFor={setting.key}>{setting.label || setting.key}</label>
                            {setting.description && <p>{setting.description}</p>}
                          </div>
                          <div className="admin-settings__meta">
                            <span>Updated {new Date(setting.updatedAt).toLocaleString()}</span>
                            {setting.updatedBy?.name || setting.updatedBy?.email ? (
                              <span>by {setting.updatedBy?.name || setting.updatedBy?.email}</span>
                            ) : null}
                          </div>
                        </div>
                        <div className="admin-settings__item-body">
                          <div className="admin-settings__control">{renderControl(setting)}</div>
                          {getControlType(setting) !== "toggle" && (
                            <div className="admin-settings__actions">
                              <button
                                type="button"
                                className="btn btn--sm"
                                disabled={!isDirty || isSaving}
                                onClick={() => saveSetting(setting)}
                              >
                                {isSaving ? "Saving..." : "Save"}
                              </button>
                              <button
                                type="button"
                                className="btn btn--sm btn--outline"
                                disabled={!isDirty || isSaving}
                                onClick={() => {
                                  setDrafts((prev) => ({ ...prev, [setting.key]: parseDisplayValue(setting) }))
                                  setDirty((prev) => ({ ...prev, [setting.key]: false }))
                                }}
                              >
                                Reset
                              </button>
                            </div>
                          )}
                          {getControlType(setting) === "toggle" && (
                            <div className="admin-settings__actions">
                              <button
                                type="button"
                                className="btn btn--sm"
                                disabled={!isDirty || isSaving}
                                onClick={() => saveSetting(setting)}
                              >
                                {isSaving ? "Saving..." : "Save"}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
