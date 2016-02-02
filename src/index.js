const React = require('react-native');
const {
  Animated,
  Component,
  Dimensions,
  ScrollView,
  View
} = React;

const styles = require('./styles');

const { func, number, string } = React.PropTypes;

const window = Dimensions.get('window');

const SCROLLVIEW_REF = 'ScrollView';

const pivotPoint = (a, b) => (a - b);

// Properties accepted by `ParallaxScrollView`.
const IPropTypes = {
  backgroundColor: string,
  contentBackgroundColor: string,
  onChangeHeaderVisibility: func,
  parallaxHeaderHeight: number.isRequired,
  renderForeground: func,
  renderStickyHeader: func,
  renderScrollComponent: func,
  renderFixedHeader: func,
  renderBackground: func,
  stickyHeaderHeight: number,
  backgroundSpeed: number
};

class ParallaxScrollView extends Component {
  constructor(props) {
    super(props);
    if (props.renderStickyHeader && !props.stickyHeaderHeight) {
      console.warn('Property `stickyHeaderHeight` must be set if `renderStickyHeader` is used.');
    }
    if (props.renderParallaxHeader && !props.renderForeground) {
      console.warn('Property `renderParallaxHeader` is deprecated. Use `renderForeground` instead.');
    }
    this.state = {
      scrollY: new Animated.Value(0),
      viewHeight: window.height,
      viewWidth: window.width
    };
    this._footerComponent = { setNativeProps() {} }; // Initial stub
    this._footerHeight = 0;
  }

  render() {
    const {
      children,
      contentBackgroundColor,
      backgroundSpeed,
      headerSpeed,
      backgroundColor,
      parallaxHeaderHeight,
      stickyHeaderHeight,
      renderBackground,
      renderFixedHeader,
      renderForeground,
      renderParallaxHeader,
      renderScrollComponent,
      renderStickyHeader,
      style,
      ...scrollViewProps
    } = this.props;

    const background = this._renderBackground({ backgroundSpeed, backgroundColor, parallaxHeaderHeight, stickyHeaderHeight, renderBackground });
    const foreground = this._renderForeground({ headerSpeed, parallaxHeaderHeight, stickyHeaderHeight, renderForeground: renderForeground || renderParallaxHeader });
    const bodyComponent = this._wrapChildren(children, { contentBackgroundColor, stickyHeaderHeight });
    const footerSpacer = this._renderFooterSpacer({ contentBackgroundColor });
    const maybeStickyHeader = this._maybeRenderStickyHeader({ parallaxHeaderHeight, stickyHeaderHeight, backgroundColor, renderFixedHeader, renderStickyHeader });
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
  getInnerViewNode() {
    return this.getScrollResponder().getInnerViewNode();
  }
  scrollTo(destY, destX) {
    this.getScrollResponder().scrollTo(destY, destX);
  }
  scrollWithoutAnimationTo(destY, destX) {
    this.getScrollResponder().scrollWithoutAnimationTo(destY, destX);
  }
  setNativeProps(props) {
    this.refs[SCROLLVIEW_REF].setNativeProps(props);
  }

  /*
   * Private helpers
   */

  _onScroll(e) {
    const {
      parallaxHeaderHeight,
      stickyHeaderHeight,
      onChangeHeaderVisibility,
      onScroll: prevOnScroll = () => {}
      } = this.props;

    const p = pivotPoint(parallaxHeaderHeight, stickyHeaderHeight);

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
    const { parallaxHeaderHeight, stickyHeaderHeight } = this.props;
    const { scrollY } = this.state;
    const { nativeEvent: { contentOffset: { y: offsetY } } } = e;
    const p = pivotPoint(parallaxHeaderHeight, stickyHeaderHeight);

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

  _renderBackground({ backgroundSpeed, backgroundColor, parallaxHeaderHeight, stickyHeaderHeight, renderBackground }) {
    const { viewWidth, viewHeight, scrollY } = this.state;
    const p = pivotPoint(parallaxHeaderHeight, stickyHeaderHeight);
    return (
      <Animated.View
        style={[styles.backgroundImage, {
            backgroundColor: backgroundColor,
            height: parallaxHeaderHeight,
            width: viewWidth,
            transform: [{
              translateY: scrollY.interpolate({
                inputRange: [0, p],
                outputRange: [0, -(p / backgroundSpeed)],
                extrapolateRight: 'extend',
                extrapolateLeft: 'clamp'
              })
            }, {
              scale: scrollY.interpolate({
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

  _renderForeground({ parallaxHeaderHeight, stickyHeaderHeight, renderForeground }) {
    const { scrollY } = this.state;
    const p = pivotPoint(parallaxHeaderHeight, stickyHeaderHeight);
    return (
      <View style={styles.parallaxHeaderContainer}>
        <Animated.View
          style={[styles.parallaxHeader, {
                  height: parallaxHeaderHeight,
                  opacity: scrollY.interpolate({
                    inputRange: [0, p * (2/3), p],
                    outputRange: [1, 0.5, 0],
                    extrapolate: 'extend'
                  })
                }]}>
            <View style={{ height: parallaxHeaderHeight }}>
              { renderForeground() }
            </View>
        </Animated.View>
      </View>
    );
  }

  _wrapChildren(children, { contentBackgroundColor, stickyHeaderHeight }) {
    const { viewHeight } = this.state;
    return (
      <View
        style={{ backgroundColor: contentBackgroundColor }}
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
    if (renderStickyHeader) {
      const p = pivotPoint(parallaxHeaderHeight, stickyHeaderHeight);
      return (
        <View style={[styles.stickyHeader, { width: viewWidth, height: stickyHeaderHeight }]}>
          <Animated.View
            style={{
                backgroundColor: backgroundColor,
                height: stickyHeaderHeight,
                opacity: scrollY.interpolate({
                  inputRange: [0, p],
                  outputRange: [0, 1],
                  extrapolate: 'clamp'
                })
              }}>
            <Animated.View
              style={{
                  transform: [{
                    translateY: scrollY.interpolate({
                      inputRange: [0, p],
                      outputRange: [stickyHeaderHeight, 0],
                      extrapolate: 'clamp'
                    })
                  }]
                }}>
              { renderStickyHeader() }
            </Animated.View>
          </Animated.View>
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
  backgroundSpeed: 5,
  backgroundColor: '#000',
  contentBackgroundColor: '#fff',
  onChangeHeaderVisibility: () => {},
  renderScrollComponent: props => <ScrollView {...props}/>,
  renderBackground: () => <View/>,
  renderParallaxHeader: () => <View/>,
  renderForeground: null,
  stickyHeaderHeight: 0
};

module.exports = ParallaxScrollView;
