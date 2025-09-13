import {
  FeatureCard,
  HeroCard,
  InfoCard,
  MultiColumnCards,
  ProfileCard,
  StatsCard,
  SuccessCard,
  TechCard,
  TimelineCard,
  WarningCard,
} from '@/components/markdown/CardComponents';
import React from 'react';

// Enhanced card parser that works with ReactMarkdown
export function parseCardBlock(content: string): React.ReactElement | null {
  // Match card syntax: :::card[type]{props}
  const cardRegex = /^:::card\[(\w+)\]\{([^}]*)\}\n([\s\S]*?)\n:::$/;
  const match = content.match(cardRegex);

  if (!match) return null;

  const [, type, propsString, cardContent] = match;

  // Parse props from JSON-like syntax
  const props: Record<string, unknown> = {};
  if (propsString?.trim()) {
    try {
      // Handle simple key-value pairs: key="value" key2="value2"
      const propPairs = propsString?.match(/(\w+)="([^"]*)"/g);
      if (propPairs) {
        propPairs.forEach(pair => {
          const [, key, value] = pair.match(/(\w+)="([^"]*)"/) ?? [];
          if (key && value) {
            // Handle special cases
            if (
              key === 'badges' ||
              key === 'stats' ||
              key === 'items' ||
              key === 'technologies'
            ) {
              props[key] = value.split(',').map(s => s.trim());
            } else if (key === 'contact') {
              // Parse contact object: contact="email:test@example.com,phone:123-456-7890"
              const contactPairs = value.split(',').map(s => s.trim());
              props[key] = {} as Record<string, string>;
              contactPairs.forEach(contactPair => {
                const [contactKey, contactValue] = contactPair.split(':');
                if (contactKey && contactValue) {
                  (props[key] as Record<string, string>)[contactKey.trim()] =
                    contactValue.trim();
                }
              });
            } else {
              props[key] = value;
            }
          }
        });
      }
    } catch (error) {
      console.warn('Error parsing card props:', error);
    }
  }

  // Parse content for special card types
  const parsedContent = cardContent?.trim() ?? '';

  switch (type) {
    case 'info':
      return React.createElement(InfoCard, {
        ...props,
        children: parsedContent,
      });

    case 'feature':
      return React.createElement(FeatureCard, {
        ...props,
        children: parsedContent,
      });

    case 'profile':
      return React.createElement(ProfileCard, {
        ...props,
        children: parsedContent,
      });

    case 'stats':
      // Parse stats from content if not provided in props
      if (!props.stats && parsedContent) {
        const statLines = parsedContent
          .split('\n')
          .filter(line => line.includes(':'));
        props.stats = statLines.map(line => {
          const [label, value] = line.split(':').map(s => s.trim());
          return { label, value };
        });
      }
      return React.createElement(StatsCard, {
        ...props,
        children: parsedContent,
      });

    case 'timeline':
      // Parse timeline items from content if not provided in props
      if (!props.items && parsedContent) {
        const itemLines = parsedContent
          .split('\n')
          .filter(line => line.includes('|'));
        props.items = itemLines.map(line => {
          const [date, title, description, badge] = line
            .split('|')
            .map(s => s.trim());
          return { date, title, description, badge };
        });
      }
      return React.createElement(TimelineCard, {
        ...props,
        children: parsedContent,
      });

    case 'hero':
      return React.createElement(HeroCard, {
        ...props,
        children: parsedContent,
      });

    case 'success':
      return React.createElement(SuccessCard, {
        ...props,
        children: parsedContent,
      });

    case 'warning':
      return React.createElement(WarningCard, {
        ...props,
        children: parsedContent,
      });

    case 'tech':
      return React.createElement(TechCard, {
        ...props,
        children: parsedContent,
      });

    case 'columns':
      // Parse columns data from content
      if (parsedContent) {
        try {
          const columnsData = JSON.parse(parsedContent) as Record<
            string,
            unknown
          >;
          return React.createElement(MultiColumnCards, {
            columns: (columnsData.columns as number) === 3 ? 3 : 2,
            cards:
              (columnsData.cards as Array<{
                type: string;
                props: Record<string, unknown>;
                content: string;
              }>) || [],
            ...props,
          });
        } catch (error) {
          console.warn('Error parsing columns data:', error);
        }
      }
      return React.createElement(MultiColumnCards, {
        columns: 2,
        cards: [],
        ...props,
      });

    default:
      console.warn(`Unknown card type: ${type}`);
      return React.createElement(
        'div',
        {
          className: 'p-4 border border-red-200 bg-red-50 rounded-lg',
        },
        [
          React.createElement(
            'p',
            {
              className: 'text-red-600',
            },
            `Unknown card type: ${type}`
          ),
          React.createElement(
            'pre',
            {
              className: 'text-xs mt-2',
            },
            parsedContent
          ),
        ]
      );
  }
}

