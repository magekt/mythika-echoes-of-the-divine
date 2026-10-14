# UI Component System

## Overview

The UI Component System provides a factory-mixin pattern for creating reusable UI components with zero per-frame allocations. All components are constructed once and reused throughout the game lifecycle.

## Core Concepts

### UI.Component Factory

The base factory function that creates component instances with position, size, and lifecycle hooks.

```javascript
globalThis.UI.Component = function(x, y, w, h, opts = {}) {
  // Returns component object with x, y, w, h, render, update, contains, onClick, data
}
```

**Parameters:**
- `x` (number): X position
- `y` (number): Y position  
- `w` (number): Width
- `h` (number): Height
- `opts` (object, optional): Configuration options

**Returns:** Object with:
- `x`, `y`, `w`, `h`: Position and size
- `render(ctx)`: Render method (delegates to `_renderHook`)
- `update(dt)`: Update method (delegates to `_updateHook`)
- `contains(px, py)`: Hit test method (delegates to `_containsHook`)
- `onClick`: Click handler
- `data`: Custom data storage

### Mixin Functions

Mixin functions add specific capabilities to component instances by attaching hook functions.

#### UI.mixinRender(comp, drawFn)

Adds a render method that delegates to a custom draw function.

**Parameters:**
- `comp`: Component instance to enhance
- `drawFn`: Function(ctx, comp) that performs custom rendering

#### UI.mixinUpdate(comp)

Adds an update method that delegates to an update hook. (Note: Base Component already provides basic update delegation)

#### UI.mixinSpring(comp, config)

Adds spring physics capabilities with a spring step function stored on the instance for zero per-frame allocation.

**Parameters:**
- `comp`: Component instance to enhance
- `config`: Spring configuration object passed to `R.spring(config)`

**Adds to component:**
- `_springState`: Spring state object
- `_springStep`: Function(dt) that advances spring state and returns `{value, velocity}`
- `_target`: Target value for the spring (mutated when changed)

#### UI.mixinEase(comp)

Adds easing capabilities using the premium easing function.

**Adds to component:**
- `easedValue(t)`: Method that returns eased value for time t in [0,1]

#### UI.mixinContains(comp, radiusKey = 's')

Adds hit testing capabilities using radius configuration from `R.radius`.

**Parameters:**
- `comp`: Component instance to enhance
- `radiusKey`: Key to look up in `R.radius` object (default: 's')

**Adds to component:**
- `_containsHook`: Function(px, py) that returns true if point is within component bounds

## Component Implementation Examples

### UI.Button

Refactored to use `UI.Component` + mixins:
- Base: `UI.Component(x, y, w, h, opts)`
- Rendering: Custom draw function via `UI.mixinRender`
- Updates: Spring physics via `UI.mixinSpring` (for press animations)
- Hit testing: `UI.mixinContains` for click detection
- Easing: `UI.mixinEase` for smooth animations

### UI.Panel & UI.Modal

Similarly refactored to use the factory-mixin pattern with:
- Base component for position/size
- Mixins for rendering, updates, spring physics, easing, and hit testing
- Specialized rendering via custom draw functions
- Spring-based entrance animations

## Key Benefits

1. **Zero Per-Frame Allocation**: All state allocated at construction; mixins store functions on instance
2. **Consistent API**: All components share `render`, `update`, `contains`, `onClick` methods
3. **Composability**: Mixins can be combined freely to add capabilities
4. **Performance**: Minimal garbage collection pressure during gameplay
5. **Maintainability**: Clear separation of concerns (base factory + capability mixins)

## Usage Pattern

```javascript
// Create base component
const button = UI.Component(100, 200, 80, 40, {enabled: true});

// Add rendering capability
UI.mixinRender(button, function(ctx, comp) {
  // Custom button rendering here
  ctx.fillStyle = comp.enabled ? '#e8a030' : '#666';
  ctx.fillRect(comp.x, comp.y, comp.w, comp.h);
});

// Add spring physics for press animation
UI.mixinSpring(button, {stiffness: 300, damping: 24});

// Add hit testing
UI.mixinContains(button, 'm'); // medium radius

// Add easing for smooth transitions
UI.mixinEase(button);

// In game loop:
// button.update(dt);
// button.render(ctx);
// if (button.contains(mouseX, mouseY) && mouseClicked) {
//   button.onClick();
// }
```

## Related Files

- `src/ui/component.js` - Base factory and mixins
- `src/ui/button.js` - Button and MagneticButton implementations
- `src/ui/panel.js` - Panel and Dialog implementations  
- `src/ui/modal.js` - Modal implementation
- `src/ui/tabbar.js` - TabBar implementation
- `src/ui/list.js` - ScrollableList implementation
- `src/ui/heroSurface.js` - HeroSurface implementation
- `src/ui/feedback.js` - Feedback system (Toast, Hint, etc.)