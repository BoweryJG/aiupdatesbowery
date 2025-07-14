import React from 'react';
import { cn } from '../../lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlowTextProps extends HTMLMotionProps<"span"> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  gradient?: 'primary' | 'secondary' | 'success' | 'warning';
  children: React.ReactNode;
}

export const GlowText: React.FC<GlowTextProps> = ({
  as: Component = 'span',
  gradient = 'primary',
  className,
  children,
  ...props
}) => {
  const gradients = {
    primary: 'from-electric-cyan to-quantum-purple',
    secondary: 'from-quantum-purple to-neon-green',
    success: 'from-neon-green to-electric-cyan',
    warning: 'from-solar-orange to-quantum-purple',
  };

  const MotionComponent = motion[Component as keyof typeof motion] as any;

  return (
    <MotionComponent
      className={cn(
        'text-transparent bg-clip-text bg-gradient-to-r font-space font-bold',
        gradients[gradient],
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      {...props}
    >
      {children}
    </MotionComponent>
  );
};