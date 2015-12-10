import React, {
  Component,
  Dimensions,
  Image,
  ListView,
  PixelRatio,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import ParallaxListView from 'react-native-parallax-listview';

class Example extends Component {
  constructor(props) {
    super(props);

    const dataBlob = [{
      speaker: 'Rich Hickey',
      talks: [
        'Simplicity Matters',
        'Hammock Driven Development',
        'Value of Values',
        'Are We There Yet?',
        'The Language of the System',
        'Design, Composition, and Performance',
        'Clojure core.async',
        'The Functional Database',
        'Deconstructing the Database'
      ]
    }];

    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
      getSectionHeaderData: (data, sectionIdx) => data[sectionIdx],
      getRowData: (data, sectionIdx, rowIdx) => data[sectionIdx].talks[rowIdx]
    });

    const second = (a, b) => b;

    this.state =  {
      dataSource: ds.cloneWithRowsAndSections(dataBlob, dataBlob.map(second), dataBlob.map(v => v.talks.map(second)))
    };
  }

  render() {
    return (
      <ParallaxListView
        style={styles.container}
        dataSource={ this.state.dataSource }

        // Parallax options
        backgroundColor="#333"
        rowHeight={ ROW_HEIGHT }
        stickyHeaderHeight={ STICKY_HEADER_HEIGHT }
        parallaxHeaderHeight={ PARALLAX_HEADER_HEIGHT }

        renderBackground={() => (
          <View>
            <Image source={{uri: 'https://i.ytimg.com/vi/P-NZei5ANaQ/maxresdefault.jpg',
                            width: window.width,
                            height: PARALLAX_HEADER_HEIGHT}}/>
            <View style={{position: 'absolute',
                          top: 0,
                          width: window.width,
                          backgroundColor: 'rgba(0,0,0,.4)',
                          height: PARALLAX_HEADER_HEIGHT}}/>
          </View>
        )}

        renderStickyHeader={() => (
          <View style={styles.stickySection}>
            <Text style={styles.stickySectionText}>Rich Hickey Talks</Text>
          </View>
        )}

        renderFixedHeader={() => (
          <View style={styles.fixedSection}>
            <Text style={styles.fixedSectionText} onPress={() => console.log('Pressed')}>DEMO</Text>
          </View>
        )}

        renderParallaxHeader={() => (
          <View style={ styles.parallaxHeader }>
            <Image style={ styles.avatar } source={{
              uri: 'https://pbs.twimg.com/profile_images/2694242404/5b0619220a92d391534b0cd89bf5adc1_400x400.jpeg',
              width: AVATAR_SIZE,
              height: AVATAR_SIZE
            }}/>
            <Text style={ styles.sectionSpeakerText }>
              Talks by Rich Hickey
            </Text>
            <Text style={ styles.sectionTitleText }>
              CTO of Cognitec, Creator of Clojure
            </Text>
          </View>
        )}

        renderRow={ rowData => (
          <View style={ styles.row }>
            <Text style={ styles.rowText }>
              { rowData }
            </Text>
          </View>
         ) }
      />
    );
  }
}

const window = Dimensions.get('window');

const AVATAR_SIZE = 120;
const ROW_HEIGHT = 50;
const PARALLAX_HEADER_HEIGHT = 300;
const STICKY_HEADER_HEIGHT = 70;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black'
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: window.width,
    height: PARALLAX_HEADER_HEIGHT
  },
  stickySection: {
    height: STICKY_HEADER_HEIGHT,
    width: 300,
    justifyContent: 'flex-end'
  },
  stickySectionText: {
    color: 'white',
    fontSize: 20,
    margin: 10
  },
  fixedSection: {
    position: 'absolute',
    bottom: 10,
    right: 10
  },
  fixedSectionText: {
    color: '#777',
    fontSize: 20
  },
  parallaxHeader: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'column',
    paddingTop: 80
  },
  avatar: {
    marginBottom: 10,
    borderRadius: AVATAR_SIZE / 2
  },
  sectionSpeakerText: {
    color: 'white',
    fontSize: 24,
    paddingVertical: 5
  },
  sectionTitleText: {
    color: 'white',
    fontSize: 18,
    paddingVertical: 5
  },
  row: {
    paddingHorizontal: 10,
    height: ROW_HEIGHT,
    backgroundColor: 'white',
    borderColor: '#ccc',
    borderBottomWidth: 1,
    justifyContent: 'center'
  },
  rowText: {
    fontSize: 20
  }
});

export default Example;
