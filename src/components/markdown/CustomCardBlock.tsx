import React from 'react';
import { parseCardBlock } from '@/utils/markdownCardExtensions';

interface CustomCardBlockProps {
  children: string;
}

export const CustomCardBlock: React.FC<CustomCardBlockProps> = ({
  children,
}) => {
  const cardComponent = parseCardBlock(children);

  if (cardComponent) {
    return <div className='my-6'>{cardComponent}</div>;
  }

  // If not a card, render as regular content
  return <div dangerouslySetInnerHTML={{ __html: children }} />;
};
