import React from 'react';
import { motion } from 'framer-motion';

interface TextEffectProps {
  children: string;
  per?: 'char' | 'word';
  preset?: 'fade' | 'slide';
}

export function TextEffect({ children, per = 'char', preset = 'fade' }: TextEffectProps) {
  const items = per === 'char' ? children.split('') : children.split(' ');

  const animations = {
    fade: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5 }
    },
    slide: {
      initial: { x: -20, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="flex flex-wrap">
      {items.map((item, index) => (
        <motion.span
          key={index}
          initial={animations[preset].initial}
          animate={animations[preset].animate}
          transition={{
            ...animations[preset].transition,
            delay: index * 0.1
          }}
          className="inline-block"
        >
          {item}
          {per === 'char' ? '' : ' '}
        </motion.span>
      ))}
    </div>
  );
}
