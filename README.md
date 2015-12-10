# react-native-parallax-listview

Parallax header and sticky header for `ListView`.

Tested with react-native 0.16.0 on Android and iOS.

## Installation

```
$ npm install react-native-parallax-listview --save
```

## Demo

![](./demo.gif)

## Example

Please refer to the [Example](./Example/example.js) provided.

## Usage (API)

All of the properties of `ListView` are supported. Please refer to the
[`ListView` documentation](https://facebook.github.io/react-native/docs/listview.html) for more detail.

The `ParallaxListView` component adds a few additional properties, as described below.


| Property | Type | Required | Default | Description |
| -------- | ---- | -------- | ------- | ----------- |
| `rowHeight` | `number` | No  | N/A | If the content is short, the `rowHeight` will be used to calculate bottom padding to allow parallax header to scroll all the way up. It is recommended that you set this fixed height. |
| `renderBackground` | `func` | Yes | N/A | This renders the background of the parallax header. Can be used to display cover images for example. |
| `parallaxHeaderHeight` | `number` | Yes | This is the initial height of parallax header. |
| `renderParallaxHeader` |  `func` | Yes | N/A | This renders the parallax header above the background. |
| `renderStickyHeader` | `func` | No | N/A | This renders an optional sticky header that will be fixed to the top of the view. |
| `stickyHeaderHeight` | `number` | If `renderStickyHeader` is used | 0 | If `renderStickyHeader` is set, then its height must be specified. |
