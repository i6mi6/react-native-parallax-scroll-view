import {JSX} from 'react';

export interface ParallaxScrollViewProps {
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

export interface RenderBackgroundParams {
    fadeOutForeground: any;
    backgroundScrollSpeed: number;
    backgroundColor: string;
    parallaxHeaderHeight: number;
    stickyHeaderHeight: number;
    renderBackground: () => void;
    outputScaleValue: number;
}