// Custom div component for ReactMarkdown that handles card syntax
export function createCardDivComponent() {
  return function CardDiv({
    children,
    ...props
  }: React.HTMLAttributes<HTMLDivElement>) {
    // Convert children to string if it's not already
    const content = React.Children.toArray(children)
      .map(child => (typeof child === 'string' ? child : ''))
      .join('');

    // Check if this div contains card syntax
    if (typeof content === 'string' && content.includes(':::card[')) {
      const cardComponent = parseCardBlock(content);
      if (cardComponent) {
        return React.createElement(
          'div',
          {
            className: 'my-6',
            ...props,
          },
          cardComponent
        );
      }
    }

    // Regular div
    return React.createElement('div', props, children);
  };
}

// Custom paragraph component that can handle card syntax
export function createCardParagraphComponent() {
  return function CardParagraph({
    children,
    ...props
  }: React.HTMLAttributes<HTMLParagraphElement>) {
    const content = React.Children.toArray(children)
      .map(child => (typeof child === 'string' ? child : ''))
      .join('');

    // Check if this paragraph contains card syntax
    if (typeof content === 'string' && content.includes(':::card[')) {
      const cardComponent = parseCardBlock(content);
      if (cardComponent) {
        return React.createElement(
          'div',
          {
            className: 'my-6',
            ...props,
          },
          cardComponent
        );
      }
    }

    // Regular paragraph
    return React.createElement('p', props, children);
  };
}

// Process markdown content to extract and replace card blocks
export function preprocessMarkdownForCards(markdown: string): {
  processedMarkdown: string;
  cardBlocks: Array<{ placeholder: string; component: React.ReactElement }>;
} {
  const cardBlocks: Array<{
    placeholder: string;
    component: React.ReactElement;
  }> = [];
  let processedMarkdown = markdown;
  let cardIndex = 0;

  // Find all card blocks
  const cardRegex = /^:::card\[(\w+)\]\{([^}]*)\}\n([\s\S]*?)\n:::$/gm;
  let match;

  while ((match = cardRegex.exec(markdown)) !== null) {
    const cardComponent = parseCardBlock(match[0]);
    if (cardComponent) {
      const placeholder = `__CARD_PLACEHOLDER_${cardIndex}__`;
      cardBlocks.push({ placeholder, component: cardComponent });
      processedMarkdown = processedMarkdown.replace(match[0], placeholder);
      cardIndex++;
    }
  }

  return { processedMarkdown, cardBlocks };
}

// Render processed markdown with card placeholders replaced
export function renderMarkdownWithCards(
  processedMarkdown: string,
  cardBlocks: Array<{ placeholder: string; component: React.ReactElement }>
): React.ReactNode[] {
  const parts = processedMarkdown.split(/(__CARD_PLACEHOLDER_\d+__)/);

  return parts.map((part, index) => {
    const cardBlock = cardBlocks.find(block => block.placeholder === part);
    if (cardBlock) {
      return React.createElement(
        'div',
        {
          key: index,
          className: 'my-6',
        },
        cardBlock.component
      );
    }

    // Regular content - return as string for further markdown processing
    return part;
  });
}
