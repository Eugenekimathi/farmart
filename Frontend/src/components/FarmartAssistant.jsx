import { useState } from 'react'
import { sendAssistantMessage } from '../services/assistantService'

const quickQuestions = [
  'What animals are available?',
  'How do I buy an animal?',
  'What should I check before buying?',
]

const FarmartAssistant = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I can help you find livestock and use Farmart.' },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const [error, setError] = useState('')

  const askQuestion = async (question) => {
    const trimmedQuestion = question.trim()
    if (!trimmedQuestion || isLoading) return

    setMessages((current) => [...current, { role: 'user', content: trimmedQuestion }])
    setMessage('')
    setError('')
    setIsLoading(true)

    try {
      const response = await sendAssistantMessage({ message: trimmedQuestion, conversationId })
      setConversationId(response.conversation_id)
      setMessages((current) => [...current, { role: 'assistant', content: response.message }])
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'The assistant is unavailable. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    askQuestion(message)
  }

  return (
    <div className="farmart-assistant">
      {isOpen && (
        <section className="farmart-assistant__panel" aria-label="Farmart Assistant">
          <header className="farmart-assistant__header">
            <div>
              <strong>Farmart Assistant</strong>
              <span>Livestock help, on demand</span>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Close assistant">×</button>
          </header>

          <div className="farmart-assistant__messages" aria-live="polite">
            {messages.map((item, index) => (
              <p key={`${item.role}-${index}`} className={`farmart-assistant__message farmart-assistant__message--${item.role}`}>
                {item.content}
              </p>
            ))}
            {isLoading && <p className="farmart-assistant__message farmart-assistant__message--assistant">Thinking...</p>}
            {error && <p className="farmart-assistant__message farmart-assistant__message--error" role="alert">{error}</p>}
          </div>

          <div className="farmart-assistant__quick-actions">
            {quickQuestions.map((question) => (
              <button type="button" key={question} onClick={() => askQuestion(question)}>{question}</button>
            ))}
          </div>

          <form className="farmart-assistant__form" onSubmit={handleSubmit}>
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ask about livestock..."
              aria-label="Ask Farmart Assistant"
            />
            <button type="submit" disabled={isLoading || !message.trim()} aria-label="Send question">→</button>
          </form>
        </section>
      )}

      <button className="farmart-assistant__launcher" type="button" onClick={() => setIsOpen((open) => !open)}>
        <span aria-hidden="true">✦</span> Ask Farmart
      </button>
    </div>
  )
}

export default FarmartAssistant
