import { lazy } from 'react';

export const BaseModalLazy = lazy(() => import('../ui/BaseModal'));
export const GridLayoutLazy = lazy(() => import('../layouts/GridLayout'));
export const AppHomeLazy = lazy(() => import('../App'));
export const JsonDiffLazy = lazy(() => import('../ui/DiffJson'));
export const JsonViewerLazy = lazy(
  () => import('../ui/formatter-JSON/Formatter'),
);
export const ModalViwerJSONLazy = lazy(() => import('../ui/ModalViewer'));
export const CodeEditorLazy = lazy(
  () => import('../ui/code-editor/code-editor'),
);
