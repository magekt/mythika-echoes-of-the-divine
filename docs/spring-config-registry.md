# Spring Config Registry

## Overview

The Spring Config Registry centralizes spring physics configurations to ensure consistent animation behavior across the game while allowing easy extension and maintenance.

## R.springConfigs Registry

The registry object stores named spring configurations that can be referenced throughout the codebase.

```javascript
// In src/engine/renderer.js
R.springConfigs = {
  // stiffness, damping pairs for various UI elements
  noHover: [0, 0],           // No spring effect
  whisper: [16, 12],         // Very subtle movement
  feather: [30, 20],         // Light, airy movement
  leaf: [60, 20],            // Gentle floating
  paper: [80, 24],           // Slight resistance
  cloth: [100, 25],          // Soft, fabric-like
  foam: [120, 26],           // Light, buoyant
  hair: [150, 22],           // Fine, responsive
  wool: [175, 25],           // Soft, yielding
  wood: [200, 24],           // Firm, solid
  metal: [220, 24],          // Rigid, responsive
  stone: [300, 24],          // Heavy, substantial
};
```

## R.springConfig(name) Accessor

Provides safe access to spring configurations with error handling.

```javascript
// In src/engine/renderer.js
R.springConfig = function(name) {
  const config = R.springConfigs[name];
  if (!config) {
    console.warn(`Spring config "${name}" not found, using noHover`);
    return R.springConfigs.noHover;
  }
  return config;
};
```

**Usage:**
```javascript
// Instead of inline spring configs:
R.spring({stiffness: 150, damping: 22})

// Use registry reference:
R.spring(R.springConfigs.wool)
// Or via accessor:
R.spring(R.springConfig('wool'))
```

## Migration Benefits

1. **Consistency**: Ensures identical spring behavior across all UI elements
2. **Maintainability**: Change spring physics in one place to update everywhere
3. **Extensibility**: Add new configurations without modifying core spring function
4. **Performance**: Eliminates redundant object creation from inline configs
5. **Clarity**: Named configs express intent better than magic numbers

## Files Modified

- `src/engine/renderer.js`: Added `R.springConfigs` registry and `R.springConfig()` accessor
- `src/ui/button.js`: Replaced inline spring configs with registry references
- `src/ui/panel.js`: Updated to use registry spring config for entrance animation
- `src/ui/modal.js`: Updated button cascade and overlay animations
- `src/engine/scene-helpers.js`: Updated scene entrance and stagger animations
- `src/scenes/travelMap.js`: Updated various UI animations
- `src/scenes/cultivationScene.js`: Updated UI animations
- `src/scenes/combatScene.js`: Updated UI animations
- `src/scenes/fishing.js`: Updated UI animations

## Test Coverage

See `tests/spring_registry.test.js` for:
- Registry object structure validation
- Accessor function behavior
- Spring function equivalence testing
- Extensibility verification

## Usage Guidelines

1. **Prefer registry access**: Use `R.spring(R.springConfig('name'))` for dynamic lookup
2. **Direct reference for constants**: Use `R.spring(R.springConfigs.wool)` when config is known
3. **Never create inline configs**: Always reference from registry to maintain consistency
4. **Add new configs to registry**: When new spring behavior is needed, add to `R.springConfigs`
5. **Preserve existing behavior**: When migrating, ensure registry values match original inline configs

## Related Files

- `src/engine/renderer.js` - Registry and accessor implementation
- `tests/spring_registry.test.js` - Unit tests for registry functionality