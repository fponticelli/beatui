import { createLibrary } from '../library/library'
import { layoutComponents } from './layout'
import { buttonComponents } from './button'
import { dataComponents } from './data'
import { formComponents } from './form'
import { navigationComponents } from './navigation'
import { overlayComponents } from './overlay'
import { formatComponents } from './format'
import { typographyComponents } from './typography'

export const beatuiLibrary = createLibrary({
  components: [
    ...layoutComponents,
    ...buttonComponents,
    ...dataComponents,
    ...formComponents,
    ...navigationComponents,
    ...overlayComponents,
    ...formatComponents,
    ...typographyComponents,
  ],
  root: 'Stack',
  groups: [
    {
      name: 'Layout',
      description: 'Structural containers',
      components: [
        'Stack',
        'Flex',
        'Card',
        'Divider',
        'Accordion',
        'Center',
        'Group',
        'Collapse',
      ],
    },
    {
      name: 'Button',
      description: 'Interactive buttons',
      components: [
        'Button',
        'ToggleButton',
        'CopyButton',
        'CloseButton',
        'ToggleButtonGroup',
      ],
    },
    {
      name: 'Data Display',
      description: 'Content presentation',
      components: [
        'StatCard',
        'Badge',
        'AutoColorBadge',
        'Avatar',
        'AvatarGroup',
        'ProgressBar',
        'DataTable',
        'Skeleton',
        'Indicator',
        'HistoryTimeline',
        'Icon',
      ],
    },
    {
      name: 'Form',
      description: 'User input controls',
      components: [
        'TextInput',
        'NumberInput',
        'PasswordInput',
        'EmailInput',
        'TextArea',
        'CheckboxInput',
        'Switch',
        'RadioGroup',
        'NativeSelect',
        'DropdownInput',
        'ComboboxInput',
        'DatePicker',
        'TimePicker',
        'RatingInput',
        'SliderInput',
        'ColorInput',
        'TagInput',
        'OTPInput',
        'SegmentedInput',
      ],
    },
    {
      name: 'Navigation',
      description: 'Navigation controls',
      components: [
        'Tabs',
        'Breadcrumbs',
        'Pagination',
        'Stepper',
        'TreeView',
        'Sidebar',
      ],
    },
    {
      name: 'Overlay',
      description: 'Floating content',
      components: ['Modal', 'Drawer', 'Tooltip', 'Popover'],
    },
    {
      name: 'Format',
      description: 'Formatted values',
      components: [
        'FormatNumber',
        'FormatDate',
        'FormatTime',
        'FormatDateTime',
        'FormatRelativeTime',
        'FormatFileSize',
      ],
    },
    {
      name: 'Typography',
      description: 'Text elements',
      components: ['Kbd', 'Label'],
    },
  ],
})

export { layoutComponents } from './layout'
export { buttonComponents } from './button'
export { dataComponents } from './data'
export { formComponents } from './form'
export { navigationComponents } from './navigation'
export { overlayComponents } from './overlay'
export { formatComponents } from './format'
export { typographyComponents } from './typography'
