# Render Deployment Fixes

## Issues Fixed

### 1. Backend Build Error
**Problem**: Render was looking for `package.json` in the wrong location (`/opt/render/project/src/package.json`)

**Solution**: 
- Added `rootDir: backend` to the backend service configuration
- This tells Render to use the `backend/` directory as the root for this service
- Removed `cd backend &&` from build and start commands since `rootDir` handles this

### 2. Frontend Dependency Conflict
**Problem**: `@testing-library/react@14.1.2` requires React 18, but the project uses React 19.2.1

**Solutions Applied**:
1. Updated `@testing-library/react` to version `^16.0.1` (latest version with better React 19 compatibility)
2. Updated related testing libraries to latest versions
3. Added `.npmrc` file with `legacy-peer-deps=true` for consistent dependency resolution across all environments

## Changes Made

### `render.yaml`
- Added `rootDir: backend` for backend service
- Added `rootDir: frontend` for frontend service
- Simplified build commands (removed `cd` commands since `rootDir` handles it)

### `frontend/package.json`
- Updated `@testing-library/react`: `^14.1.2` → `^16.0.1`
- Added `@testing-library/dom`: `^10.4.0` (required peer dependency for v16)
- Updated `@testing-library/jest-dom`: `^6.1.5` → `^6.6.3`
- Updated `@testing-library/user-event`: `^14.5.1` → `^14.5.2`

### `frontend/.npmrc` (new file)
- Added `legacy-peer-deps=true` to handle React 19 compatibility issues

## Testing

After these changes, the deployment should:
1. ✅ Backend: Successfully install dependencies and start
2. ✅ Frontend: Successfully install dependencies (with legacy peer deps) and build

## Next Steps

1. Commit and push these changes to your repository
2. Trigger a new deployment on Render
3. Monitor the build logs to ensure both services deploy successfully

## Notes

- The `legacy-peer-deps` flag allows npm to install packages even when peer dependencies don't match exactly
- This is safe for dev dependencies like testing libraries
- The updated testing library versions should work better with React 19, even if not officially supported yet
- Once `@testing-library/react` officially supports React 19, you can remove the `legacy-peer-deps` flag
