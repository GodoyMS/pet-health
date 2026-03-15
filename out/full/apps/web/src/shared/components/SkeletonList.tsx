import React from 'react'
import { Skeleton } from '@repo/ui'
const SkeletonList = () => {
  return (
    <div>
        <Skeleton className="w-full h-10" />
        <Skeleton className="w-full h-10" />
        <Skeleton className="w-full h-10" />
        <Skeleton className="w-full h-10" />
    </div>
  )
}

export default SkeletonList