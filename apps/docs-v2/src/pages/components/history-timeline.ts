import { HistoryTimeline } from '@tempots/beatui'
import { html, attr, prop, on } from '@tempots/dom'
import { ComponentPage, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'HistoryTimeline',
  category: 'Tables & Media',
  component: 'HistoryTimeline',
  description:
    'A chronological audit log timeline with filter chips, colored action labels, and optional restore actions.',
  icon: 'lucide:history',
  order: 12,
}

const sampleEntries = [
  {
    id: '1',
    action: 'CREATED',
    actionColor: '#22c55e',
    icon: 'lucide:plus-circle',
    target: 'User: alice@example.com',
    targetIcon: 'lucide:user',
    actor: { name: 'System', initials: 'SY' },
    time: '2 minutes ago',
    detail: 'New user account created via OAuth sign-in.',
  },
  {
    id: '2',
    action: 'EDITED',
    actionColor: '#3b82f6',
    icon: 'lucide:pencil',
    target: 'Post: "Getting Started with BeatUI"',
    targetIcon: 'lucide:file-text',
    actor: { name: 'Alice Johnson', initials: 'AJ' },
    time: '15 minutes ago',
    detail: 'Updated title and body content.',
    restorable: true,
    onRestore: () => console.log('Restoring post edit'),
  },
  {
    id: '3',
    action: 'DELETED',
    actionColor: '#ef4444',
    icon: 'lucide:trash-2',
    target: 'Comment #4821',
    targetIcon: 'lucide:message-circle',
    actor: { name: 'Bob Smith', initials: 'BS' },
    time: '1 hour ago',
    detail: 'Comment removed for violating community guidelines.',
    restorable: true,
    onRestore: () => console.log('Restoring comment'),
  },
  {
    id: '4',
    action: 'SCHEMA CHANGE',
    actionColor: '#8b5cf6',
    icon: 'lucide:database',
    target: 'Table: users',
    targetIcon: 'lucide:table',
    actor: { name: 'Carol White', initials: 'CW' },
    time: '3 hours ago',
    detail: 'Added column: last_login_at (timestamp, nullable).',
  },
  {
    id: '5',
    action: 'EDITED',
    actionColor: '#3b82f6',
    icon: 'lucide:pencil',
    target: 'Settings: Email Notifications',
    targetIcon: 'lucide:settings',
    actor: { name: 'David Lee', initials: 'DL' },
    time: '5 hours ago',
    detail: 'Disabled weekly digest emails for all users.',
    restorable: true,
    onRestore: () => console.log('Restoring settings'),
  },
  {
    id: '6',
    action: 'DELETED',
    actionColor: '#ef4444',
    icon: 'lucide:trash-2',
    target: 'Media: banner-old.png',
    targetIcon: 'lucide:image',
    actor: { name: 'Alice Johnson', initials: 'AJ' },
    time: 'Yesterday',
    detail: 'Removed outdated banner image from media library.',
    restorable: false,
  },
]

export default function HistoryTimelinePage() {
  return ComponentPage(meta, {
    playground: html.div(
      attr.class('w-full'),
      HistoryTimeline({ entries: sampleEntries as never })
    ),
    sections: [
      Section(
        'Basic Timeline',
        () =>
          HistoryTimeline({
            entries: sampleEntries.slice(0, 3) as never,
          }),
        'A minimal HistoryTimeline with a few entries. Default filter chips are shown automatically.'
      ),
      Section(
        'With Restore Actions',
        () =>
          HistoryTimeline({
            entries: sampleEntries.filter(e => e.restorable) as never,
          }),
        'Entries with restorable: true and an onRestore callback show a Restore button.'
      ),
      Section(
        'Custom Filter Chips',
        () =>
          HistoryTimeline({
            entries: sampleEntries as never,
            filters: [
              { value: 'all', label: 'All Changes' },
              { value: 'deletions', label: 'Deletions' },
              { value: 'edits', label: 'Edits' },
              { value: 'restorable', label: 'Can Restore' },
            ],
          }),
        'Pass a custom filters array to replace the default filter chips.'
      ),
      Section(
        'Reactive Data',
        () => {
          const entries = prop(sampleEntries.slice(0, 2))
          return html.div(
            attr.class('flex flex-col gap-3'),
            HistoryTimeline({ entries: entries as never }),
            html.div(
              attr.class('flex gap-2'),
              html.button(
                attr.class(
                  'px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                ),
                attr.type('button'),
                on.click(() => entries.set(sampleEntries)),
                'Load more entries'
              ),
              html.button(
                attr.class(
                  'px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                ),
                attr.type('button'),
                on.click(() => entries.set(sampleEntries.slice(0, 2))),
                'Reset'
              )
            )
          )
        },
        'The entries prop is reactive. Updating the signal appends or replaces timeline items without re-mounting.'
      ),
    ],
  })
}
