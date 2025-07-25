# 🧹 CARDSHOW CLEANUP PLAN

## 🚨 IMMEDIATE ACTIONS NEEDED

### 1. **Resolve Auth Provider Conflicts**
- **KEEP**: `/contexts/AuthContext.tsx` (currently used in App.tsx)
- **REMOVE**: `/features/auth/providers/AuthProvider.tsx`
- **MODIFY**: Remove CRDDataService auth management to prevent conflicts

### 2. **Collection Repository Consolidation**
- **KEEP**: `/repositories/collections/index.ts` (simple, actively used)
- **REMOVE**: `/lib/storage/repositories/CollectionRepository.ts` (complex, unused)
- **REMOVE**: `/hooks/collections/useCollectionQueries.ts` (mock data only)
- **KEEP**: `/hooks/useCollections.ts` (uses active repository)

### 3. **Component System Standardization**
- **DECISION NEEDED**: Choose ONE design system
  - Option A: Universal Design System (more mature)
  - Option B: CRD Design System (more brand-specific)
- **REMOVE**: The unused system after decision

### 4. **Route Simplification**
- **REMOVE STABLE VARIANTS**: These were experimental/development versions
  - Remove: `StableSignIn`, `StableCardCreator`, `StableCollectionsView`, `StableProtectedRoute`
  - Keep: Standard versions (`SignIn`, `CRDCreateFlow`, `Collections`, `ProtectedRoute`)

## 📁 FILES TO DELETE

### Auth Duplicates
- `src/features/auth/providers/AuthProvider.tsx`
- `src/features/auth/hooks/useAuthState.ts` 
- `src/features/auth/hooks/useAuthActions.ts`
- `src/features/auth/services/authService.ts`
- `src/features/auth/services/devAuthService.ts`
- `src/features/auth/services/profileService.ts`

### Stable Component Variants
- `src/components/core/StableCardCreator.tsx`
- `src/components/core/StableCollectionsView.tsx`
- `src/components/common/StableProtectedRoute.tsx`
- `src/pages/auth/StableSignIn.tsx`

### Unused Repositories
- `src/lib/storage/repositories/CollectionRepository.ts`
- `src/lib/storage/UnifiedRepository.ts`
- `src/lib/storage/LocalStorageManager.ts`
- `src/lib/storage/SyncManager.ts`
- `src/hooks/collections/useCollectionQueries.ts`

### Testing/Development Components (If Not Needed in Production)
- `src/components/testing/TestingSuite.tsx`
- `src/components/deployment/DeploymentChecklist.tsx`
- `src/components/monitoring/ProductionMonitor.tsx`

### Legacy/Debug Components
- `src/pages/SimplePSDAnalysisPage.tsx` (marked as legacy)
- `src/pages/PSDPreviewPage.tsx` (marked as legacy)
- `src/pages/BulkPSDAnalysisPage.tsx` (marked as legacy)

## 🔧 CLEANUP SCRIPTS NEEDED

### 1. Remove Unused Imports
Search for and remove imports of deleted components

### 2. Update Route Definitions
- Remove stable routes from App.tsx
- Redirect old stable routes to new standard routes

### 3. CSS Cleanup
- Remove unused design system classes
- Consolidate duplicate styles
- Remove legacy theme variables

## 📊 ESTIMATED IMPACT

### File Reduction
- **Remove ~25-30 component files**
- **Remove ~15-20 hook/service files** 
- **Reduce bundle size by ~20-25%**

### Code Maintainability
- **Single auth system** → Eliminates auth conflicts
- **Single design system** → Consistent UI
- **Single repository pattern** → Clearer data flow
- **Simplified routing** → Easier navigation management

## ⚠️ RISKS TO CONSIDER

1. **Breaking Changes**: Some components might be used in ways not detected by search
2. **Design Inconsistency**: Need to verify all pages work with chosen design system
3. **Data Migration**: If switching repository patterns, need to ensure data compatibility

## 🎯 RECOMMENDED APPROACH

1. **Phase 1**: Remove auth conflicts (immediate - fixes current bugs)
2. **Phase 2**: Standardize on one design system 
3. **Phase 3**: Remove stable component variants
4. **Phase 4**: Clean up unused repositories and development tools
5. **Phase 5**: CSS cleanup and optimization

Would you like me to proceed with any of these cleanup phases?