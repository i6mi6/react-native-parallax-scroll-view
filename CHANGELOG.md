## Changelog

### 0.19.0

- Fixes compatibility with React Native 0.27.2
- Adds `contentContainerStyle` prop to style scroll container (thanks @alaycock)

### 0.18.1

- Fixes error when inspecting the sticky header due to cyclical object structure
  on `style` (#23)
  
### 0.18.0 (Compatibility with React Native 0.20.0)

- **Breaking:** Removes `ParallaxScrollView#scrollWithoutAnimationTo` since this has been deprecated in React Native. If you used this method previously, use `scrollTo` instead.
- Adds `ParallaxScrollView#getScrollableNode` method, which is required in React Native 0.20.0 for components implementing
  `ScrollView` interface.

### 0.17.4

- The background now fades out in the same manner as the foreground. Thanks @generalChaos for the PR.

### 0.17.3

- Allows `renderFixedHeader` to be used without providing `renderStickyHeader` and `stickyHeaderHeight`.

### 0.17.2

- Adds optional `fadeOutForeground` property that can be set to false to disable fading out of the foreground.

### 0.17.1

- **Breaking:** `renderParallaxHeader` is now `renderForeground`, and now scrolls with the same speed as scroll content.
- Refactored parallax header calculations to keep their scroll speeds consistent with user scroll speed.
- Parallax effect is now calculated using the `backgroundSpeed` prop.
