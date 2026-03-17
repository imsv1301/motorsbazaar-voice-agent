export type Language = 'hindi' | 'gujarati'

export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  language: Language
  conversation_history: ConversationMessage[]
  user_message: string
}

export interface ExtractedConsultation {
  name: string
  contact: string
  query_type: 'buy' | 'sell'
  budget?: string
  car_preference?: string
  details?: string
}

export interface ChatResponse {
  reply: string
  is_complete: boolean
  extracted_data: ExtractedConsultation | null
}

export interface Consultation {
  ID: string
  Timestamp: string
  Language: string
  Name: string
  Contact: string
  'Query Type': string
  Budget: string
  'Car Preference': string
  Details: string
  Status: string
}

export type AgentState =
  | 'language_select'
  | 'chatting'
  | 'saving'
  | 'complete'
  | 'error'
