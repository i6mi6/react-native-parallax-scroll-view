import * as React from 'react';

declare class ParallaxScrollView extends React.Component<ParallaxScrollViewProps, {}> {

}

export interface ParallaxScrollViewProps {
    backgroundScrollSpeed?: number;
    backgroundColor?: string;
    contentBackgroundColor?: string;
    fadeOutForeground?: boolean;
    onChangeHeaderVisibility?: (value: boolean) => void;
    renderScrollComponent?: (props: any) => any;
    renderBackground?: (params: RenderBackgroundParams) => JSX.Element;
    renderForeground?: () => any;
    stickyHeaderHeight?: number;
    contentContainerStyle?: any;
    outputScaleValue?: number;
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