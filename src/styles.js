const StyleSheet = require('react-native').StyleSheet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  parallaxHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    overflow: 'hidden'
  },
  parallaxContent: {
    overflow: 'hidden'
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    backgroundColor: 'transparent',
    overflow: 'hidden'
  },
  stickyHeader: {
    backgroundColor: 'transparent',
    position: 'absolute',
    overflow: 'hidden',
    top: 0,
    left: 0
  },
  scrollView: {
    backgroundColor: 'transparent'
  }
});

module.exports = styles;
