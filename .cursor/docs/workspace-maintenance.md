# Workspace Maintenance Process

This document describes the maintenance process for keeping the workspace tracker (`.cursor/workspace-tracker.json`) in sync with the actual project state.

## Overview

The workspace tracking system consists of two key files:
- `.cursor/workspace-tracker.json`: The state tracker
- `.cursor/docs/workspace-tracking.md`: System documentation

## Maintenance Loop

### When to Run
Run this maintenance process after ANY of these events:
1. File System Changes:
   - File creation/deletion/modification
   - Directory creation/deletion
   - File/directory moves
   - Content updates

2. Code Changes:
   - New dependencies added
   - Features implemented/removed
   - API endpoints added/modified
   - Component relationships changed
   - Performance optimizations implemented
   - Lighthouse scores updated

3. Performance Updates:
   - Image optimizations
   - Font loading improvements
   - CSS performance enhancements
   - Resource loading optimizations
   - Lighthouse score changes

### Process Steps

1. **Structure Update**
   ```
   Current Directory: {workspace_root}
   ├── Check all files/directories
   ├── Update metadata (size, lines, timestamps)
   └── Verify directory contents
   ```

2. **Code Analysis**
   ```
   For each code file:
   ├── Scan for exports/imports
   ├── Identify API endpoints
   ├── Map dependencies
   ├── Document features
   └── Track performance optimizations
   ```

3. **Performance Tracking**
   ```
   Monitor and document:
   ├── Lighthouse scores
   ├── Image loading optimizations
   ├── Font loading strategies
   ├── CSS performance techniques
   └── Resource loading patterns
   ```

4. **Relationship Mapping**
   ```
   Map connections between:
   ├── Frontend-Backend integrations
   ├── API endpoints and handlers
   ├── Component dependencies
   └── Feature implementations
   ```

5. **Documentation Update**
   ```
   Update documentation:
   ├── Verify accuracy
   ├── Update timestamps
   ├── Add new features/changes
   └── Document performance metrics
   ```

### Verification Checklist

✓ Structure Verification
- [ ] All paths exist
- [ ] File types match reality
- [ ] Directory contents complete
- [ ] Timestamps current

✓ Performance Verification
- [ ] Lighthouse scores current
- [ ] Image optimizations documented
- [ ] Font loading strategies tracked
- [ ] CSS performance techniques listed
- [ ] Resource loading patterns verified

✓ Relationship Verification
- [ ] API endpoints valid
- [ ] Dependencies accurate
- [ ] Feature mappings correct
- [ ] Integration points working

✓ Documentation Verification
- [ ] All changes documented
- [ ] Timestamps updated
- [ ] No orphaned references
- [ ] Documentation matches reality

### Error Handling

If discrepancies found:
1. Log the issue:
   ```
   {
     "type": "error_type",
     "path": "affected_path",
     "expected": "expected_state",
     "actual": "actual_state"
   }
   ```

2. Resolution Steps:
   - Update tracker to match reality
   - Document the discrepancy
   - Update related documentation
   - Note any manual intervention needed

## Example Maintenance Scenarios

### 1. New File Added
```
Event: New component created
Action: 
- Add to structure
- Analyze for features
- Map relationships
- Update documentation
```

### 2. Feature Modified
```
Event: API endpoint changed
Action:
- Update endpoint registry
- Check dependent components
- Verify integrations
- Update documentation
```

### 3. Performance Update
```
Event: Lighthouse score improved
Action:
- Update performance metrics
- Document optimization techniques
- Verify implementation details
- Update maintenance docs
```

### 4. File Deleted
```
Event: Component removed
Action:
- Remove from structure
- Clean up relationships
- Update dependencies
- Remove from documentation
```

## Best Practices

1. **Atomic Updates**
   - Update tracker immediately after changes
   - Keep documentation in sync
   - Verify before committing

2. **Performance Monitoring**
   - Track Lighthouse scores
   - Document optimization techniques
   - Monitor resource loading
   - Verify implementation details

3. **Relationship Management**
   - Track all dependencies
   - Map feature implementations
   - Document integration points

4. **Error Prevention**
   - Verify before operations
   - Check file/directory types
   - Validate relationships
   - Maintain consistency

## Integration Note

To reference this maintenance process in Cursor rules:
```
<workspace_context>
Reference: .cursor/docs/workspace-maintenance.md
Process: Follow maintenance loop for all workspace changes
Verification: Run checklist after updates
Documentation: Keep all docs in sync
</workspace_context>
```

SERVER MANAGEMENT
- Before starting new server: Check running instances (Get-Process python*)
- Multiple servers on same port = 404s and routing issues
- Always clean up: Stop-Process -Name python* -Force when switching servers 