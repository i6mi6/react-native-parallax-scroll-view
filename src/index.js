import React, { Component } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  View
} from 'react-native';

const styles = require('./styles');

const { bool, func, number, string } = React.PropTypes;

const window = Dimensions.get('window');

const SCROLLVIEW_REF = 'ScrollView';

const pivotPoint = (a, b) => (a - b);

const renderEmpty = () => <View/>;

// Override `toJSON` of interpolated value because of
// an error when serializing style on view inside inspector.
// See: https://github.com/jaysoo/react-native-parallax-scroll-view/issues/23
const interpolate = (value, opts) => {
  const x = value.interpolate(opts);
  x.toJSON = () => x.__getValue();
  return x;
};

// Properties accepted by `ParallaxScrollView`.
const IPropTypes = {
  backgroundColor: string,
  backgroundScrollSpeed: number,
  fadeOutForeground: bool,
  fadeOutBackground: bool,
  contentBackgroundColor: string,
  onChangeHeaderVisibility: func,
  renderBackground: func,
  renderFixedHeader: func,
  renderForeground: func,
  renderScrollComponent: func,
  renderStickyHeader: func,
  stickyHeaderHeight: number,
  contentContainerStyle: View.propTypes.style
};

class ParallaxScrollView extends Component {

  constructor(props) {
    super(props);
    if (props.renderStickyHeader && !props.stickyHeaderHeight) {
      console.warn('Property `stickyHeaderHeight` must be set if `renderStickyHeader` is used.');
    }
    if (props.renderParallaxHeader !== renderEmpty && !props.renderForeground) {
      console.warn('Property `renderParallaxHeader` is deprecated. Use `renderForeground` instead.');
    }
    this.state = {
      scrollY: new Animated.Value(0),
      viewHeight: window.height,
      viewWidth: window.width,
      parallaxHeaderHeight: window.height
    };
    this._footerComponent = { setNativeProps() {} }; // Initial stub
    this._footerHeight = 0;
  }

  render() {
    const {
      backgroundColor,
      backgroundScrollSpeed,
      children,
      contentBackgroundColor,
      fadeOutForeground,
      fadeOutBackground,
      renderBackground,
      renderFixedHeader,
      renderForeground,
      renderParallaxHeader,
      renderScrollComponent,
      renderStickyHeader,
      stickyHeaderHeight,
      style,
      contentContainerStyle,
      ...scrollViewProps
    } = this.props;

    const background = this._renderBackground({ fadeOutBackground, backgroundScrollSpeed, backgroundColor, parallaxHeaderHeight: this.state.parallaxHeaderHeight, stickyHeaderHeight, renderBackground });
    const foreground = this._renderForeground({ fadeOutForeground, parallaxHeaderHeight: this.state.parallaxHeaderHeight, stickyHeaderHeight, renderForeground: renderForeground || renderParallaxHeader });
    const bodyComponent = this._wrapChildren(children, { contentBackgroundColor, stickyHeaderHeight, contentContainerStyle });
    const footerSpacer = this._renderFooterSpacer({ contentBackgroundColor });
    const maybeStickyHeader = this._maybeRenderStickyHeader({ parallaxHeaderHeight: this.state.parallaxHeaderHeight, stickyHeaderHeight, backgroundColor, renderFixedHeader, renderStickyHeader });
    const scrollElement = renderScrollComponent(scrollViewProps);

    return (
      <View style={[style, styles.container]}
            onLayout={(e) => this._maybeUpdateViewDimensions(e)}>
        { background }
        {
          React.cloneElement(scrollElement, {
              ref: SCROLLVIEW_REF,
              style: [styles.scrollView, scrollElement.props.style],
              scrollEventThrottle: 16,
              onScroll: this._onScroll.bind(this),
            },
            foreground,
            bodyComponent,
            footerSpacer
          )
        }
        { maybeStickyHeader }
      </View>
    );
  }

  /*
   * Expose `ScrollView` API so this component is composable with any component that expects a `ScrollView`.
   */
  getScrollResponder() {
    return this.refs[SCROLLVIEW_REF].getScrollResponder();
  }
  getScrollableNode() {
    return this.getScrollResponder().getScrollableNode();
  }
  getInnerViewNode() {
    return this.getScrollResponder().getInnerViewNode();
  }
  scrollTo(...args) {
    this.getScrollResponder().scrollTo(...args);
  }
  setNativeProps(props) {
    this.refs[SCROLLVIEW_REF].setNativeProps(props);
  }

  /*
   * Private helpers
   */

  _onScroll(e) {
    const {
      stickyHeaderHeight,
      onChangeHeaderVisibility,
      onScroll: prevOnScroll = () => {}
      } = this.props;

    const p = pivotPoint(this.state.parallaxHeaderHeight, stickyHeaderHeight);

    this._maybeUpdateScrollPosition(e);

    if (e.nativeEvent.contentOffset.y >= p) {
      onChangeHeaderVisibility(false);
    } else {
      onChangeHeaderVisibility(true);
    }

    prevOnScroll(e);
  }

  // This optimizes the state update of current scrollY since we don't need to
  // perform any updates when user has scrolled past the pivot point.
  _maybeUpdateScrollPosition(e) {
    const { stickyHeaderHeight } = this.props;
    const { scrollY } = this.state;
    const { nativeEvent: { contentOffset: { y: offsetY } } } = e;
    const p = pivotPoint(this.state.parallaxHeaderHeight, stickyHeaderHeight);

    if (offsetY <= p || scrollY._value <= p) {
      scrollY.setValue(offsetY);
    }
  }

