import React from 'react';
import { parseCardBlock } from '@/utils/markdownCardExtensions';

interface CardBlockProps {
  children: React.ReactNode;
}

export const CardBlock: React.FC<CardBlockProps> = ({ children }) => {
  // Convert children to string
  const content = React.Children.toArray(children).join('');

  // Check if this contains card syntax
  if (typeof content === 'string' && content.includes(':::card[')) {
    const cardComponent = parseCardBlock(content);
    if (cardComponent) {
      return <div className='my-6'>{cardComponent}</div>;
    }
  }

  // If not a card, render as regular content
  return <div>{children}</div>;
};
