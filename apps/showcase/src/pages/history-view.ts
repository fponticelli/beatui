import { html, attr, prop } from '@tempots/dom'
import { HistoryTimeline, HistoryEntry } from '@tempots/beatui'
import { WidgetPage } from '../views/widget-page'

const sampleEntries: HistoryEntry[] = [
  {
    id: '1',
    action: 'DELETED',
    actionColor: '#DC2626',
    icon: 'lucide:trash-2',
    target: 'Old Budget Report',
    targetIcon: 'lucide:file-text',
    actor: { name: 'Sarah Chen', initials: 'SC' },
    time: '2 min ago',
    detail: 'Permanently removed from workspace',
    restorable: true,
    onRestore: () => {},
  },
  {
    id: '2',
    action: 'EDITED',
    actionColor: '#2563EB',
    icon: 'lucide:pencil',
    target: 'Q3 Budget Report',
    targetIcon: 'lucide:file-text',
    actor: { name: 'Jordan Lee', initials: 'JL' },
    time: '15 min ago',
    detail: 'Updated revenue projections in Section 3',
  },
  {
    id: '3',
    action: 'CREATED',
    actionColor: '#059669',
    icon: 'lucide:plus',
    target: 'API Endpoints',
    targetIcon: 'lucide:database',
    actor: { name: 'Alex Rivera', initials: 'AR' },
    time: '1 hour ago',
    detail: 'New collection with 12 initial records',
  },
  {
    id: '4',
    action: 'SCHEMA CHANGE',
    actionColor: '#9333EA',
    icon: 'lucide:settings',
    target: 'Tasks',
    targetIcon: 'lucide:database',
    actor: { name: 'Sarah Chen', initials: 'SC' },
    time: '3 hours ago',
    detail: 'Added "Priority" field (select type)',
  },
  {
    id: '5',
    action: 'MOVED',
    actionColor: '#D97706',
    icon: 'lucide:move',
    target: 'Weekly Status',
    targetIcon: 'lucide:file-text',
    actor: { name: 'Jordan Lee', initials: 'JL' },
    time: '5 hours ago',
    detail: 'Moved from "Archive" to "Active" folder',
    restorable: true,
    onRestore: () => {},
  },
  {
    id: '6',
    action: 'DELETED',
    actionColor: '#DC2626',
    icon: 'lucide:trash-2',
    target: 'Test Data',
    targetIcon: 'lucide:database',
    actor: { name: 'Alex Rivera', initials: 'AR' },
    time: '1 day ago',
    detail: 'Removed 48 test records',
    restorable: true,
    onRestore: () => {},
  },
]

export default function HistoryViewPage() {
  return WidgetPage({
    id: 'history-view',
    title: 'History View',
    description: 'Timeline view of workspace activity with filters.',
    body: html.div(
      attr.style('max-width: 600px'),
      HistoryTimeline({
        entries: prop(sampleEntries),
      })
    ),
  })
}
