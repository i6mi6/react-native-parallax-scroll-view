export default interface ParallaxScrollView {
    backgroundScrollSpeed?: number;
    backgroundColor?: string;
    contentBackgroundColor?: string;
    fadeOutForeground?: boolean;
    onChangeHeaderVisibility?: (value: boolean) => void;
    renderScrollComponent?: (props: any) => any;
    renderBackground(params: RenderBackgroundParams);
    renderForeground: () => any;
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