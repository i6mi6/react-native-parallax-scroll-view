const React = require('react-native');
const {
  Animated,
  Component,
  Dimensions,
  ScrollView,
  StyleSheet,
  View
} = React;

const {
  any,
  func,
  number,
  string
} = React.PropTypes;

const SCROLLVIEW_REF = 'ScrollView';

// Properties accepted by `ParallaxScrollView`.
const IPropTypes = {
  headerBackgroundColor: string,
  contentBackgroundColor: string,
  onChangeHeaderVisibility: func,
  parallaxHeaderHeight: number.isRequired,
  renderParallaxHeader: func.isRequired,
  renderStickyHeader: func,
  renderScrollComponent: func,
  renderFixedHeader: func,
  renderBackground: func,
  stickyHeaderHeight: number,
  style: any
};

class ParallaxScrollView extends Component {
  constructor(props) {
    super(props);
    if (props.renderStickyHeader && !props.stickyHeaderHeight) {
      console.error('Property `stickyHeaderHeight` must be set if `renderStickyHeader` is used')
    }
    this.state = { scrollY: new Animated.Value(0) };
    this._footerComponent = null;
    this._footerHeight = 0;
    this._animatedEvent = Animated.event([{nativeEvent: { contentOffset: { y: this.state.scrollY } } }]);
  }

  render() {
    const {
      children,
      contentBackgroundColor,
      headerBackgroundColor,
      parallaxHeaderHeight,
      stickyHeaderHeight,
      renderBackground,
      renderFixedHeader,
      renderParallaxHeader,
      renderScrollComponent,
      renderStickyHeader,
      style,
      ...scrollViewProps
    } = this.props;

    const background = this._renderBackground({ headerBackgroundColor, parallaxHeaderHeight, stickyHeaderHeight, renderBackground });
    const parallaxHeader = this._renderParallaxHeader({ parallaxHeaderHeight, stickyHeaderHeight, renderParallaxHeader });
    const bodyComponent = this._wrapChildren(children, { contentBackgroundColor, stickyHeaderHeight });
    const footerSpacer = this._renderFooterSpacer({ contentBackgroundColor });
    const maybeStickyHeader = this._maybeRenderStickyHeader({ parallaxHeaderHeight, stickyHeaderHeight, headerBackgroundColor, renderFixedHeader, renderStickyHeader });

    return (
      <View style={styles.container}>
        { background }
        {
          React.cloneElement(renderScrollComponent(scrollViewProps), {
            ref: SCROLLVIEW_REF,
            style: [style, styles.scrollView],
            scrollEventThrottle: 16,
            onScroll: this._onScroll.bind(this),
          },
            parallaxHeader,
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

    const midpoint = (parallaxHeaderHeight - stickyHeaderHeight) / 2;

    this._animatedEvent(e);

    if (e.nativeEvent.contentOffset.y >= midpoint) {
      onChangeHeaderVisibility({ visible: false, nativeEvent: e.nativeEvent });
    } else {
      onChangeHeaderVisibility({ visible: true,  nativeEvent: e.nativeEvent });
    }

    prevOnScroll(e);
  }

  _renderBackground({ headerBackgroundColor, parallaxHeaderHeight, stickyHeaderHeight, renderBackground }) {
    const midpoint = (parallaxHeaderHeight - stickyHeaderHeight) / 2;
    return (
      <Animated.View
        style={[styles.backgroundImage, {
            backgroundColor: headerBackgroundColor,
            height: parallaxHeaderHeight,
            width: window.width,
            transform: [{
              translateY: this.state.scrollY.interpolate({
                inputRange: [0, midpoint],
                outputRange: [0, -midpoint],
                extrapolateRight: 'extend',
                extrapolateLeft: 'clamp'
              })
            }, {
              scale: this.state.scrollY.interpolate({
                inputRange: [-window.height, 0],
                outputRange: [5, 1],
                extrapolate: 'clamp'
              })
            }]
          }]}>
        <View>
          { renderBackground && renderBackground() }
        </View>
      </Animated.View>
    );
  }

  _renderParallaxHeader({ parallaxHeaderHeight, stickyHeaderHeight, renderParallaxHeader }) {
    const midpoint = (parallaxHeaderHeight - stickyHeaderHeight) / 2;
    return (
      <View style={styles.parallaxHeaderContainer}>
        <Animated.View
          style={[styles.parallaxHeader, {
                  height: this.state.scrollY.interpolate({
                    inputRange: [0, parallaxHeaderHeight - stickyHeaderHeight],
                    outputRange: [parallaxHeaderHeight, stickyHeaderHeight],
                    extrapolate: 'clamp'
                  }),
                  opacity: this.state.scrollY.interpolate({
                    inputRange: [0, midpoint - 20, midpoint],
                    outputRange: [1, .9, 0],
                    extrapolate: 'extend'
                  })
                }]}>
          { renderParallaxHeader && renderParallaxHeader() }
        </Animated.View>
      </View>
    );
  }

  _wrapChildren(children, { contentBackgroundColor, stickyHeaderHeight }) {
    return (
      <View
        style={{ backgroundColor: contentBackgroundColor }}
        onLayout={e => {
                // Adjust the bottom height so we can scroll the parallax header all the way up.
                const { nativeEvent: { layout: { height } } } = e;
                const footerHeight = Math.max(0, window.height - height - stickyHeaderHeight);
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

  _maybeRenderStickyHeader({ parallaxHeaderHeight, stickyHeaderHeight, headerBackgroundColor, renderFixedHeader, renderStickyHeader }) {
    if (renderStickyHeader) {
      const midpoint = (parallaxHeaderHeight - stickyHeaderHeight) / 2;
      return (
        <View style={[styles.stickyHeader, { height: stickyHeaderHeight }]}>
          <Animated.View
              style={{
                backgroundColor: headerBackgroundColor,
                height: stickyHeaderHeight,
                opacity: this.state.scrollY.interpolate({
                  inputRange: [0, midpoint],
                  outputRange: [0, 1],
                  extrapolate: 'clamp'
                })
              }}>
            <Animated.View
                style={{
                  transform: [{
                    translateY: this.state.scrollY.interpolate({
                      inputRange: [0, midpoint],
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
  headerBackgroundColor: '#000',
  contentBackgroundColor: '#fff',
  onChangeHeaderVisibility: () => {},
  renderScrollComponent: props => <ScrollView {...props}/>,
  stickyHeaderHeight: 0,
  style: {}
};

const window = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  parallaxHeaderContainer: {
    backgroundColor: 'transparent',
    overflow: 'hidden'
  },
  parallaxHeader: {
    backgroundColor: 'transparent',
    overflow: 'hidden'
  },
  backgroundImage: {
    position: 'absolute',
    backgroundColor: 'transparent',
    top: 0
  },
  stickyHeader: {
    backgroundColor: 'transparent',
    position: 'absolute',
    overflow: 'hidden',
    top: 0,
    left: 0,
    width: window.width
  },
  scrollView: {
    backgroundColor: 'transparent'
  }
});

module.exports = ParallaxScrollView;
