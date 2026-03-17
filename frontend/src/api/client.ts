import type { ChatRequest, ChatResponse, Consultation } from '../types'

const BASE = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Request failed')
  }
  return res.json() as Promise<T>
}

export const apiClient = {
  chat(body: ChatRequest): Promise<ChatResponse> {
    return request('/chat', { method: 'POST', body: JSON.stringify(body) })
  },

  getConsultations(): Promise<{ consultations: Consultation[]; total: number }> {
    return request('/consultations')
  },

  updateStatus(id: string, status: string): Promise<{ success: boolean }> {
    return request(`/consultations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  },

  deleteConsultation(id: string): Promise<{ success: boolean }> {
    return request(`/consultations/${id}`, { method: 'DELETE' })
  },

  health(): Promise<{ status: string }> {
    return request('/health')
  },
}
