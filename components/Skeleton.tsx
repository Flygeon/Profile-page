interface SkeletonProps {
  className?: string
}

/** 轻量骨架块，用于客户端异步内容的加载占位，减少布局抖动。 */
export default function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse bg-white/[0.06] ${className}`} aria-hidden />
}
