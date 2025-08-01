'use client'

import { cn } from "@/lib/utils"
import { Card, CardProps } from "./card"
import { forwardRef } from "react"
import { motion, MotionProps } from "framer-motion"

interface AnimatedCardProps extends Omit<CardProps, 'onAnimationStart'> {
  animation?: "fade" | "slide" | "scale" | "float"
  delay?: number
  hover?: boolean
  children: React.ReactNode
}

const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ animation = "fade", delay = 0, hover = true, className, children, ...props }, ref) => {
    const getAnimationVariants = () => {
      switch (animation) {
        case "slide":
          return {
            initial: { opacity: 0, x: -20 },
            animate: { opacity: 1, x: 0 },
            exit: { opacity: 0, x: 20 }
          }
        case "scale":
          return {
            initial: { opacity: 0, scale: 0.95 },
            animate: { opacity: 1, scale: 1 },
            exit: { opacity: 0, scale: 0.95 }
          }
        case "float":
          return {
            initial: { opacity: 0, y: 10 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -10 }
          }
        case "fade":
        default:
          return {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 }
          }
      }
    }

    const getHoverAnimation = () => {
      if (!hover) return {}
      
      return {
        whileHover: { 
          scale: 1.02, 
          y: -2,
          transition: { duration: 0.2 }
        },
        whileTap: { 
          scale: 0.98,
          transition: { duration: 0.1 }
        }
      }
    }

    const variants = getAnimationVariants()
    const hoverProps = getHoverAnimation()

    return (
      <motion.div
        ref={ref}
        initial={variants.initial}
        animate={variants.animate}
        exit={variants.exit}
        transition={{
          duration: 0.3,
          delay,
          ease: "easeOut"
        }}
        {...hoverProps}
        className={cn("will-change-transform", className)}
        {...props}
      >
        <Card className={cn(
          "transition-shadow duration-200",
          hover && "hover:shadow-lg dark:hover:shadow-neutral-900/50"
        )}>
          {children}
        </Card>
      </motion.div>
    )
  }
)

AnimatedCard.displayName = "AnimatedCard"

export { AnimatedCard }