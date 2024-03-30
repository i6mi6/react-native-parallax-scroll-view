"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const styles_1 = __importDefault(require("./styles"));
const window = react_native_1.Dimensions.get('window');
const pivotPoint = (a, b) => a - b;
const renderScroll = (props) => react_1.default.createElement(react_native_1.Animated.ScrollView, Object.assign({}, props));
const renderEmpty = () => react_1.default.createElement(react_native_1.View, null);
const noRender = () => react_1.default.createElement(react_native_1.View, { style: { display: 'none' } });
// Override `toJSON` of interpolated value because of
// an error when serializing style on view inside inspector.
// See: https://github.com/jaysoo/react-native-parallax-scroll-view/issues/23
const interpolate = (value, opts) => {
    const x = value.interpolate(opts);
    // We have to play to make TypeScript happy
    const xAny = x;
    xAny.toJSON = () => xAny.__getValue();
    // We want the return type to still make sense from the value.interpolate function
    return xAny;
};
class ParallaxScrollView extends react_1.Component {
    constructor(props) {
        super(props);
        this.scrollY = new react_native_1.Animated.Value(0);
        this._footerComponent = { setNativeProps(props) { } }; // Initial stub
        this._footerHeight = 0;
        this.scrollViewRef = react_1.default.createRef();
        this.animatedEvent = react_native_1.Animated.event([{ nativeEvent: { contentOffset: { y: this.scrollY } } }], { useNativeDriver: true });
        if (props.renderStickyHeader && props.stickyHeaderHeightEx === undefined) {
            console.warn('Property `stickyHeaderHeight` must be set if `renderStickyHeader` is used.');
        }
        this.state = {
            viewHeight: window.height,
            viewWidth: window.width
        };
    }
    render() {
        const _a = this.props, { backgroundColor, backgroundScrollSpeed, children, contentBackgroundColor, fadeOutForeground, fadeOutBackground, parallaxHeaderHeight, renderBackground, renderContentBackground, renderFixedHeader, renderForeground, renderScrollComponent, renderStickyHeader, stickyHeaderHeight, style, contentContainerStyle, outputScaleValue } = _a, scrollViewProps = __rest(_a, ["backgroundColor", "backgroundScrollSpeed", "children", "contentBackgroundColor", "fadeOutForeground", "fadeOutBackground", "parallaxHeaderHeight", "renderBackground", "renderContentBackground", "renderFixedHeader", "renderForeground", "renderScrollComponent", "renderStickyHeader", "stickyHeaderHeight", "style", "contentContainerStyle", "outputScaleValue"]);
        const background = this._renderBackground({
            fadeOutBackground,
            backgroundScrollSpeed,
            backgroundColor,
            parallaxHeaderHeight,
            stickyHeaderHeight,
            renderBackground,
            outputScaleValue
        });
        const foreground = this._renderForeground({
            fadeOutForeground,
            parallaxHeaderHeight,
            stickyHeaderHeight,
            renderForeground
        });
        const bodyComponent = this._wrapChildren(children, {
            contentBackgroundColor,
            stickyHeaderHeight,
            renderContentBackground,
            contentContainerStyle
        });
        const footerSpacer = this._renderFooterSpacer({ contentBackgroundColor });
        const maybeStickyHeader = this._maybeRenderStickyHeader({
            parallaxHeaderHeight,
            stickyHeaderHeight,
            backgroundColor,
            renderFixedHeader,
            renderStickyHeader
        });
        const scrollElement = renderScrollComponent(scrollViewProps);
        return (react_1.default.createElement(react_native_1.View, { style: [style, styles_1.default.container], onLayout: e => this._maybeUpdateViewDimensions(e) },
            background,
            react_1.default.cloneElement(scrollElement, {
                ref: this.scrollViewRef,
                style: [styles_1.default.scrollView, scrollElement.props.style],
                scrollEventThrottle: 1,
                // Using Native Driver greatly optimizes performance
                onScroll: react_native_1.Animated.event([{ nativeEvent: { contentOffset: { y: this.scrollY } } }], { useNativeDriver: true, listener: this._onScroll.bind(this) })
                // onScroll: this._onScroll.bind(this)
            }, foreground, bodyComponent, footerSpacer),
            maybeStickyHeader));
    }
    /*
   * Expose `ScrollView` API so this component is composable with any component that expects a `ScrollView`.
   */
    getScrollResponder() {
        var _a;
        return (_a = this.scrollViewRef.current) === null || _a === void 0 ? void 0 : _a.getScrollResponder();
    }
    getScrollableNode() {
        var _a;
        return (_a = this.scrollViewRef.current) === null || _a === void 0 ? void 0 : _a.getScrollableNode();
    }
    getInnerViewNode() {
        var _a;
        return (_a = this.scrollViewRef.current) === null || _a === void 0 ? void 0 : _a.getInnerViewNode();
    }
    scrollTo(...args) {
        var _a;
        (_a = this.scrollViewRef.current) === null || _a === void 0 ? void 0 : _a.scrollTo(...args);
    }
    setNativeProps(props) {
        var _a;
        (_a = this.scrollViewRef.current) === null || _a === void 0 ? void 0 : _a.setNativeProps(props);
    }
    /*
   * Private helpers
   */
    _onScroll(e) {
        const { parallaxHeaderHeight, stickyHeaderHeight, onChangeHeaderVisibility, onScroll: prevOnScroll = () => { } } = this.props;
        this.props.scrollEvent && this.props.scrollEvent(e);
        const p = pivotPoint(parallaxHeaderHeight, stickyHeaderHeight);
        // This optimization wont run, since we update the animation value directly in onScroll event
        // this._maybeUpdateScrollPosition(e)
        if (e.nativeEvent.contentOffset.y >= p) {
            onChangeHeaderVisibility(false);
        }
        else {
            onChangeHeaderVisibility(true);
        }
        prevOnScroll(e);
    }
    // This optimizes the state update of current scrollY since we don't need to
    // perform any updates when user has scrolled past the pivot point.
    _maybeUpdateScrollPosition(e) {
        const { parallaxHeaderHeight, stickyHeaderHeight } = this.props;
        const { scrollY } = this;
        const { nativeEvent: { contentOffset: { y: offsetY } } } = e;
        const p = pivotPoint(parallaxHeaderHeight, stickyHeaderHeight);
        // @ts-ignore getting the internal value of scrollY
        const syv = scrollY._value;
        if (offsetY <= p || syv <= p) {
            scrollY.setValue(offsetY);
        }
    }
    _maybeUpdateViewDimensions(e) {
        const { nativeEvent: { layout: { width, height } } } = e;
        if (width !== this.state.viewWidth || height !== this.state.viewHeight) {
            this.setState({
                viewWidth: width,
                viewHeight: height
            });
        }
    }
    _renderBackground({ fadeOutBackground, backgroundScrollSpeed, backgroundColor, parallaxHeaderHeight, stickyHeaderHeight, renderBackground, outputScaleValue }) {
        const { viewWidth, viewHeight } = this.state;
        const { scrollY } = this;
        const p = pivotPoint(parallaxHeaderHeight, stickyHeaderHeight);
        return (react_1.default.createElement(react_native_1.Animated.View, { style: [
                styles_1.default.backgroundImage,
                ((this.props.backgroundImageStyle) ? this.props.backgroundImageStyle : null),
                {
                    backgroundColor: backgroundColor,
                    height: parallaxHeaderHeight,
                    width: viewWidth,
                    opacity: fadeOutBackground
                        ? interpolate(scrollY, {
                            inputRange: [0, p * (1 / 2), p * (3 / 4), p],
                            outputRange: [1, 0.3, 0.1, 0],
                            extrapolate: 'clamp'
                        })
                        : 1,
                    transform: [
                        {
                            translateY: interpolate(scrollY, {
                                inputRange: [0, p],
                                outputRange: [0, -(p / backgroundScrollSpeed)],
                                extrapolateRight: 'extend',
                                extrapolateLeft: 'clamp'
                            })
                        },
                        {
                            scale: interpolate(scrollY, {
                                inputRange: [-viewHeight, 0],
                                outputRange: [outputScaleValue * 1.5, 1],
                                extrapolate: 'clamp'
                            })
                        }
                    ]
                }
            ] },
            react_1.default.createElement(react_native_1.View, null, renderBackground())));
    }
    _renderForeground({ fadeOutForeground, parallaxHeaderHeight, stickyHeaderHeight, renderForeground }) {
        const { scrollY } = this;
        const p = pivotPoint(parallaxHeaderHeight, stickyHeaderHeight);
        return (react_1.default.createElement(react_native_1.View, { style: [
                styles_1.default.parallaxHeaderContainer,
                (this.props.parallaxHeaderContainerStyle) ? this.props.parallaxHeaderContainerStyle : null
            ] },
            react_1.default.createElement(react_native_1.Animated.View, { style: [
                    styles_1.default.parallaxHeader,
                    ((this.props.parallaxHeaderStyle) ? this.props.parallaxHeaderStyle : null),
                    {
                        height: parallaxHeaderHeight,
                        opacity: fadeOutForeground
                            ? interpolate(scrollY, {
                                inputRange: [0, p * (1 / 2), p * (3 / 4), p],
                                outputRange: [1, 0.3, 0.1, 0],
                                extrapolate: 'clamp'
                            })
                            : 1
                    }
                ] },
                react_1.default.createElement(react_native_1.View, { style: { height: parallaxHeaderHeight } }, renderForeground()))));
    }
    _wrapChildren(children, { contentBackgroundColor, stickyHeaderHeight, contentContainerStyle, renderContentBackground }) {
        const { viewHeight } = this.state;
        const containerStyles = [{ backgroundColor: contentBackgroundColor }];
        if (contentContainerStyle)
            containerStyles.push(contentContainerStyle);
        let containerHeight = this.state.viewHeight;
        react_1.default.Children.forEach(children, (item) => {
            if (item && Object.keys(item).length != 0) {
                containerHeight = 0;
            }
        });
        return (react_1.default.createElement(react_native_1.View, { style: [containerStyles, { minHeight: containerHeight }], onLayout: e => {
                // Adjust the bottom height so we can scroll the parallax header all the way up.
                const { nativeEvent: { layout: { height } } } = e;
                const footerHeight = Math.max(0, viewHeight - height - stickyHeaderHeight);
                if (this._footerHeight !== footerHeight) {
                    this._footerComponent.setNativeProps({
                        style: { height: footerHeight }
                    });
                    this._footerHeight = footerHeight;
                }
            } },
            renderContentBackground(),
            children));
    }
    _renderFooterSpacer({ contentBackgroundColor }) {
        return (react_1.default.createElement(react_native_1.View, { ref: ref => {
                if (ref) {
                    this._footerComponent = ref;
                }
            }, style: { backgroundColor: contentBackgroundColor } }));
    }
    _maybeRenderStickyHeader({ parallaxHeaderHeight, stickyHeaderHeight, backgroundColor, renderFixedHeader, renderStickyHeader }) {
        const { viewWidth } = this.state;
        const { scrollY } = this;
        if (renderStickyHeader || renderFixedHeader) {
            const p = pivotPoint(parallaxHeaderHeight, stickyHeaderHeight);
            return (react_1.default.createElement(react_native_1.View, { style: [
                    styles_1.default.stickyHeader,
                    ((this.props.stickyHeaderStyle) ? this.props.stickyHeaderStyle : null),
                    Object.assign({ width: viewWidth }, (stickyHeaderHeight ? { height: stickyHeaderHeight } : null))
                ] },
                renderStickyHeader
                    ? react_1.default.createElement(react_native_1.Animated.View, { style: {
                            backgroundColor: backgroundColor,
                            height: stickyHeaderHeight,
                            opacity: interpolate(scrollY, {
                                inputRange: [0, p],
                                outputRange: [0, 1],
                                extrapolate: 'clamp'
                            })
                        } },
                        react_1.default.createElement(react_native_1.Animated.View, { style: {
                                transform: [
                                    {
                                        translateY: interpolate(scrollY, {
                                            inputRange: [0, p],
                                            outputRange: [stickyHeaderHeight, 0],
                                            extrapolate: 'clamp'
                                        })
                                    }
                                ]
                            } }, renderStickyHeader()))
                    : null,
                renderFixedHeader && renderFixedHeader()));
        }
        else {
            return null;
        }
    }
}
ParallaxScrollView.defaultProps = {
    backgroundColor: '#000',
    backgroundScrollSpeed: 5,
    contentBackgroundColor: '#fff',
    fadeOutForeground: true,
    fadeOutBackground: false,
    onChangeHeaderVisibility: () => { },
    renderBackground: renderEmpty,
    renderContentBackground: noRender,
    renderFixedHeader: () => react_1.default.createElement(react_native_1.View, null),
    renderScrollComponent: renderScroll,
    outputScaleValue: 5,
};
exports.default = ParallaxScrollView;
