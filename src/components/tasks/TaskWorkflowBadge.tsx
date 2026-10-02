import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Circle, PlayCircle, Eye, CheckCircle2 } from 'lucide-react'
import type { TaskStatus } from '@/types'

interface TaskWorkflowBadgeProps {
  status: TaskStatus
  onSelectStatus?: (status: TaskStatus) => void
  interactive?: boolean
  className?: string
}

export const TaskWorkflowBadge: React.FC<TaskWorkflowBadgeProps> = ({
  status,
  onSelectStatus,
  interactive = false,
  className = '',
}) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'IN_PROGRESS':
        return {
          label: 'IN PROGRESS',
          icon: <PlayCircle className="h-3 w-3 mr-1 text-blue-500 animate-pulse" />,
          classes:
            'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500/20',
        }
      case 'REVIEW':
        return {
          label: 'REVIEW',
          icon: <Eye className="h-3 w-3 mr-1 text-amber-500" />,
          classes:
            'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20',
        }
      case 'DONE':
        return {
          label: 'DONE',
          icon: <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-500" />,
          classes:
            'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20',
        }
      case 'TODO':
      default:
        return {
          label: 'TODO',
          icon: <Circle className="h-3 w-3 mr-1 text-muted-foreground" />,
          classes:
            'bg-muted/60 text-muted-foreground border border-border/60 hover:bg-muted',
        }
    }
  }

  const config = getBadgeConfig()

  if (!interactive || !onSelectStatus) {
    return (
      <Badge
        variant="outline"
        className={`text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full flex items-center ${config.classes} ${className}`}
      >
        {config.icon}
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="flex items-center space-x-1">
      <Badge
        variant="outline"
        className={`text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full flex items-center cursor-default ${config.classes} ${className}`}
      >
        {config.icon}
        {config.label}
      </Badge>
    </div>
  )
}
