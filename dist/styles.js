"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_native_1 = require("react-native");
const styles = react_native_1.StyleSheet.create({
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
        overflow: 'hidden',
        top: 0
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
exports.default = styles;
