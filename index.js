const React = require('react-native');
const {
  Animated,
  Component,
  Dimensions,
  ListView,
  StyleSheet,
  View
} = React;

const {
  any,
  func,
  number,
  string
} = React.PropTypes;

// Properties accepted by `ParallaxListView`.
const IPropTypes = {
  backgroundColor: string,
  parallaxHeaderHeight: number.isRequired,
  renderStickyHeader: func,
  renderBackground: func,
  renderParallaxHeader: func.isRequired,
  rowHeight: number,
  stickyHeaderHeight: number,
  style: any
};

class ParallaxListView extends Component {
  constructor(props) {
    super(props);
    if (props.renderStickyHeader && !props.stickyHeaderHeight) {
      console.error('Property `stickyHeaderHeight` must be set if `renderStickyHeader` is used')
    }
    this.state = { scrollY: new Animated.Value(0) };
    this._animatedEvent = Animated.event([{nativeEvent: { contentOffset: { y: this.state.scrollY } } }]);
  }

  render() {
    const { scrollY } = this.state;
    const {
      backgroundColor,
      dataSource,
      parallaxHeaderHeight,
      stickyHeaderHeight,
      renderBackground,
      renderStickyHeader,
      renderParallaxHeader,
      rowHeight,
      onScroll: prevOnScroll = () => {},
      style,
      ...listViewProps
    } = this.props;

    return (
      <View style={styles.container}>
        <Animated.View shouldRasterizeIOS={true}
                       style={[styles.backgroundImage, {
                               backgroundColor,
                               height: parallaxHeaderHeight,
                               width: window.width,
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
          <View>
            { renderBackground && renderBackground() }
          </View>
        </Animated.View>
        <ListView {...listViewProps}
                  style={[style, styles.listView]}
                  dataSource={dataSource}
                  ref="ListView"
                  scrollEventThrottle={16}
                  onScroll={e => {
                    this._animatedEvent(e);
                    prevOnScroll(e);
                  }}
                  renderHeader={() => (
                    <View style={styles.parallaxHeaderContainer}>
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
                          { renderParallaxHeader && renderParallaxHeader() }
                      </Animated.View>
                    </View>
                  )}

                  renderFooter={() => {
                    let height;
                    const extraTopHeight = renderStickyHeader ? stickyHeaderHeight : 0;

                    // If `rowHeight` is provided, we can calculate exact remaining height in order to allow
                    // parallax header to scroll all the way up. Otherwise, extra padding will have to be accounted
                    // for outside of this component.
                    if (rowHeight) {
                      height = Math.max(0, window.height - extraTopHeight - dataSource.getRowCount() * rowHeight);
                    } else {
                      height = 0;
                    }
                    return <View shouldRasterizeIOS={true} style={{ height }}/>;
                  }}/>
        { renderStickyHeader
          ? (
            <Animated.View shouldRasterizeIOS={true}
                           style={[styles.stickyHeader, {
                               backgroundColor,
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
          )
          : null
        }
      </View>
    );
  }

  getScrollResponder() {
    return this.refs.ListView.getScrollResponder();
  }
}

ParallaxListView.propTypes = IPropTypes;

ParallaxListView.defaultProps = {
  backgroundColor: '#000',
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
    backgroundColor: '#000',
    position: 'absolute',
    overflow: 'hidden',
    top: 0,
    left: 0,
    width: window.width
  },
  listView: {
    backgroundColor: 'transparent'
  }
});

module.exports = ParallaxListView;
