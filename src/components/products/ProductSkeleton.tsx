import { motion } from 'framer-motion';

interface ProductSkeletonProps {
  readonly index?: number;
}

export function ProductSkeleton({ index = 0 }: Readonly<ProductSkeletonProps>) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
      className="h-full flex flex-col bg-gradient-to-br from-white/5 to-white/2 rounded-lg overflow-hidden border border-white/5"
    >
      {/* Image skeleton */}
      <div className="aspect-square bg-white/5 animate-shimmer animate-breathe border-b border-white/5" />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        {/* Category/Type line */}
        <div className="h-3 bg-white/5 rounded animate-shimmer animate-breathe w-2/3" />
        
        {/* Title lines (2 lines simulating product name) */}
        <div className="space-y-2">
          <div className="h-4 bg-white/5 rounded animate-shimmer animate-breathe" />
          <div className="h-4 bg-white/5 rounded animate-shimmer animate-breathe w-4/5" />
        </div>

        {/* Price/Weight line */}
        <div className="h-3 bg-white/5 rounded animate-shimmer animate-breathe w-1/2" />
      </div>
    </motion.div>
  );
}

interface ProductSkeletonGridProps {
  readonly count?: number;
}

export function ProductSkeletonGrid({ count = 8 }: Readonly<ProductSkeletonGridProps>) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={`skeleton-${i}`} index={i} />
      ))}
    </>
  );
}
