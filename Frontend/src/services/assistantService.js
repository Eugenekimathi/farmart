import api from './api'

export const sendAssistantMessage = async ({ message, conversationId }) => {
  const response = await api.post('/assistant/chat', {
    message,
    conversation_id: conversationId || undefined,
  })
  return response.data
}
