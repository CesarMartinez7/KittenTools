import { lazy } from 'react';

export const AppHomeLazy = lazy(() => import('../App'));
export const JsonDiffLazy = lazy(() => import('./DiffJson'));
export const JsonViewerLazy = lazy(() => import('./Formatter'));
export const ModalViwerJSONLazy = lazy(() => import('./ModalViewer'));
