import React from 'react'
import { 
  InfoCard, 
  FeatureCard, 
  ProfileCard, 
  StatsCard, 
  TimelineCard,
  HeroCard,
  SuccessCard,
  WarningCard,
  TechCard,
  HeroProfileCard,
  MultiColumnCards
} from '@/components/markdown/CardComponents'

// Types for card data
interface CardData {
  type: 'info' | 'feature' | 'profile' | 'stats' | 'timeline' | 'hero' | 'success' | 'warning' | 'tech' | 'columns' | 'hero-profile'
  props: Record<string, unknown>
  content: string
}

// Parse custom markdown card syntax - both old and new formats
export function parseCardMarkdown(markdown: string): CardData | null {
  // Match old card syntax: :::card[type]{props}
  const oldCardRegex = /^:::card\[(\w+)\]\{([^}]*)\}\n([\s\S]*?)\n:::$/gm
  
  // Match new card syntax: ```card\n{JSON content}\n```
  const newCardRegex = /^```card\n([\s\S]*?)\n```$/gm
  
  // Try old syntax first
  let match = oldCardRegex.exec(markdown)
  if (match) {
    const [, type, propsString, content] = match

    // Parse props from JSON-like syntax
    const props: Record<string, unknown> = {}
    if (propsString.trim()) {
      try {
        // Handle simple key-value pairs: key="value" key2="value2"
        const propPairs = propsString.match(/(\w+)="([^"]*)"/g)
        if (propPairs) {
          propPairs.forEach(pair => {
            const [, key, value] = pair.match(/(\w+)="([^"]*)"/) || []
            if (key && value) {
              // Handle special cases
              if (key === 'badges' || key === 'stats' || key === 'items') {
                props[key] = value.split(',').map(s => s.trim())
              } else if (key === 'contact') {
                // Parse contact object: contact="email:test@example.com,phone:123-456-7890"
                const contactPairs = value.split(',').map(s => s.trim())
                props[key] = {} as Record<string, string>
                contactPairs.forEach(contactPair => {
                  const [contactKey, contactValue] = contactPair.split(':')
                  if (contactKey && contactValue) {
                    (props[key] as Record<string, string>)[contactKey.trim()] = contactValue.trim()
                  }
                })
              } else {
                props[key] = value
              }
            }
          })
        }
      } catch (error) {
        console.warn('Error parsing card props:', error)
      }
    }

    return {
      type: type as CardData['type'],
      props,
      content: content.trim()
    }
  }

  // Try new syntax
  match = newCardRegex.exec(markdown)
  if (match) {
    try {
      const jsonContent = match[1].trim()
      const parsedCard = JSON.parse(jsonContent)
      
      return {
        type: parsedCard.type as CardData['type'],
        props: parsedCard.props || {},
        content: parsedCard.content || ''
      }
    } catch (error) {
      console.warn('Error parsing new card syntax:', error)
      return null
    }
  }

  return null
}

// Render card component based on type
export function renderCardComponent(cardData: CardData): React.ReactElement | null {
  const { type, props, content } = cardData

  // Parse content as markdown-like text (simple parsing for now)
  let parsedContent = ''
  if (typeof content === 'string') {
    parsedContent = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n')
  } else {
    // For non-string content (like objects), use as-is
    parsedContent = content
  }

  switch (type) {
    case 'info':
      return React.createElement(InfoCard, {
        ...props,
        children: parsedContent
      })

    case 'feature':
      return React.createElement(FeatureCard, {
        ...props,
        children: parsedContent
      })

    case 'profile':
      return React.createElement(ProfileCard, {
        ...props,
        children: parsedContent
      })

    case 'stats':
      // Parse stats from content if not provided in props
      if (!props.stats && content && typeof content === 'string') {
        const statLines = content.split('\n').filter(line => line.includes(':'))
        props.stats = statLines.map(line => {
          const [label, value] = line.split(':').map(s => s.trim())
          return { label, value }
        })
      }
      return React.createElement(StatsCard, {
        ...props,
        children: parsedContent
      })

    case 'timeline':
      // Parse timeline items from content if not provided in props
      if (!props.items && content && typeof content === 'string') {
        const itemLines = content.split('\n').filter(line => line.includes('|'))
        props.items = itemLines.map(line => {
          const [date, title, description, badge] = line.split('|').map(s => s.trim())
          return { date, title, description, badge }
        })
      }
      return React.createElement(TimelineCard, {
        ...props,
        children: parsedContent
      })

    case 'hero':
      return React.createElement(HeroCard, {
        ...props,
        children: parsedContent
      })

    case 'success':
      return React.createElement(SuccessCard, {
        ...props,
        children: parsedContent
      })

    case 'warning':
      return React.createElement(WarningCard, {
        ...props,
        children: parsedContent
      })

    case 'tech':
      return React.createElement(TechCard, {
        ...props,
        children: parsedContent
      })

    case 'hero-profile':
      return React.createElement(HeroProfileCard, {
        ...props,
        children: parsedContent
      })

    case 'columns':
      // Parse columns data from content
      if (content) {
        try {
          // If content is already an object, use it directly
          let columnsData
          if (typeof content === 'string') {
            columnsData = JSON.parse(content)
          } else if (typeof content === 'object') {
            columnsData = content
          } else {
            return null
          }
          
          return React.createElement(MultiColumnCards, {
            columns: columnsData.columns || 2,
            cards: columnsData.cards || [],
            ...props
          })
        } catch {
          return null
        }
      }
      return React.createElement(MultiColumnCards, {
        columns: 2,
        cards: [],
        ...props
      })

    default:
      console.warn(`Unknown card type: ${type}`)
      return null
  }
}

