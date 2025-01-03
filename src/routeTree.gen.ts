/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { createFileRoute } from '@tanstack/react-router'

// Import Routes

import { Route as rootRoute } from './routes/__root'

// Create Virtual Routes

const VizLazyImport = createFileRoute('/viz')()
const ReplLazyImport = createFileRoute('/repl')()
const ImportLazyImport = createFileRoute('/import')()
const ExplorerLazyImport = createFileRoute('/explorer')()
const IndexLazyImport = createFileRoute('/')()

// Create/Update Routes

const VizLazyRoute = VizLazyImport.update({
  id: '/viz',
  path: '/viz',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/viz.lazy').then((d) => d.Route))

const ReplLazyRoute = ReplLazyImport.update({
  id: '/repl',
  path: '/repl',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/repl.lazy').then((d) => d.Route))

const ImportLazyRoute = ImportLazyImport.update({
  id: '/import',
  path: '/import',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/import.lazy').then((d) => d.Route))

const ExplorerLazyRoute = ExplorerLazyImport.update({
  id: '/explorer',
  path: '/explorer',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/explorer.lazy').then((d) => d.Route))

const IndexLazyRoute = IndexLazyImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/index.lazy').then((d) => d.Route))

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexLazyImport
      parentRoute: typeof rootRoute
    }
    '/explorer': {
      id: '/explorer'
      path: '/explorer'
      fullPath: '/explorer'
      preLoaderRoute: typeof ExplorerLazyImport
      parentRoute: typeof rootRoute
    }
    '/import': {
      id: '/import'
      path: '/import'
      fullPath: '/import'
      preLoaderRoute: typeof ImportLazyImport
      parentRoute: typeof rootRoute
    }
    '/repl': {
      id: '/repl'
      path: '/repl'
      fullPath: '/repl'
      preLoaderRoute: typeof ReplLazyImport
      parentRoute: typeof rootRoute
    }
    '/viz': {
      id: '/viz'
      path: '/viz'
      fullPath: '/viz'
      preLoaderRoute: typeof VizLazyImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexLazyRoute
  '/explorer': typeof ExplorerLazyRoute
  '/import': typeof ImportLazyRoute
  '/repl': typeof ReplLazyRoute
  '/viz': typeof VizLazyRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexLazyRoute
  '/explorer': typeof ExplorerLazyRoute
  '/import': typeof ImportLazyRoute
  '/repl': typeof ReplLazyRoute
  '/viz': typeof VizLazyRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexLazyRoute
  '/explorer': typeof ExplorerLazyRoute
  '/import': typeof ImportLazyRoute
  '/repl': typeof ReplLazyRoute
  '/viz': typeof VizLazyRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/explorer' | '/import' | '/repl' | '/viz'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/explorer' | '/import' | '/repl' | '/viz'
  id: '__root__' | '/' | '/explorer' | '/import' | '/repl' | '/viz'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexLazyRoute: typeof IndexLazyRoute
  ExplorerLazyRoute: typeof ExplorerLazyRoute
  ImportLazyRoute: typeof ImportLazyRoute
  ReplLazyRoute: typeof ReplLazyRoute
  VizLazyRoute: typeof VizLazyRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexLazyRoute: IndexLazyRoute,
  ExplorerLazyRoute: ExplorerLazyRoute,
  ImportLazyRoute: ImportLazyRoute,
  ReplLazyRoute: ReplLazyRoute,
  VizLazyRoute: VizLazyRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/explorer",
        "/import",
        "/repl",
        "/viz"
      ]
    },
    "/": {
      "filePath": "index.lazy.tsx"
    },
    "/explorer": {
      "filePath": "explorer.lazy.tsx"
    },
    "/import": {
      "filePath": "import.lazy.tsx"
    },
    "/repl": {
      "filePath": "repl.lazy.tsx"
    },
    "/viz": {
      "filePath": "viz.lazy.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
