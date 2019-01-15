import * as React from 'react';
import { ScrollViewProps } from 'react-native';

declare class ParallaxScrollView extends React.Component<ParallaxScrollViewProps, {}> {

}

export interface ParallaxScrollViewProps extends ScrollViewProps {
    backgroundScrollSpeed?: number;
    backgroundColor?: string;
    contentBackgroundColor?: string;
    fadeOutForeground?: boolean;
    onChangeHeaderVisibility?: (value: boolean) => void;
    renderScrollComponent?: (props: any) => JSX.Element;
    renderBackground?: (params: RenderBackgroundParams) => JSX.Element;
    renderForeground?: () => JSX.Element;
    renderFixedHeader?: () => JSX.Element;
    renderStickyHeader?: () => JSX.Element;
    stickyHeaderHeight?: number;
    contentContainerStyle?: any;
    outputScaleValue?: number;
    style?: any;
    parallaxHeaderHeight?: number;
}

export class RenderBackgroundParams {
    fadeOutForeground: any;
    backgroundScrollSpeed: number;
    backgroundColor: string;
    parallaxHeaderHeight: number;
    stickyHeaderHeight: number;
    renderBackground: () => void;
    outputScaleValue: number;
}

export default ParallaxScrollView;
