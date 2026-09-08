"use client"

import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Preloader from "@/components/Preloader"
import ScrollToTop from "@/components/ScrollToTop"
import Breadcrumb from "@/components/common/Breadcrumb"
import { useFileUpload } from "@/hooks/useFileUpload"
import Image from "next/image"
import { getApiUrl, withBasePath } from "@/utils/paths"
import { getSocket } from "@/lib/socketClient"
import type { Socket } from "socket.io-client"

interface MessageSender {
  name: string
  avatar: string
  email?: string
}

interface MessageItem {
  id: string
  sender: MessageSender
  preview: string
  time: string
  isStarred: boolean
  isUnread: boolean
  isActive?: boolean
  lastSenderId?: string | null
  attachmentsCount?: number
}

interface ConversationAttachment {
  id: string
  fileUrl: string
  fileName: string
  mimeType: string
  fileSize: number
  createdAt?: string
}

interface ConversationItem {
  id: string
  sender: {
    name: string
    avatar: string
    email: string
  }
  time: string
  content: string
  attachments?: ConversationAttachment[]
}

interface UploadedAttachmentPayload {
  url: string
  fileName: string
  mimeType: string
  fileSize: number
}

interface ChatSummary {
  id: string
  partner: {
    id: string
    name: string | null
    username: string | null
    email: string | null
    image: string | null
  }
  lastMessage: {
    id: string
    content: string
    createdAt: string
    senderId: string
    receiverId: string
    read: boolean
    attachmentsCount: number
  } | null
  unreadCount: number
  updatedAt: string
}

interface ChatResponse {
  chats: ChatSummary[]
  unreadTotal: number
}

interface ConversationResponse {
  chatId: string
  partner: {
    id: string
    name: string | null
    username: string | null
    email: string | null
    image: string | null
  }
  messages: Array<{
    id: string
    content: string
    createdAt: string
    senderId: string
    receiverId: string
    read: boolean
    sender: {
      id: string
      name: string | null
      username: string | null
      email: string | null
      image: string | null
    }
    attachments?: Array<{
      id: string
      fileUrl: string
      fileName: string
      mimeType: string
      fileSize: number
      createdAt: string
    }>
  }>
}

interface IncomingMessagePayload {
  chatId: string
  message: {
    id: string
    content: string
    createdAt: string
    senderId: string
    receiverId: string
    attachments?: Array<{
      id: string
      fileUrl: string
      fileName: string
      mimeType: string
      fileSize: number
      createdAt: string
    }>
  }
  sender: {
    id: string
    name: string | null
    username: string | null
    email: string | null
    image: string | null
  }
  receiver: {
    id: string
    name: string | null
    username: string | null
    email: string | null
    image: string | null
  }
}

function formatListTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
}

function formatConversationTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })
}

