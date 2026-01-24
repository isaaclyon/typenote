import type { Icon as PhosphorIcon } from '@phosphor-icons/react';
import { Calendar } from '@phosphor-icons/react/dist/ssr/Calendar';
import { FileText } from '@phosphor-icons/react/dist/ssr/FileText';
import { User } from '@phosphor-icons/react/dist/ssr/User';
import { CalendarCheck } from '@phosphor-icons/react/dist/ssr/CalendarCheck';
import { MapPin } from '@phosphor-icons/react/dist/ssr/MapPin';
import { CheckSquare } from '@phosphor-icons/react/dist/ssr/CheckSquare';
import { File } from '@phosphor-icons/react/dist/ssr/File';
import { Plus } from '@phosphor-icons/react/dist/ssr/Plus';
import { Gear } from '@phosphor-icons/react/dist/ssr/Gear';

/**
 * Maps icon identifier strings to Phosphor icon components.
 * Handles kebab-case icon names from storage and returns the matching component.
 *
 * @param iconName - Kebab-case icon identifier (e.g., 'file-text', 'calendar')
 * @returns Phosphor icon component, or File icon as fallback
 *
 * @example
 * ```ts
 * const Icon = getTypeIcon('calendar'); // Returns Calendar component
 * <Icon className="w-4 h-4" />
 * ```
 */
export function getTypeIcon(iconName: string | null): PhosphorIcon {
  if (!iconName) {
    return File; // Default fallback
  }

  // Map kebab-case to Phosphor components
  const iconMap: Record<string, PhosphorIcon> = {
    // Built-in types
    calendar: Calendar,
    'file-text': FileText,
    user: User,
    'calendar-clock': CalendarCheck,
    'map-pin': MapPin,
    'check-square': CheckSquare,

    // Command palette actions
    plus: Plus,
    gear: Gear,

    // Fallback
    file: File,
  };

  return iconMap[iconName.toLowerCase()] ?? File;
}
