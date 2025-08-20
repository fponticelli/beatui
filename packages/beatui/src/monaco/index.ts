import { setupMonacoEnvironment } from './loader'

// Configure Monaco workers in a bundler-agnostic way using AMD workerMain
setupMonacoEnvironment()

export * from '../components/monaco/monaco-editor-input'
export * from '../components/monaco/monaco-editor-control'