function normalizeImage(image: string | null | undefined, fallback: string) {
  if (!image) return withBasePath(fallback)
  if (image.startsWith("http://") || image.startsWith("https://")) return image
  const cleaned = image.replace(/\\/g, "/")
  return withBasePath(cleaned.startsWith("/") ? cleaned : `/${cleaned}`)
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 B"
  const units = ["B", "KB", "MB", "GB"]
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / Math.pow(1024, index)
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`
}

function computePreview(content: string | null | undefined, attachmentsCount?: number) {
  const trimmed = (content || "").trim()
  if (trimmed) {
    const firstLine = trimmed.split(/\r?\n/, 1)[0] ?? ""
    const MAX_LENGTH = 120
    if (firstLine.length > MAX_LENGTH) {
      return `${firstLine.slice(0, MAX_LENGTH - 1)}…`
    }
    return firstLine
  }
  if (attachmentsCount && attachmentsCount > 0) {
    return attachmentsCount === 1 ? "Sent an attachment" : `Sent ${attachmentsCount} attachments`
  }
  return "Say hello and start a conversation..."
}

function MessagePageInner() {
  const {
    uploadedFiles,
    handleFileChange,
    removeFile,
    clearFiles,
    error: fileError,
    setError: setFileError,
    isAtLimit,
  } = useFileUpload({
    maxFiles: 5,
    maxFileSize: 10 * 1024 * 1024,
  })
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [messageFolder, setMessageFolder] = useState("inbox")
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)
  const [loadingChats, setLoadingChats] = useState(false)
  const [loadingConversation, setLoadingConversation] = useState(false)
  const [chatError, setChatError] = useState<string>("")
  const [conversationError, setConversationError] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [composeMode, setComposeMode] = useState(false)
  const [composeRecipient, setComposeRecipient] = useState("")
  const [composeMessage, setComposeMessage] = useState("")
  const [composeError, setComposeError] = useState("")
  const [composeSending, setComposeSending] = useState(false)
  const [replySending, setReplySending] = useState(false)
  const [replyMessage, setReplyMessage] = useState("")
  const chatsRef = useRef<ChatSummary[]>([])
  const socketRef = useRef<Socket | null>(null)
  const selectedChatRef = useRef<string | null>(null)
  const sessionUserIdRef = useRef<string | undefined>(session?.user?.id)
  const sessionUserNameRef = useRef<string | undefined>(
    session?.user?.name ?? session?.user?.email ?? undefined
  )
  const sessionUserImageRef = useRef<string | undefined>(session?.user?.image ?? undefined)
  const sessionUserEmailRef = useRef<string | undefined>(session?.user?.email ?? undefined)
  const conversationContainerRef = useRef<HTMLDivElement | null>(null)
  const conversationsCache = useRef<Map<string, ConversationResponse>>(new Map())
  const initialisedRef = useRef(false)
  const handledParamsRef = useRef<{ chat?: string | null; to?: string | null }>({ chat: null, to: null })
  const typingTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map())
  const typingEmitCooldownRef = useRef<NodeJS.Timeout | null>(null)
  const [typingUsers, setTypingUsers] = useState<Array<{ id: string; name: string | null }>>([])
  const [readUpdatingChats, setReadUpdatingChats] = useState<Set<string>>(() => new Set())

  const setReadUpdating = useCallback((chatId: string, updating: boolean) => {
    setReadUpdatingChats((prev) => {
      const next = new Set(prev)
      if (updating) {
        next.add(chatId)
      } else {
        next.delete(chatId)
      }
      return next
    })
  }, [])

  const scrollConversationToBottom = useCallback(() => {
    const container = conversationContainerRef.current
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" })
    }
  }, [])

  const transformAttachments = useCallback(
    (attachments?: ConversationResponse["messages"][number]["attachments"]) =>
      (attachments ?? []).map((attachment) => ({
        id: attachment.id,
        fileUrl:
          attachment.fileUrl.startsWith("http://") || attachment.fileUrl.startsWith("https://")
            ? attachment.fileUrl
            : withBasePath(attachment.fileUrl),
        fileName: attachment.fileName,
        mimeType: attachment.mimeType,
        fileSize: attachment.fileSize,
        createdAt: attachment.createdAt,
      })),
    []
  )

  const uploadSelectedAttachments = useCallback(async (): Promise<UploadedAttachmentPayload[]> => {
    if (uploadedFiles.length === 0) {
      return []
    }

    setFileError(null)
    const uploaded: UploadedAttachmentPayload[] = []

    for (const file of uploadedFiles) {
      try {
        const formData = new FormData()
        formData.append("file", file.file)

        const response = await fetch(getApiUrl("/api/messages/attachments"), {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Failed to upload attachment" }))
          throw new Error(errorData.error || `Failed to upload ${file.name}`)
        }

        const data = await response.json()
        const attachment = data?.attachment

        if (!attachment?.url) {
          throw new Error("Attachment upload response invalid")
        }

        uploaded.push({
          url: attachment.url,
          fileName: attachment.fileName || file.name,
          mimeType: attachment.mimeType || file.file.type || "application/octet-stream",
          fileSize: typeof attachment.fileSize === "number" ? attachment.fileSize : file.file.size,
        })
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to upload attachment. Please try again."
        setFileError(message)
        throw error instanceof Error ? error : new Error(message)
      }
    }

    return uploaded
  }, [setFileError, uploadedFiles])

  const handleIncomingMessage = useCallback(
    (payload: IncomingMessagePayload) => {
      const currentUserId = sessionUserIdRef.current
      const chatId = payload.chatId
      const isCurrentChat = selectedChatRef.current === chatId
      const attachments = transformAttachments(payload.message.attachments)
      const messageTime = formatListTime(payload.message.createdAt)
      const previewText = computePreview(payload.message.content, attachments.length)
      const isCurrentUserSender = payload.message.senderId === currentUserId

      const partnerSource = isCurrentUserSender ? payload.receiver : payload.sender
      const partnerName = partnerSource?.name || partnerSource?.username || "Unknown"
      const partnerAvatar = normalizeImage(partnerSource?.image, "/images/notification_head4.png")
      const partnerEmail = partnerSource?.email || ""

      setMessages((prev) => {
        const existing = prev.find((chat) => chat.id === chatId)

        const nextChat: MessageItem = existing
          ? {
              ...existing,
              preview: previewText,
              time: messageTime,
              isUnread: !isCurrentUserSender && !isCurrentChat,
              isActive: isCurrentChat,
              lastSenderId: payload.message.senderId,
              attachmentsCount: attachments.length,
            }
          : {
              id: chatId,
              sender: {
                name: partnerName,
                avatar: partnerAvatar,
                email: partnerEmail,
              },
              preview: previewText,
              time: messageTime,
              isStarred: false,
              isUnread: !isCurrentUserSender,
              isActive: isCurrentChat,
              lastSenderId: payload.message.senderId,
              attachmentsCount: attachments.length,
            }

        if (isCurrentChat) {
          nextChat.isUnread = false
          nextChat.isActive = true
        }

        const others = prev
          .filter((chat) => chat.id !== chatId)
          .map((chat) =>
            chat.id === selectedChatRef.current
              ? { ...chat, isActive: true, isUnread: false }
              : { ...chat, isActive: false }
          )
        return [nextChat, ...others]
      })

      if (isCurrentChat) {
        const senderProfile = payload.message.senderId === payload.sender.id ? payload.sender : payload.receiver
        const senderDisplayName = isCurrentUserSender
          ? "Me"
          : senderProfile?.name || senderProfile?.username || "Unknown"
        const senderAvatar = normalizeImage(
          isCurrentUserSender ? sessionUserImageRef.current : senderProfile?.image,
          "/images/notification_head4.png"
        )
        const senderEmail = isCurrentUserSender ? sessionUserEmailRef.current ?? "" : senderProfile?.email || ""
        const conversationEntry: ConversationItem = {
          id: payload.message.id,
          sender: {
            name: senderDisplayName,
            avatar: senderAvatar,
            email: senderEmail,
          },
          time: formatConversationTime(payload.message.createdAt),
          content: payload.message.content,
          attachments: attachments.length > 0 ? attachments : undefined,
        }

        setConversations((prev) => {
          if (prev.some((item) => item.id === payload.message.id)) {
            return prev
          }
          return [...prev, conversationEntry]
        })

        const cached = conversationsCache.current.get(chatId)
        if (cached && !cached.messages.some((item) => item.id === payload.message.id)) {
          conversationsCache.current.set(chatId, {
            ...cached,
            messages: [
              ...cached.messages,
              {
                id: payload.message.id,
                content: payload.message.content,
                createdAt: payload.message.createdAt,
                senderId: payload.message.senderId,
                receiverId: payload.message.receiverId,
                read: payload.message.senderId === currentUserId,
                sender: {
                  id: payload.message.senderId,
                  name: senderProfile?.name,
                  username: senderProfile?.username,
                  email: senderProfile?.email,
                  image: senderProfile?.image,
                },
                attachments: payload.message.attachments ?? [],
              },
            ],
          })
        }

        requestAnimationFrame(scrollConversationToBottom)
      }
    },
    [scrollConversationToBottom, transformAttachments]
  )

  const emitTypingState = useCallback(
    (chatId: string | null, isTyping: boolean) => {
      const socket = socketRef.current
      const userId = sessionUserIdRef.current
      if (!socket || !chatId || !userId) return
      socket.emit("chat:typing", {
        chatId,
        userId,
        userName: sessionUserNameRef.current ?? null,
        isTyping,
      })
    },
    []
  )

  const triggerTyping = useCallback(() => {
    const chatId = selectedChatRef.current
    if (!chatId) return
    emitTypingState(chatId, true)

    if (typingEmitCooldownRef.current) {
      clearTimeout(typingEmitCooldownRef.current)
    }

    typingEmitCooldownRef.current = setTimeout(() => {
      emitTypingState(chatId, false)
      typingEmitCooldownRef.current = null
    }, 3000)
  }, [emitTypingState])

  const stopTyping = useCallback(() => {
    const chatId = selectedChatRef.current
    if (!chatId) return
    if (typingEmitCooldownRef.current) {
      clearTimeout(typingEmitCooldownRef.current)
      typingEmitCooldownRef.current = null
    }
    emitTypingState(chatId, false)
  }, [emitTypingState])

  const handleReplyInputChange = useCallback(
    (value: string) => {
      setReplyMessage(value)
      triggerTyping()
    },
    [triggerTyping]
  )

  const selectedMessage = useMemo(() => messages.find((msg) => msg.id === selectedMessageId) || null, [messages, selectedMessageId])

  const displayedConversations = useMemo(() => {
    const seen = new Set<string>()
    return conversations.filter((conversation) => {
      if (seen.has(conversation.id)) {
        return false
      }
      seen.add(conversation.id)
      return true
    })
  }, [conversations])

  useEffect(() => {
    selectedChatRef.current = selectedMessageId
    setTypingUsers([])
  }, [selectedMessageId])

  useEffect(() => {
    sessionUserIdRef.current = session?.user?.id
  }, [session?.user?.id])

  useEffect(() => {
    sessionUserNameRef.current = session?.user?.name ?? session?.user?.email ?? undefined
  }, [session?.user?.name, session?.user?.email])

  useEffect(() => {
    sessionUserImageRef.current = session?.user?.image ?? undefined
  }, [session?.user?.image])

  useEffect(() => {
    sessionUserEmailRef.current = session?.user?.email ?? undefined
  }, [session?.user?.email])

  const handleTypingIndicator = useCallback(
    (payload: { chatId: string; userId: string; userName?: string | null; isTyping: boolean }) => {
      const currentChatId = selectedChatRef.current
      if (!currentChatId || payload.chatId !== currentChatId) return
      if (payload.userId === sessionUserIdRef.current) return

      setTypingUsers((prev) => {
        const map = new Map(prev.map((user) => [user.id, user]))
        if (payload.isTyping) {
          map.set(payload.userId, {
            id: payload.userId,
            name: payload.userName ?? null,
          })
        } else {
          map.delete(payload.userId)
        }
        return Array.from(map.values())
      })

      if (payload.isTyping) {
        const timeoutKey = `${payload.chatId}:${payload.userId}`
        if (typingTimeoutsRef.current.has(timeoutKey)) {
          clearTimeout(typingTimeoutsRef.current.get(timeoutKey)!)
        }
        const timeout = setTimeout(() => {
          setTypingUsers((prev) => prev.filter((user) => user.id !== payload.userId))
          typingTimeoutsRef.current.delete(timeoutKey)
        }, 5000)
        typingTimeoutsRef.current.set(timeoutKey, timeout)
      }
    },
    []
  )

  useEffect(() => {
    if (typingUsers.length > 0) {
      requestAnimationFrame(scrollConversationToBottom)
    }
  }, [typingUsers, scrollConversationToBottom])

  useEffect(() => {
    let isMounted = true

    const setupSocket = async () => {
      try {
        // Use getApiUrl to include basePath in the socket endpoint
        const socketPath = getApiUrl("/api/socket")
        await fetch(socketPath)
        if (!isMounted) return
        const socket = getSocket()
        socketRef.current = socket

        if (sessionUserIdRef.current) {
          socket.emit("user:join", sessionUserIdRef.current)
        }

        if (selectedChatRef.current) {
          socket.emit("chat:join", selectedChatRef.current)
        }

        socket.on("message:new", handleIncomingMessage)
        socket.on("chat:typing", handleTypingIndicator)
      } catch (error) {
        setChatError("Unable to initialize real-time messaging.")
      }
    }

    setupSocket()

    return () => {
      isMounted = false
      if (socketRef.current) {
        socketRef.current.off("message:new", handleIncomingMessage)
        socketRef.current.off("chat:typing", handleTypingIndicator)
      }
      typingTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout))
      typingTimeoutsRef.current.clear()
    }
  }, [handleIncomingMessage, handleTypingIndicator])

useEffect(() => {
  const socket = socketRef.current
  if (socket && selectedMessageId) {
    socket.emit("chat:join", selectedMessageId)
  }
}, [selectedMessageId])

useEffect(() => {
  const socket = socketRef.current
  if (socket && sessionUserIdRef.current) {
    socket.emit("user:join", sessionUserIdRef.current)
  }
}, [session?.user?.id])

useEffect(() => {
  return () => {
    if (typingEmitCooldownRef.current) {
        clearTimeout(typingEmitCooldownRef.current)
      typingEmitCooldownRef.current = null
    }
  }
}, [])

  const renderAttachedFiles = (disabled: boolean) => (
    <>
      {uploadedFiles.length > 0 && (
        <div className="attached attached--list">
          {uploadedFiles.map((file) => (
            <div key={file.id} className="attached__item">
              {file.previewUrl ? (
                <Image
                  src={file.previewUrl}
                  alt={file.name}
                  width={48}
                  height={48}
                  className="attached__thumb"
                  unoptimized
                />
              ) : (
                <span className="lnr lnr-file-empty attached__icon" aria-hidden="true"></span>
              )}
              <div className="attached__meta">
                <p className="attached__name" title={file.name}>
                  {file.name}
                </p>
                <span className="attached__size">{formatFileSize(file.size)}</span>
              </div>
              <button
                type="button"
                className="attached__remove"
                onClick={() => removeFile(file.id)}
                disabled={disabled}
                aria-label={`Remove ${file.name}`}
              >
                <span className="lnr lnr-cross"></span>
              </button>
            </div>
          ))}
        </div>
      )}
      {fileError && <p className="attached__error">{fileError}</p>}
    </>
  )

  const requestChatList = useCallback(async () => {
    if (!session?.user?.id) return
    if (loadingChats) return
    try {
      setLoadingChats(true)
      setChatError("")
      const response = await fetch(getApiUrl("/api/messages/chats"), { cache: "no-store" })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to load messages" }))
        throw new Error(errorData.error || "Failed to load messages")
      }
      const data: ChatResponse = await response.json()
      const chats = data.chats || []
      chatsRef.current = chats

      setMessages((prev) => {
        const starredMap = new Map(prev.map((msg) => [msg.id, msg.isStarred]))
        const activeId = composeMode
          ? null
          : selectedMessageId && chats.some((chat) => chat.id === selectedMessageId)
          ? selectedMessageId
          : chats[0]?.id || null
        setSelectedMessageId(activeId)
        return chats.map((chat) => {
          const last = chat.lastMessage
          const partnerName = chat.partner.name || chat.partner.username || "Unknown"
          const attachmentsCount = last?.attachmentsCount ?? 0
          const previewText = computePreview(last?.content, attachmentsCount)
          const timestamp = last?.createdAt || chat.updatedAt
          return {
            id: chat.id,
            sender: {
              name: partnerName,
              avatar: normalizeImage(chat.partner.image, "/images/notification_head4.png"),
              email: chat.partner.email || undefined,
            },
            preview: previewText,
            time: formatListTime(timestamp),
            isStarred: starredMap.get(chat.id) || false,
            isUnread: chat.unreadCount > 0 && chat.id !== activeId,
            isActive: activeId !== null && chat.id === activeId,
            lastSenderId: last?.senderId || null,
            attachmentsCount,
          }
        })
      })
    } catch (error: any) {
      setChatError(error.message || "Failed to load messages")
    } finally {
      setLoadingChats(false)
    }
  }, [session?.user?.id, selectedMessageId, loadingChats, composeMode])

  const loadConversation = useCallback(
    async (chatId: string) => {
      if (conversationsCache.current.has(chatId)) {
        const cached = conversationsCache.current.get(chatId)!
        return cached
      }
      const response = await fetch(getApiUrl(`/api/messages/chat/${chatId}`), { cache: "no-store" })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to load conversation" }))
        throw new Error(errorData.error || "Failed to load conversation")
      }
      const data: ConversationResponse = await response.json()
      conversationsCache.current.set(chatId, data)
      return data
    },
    []
  )

  const displayConversation = useCallback(
    async (chatId: string) => {
      if (loadingConversation) return
      try {
        setLoadingConversation(true)
        setConversationError("")
        const data = await loadConversation(chatId)
        const partner = data.partner
        const partnerName = partner.name || partner.username || "Unknown"
        const partnerAvatar = normalizeImage(partner.image, "/images/notification_head4.png")
        const currentUserId = session?.user?.id
        const currentUserAvatar = normalizeImage(session?.user?.image, "/images/notification_head4.png")
        const currentUserEmail = session?.user?.email || ""

        setConversations(
          data.messages.map((message) => {
            const isSelf = message.sender.id === currentUserId
            const senderAvatar = normalizeImage(
              isSelf ? currentUserAvatar : message.sender.image,
              "/images/notification_head4.png"
            )
            const senderEmail = isSelf ? currentUserEmail : message.sender.email || ""
            const senderName = isSelf ? "Me" : message.sender.name || message.sender.username || "Unknown"
            const attachments = transformAttachments(message.attachments)

            return {
              id: message.id,
              sender: {
                name: senderName,
                avatar: senderAvatar,
                email: senderEmail,
              },
              time: formatConversationTime(message.createdAt),
              content: message.content,
              attachments: attachments.length > 0 ? attachments : undefined,
            }
          })
        )

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === chatId
              ? {
                  ...msg,
                  isUnread: false,
                  isActive: true,
                  sender: {
                    name: partnerName,
                    avatar: partnerAvatar,
                    email: partner.email || undefined,
                  },
                }
              : {
                  ...msg,
                  isActive: false,
                }
          )
        )
        clearFiles()
        setReplyMessage("")
        requestAnimationFrame(scrollConversationToBottom)
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("messages:update"))
        }
      } catch (error: any) {
        setConversationError(error.message || "Failed to load conversation")
      } finally {
        setLoadingConversation(false)
      }
    },
    [
      clearFiles,
      loadConversation,
      loadingConversation,
      scrollConversationToBottom,
      session?.user?.email,
      session?.user?.id,
      session?.user?.image,
      transformAttachments,
    ]
  )

  const ensureChatWithPartner = useCallback(
    async (partnerIdentifier: string) => {
      const matchingChat = chatsRef.current.find((chat) => chat.partner.id === partnerIdentifier)
      if (matchingChat) {
        return matchingChat.id
      }

      try {
        const response = await fetch(getApiUrl("/api/messages/chats"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ partnerId: partnerIdentifier }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Failed to start chat" }))
          throw new Error(errorData.error || "Failed to start chat")
        }

        const data = await response.json()
        await requestChatList()
        return data.chat?.id as string | undefined
      } catch (error) {
        return undefined
      }
    },
    [requestChatList]
  )

  const updateChatUnreadState = useCallback(
    (chatId: string, isUnread: boolean, unreadCountOverride?: number) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === chatId
            ? {
                ...msg,
                isUnread,
              }
            : msg
        )
      )

      chatsRef.current = chatsRef.current.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              unreadCount:
                typeof unreadCountOverride === "number"
                  ? unreadCountOverride
                  : isUnread
                  ? Math.max(chat.unreadCount || 0, 1)
                  : 0,
              lastMessage: chat.lastMessage
                ? {
                    ...chat.lastMessage,
                    read: !isUnread,
                  }
                : chat.lastMessage,
            }
          : chat
      )
    },
    []
  )

  const markChatAsRead = useCallback(
    async (chatId: string, options?: { messageId?: string }) => {
      if (!chatId) return
      setReadUpdating(chatId, true)
      try {
        const response = await fetch(getApiUrl(`/api/messages/chat/${chatId}`), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "markRead",
            messageId: options?.messageId,
          }),
        })

        const data = await response.json().catch(() => ({}))

        if (!response.ok) {
          throw new Error(data?.error || "Failed to mark conversation as read")
        }

        const unreadCount =
          typeof data?.unreadCount === "number" ? data.unreadCount : 0

        updateChatUnreadState(chatId, false, unreadCount)
        setChatError("")
        if (selectedMessageId === chatId) {
          setConversationError("")
        }
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("messages:update"))
        }

        const userId = session?.user?.id
        if (userId) {
          const cached = conversationsCache.current.get(chatId)
          if (cached) {
            conversationsCache.current.set(chatId, {
              ...cached,
              messages: cached.messages.map((message) =>
                message.receiverId === userId ? { ...message, read: true } : message
              ),
            })
          }
        }
      } catch (error: any) {
        const message =
          error instanceof Error ? error.message : "Failed to mark conversation as read"
        if (selectedMessageId === chatId) {
          setConversationError(message)
        } else {
          setChatError(message)
        }
      } finally {
        setReadUpdating(chatId, false)
      }
    },
    [selectedMessageId, session?.user?.id, setReadUpdating, updateChatUnreadState]
  )

  const markChatAsUnread = useCallback(
    async (chatId: string, options?: { messageId?: string }) => {
      if (!chatId) return
      setReadUpdating(chatId, true)
      try {
        const response = await fetch(getApiUrl(`/api/messages/chat/${chatId}`), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "markUnread",
            messageId: options?.messageId,
          }),
        })

        const data = await response.json().catch(() => ({}))

        if (!response.ok) {
          throw new Error(data?.error || "Failed to mark conversation as unread")
        }

        const unreadCount =
          typeof data?.unreadCount === "number" ? data.unreadCount : undefined

        updateChatUnreadState(chatId, true, unreadCount)
        setChatError("")
        if (selectedMessageId === chatId) {
          setConversationError("")
        }

        const targetMessageId =
          typeof data?.messageId === "string" ? data.messageId : null
        if (targetMessageId) {
          const cached = conversationsCache.current.get(chatId)
          if (cached) {
            conversationsCache.current.set(chatId, {
              ...cached,
              messages: cached.messages.map((message) =>
                message.id === targetMessageId ? { ...message, read: false } : message
              ),
            })
          }
        }
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("messages:update"))
        }
      } catch (error: any) {
        const message =
          error instanceof Error ? error.message : "Failed to mark conversation as unread"
        if (selectedMessageId === chatId) {
          setConversationError(message)
        } else {
          setChatError(message)
        }
      } finally {
        setReadUpdating(chatId, false)
      }
    },
    [selectedMessageId, setReadUpdating, updateChatUnreadState]
  )

  const resetComposeState = useCallback(() => {
    setComposeRecipient("")
    setComposeMessage("")
    setComposeError("")
    setComposeMode(false)
    setComposeSending(false)
    setReplyMessage("")
    clearFiles()
  }, [clearFiles])

  const handleStartCompose = useCallback(
    (initialRecipient = "") => {
      setMessages((prev) => prev.map((msg) => ({ ...msg, isActive: false })))
      setSelectedMessageId(null)
      setConversations([])
      clearFiles()
      setComposeRecipient(initialRecipient)
      setComposeMessage("")
      setComposeError("")
      setComposeMode(true)
      setReplyMessage("")
      handledParamsRef.current = { chat: null, to: null }
    },
    [clearFiles]
  )

  const handleComposeCancel = useCallback(
    (event?: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
      if (event) event.preventDefault()
      resetComposeState()
      handledParamsRef.current = { chat: null, to: null }
      router.replace("/message")
    },
    [resetComposeState, router]
  )

  const handleComposeSend = useCallback(async () => {
    const trimmedMessage = composeMessage.trim()

    if (!composeRecipient.trim()) {
      setComposeError("Please enter a recipient username or email.")
      return
    }

    if (!trimmedMessage && uploadedFiles.length === 0) {
      setComposeError("Add a message or at least one attachment.")
      return
    }

    if (composeSending) {
      return
    }

    try {
      setComposeSending(true)
      setComposeError("")

      const resolveResponse = await fetch(getApiUrl("/api/messages/resolve"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: composeRecipient }),
      })

      if (!resolveResponse.ok) {
        const resolveError = await resolveResponse.json().catch(() => ({ error: "Failed to resolve user" }))
        throw new Error(resolveError.error || "Failed to resolve recipient")
      }

      const { user } = await resolveResponse.json()

      const attachmentPayload = await uploadSelectedAttachments()

      const sendResponse = await fetch(getApiUrl("/api/messages/send"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: user.id,
          content: trimmedMessage,
          attachments: attachmentPayload,
        }),
      })

      if (!sendResponse.ok) {
        const sendError = await sendResponse.json().catch(() => ({ error: "Failed to send message" }))
        throw new Error(sendError.error || "Failed to send message")
      }

      const result = await sendResponse.json()
      const chatId: string | undefined = result.message?.chatId

      resetComposeState()
      handledParamsRef.current = { chat: null, to: null }

      await requestChatList()

      if (chatId) {
        setSelectedMessageId(chatId)
        setReplyMessage("")
        conversationsCache.current.delete(chatId)
        await displayConversation(chatId)
        router.replace(`/message?chat=${chatId}`)
      } else {
        router.replace("/message")
      }
    } catch (error: any) {
      setComposeSending(false)
      setComposeError(error.message || "Failed to send message")
      return
    }

    setComposeSending(false)
  }, [
    composeMessage,
    composeRecipient,
    composeSending,
    displayConversation,
    requestChatList,
    resetComposeState,
    router,
    uploadSelectedAttachments,
    uploadedFiles,
  ])

  const handleComposeInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault()
        if (!composeSending) {
          void handleComposeSend()
        }
      }
    },
    [composeSending, handleComposeSend]
  )

  useEffect(() => {
    if (status !== "authenticated") return
    const params = searchParams ?? new URLSearchParams()
    const composeParam = params.get("compose")
    const toParam = params.get("to") || ""
    if (composeParam && !composeMode) {
      handleStartCompose(toParam)
    }
  }, [status, searchParams, composeMode, handleStartCompose])

  useEffect(() => {
    if (status === "authenticated" && !initialisedRef.current) {
      requestChatList().then(() => {
        initialisedRef.current = true
      })
    }
  }, [status, requestChatList])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/message")
    }
  }, [status, router])

  useEffect(() => {
    if (!initialisedRef.current || loadingChats || composeMode) return

    const params = searchParams ?? new URLSearchParams()
    const chatParam = params.get("chat")
    const toParam = params.get("to")

    const handleInitialSelection = async () => {
      if (chatParam && handledParamsRef.current.chat !== chatParam) {
        handledParamsRef.current.chat = chatParam
        if (chatsRef.current.some((chat) => chat.id === chatParam)) {
          setSelectedMessageId(chatParam)
          conversationsCache.current.delete(chatParam)
          await displayConversation(chatParam)
          return
        }
      }

      if (toParam && handledParamsRef.current.to !== toParam) {
        handledParamsRef.current.to = toParam
        let partnerId: string | undefined
        const existing = chatsRef.current.find((chat) => chat.partner.id === toParam)
        if (existing) {
          partnerId = existing.partner.id
        } else {
          try {
            const res = await fetch(getApiUrl(`/api/authors/${encodeURIComponent(toParam)}`), { cache: "no-store" })
            if (res.ok) {
              const data = await res.json()
              partnerId = data.author?.id || data.id || undefined
            }
          } catch (error) {
          }
        }

        partnerId = partnerId || toParam

        const chatId = await ensureChatWithPartner(partnerId)
        if (chatId) {
          setSelectedMessageId(chatId)
          conversationsCache.current.delete(chatId)
          await displayConversation(chatId)
          return
        }
      }

      if (selectedMessageId) {
        await displayConversation(selectedMessageId)
      } else if (chatsRef.current.length > 0) {
        const firstId = chatsRef.current[0].id
        setSelectedMessageId(firstId)
        conversationsCache.current.delete(firstId)
        await displayConversation(firstId)
      }
    }

    handleInitialSelection()
  }, [initialisedRef.current, loadingChats, searchParams, selectedMessageId, displayConversation, ensureChatWithPartner, composeMode])

  const filteredMessages = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return messages.filter((msg) => {
      if (messageFolder === "starred" && !msg.isStarred) return false
      if (messageFolder === "sent" && msg.lastSenderId !== session?.user?.id) return false
      if (messageFolder === "trash") return false

      if (term) {
        const name = msg.sender.name.toLowerCase()
        const preview = msg.preview.toLowerCase()
        return name.includes(term) || preview.includes(term)
      }
      return true
    })
  }, [messages, messageFolder, searchTerm, session?.user?.id])

  const handleMessageClick = async (message: MessageItem) => {
    stopTyping()
    if (composeMode) {
      resetComposeState()
    }

    if (selectedMessageId === message.id && conversationsCache.current.has(message.id)) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === message.id
            ? { ...msg, isUnread: false, isActive: true }
            : { ...msg, isActive: false }
        )
      )
      const cached = conversationsCache.current.get(message.id)!
      setConversations(
        cached.messages.map((item) => {
          const isSelf = item.sender.id === session?.user?.id
          const senderAvatar = normalizeImage(
            isSelf ? session?.user?.image : item.sender.image,
            "/images/notification_head4.png"
          )
          const senderEmail = isSelf ? session?.user?.email || "" : item.sender.email || ""
          const senderName = isSelf ? "Me" : item.sender.name || item.sender.username || "Unknown"
          const attachments = transformAttachments(item.attachments)

          return {
            id: item.id,
            sender: {
              name: senderName,
              avatar: senderAvatar,
              email: senderEmail,
            },
            time: formatConversationTime(item.createdAt),
            content: item.content,
            attachments: attachments.length > 0 ? attachments : undefined,
          }
        })
      )
      return
    }

    setSelectedMessageId(message.id)
    conversationsCache.current.delete(message.id)
    await displayConversation(message.id)
  }

  const handleReply = useCallback(async () => {
    if (!selectedMessageId || !selectedMessage || loadingConversation || replySending) return
    const trimmedContent = replyMessage.trim()
    if (!trimmedContent && uploadedFiles.length === 0) {
      setConversationError("Add a message or at least one attachment.")
      return
    }

    try {
      setReplySending(true)
      setConversationError("")
      const partner = chatsRef.current.find((chat) => chat.id === selectedMessageId)?.partner
      const receiverId = partner?.id || selectedMessageId
      const attachmentPayload = await uploadSelectedAttachments()
      const response = await fetch(getApiUrl("/api/messages/send"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId, content: trimmedContent, attachments: attachmentPayload }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to send message" }))
        throw new Error(errorData.error || "Failed to send message")
      }
      const data = await response.json()
      const sentAt = data.message?.createdAt || new Date().toISOString()
      conversationsCache.current.delete(selectedMessageId)

      const currentUser = session?.user
      const senderName = currentUser?.name || currentUser?.username || "Me"
      const senderAvatar = normalizeImage(currentUser?.image, "/images/notification_head4.png")
      const newAttachments = transformAttachments(data.message?.attachments)
      const previewText = computePreview(trimmedContent, newAttachments.length)

      setConversations((prev) => [
        ...prev,
        {
          id: data.message.id,
          sender: {
            name: senderName,
            avatar: senderAvatar,
            email: currentUser?.email || "",
          },
          time: formatConversationTime(sentAt),
          content: trimmedContent,
          attachments: newAttachments.length > 0 ? newAttachments : undefined,
        },
      ])

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === selectedMessageId
            ? {
                ...msg,
                preview: previewText,
                time: formatListTime(sentAt),
                isUnread: false,
                lastSenderId: currentUser?.id || msg.lastSenderId,
                attachmentsCount: newAttachments.length,
              }
            : msg
        )
      )

      clearFiles()
      setReplyMessage("")
      stopTyping()
      requestAnimationFrame(scrollConversationToBottom)
    } catch (error: any) {
      const message = error instanceof Error ? error.message : "Failed to send reply"
      setConversationError(message)
    } finally {
      setReplySending(false)
    }
  }, [
    clearFiles,
    formatConversationTime,
    formatListTime,
    loadingConversation,
    replyMessage,
    replySending,
    selectedMessage,
    selectedMessageId,
    session?.user,
    scrollConversationToBottom,
    transformAttachments,
    stopTyping,
    uploadSelectedAttachments,
    uploadedFiles,
  ])

  const handleReplyInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault()
        if (!loadingConversation && !replySending) {
          void handleReply()
        }
      }
    },
    [handleReply, loadingConversation, replySending]
  )

  if (status === "loading" || !initialisedRef.current) {
    return (
      <div className="preload messages-page">
        <Preloader />
        <Header />
        <div className="text-center" style={{ padding: "100px 0" }}>
          <p>Loading...</p>
        </div>
        <Footer />
        <ScrollToTop />
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  return (
    <div className="preload messages-page">
      <Preloader />
      <Header />
      <Breadcrumb pageTitle="Messages Box" paths={[{ name: "Message", link: "/message" }]} />

      <section className="message_area">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="content_title">
                <h3>Messages</h3>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-5">
              <div className="cardify messaging_sidebar">
                <div className="messaging__header">
                  <div className="messaging_menu">
                    <a
                      href="#"
                      id="drop2"
                      className="dropdown-toggle"
                      aria-haspopup="true"
                      aria-expanded="true"
                      onClick={(event) => event.preventDefault()}
                    >
                      <span className="lnr lnr-inbox"></span>Inbox
                      <span className="msg">{messages.filter((msg) => msg.isUnread).length}</span>
                      <span className="lnr lnr-chevron-down"></span>
                    </a>

                    <ul className="custom_dropdown messaging_dropdown dropdown-menu" aria-labelledby="drop2">
                      <li>
                        <a href="#" onClick={(e) => { e.preventDefault(); setMessageFolder("inbox") }}>
                          <span className="lnr lnr-inbox"></span>Inbox
                        </a>
                      </li>
                      <li>
                        <a href="#" onClick={(e) => { e.preventDefault(); setMessageFolder("starred") }}>
                          <span className="fa fa-star-o"></span>Starred
                        </a>
                      </li>
                      <li>
                        <a href="#" onClick={(e) => { e.preventDefault(); setMessageFolder("sent") }}>
                          <span className="lnr lnr-dice"></span>Sent
                        </a>
                      </li>
                      <li>
                        <a href="#" onClick={(e) => { e.preventDefault(); setMessageFolder("trash") }}>
                          <span className="lnr lnr-trash"></span>Trash
                        </a>
                      </li>
                    </ul>
                  </div>

                  <div className="messaging_action">
                    <span className="lnr lnr-trash"></span>
                    <span className="lnr lnr-sync" onClick={() => requestChatList()} style={{ cursor: "pointer" }}></span>

                    <button type="button" className="btn btn--round btn--sm" onClick={() => handleStartCompose()}>
                      <span className="lnr lnr-pencil"></span>
                      <span className="text">Compose</span>
                    </button>
                  </div>
                </div>

                <div className="messaging__contents">
                  <div className="message_search">
                    <input
                      type="text"
                      placeholder="Search messages..."
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                    />
                    <span className="lnr lnr-magnifier"></span>
                  </div>

                  <div className="messages">
                    {loadingChats && <p className="text-center p-3">Loading conversations...</p>}
                    {!loadingChats && chatError && <p className="text-center text-danger p-3">{chatError}</p>}
                    {!loadingChats && !chatError && filteredMessages.length === 0 && (
                      <p className="text-center p-3">No conversations found.</p>
                    )}
                    {!loadingChats &&
                      !chatError &&
                      filteredMessages.map((message) => {
                        const isReadUpdating = readUpdatingChats.has(message.id)
                        return (
                      <div
                        key={message.id}
                        className={`message${message.isUnread ? " recent" : ""}${message.isActive ? " active" : ""}`}
                        onClick={() => handleMessageClick(message)}
                      >
                        <div className="message__actions_avatar">
                          <div className="actions">
                            <span
                              className={`fa ${message.isStarred ? "fa-star" : "fa-star-o"}`}
                              role="button"
                              aria-label={message.isStarred ? "Remove star" : "Add star"}
                              onClick={(event) => {
                                event.stopPropagation()
                                setMessages((prev) =>
                                  prev.map((msg) =>
                                    msg.id === message.id ? { ...msg, isStarred: !msg.isStarred } : msg
                                  )
                                )
                              }}
                            ></span>
                            <div className="custom_checkbox">
                              <input type="checkbox" id={`ch${message.id}`} />
                              <label htmlFor={`ch${message.id}`}>
                                <span className="shadow_checkbox"></span>
                              </label>
                            </div>
                          </div>
                          <div className="avatar">
                            <Image src={message.sender.avatar} alt={message.sender.name} width={50} height={50} />
                          </div>
                        </div>

                        <div className="message_data">
                          <div className="name_time">
                            <div className="name">
                              <p>{message.sender.name}</p>
                              {message.isUnread && (
                                <span
                                  className="lnr lnr-envelope"
                                  role="button"
                                  aria-label="Mark as read"
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    if (isReadUpdating) return
                                    void markChatAsRead(message.id)
                                  }}
                                ></span>
                              )}
                            </div>
                            <span className="time">{message.time}</span>
                          </div>
                          <p className="message__preview_text">
                            {message.attachmentsCount ? (
                              <>
                                <span className="lnr lnr-paperclip message__preview_icon" aria-hidden="true"></span>
                                {message.preview}
                              </>
                            ) : (
                              message.preview
                            )}
                          </p>
                        </div>
                      </div>
                        )
                      })}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-7">
              <div className="chat_area cardify">
                <div className="chat_area--title">
                  <h3>
                    {composeMode ? (
                      "Compose New Message"
                    ) : (
                      <>
                        Message with <span className="name">{selectedMessage?.sender.name || ""}</span>
                      </>
                    )}
                  </h3>
                  {!composeMode && (
                    <div className="message_toolbar">
                      <a href="#">
                        <span className="lnr lnr-flag"></span>
                      </a>
                      <a href="#">
                        <span className="lnr lnr-trash"></span>
                      </a>
                      <a
                        href="#"
                        id="drop1"
                        className="dropdown-trigger dropdown-toggle"
                        aria-haspopup="true"
                        aria-expanded="true"
                        onClick={(event) => event.preventDefault()}
                      >
                        <Image src={withBasePath("/images/menu_icon.png")} alt="Menu icon" width={20} height={20} className="dropdown-trigger" />
                      </a>

                      <ul className="custom_dropdown dropdown-menu" aria-labelledby="drop1">
                        <li>
                          <a
                            href="#"
                            onClick={(event) => {
                              event.preventDefault()
                              if (!selectedMessageId || readUpdatingChats.has(selectedMessageId)) {
                                return
                              }
                              void markChatAsRead(selectedMessageId)
                            }}
                            className={selectedMessageId && readUpdatingChats.has(selectedMessageId) ? "disabled-link" : ""}
                          >
                            Mark as read
                          </a>
                        </li>
                        <li>
                          <a
                            href="#"
                            onClick={(event) => {
                              event.preventDefault()
                              if (!selectedMessageId || readUpdatingChats.has(selectedMessageId)) {
                                return
                              }
                              void markChatAsUnread(selectedMessageId)
                            }}
                            className={selectedMessageId && readUpdatingChats.has(selectedMessageId) ? "disabled-link" : ""}
                          >
                            Mark as unread
                          </a>
                        </li>
                        <li>
                          <a href="#">All Attachments</a>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                {composeMode ? (
                  <div className="message_composer composing">
                    {composeError && (
                      <div className="alert alert-danger" role="alert">
                        {composeError}
                      </div>
                    )}

                    <input
                      type="text"
                      className="recipient_field"
                      placeholder="To"
                      value={composeRecipient}
                      onChange={(event) => setComposeRecipient(event.target.value)}
                      disabled={composeSending}
                    />

                    {renderAttachedFiles(composeSending)}

                    <div className="btns" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <input
                        type="text"
                        className="message_input"
                        placeholder="Write your message..."
                        value={composeMessage}
                        onChange={(event) => setComposeMessage(event.target.value)}
                        onKeyDown={handleComposeInputKeyDown}
                        disabled={composeSending}
                        style={{ flex: 1, minWidth: 0 }}
                      />
                      <button
                        className="btn send btn--sm btn--round"
                        onClick={handleComposeSend}
                        disabled={composeSending}
                        title="Send"
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "10px 14px" }}
                      >
                        <span className="lnr lnr-location"></span>
                      </button>
                      <label
                        htmlFor="compose_att"
                        style={{
                          margin: 0,
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          cursor: composeSending || isAtLimit ? "not-allowed" : "pointer",
                        }}
                        title={isAtLimit ? "Attachment limit reached" : "Attach files"}
                      >
                        <input
                          type="file"
                          className="attachment_field"
                          id="compose_att"
                          multiple
                          onChange={handleFileChange}
                          disabled={composeSending || isAtLimit}
                        />
                        <span className="lnr lnr-paperclip"></span>
                      </label>
                      <button
                        type="button"
                        className="btn btn--round btn--sm cancel_btn"
                        onClick={(event) => handleComposeCancel(event)}
                        disabled={composeSending}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="chat_area--conversation" ref={conversationContainerRef}>
                      {loadingConversation && <p className="text-center p-3">Loading conversation...</p>}
                      {!loadingConversation && conversationError && <p className="text-center text-danger p-3">{conversationError}</p>}
                      {!loadingConversation && !conversationError && displayedConversations.length === 0 && (
                        <p className="text-center p-3">No messages yet. Start the conversation!</p>
                      )}
                      {!loadingConversation && !conversationError && displayedConversations.map((conversation) => (
                        <div key={conversation.id} className="conversation">
                          <div className="head">
                            <div className="chat_avatar">
                              <Image src={conversation.sender.avatar} alt="Notification avatar" width={50} height={50} />
                            </div>

                            <div className="name_time">
                              <div>
                                <h4>{conversation.sender.name}</h4>
                                <p>{conversation.time}</p>
                              </div>
                              <span className="email">{conversation.sender.email}</span>
                            </div>
                          </div>

                          <div className="body">
                            {conversation.content && <p>{conversation.content}</p>}
                            {conversation.attachments && conversation.attachments.length > 0 && (
                              <div className="attachments">
                                <div className="attachment_head">
                                  <p>
                                    <span className="lnr lnr-paperclip"></span> {conversation.attachments.length}{" "}
                                    {conversation.attachments.length > 1 ? "Attachments" : "Attachment"}
                                  </p>
                                </div>

                                <div className="attachment">
                                  <ul>
                                    {conversation.attachments.map((attachment) => (
                                      <li key={attachment.id}>
                                        {attachment.mimeType.startsWith("image/") ? (
                                          <a
                                            href={attachment.fileUrl}
                                            className="venobox"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title={attachment.fileName}
                                          >
                                            <Image
                                              src={attachment.fileUrl}
                                              alt={attachment.fileName}
                                              width={100}
                                              height={100}
                                            />
                                          </a>
                                        ) : (
                                          <a
                                            href={attachment.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="attachment__file"
                                            title={attachment.fileName}
                                          >
                                            <span className="lnr lnr-download"></span>
                                            <span>{attachment.fileName}</span>
                                          </a>
                                        )}
                                        <div className="attachment__meta">
                                          <span className="attachment__name">{attachment.fileName}</span>
                                          <span className="attachment__size">{formatFileSize(attachment.fileSize)}</span>
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {typingUsers.length > 0 && (
                        <div className="typing-indicator">
                          <span className="typing-indicator__text">
                            {typingUsers.length === 1
                              ? `${typingUsers[0].name ?? "Someone"} is typing...`
                              : `${typingUsers
                                  .map((user) => user.name ?? "Someone")
                                  .join(", ")} are typing...`}
                          </span>
                          <span className="typing-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="message_composer">
                      {renderAttachedFiles(replySending || loadingConversation)}

                      <div className="btns" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <input
                          type="text"
                          className="message_input"
                          placeholder="Write a message..."
                          value={replyMessage}
                          onChange={(event) => handleReplyInputChange(event.target.value)}
                          onKeyDown={handleReplyInputKeyDown}
                          onBlur={stopTyping}
                          disabled={loadingConversation || replySending}
                          style={{ flex: 1, minWidth: 0 }}
                        />
                        <button
                          className="btn send btn--sm btn--round"
                          onClick={handleReply}
                          disabled={loadingConversation || replySending}
                          title="Send"
                          style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "10px 14px" }}
                        >
                          <span className="lnr lnr-location"></span>
                        </button>
                        <label
                          htmlFor="att"
                          style={{
                            margin: 0,
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            cursor: loadingConversation || replySending || isAtLimit ? "not-allowed" : "pointer",
                          }}
                          title={isAtLimit ? "Attachment limit reached" : "Attach files"}
                        >
                          <input
                            type="file"
                            className="attachment_field"
                            id="att"
                            multiple
                            onChange={handleFileChange}
                            disabled={loadingConversation || replySending || isAtLimit}
                          />
                          <span className="lnr lnr-paperclip"></span>
                        </label>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <ScrollToTop />
    </div>
  )
}

export default function MessagePage() {
  return (
    <Suspense
      fallback={
        <div className="preload message-page">
          <Preloader />
          <Header />
          <ScrollToTop />
        </div>
      }
    >
      <MessagePageInner />
    </Suspense>
  )
}