// Process markdown content and replace card syntax with React components
export function processMarkdownWithCards(markdown: string): {
  processedMarkdown: string
  cardComponents: Array<{ id: string; component: React.ReactElement }>
} {
  const cardComponents: Array<{ id: string; component: React.ReactElement }> = []
  let processedMarkdown = markdown
  let cardIndex = 0

  // Find all card blocks and replace with placeholders
  // Handle both old and new syntax
  const oldCardRegex = /^:::card\[(\w+)\]\{([^}]*)\}\n([\s\S]*?)\n:::$/gm
  const newCardRegex = /^```card\n([\s\S]*?)\n```$/gm
  
  // Process old syntax first
  let match
  while ((match = oldCardRegex.exec(markdown)) !== null) {
    const cardData = parseCardMarkdown(match[0])
    if (cardData) {
      const component = renderCardComponent(cardData)
      if (component) {
        const cardId = `__CARD_${cardIndex}__`
        cardComponents.push({ id: cardId, component })
        processedMarkdown = processedMarkdown.replace(match[0], cardId)
        cardIndex++
      }
    }
  }

  // Process new syntax
  while ((match = newCardRegex.exec(processedMarkdown)) !== null) {
    const cardData = parseCardMarkdown(match[0])
    if (cardData) {
      const component = renderCardComponent(cardData)
      if (component) {
        const cardId = `__CARD_${cardIndex}__`
        cardComponents.push({ id: cardId, component })
        processedMarkdown = processedMarkdown.replace(match[0], cardId)
        cardIndex++
      }
    }
  }

  return { processedMarkdown, cardComponents }
}

// Alternative approach: Custom ReactMarkdown component for cards
export function createCardComponent(type: string) {
  return function CardComponent({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    const content = typeof children === 'string' ? children : ''
    
    switch (type) {
      case 'info':
        return React.createElement(InfoCard, { ...props, children: content })
      case 'feature':
        return React.createElement(FeatureCard, { ...props, children: content })
      case 'profile':
        return React.createElement(ProfileCard, { ...props, children: content })
      case 'stats':
        return React.createElement(StatsCard, { ...props, children: content })
      case 'timeline':
        return React.createElement(TimelineCard, { ...props, children: content })
      case 'hero':
        return React.createElement(HeroCard, { ...props, children: content })
      case 'success':
        return React.createElement(SuccessCard, { ...props, children: content })
      case 'warning':
        return React.createElement(WarningCard, { ...props, children: content })
      case 'tech':
        return React.createElement(TechCard, { ...props, children: content })
      case 'hero-profile':
        return React.createElement(HeroProfileCard, { ...props, children: content })
      case 'columns':
        // MultiColumnCards doesn't accept children, it needs cards array
        return React.createElement(MultiColumnCards, { 
          columns: 2, 
          cards: [], 
          className: props.className 
        })
      default:
        return React.createElement('div', {
          className: "p-4 border border-red-200 bg-red-50 rounded-lg"
        }, [
          React.createElement('p', {
            className: "text-red-600"
          }, `Unknown card type: ${type}`),
          children
        ])
    }
  }
}