  _maybeUpdateViewDimensions(e) {
    const { nativeEvent: { layout: { width, height} } } = e;

    if (width !== this.state.viewWidth || height !== this.state.viewHeight) {
      this.setState({
        viewWidth: width,
        viewHeight: height
      });
    }
  }

  _renderBackground({ fadeOutBackground, backgroundScrollSpeed, backgroundColor, parallaxHeaderHeight, stickyHeaderHeight, renderBackground }) {
    const { viewWidth, viewHeight, scrollY } = this.state;
    const p = pivotPoint(parallaxHeaderHeight, stickyHeaderHeight);
    return (
      <Animated.View
        style={[styles.backgroundImage, {
            backgroundColor: backgroundColor,
            height: parallaxHeaderHeight,
            width: viewWidth,
            opacity: fadeOutBackground
                     ? interpolate(scrollY, {
                      inputRange: [0, p *  (1/2), p * (3/4), p],
                      outputRange: [1, 0.3, 0.1, 0],
                      extrapolate: 'clamp'
                    })
                    : 1,
            transform: [{
              translateY: interpolate(scrollY, {
                inputRange: [0, p],
                outputRange: [0, -(p / backgroundScrollSpeed)],
                extrapolateRight: 'extend',
                extrapolateLeft: 'clamp'
              })
            }, {
              scale: interpolate(scrollY, {
                inputRange: [-viewHeight, 0],
                outputRange: [5, 1],
                extrapolate: 'clamp'
              })
            }]
          }]}>
        <View>
          { renderBackground() }
        </View>
      </Animated.View>
    );
  }

  _renderForeground({ fadeOutForeground, parallaxHeaderHeight, stickyHeaderHeight, renderForeground }) {
    const { scrollY } = this.state;
    const _this = this;
    const p = pivotPoint(parallaxHeaderHeight, stickyHeaderHeight);
    return (
      <View style={styles.parallaxHeaderContainer}
        onLayout={e => {
          const { x, y, width, height } = e.nativeEvent.layout;
          _this.setState({parallaxHeaderHeight: height});
        }}>
        <Animated.View
          style={[styles.parallaxHeader, {
                  opacity: fadeOutForeground
                     ? interpolate(scrollY, {
                      inputRange: [0, p *  (1/2), p * (3/4), p],
                      outputRange: [1, 0.3, 0.1, 0],
                      extrapolate: 'clamp'
                    })
                    : 1
                }]}>
          { renderForeground() }
        </Animated.View>
      </View>
    );
  }

  _wrapChildren(children, { contentBackgroundColor, stickyHeaderHeight, contentContainerStyle }) {
    const { viewHeight } = this.state;
    const containerStyles = [{backgroundColor: contentBackgroundColor}];

    if(contentContainerStyle)
      containerStyles.push(contentContainerStyle);

    return (
      <View
        style={containerStyles}
        onLayout={e => {
                // Adjust the bottom height so we can scroll the parallax header all the way up.
                const { nativeEvent: { layout: { height } } } = e;
                const footerHeight = Math.max(0, viewHeight - height - stickyHeaderHeight);
                if (this._footerHeight !== footerHeight) {
                  this._footerComponent.setNativeProps({ style: { height: footerHeight }});
                  this._footerHeight = footerHeight;
                }
              }}>
        { children }
      </View>
    );
  }

  _renderFooterSpacer({ contentBackgroundColor }) {
    return (
      <View ref={ref => this._footerComponent = ref } style={{ backgroundColor: contentBackgroundColor }}/>
    );
  }

  _maybeRenderStickyHeader({ parallaxHeaderHeight, stickyHeaderHeight, backgroundColor, renderFixedHeader, renderStickyHeader }) {
    const { viewWidth, scrollY } = this.state;
    if (renderStickyHeader || renderFixedHeader) {
      const p = pivotPoint(parallaxHeaderHeight, stickyHeaderHeight);
      return (
        <View style={[styles.stickyHeader, { width: viewWidth, ...(stickyHeaderHeight ? { height: stickyHeaderHeight } : null ) }]}>
          {
            renderStickyHeader
              ? (
                <Animated.View
                  style={{
                  backgroundColor: backgroundColor,
                  height: stickyHeaderHeight,
                  opacity: interpolate(scrollY, {
                    inputRange: [0, p],
                    outputRange: [0, 1],
                    extrapolate: 'clamp'
                  })
                }}>
                  <Animated.View
                    style={{
                    transform: [{
                      translateY: interpolate(scrollY, {
                        inputRange: [0, p],
                        outputRange: [stickyHeaderHeight, 0],
                        extrapolate: 'clamp'
                      })
                    }]
                  }}>
                    { renderStickyHeader() }
                  </Animated.View>
                </Animated.View>
              )
              : null
          }
          { renderFixedHeader && renderFixedHeader() }
        </View>
      );
    } else {
      return null;
    }
  }
}

ParallaxScrollView.propTypes = IPropTypes;

ParallaxScrollView.defaultProps = {
  backgroundScrollSpeed: 5,
  backgroundColor: '#000',
  contentBackgroundColor: '#fff',
  fadeOutForeground: true,
  onChangeHeaderVisibility: () => {},
  renderScrollComponent: props => <ScrollView {...props}/>,
  renderBackground: renderEmpty,
  renderParallaxHeader: renderEmpty, // Deprecated (will be removed in 0.18.0)
  renderForeground: null,
  stickyHeaderHeight: 0,
  contentContainerStyle: null
};

module.exports = ParallaxScrollView;
