# react-native-parallax-listview

Parallax header and sticky header for `ListView`.

## Installation

```
$ npm install react-native-parallax-listview --save
```

## Demo

![](./parallax-ios.gif)

## Example

Please refer to the [Example](./Example/example.js) provided.

## Usage (API)

All of the properties of `ListView` are supported. Please refer to the 
[`ListView` documentation](https://facebook.github.io/react-native/docs/listview.html) for more detail.

The `ParallaxListView` component adds a few additional properties, as described below.


| Property | Type | Required | Default | Description |
| -------- | ---- | -------- | ------- | ----------- |
| `rowHeight` | `number` | Yes | N/A | This is required for layout calculations. All rows must be of this height. |
| `renderBackground` | `func` | Yes | N/A | This renders the background of the parallax header. Can be used to display cover images for example. |
| `parallaxHeaderHeight` | `number` | Yes | This is the initial height of parallax header. | 
| `renderParallaxHeader` |  `func` | Yes | N/A | This renders the parallax header above the background. |
| `renderStickyHeader` | `func` | No | N/A | This renders an optional sticky header that will be fixed to the top of the view. |
| `stickyHeaderHeight` | `number` | Only if `renderStickyHeader` is present | 0 | If `renderStickyHeader` is set, then its height must be specified. |
