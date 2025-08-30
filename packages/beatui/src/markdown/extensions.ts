import type { Options as MicromarkOptions } from 'micromark'

export type MarkdownFeatures = {
  gfm?: boolean
}

export async function resolveExtensions(
  features: MarkdownFeatures = {}
): Promise<{
  extensions: MicromarkOptions['extensions']
  htmlExtensions: MicromarkOptions['htmlExtensions']
}> {
  const extensions: MicromarkOptions['extensions'] = []
  const htmlExtensions: MicromarkOptions['htmlExtensions'] = []

  if (features.gfm === true) {
    const gfm = await import('micromark-extension-gfm')
    extensions.push(gfm.gfm({}))
    htmlExtensions.push(gfm.gfmHtml({}))
  }

  return { extensions, htmlExtensions }
}
