import React from 'react'
import { Skeleton } from '@repo/ui'
const SkeletonGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2  gap-4">
      <Skeleton className="w-full h-20" />
      <Skeleton className="w-full h-20" />    
      <Skeleton className="w-full h-20" />

        <Skeleton className="w-full h-20" />
        <Skeleton className="w-full h-20" />
        <Skeleton className="w-full h-20" />
  
    </div>
  )
}

export default SkeletonGrid