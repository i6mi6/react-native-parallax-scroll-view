const React = require('react-native');
const {
  Animated,
  Component,
  Dimensions,
  Image,
  ListView,
  StyleSheet,
  View
} = React;

const {
  bool,
  func,
  number
} = React.PropTypes;

class ParallaxListView extends Component {
  constructor(props) {
    super(props);

    if (props.renderStickyHeader && !props.stickyHeaderHeight) {
      console.error('Property `stickyHeaderHeight` must be set if `stickyHeader` is true')
    }

    this.state = {
      scrollY: new Animated.Value(0)
    };

    this._animatedEvent = Animated.event([
      { nativeEvent: { contentOffset: { y: this.state.scrollY } } }
    ]);
  }

  render() {
    const { scrollY } = this.state;
    const {
      parallaxHeaderHeight,
      stickyHeaderHeight,
      renderBackground,
      renderStickyHeader,
      renderParallaxHeader,
      rowHeight,
      onScroll: prevOnScroll = () => {},
      ...listViewProps
      } = this.props;
    return (
      <View style={{ flex: 1, backgroundColor: 'transparent' }}>
        <Animated.View shouldRasterizeIOS={true}
                       style={[styles.backgroundImage, {
                           transform: [{
                             translateY: scrollY.interpolate({
                               inputRange: [0, parallaxHeaderHeight - stickyHeaderHeight],
                               outputRange: [0, -parallaxHeaderHeight],
                               extrapolateRight: 'extend',
                               extrapolateLeft: 'clamp'
                             })
                           }, {
                             scale: scrollY.interpolate({
                               inputRange: [-window.height, 0],
                               outputRange: [5, 1],
                               extrapolate: 'clamp'
                             })
                           }]
                         }]}>
          { renderBackground() }
        </Animated.View>
        <ListView ref="ListView"
          {...listViewProps}
                  scrollEventThrottle={16}
                  onScroll={e => {
                    this._animatedEvent(e);
                    prevOnScroll(e);
                  }}
                  renderHeader={() => (
                    <View>
                      <Animated.View shouldRasterizeIOS={true}
                                     style={[styles.parallaxHeader, {
                                       height: scrollY.interpolate({
                                         inputRange: [0, parallaxHeaderHeight - stickyHeaderHeight],
                                         outputRange: [parallaxHeaderHeight, stickyHeaderHeight],
                                         extrapolate: 'clamp'
                                       }),
                                       opacity: scrollY.interpolate({
                                         inputRange: [0, (parallaxHeaderHeight - stickyHeaderHeight) / 2 - 20, (parallaxHeaderHeight - stickyHeaderHeight) / 2],
                                         outputRange: [1, .9, 0],
                                         extrapolate: 'extend'
                                       })
                                     }]}>
                          { renderParallaxHeader() }
                      </Animated.View>
                    </View>
                  )}
                  renderFooter={() => {
                    const { dataSource } = this.props;
                    const height = Math.max(0, window.height - stickyHeaderHeight - dataSource.getRowCount() * rowHeight);
                    return (
                      <View shouldRasterizeIOS={true} style={{ height }}/>
                    );
                  }}/>
        <Animated.View shouldRasterizeIOS={true}
                       style={[styles.stickyHeader, {
                                       height: stickyHeaderHeight,
                                       opacity: scrollY.interpolate({
                                         inputRange: [-window.height, 0, stickyHeaderHeight],
                                         outputRange: [0, 0, 1],
                                         extrapolate: 'clamp'
                                       })
                                     }]}>
          <Animated.View shouldRasterizeIOS={true}
                         style={{transform: [{
                                           translateY: scrollY.interpolate({
                                             inputRange: [-window.height, 0, stickyHeaderHeight],
                                             outputRange: [stickyHeaderHeight, stickyHeaderHeight, 0],
                                             extrapolate: 'clamp'
                                           })
                                         }]}}>
            { renderStickyHeader() }
          </Animated.View>
        </Animated.View>
      </View>
    );
  }

  getScrollResponder() {
    return this.refs.ListView.getScrollResponder();
  }
}

ParallaxListView.propTypes = {
  ...ParallaxListView.propTypes,
  parallaxHeaderHeight: number.isRequired,
  renderStickyHeader: func,
  renderBackground: func.isRequired,
  renderParallaxHeader: func.isRequired,
  rowHeight: number.isRequired,
  stickyHeaderHeight: number
};

ParallaxListView.defaultProps = {
  stickyHeaderHeight: 0
};

const window = Dimensions.get('window');

const styles = StyleSheet.create({
  parallaxHeader: {
    backgroundColor: 'transparent',
    overflow: 'hidden'
  },
  backgroundImage: {
    position: 'absolute',
    top: 0
  },
  stickyHeader: {
    backgroundColor: 'black',
    position: 'absolute',
    overflow: 'hidden',
    top: 0,
    left: 0,
    width: window.width
  }
});

module.exports = ParallaxListView;
