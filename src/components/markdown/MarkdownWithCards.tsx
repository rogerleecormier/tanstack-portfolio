import { Blockquote, H1, H2, P } from '@/components/ui/typography';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import slugify from 'slugify';
// import { renderMarkdownWithCards } from '@/utils/markdownCardExtensions'

interface MarkdownWithCardsProps {
  content: string;
  cardBlocks: Array<{ placeholder: string; component: React.ReactElement }>;
  className?: string;
}

export const MarkdownWithCards: React.FC<MarkdownWithCardsProps> = ({
  content,
  cardBlocks,
  className,
}) => {
  // Split content by card placeholders and render accordingly
  const renderContent = () => {
    const parts = content.split(/(__CARD_PLACEHOLDER_\d+__)/);

    return parts.map((part, index) => {
      // Check if this part is a card placeholder
      const cardMatch = part.match(/^__CARD_PLACEHOLDER_(\d+)__$/);
      if (cardMatch) {
        // const cardIndex = parseInt(cardMatch[1])
        const cardBlock = cardBlocks.find(block => block.placeholder === part);
        return cardBlock ? (
          <div key={index} className='my-6'>
            {cardBlock.component}
          </div>
        ) : null;
      }

      // Regular markdown content - render with ReactMarkdown
      if (part.trim()) {
        return (
          <ReactMarkdown
            key={index}
            rehypePlugins={[rehypeRaw]}
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children, ...props }) => {
                const text = typeof children === 'string' ? children : '';
                const id = slugify(text, { lower: true, strict: true });
                return (
                  <H1 id={id} {...props}>
                    {children}
                  </H1>
                );
              },
              h2: ({ children, ...props }) => {
                const text = typeof children === 'string' ? children : '';
                const id = slugify(text, { lower: true, strict: true });
                return (
                  <H2 id={id} {...props}>
                    {children}
                  </H2>
                );
              },
              h3: ({ children, ...props }) => {
                const text = typeof children === 'string' ? children : '';
                const id = slugify(text, { lower: true, strict: true });
                return (
                  <h3
                    id={id}
                    className='scroll-m-20 text-2xl font-semibold tracking-tight'
                    {...props}
                  >
                    {children}
                  </h3>
                );
              },
              p: ({ children, ...props }) => <P {...props}>{children}</P>,
              blockquote: ({ children, ...props }) => (
                <Blockquote {...props}>{children}</Blockquote>
              ),
            }}
          >
            {part}
          </ReactMarkdown>
        );
      }

      return null;
    });
  };

  return <div className={className}>{renderContent()}</div>;
};
