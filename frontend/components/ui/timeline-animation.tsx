'use client'

import { motion, Variants } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef, ReactNode, ElementType } from "react"
import { cn } from "@/lib/utils"

interface TimelineContentProps {
  children: ReactNode
  className?: string
  as?: ElementType
  animationNum: number
  timelineRef: React.RefObject<HTMLElement>
  customVariants?: Variants
}

export function TimelineContent({
  children,
  className,
  as: Component = "div",
  animationNum,
  timelineRef,
  customVariants,
  ...props
}: TimelineContentProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { 
    once: true,
    margin: "-100px 0px -100px 0px"
  })

  const defaultVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 50,
      filter: "blur(10px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: animationNum * 0.1,
      },
    },
  }

  const variants = customVariants || defaultVariants

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      custom={animationNum}
      className={cn(className)}
      {...props}
    >
      <Component>{children}</Component>
    </motion.div>
  )
}
