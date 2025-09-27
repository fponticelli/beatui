import type { NavigationOptions } from '@tempots/ui'

export type NavigationProps = Partial<
  Pick<NavigationOptions, 'state' | 'scroll' | 'replace'>
> & {
  viewTransition?: NavigationOptions['viewTransition']
}

export const buildNavigationOptions = ({
  viewTransition,
  state,
  scroll,
  replace,
}: NavigationProps): Partial<NavigationOptions> => {
  const options: Partial<NavigationOptions> = {}

  if (state !== undefined) {
    options.state = state
  }
  if (scroll !== undefined) {
    options.scroll = scroll
  }
  if (replace !== undefined) {
    options.replace = replace
  }
  if (viewTransition !== undefined) {
    options.viewTransition = viewTransition
  }

  return options
}
