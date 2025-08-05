import { lazy } from 'react';

// AQUI VAN TODAS MI RUTAS LAZY PROXIMAMENTE DEBERIAN HACER EL TEMPLATE DE LOS FALLBACK LOADING
export const AppClientRouteLazy = lazy(() => import('./client/page'));
export const MainPageLazy = lazy(() => import('./home/page'));
