const React = require('react-native');
const {
  AppRegistry,
  Component,
  Dimensions,
  Image,
  ListView,
  PixelRatio,
  StyleSheet,
  StatusBarIOS,
  Text,
  View,
} = React;

class Example extends Component {
  constructor(props) {
    super(props);

    StatusBarIOS.setHidden(true);

    const dataBlob = [{
      speaker: 'Rich Hickey',
      title: 'Creator of Clojure',
      talks: [
        'Simplicity Matters',
        'Value of Values'
      ]
    }];

    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
      getSectionHeaderData: (data, sectionIdx) => data[sectionIdx],
      getRowData: (data, sectionIdx, rowIdx) => data[sectionIdx].talks[rowIdx]
  });

    this.state =  {
      dataSource: ds.cloneWithRowsAndSections(dataBlob, [0], [[0, 1]])
    };
  }

  render() {
    return (
      <ListView
        style={styles.container}
        dataSource={ this.state.dataSource }
        renderSectionHeader={ (sectionData, sectionID) => (
          <View style={ styles.sectionHeader }>
            <Image style={ styles.sectionBackground }
                   source={{
                     uri: 'https://i.ytimg.com/vi/P-NZei5ANaQ/maxresdefault.jpg',
                     width: window.width,
                     height: SECTION_HEADER_HEIGHT
                   }}/>
            <View style={ styles.sectionBackgroundOverlay }/>
            <View style={ styles.sectionHeaderContent }>
              <Image style={ styles.avatar } source={{
                uri: 'https://pbs.twimg.com/profile_images/2694242404/5b0619220a92d391534b0cd89bf5adc1_400x400.jpeg',
                width: AVATAR_SIZE,
                height: AVATAR_SIZE
              }}/>
              <Text style={ styles.sectionSpeakerText }>
                { sectionData.speaker }
              </Text>
              <Text style={ styles.sectionTitleText }>
                { sectionData.title }
              </Text>
            </View>
          </View>
        ) }
        renderRow={ rowData => (
          <View style={ styles.row }>
            <Text style={ styles.rowText }>
              { rowData }
            </Text>
          </View>
         ) }
        rowHeight={40}
      />
    );
  }
}

const window = Dimensions.get('window');

const SECTION_HEADER_HEIGHT = 300;
const AVATAR_SIZE = 120;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionHeader: {
    backgroundColor: 'transparent',
    height: SECTION_HEADER_HEIGHT
  },
  sectionBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: window.width,
    height: SECTION_HEADER_HEIGHT
  },
  sectionBackgroundOverlay: {
    position: 'absolute',
    opacity: 0.6,
    backgroundColor: 'black',
    top: 0,
    left: 0,
    width: window.width,
    height: SECTION_HEADER_HEIGHT
  },
  sectionHeaderContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'column',
    paddingTop: 60
  },
  avatar: {
    marginBottom: 10,
    borderRadius: AVATAR_SIZE / PixelRatio.get()
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
    paddingVertical: 5,
    paddingHorizontal: 10,
    height: 40
  },
  rowText: {
    fontSize: 20
  }
});

AppRegistry.registerComponent('Example', () => Example);
