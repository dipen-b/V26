'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { useApp } from '@/components/app-provider'
import { Markdown } from '@/components/markdown'
import { ModuleGuard } from '@/components/module-guard'
import { Alert, Button, Spinner } from '@/components/ui'
import { IconPlus, IconSend, IconTrash } from '@/components/icons'
import { Logo } from '@/components/brand'

type ChatSummary = { id: string; title: string; updated_at: string }
type Message = { id: string; role: 'user' | 'assistant'; content: string }

const SUGGESTIONS = [
  'Increase my app installs by 20% — build me the plan',
  'Analyze my competitors and tell me where I can win',
  'Create a 30-day launch plan for a new product',
  'How can I increase revenue without raising ad spend?',
  'My retention is dropping. Diagnose it and give me fixes.',
  'Generate a LinkedIn content strategy for this quarter',
]

export default function ChatPage() {
  return (
    <ModuleGuard capability="chat">
      <ChatWorkspace />
    </ModuleGuard>
  )
}

function ChatWorkspace() {
  const { workspace } = useApp()
  const [chats, setChats] = useState<ChatSummary[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  // Set when send() creates a chat, so selecting it does not refetch an empty
  // message list over the reply that is still streaming into local state.
  const skipFetchRef = useRef<string | null>(null)

  const loadChats = useCallback(async () => {
    if (!workspace) return
    const res = await fetch(`/api/chats?workspaceId=${workspace.id}`)
    if (!res.ok) return
    const data = await res.json()
    setChats(data.chats)
  }, [workspace])

  // Switching workspaces resets the conversation view entirely.
  useEffect(() => {
    setActiveId(null)
    setMessages([])
    void loadChats()
  }, [loadChats])

  useEffect(() => {
    if (!activeId) {
      setMessages([])
      return
    }
    if (skipFetchRef.current === activeId) {
      skipFetchRef.current = null
      return
    }
    let cancelled = false
    void (async () => {
      const res = await fetch(`/api/chats/${activeId}`)
      if (!res.ok || cancelled) return
      const data = await res.json()
      setMessages(data.messages)
    })()
    return () => {
      cancelled = true
    }
  }, [activeId])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, streaming])

  async function send(text: string) {
    const prompt = text.trim()
    if (!prompt || streaming || !workspace) return

    setError(null)
    setInput('')
    setStreaming(true)

    try {
      let chatId = activeId
      if (!chatId) {
        const res = await fetch('/api/chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workspaceId: workspace.id }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Could not start a conversation.')
        chatId = data.chat.id as string
        skipFetchRef.current = chatId
        setActiveId(chatId)
      }

      setMessages((prev) => [
        ...prev,
        { id: `local-user-${Date.now()}`, role: 'user', content: prompt },
        { id: 'streaming', role: 'assistant', content: '' },
      ])

      const res = await fetch(`/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: prompt }),
      })

      if (!res.ok || !res.body) {
        const detail = await res.json().catch(() => ({}))
        throw new Error(detail.error ?? 'The AI request failed.')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assembled = ''

      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        assembled += decoder.decode(value, { stream: true })
        setMessages((prev) =>
          prev.map((m) => (m.id === 'streaming' ? { ...m, content: assembled } : m)),
        )
      }

      setMessages((prev) =>
        prev.map((m) => (m.id === 'streaming' ? { ...m, id: `assistant-${Date.now()}` } : m)),
      )
      void loadChats()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The AI request failed.')
      setMessages((prev) => prev.filter((m) => m.id !== 'streaming'))
    } finally {
      setStreaming(false)
      inputRef.current?.focus()
    }
  }

  async function deleteChat(chatId: string) {
    await fetch(`/api/chats/${chatId}`, { method: 'DELETE' })
    if (chatId === activeId) setActiveId(null)
    void loadChats()
  }

  return (
    <div className="flex h-full min-h-0">
      {/* Conversation list */}
      <div className="flex w-[220px] shrink-0 flex-col border-r border-line">
        <div className="p-3">
          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={() => {
              setActiveId(null)
              setMessages([])
            }}
          >
            <IconPlus className="h-4 w-4" />
            New chat
          </Button>
        </div>
        <div className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-3">
          {chats.length === 0 && (
            <p className="px-2 py-4 text-center text-xs leading-5 text-faint">
              Conversations you start will appear here.
            </p>
          )}
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={clsx(
                'group flex items-center gap-1 rounded-lg pr-1 transition',
                chat.id === activeId ? 'bg-primary-soft' : 'hover:bg-elevated',
              )}
            >
              <button
                onClick={() => setActiveId(chat.id)}
                className="min-w-0 flex-1 truncate px-2.5 py-2 text-left text-[13px] text-ink/85"
              >
                {chat.title}
              </button>
              <button
                onClick={() => deleteChat(chat.id)}
                title="Delete conversation"
                className="rounded p-1 text-faint opacity-0 transition hover:text-error group-hover:opacity-100"
              >
                <IconTrash className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Thread */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <Welcome brand={workspace?.name ?? 'your brand'} onPick={send} />
          ) : (
            <div className="mx-auto max-w-3xl space-y-7 px-8 py-8">
              {messages.map((message) =>
                message.role === 'user' ? (
                  <div key={message.id} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-[15px] leading-6 text-white">
                      {message.content}
                    </div>
                  </div>
                ) : (
                  <div key={message.id} className="flex gap-3.5">
                    <Logo size={26} />
                    <div className="min-w-0 flex-1 animate-fade-up">
                      {message.content ? (
                        <Markdown>{message.content}</Markdown>
                      ) : (
                        <span className="inline-flex items-center gap-2 text-[13px] text-muted">
                          <Spinner className="h-3.5 w-3.5" />
                          Thinking…
                        </span>
                      )}
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        <div className="border-t border-line px-8 py-4">
          <div className="mx-auto max-w-3xl">
            {error && (
              <div className="mb-3">
                <Alert>{error}</Alert>
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void send(input)
              }}
              className="flex items-end gap-2 rounded-xl border border-line bg-card p-2 transition focus-within:border-primary/50"
            >
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  e.target.style.height = 'auto'
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    void send(input)
                  }
                }}
                placeholder="Tell the AI your goal — “get 10,000 users for my startup”…"
                className="max-h-[200px] flex-1 resize-none bg-transparent px-2 py-1.5 text-[15px] leading-6 text-ink placeholder:text-faint focus:outline-none"
              />
              <Button type="submit" size="sm" loading={streaming} disabled={!input.trim()}>
                {!streaming && <IconSend className="h-4 w-4" />}
                Send
              </Button>
            </form>
            <p className="mt-2 text-center text-[11px] text-faint">
              MarketPilot works from your workspace profile. Verify numbers before spending against them.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Welcome({ brand, onPick }: { brand: string; onPick: (prompt: string) => void }) {
  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col items-center justify-center px-8 py-12">
      <Logo size={44} />
      <h1 className="mt-5 text-2xl font-semibold tracking-tight">What are we growing today?</h1>
      <p className="mt-2 max-w-md text-center text-sm leading-6 text-muted">
        Tell MarketPilot the goal for <span className="text-ink">{brand}</span> and it will analyze, plan,
        generate, and tell you what to do next.
      </p>

      <div className="mt-8 grid w-full gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onPick(suggestion)}
            className="rounded-xl border border-line bg-card px-4 py-3 text-left text-[13px] leading-5 text-ink/85 transition hover:border-primary/50 hover:bg-elevated"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}
