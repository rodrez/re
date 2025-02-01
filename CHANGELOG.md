# Changelog

## [Unreleased]

### Added
- Integrated FlexSearch for fast full-text search capabilities
  - Added search service with document and category indexing
  - Added React hook `useSearch` for easy search integration
  - Automatic indexing of existing documents and categories
  - Real-time index updates when new documents/categories are added
  - Combined search results from both documents and categories
  - Results sorted by relevance score
- Integrated search into command components
  - Command Palette (⌘K): Modal search interface
  - Command Base: Inline search interface
  - Real-time search of documents and categories
  - Document results show title and summary preview
  - Category results show name
  - Loading state during index initialization
  - Quick actions with keyboard shortcuts
    - Add New Document (⌘N) - Opens upload dialog
    - Create New Category - Opens category dialog
    - Advanced Search (⌘F)
  - Integrated with existing dialogs for consistency
  - Click-through navigation to documents and categories

### Changed
- Updated database hooks to properly handle document and category creation events
- Refactored command components to use the new search functionality
- Unified search experience across command interfaces
- Reused existing dialogs in command interface for consistency

### Technical Details
- Using FlexSearch with forward tokenization and context for better search relevance
- Implemented as a singleton service with separate indices for documents and categories
- TypeScript support with proper type definitions and type guards
- Dexie.js integration for database event subscriptions 