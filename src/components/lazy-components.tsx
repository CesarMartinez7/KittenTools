import { lazy } from 'react';

export const BaseModalLazy = lazy(() => import('../ui/base-modal/BaseModal.tsx'));
export const GridLayoutLazy = lazy(() => import('../layouts/GridLayout.tsx'));
export const JsonDiffLazy = lazy(() => import('../ui/DiffJson.tsx'));
export const JsonViewerLazy = lazy(
  () => import('../ui/formatter-JSON/Formatter'),
);
export const ModalViwerJSONLazy = lazy(() => import('../ui/ModalViewer'));
export const CodeEditorLazy = lazy(
  () => import('../ui/code-editor/code-editor'),
);
export const ContainerTextArea = lazy(() => import("./container-editor.tsx"));







