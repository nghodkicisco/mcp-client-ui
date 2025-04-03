
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ImageData } from '@/types';

interface ImageContentProps {
  content: ImageData;
}

const ImageContent: React.FC<ImageContentProps> = ({ content }) => {
  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="p-4">
        <div className="relative group">
          <img 
            src={content.url} 
            alt={content.alt || 'Chat image'} 
            className="w-full h-auto rounded-lg object-contain max-h-96 transform transition-transform duration-300 group-hover:scale-[1.02] group-hover:-translate-y-1"
            style={{ maxWidth: content.width || '100%' }}
          />
          <div 
            className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg opacity-0 group-hover:opacity-70 blur transition duration-300 group-hover:blur-md -z-10"
            aria-hidden="true"
          ></div>
          <div 
            className="absolute -inset-1 bg-gray-900 rounded-lg transform translate-y-2 translate-x-2 -z-20"
            aria-hidden="true"
          ></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageContent;
