import React from 'react';
import { cn } from '../../lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassProps extends HTMLMotionProps<"div"> {
  variant?: 'default' | 'hover' | 'dark' | 'light';
  blur?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  glow?: boolean;
  children: React.ReactNode;
}

export const Glass = React.forwardRef<HTMLDivElement, GlassProps>(
  ({ className, variant = 'default', blur = 'xl', glow = false, children, ...props }, ref) => {
    const blurClasses = {
      none: '',
      sm: 'backdrop-blur-sm',
      md: 'backdrop-blur-md',
      lg: 'backdrop-blur-lg',
      xl: 'backdrop-blur-xl',
    };

    const variantClasses = {
      default: 'bg-white/5 border-white/10',
      hover: 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20',
      dark: 'bg-black/20 border-white/5',
      light: 'bg-white/10 border-white/20',
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          'rounded-2xl border shadow-2xl transition-all duration-300',
          blurClasses[blur],
          variantClasses[variant],
          glow && 'neural-glow',
          className
        )}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Glass.displayName = 'Glass';