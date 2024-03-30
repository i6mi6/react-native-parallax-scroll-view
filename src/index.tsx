import React, {Component} from 'react'
import {
	Animated,
	ColorValue,
	Dimensions,
	ScrollView,
	StyleProp,
	ViewStyle,
	View,
	NativeScrollEvent,
	NativeSyntheticEvent,
} from 'react-native'

import styles from './styles'

const window = Dimensions.get('window')

const pivotPoint = (a: number, b: number) => a - b

const renderScroll = (props: Animated.AnimatedProps<any>) => <Animated.ScrollView {...props} />

const renderEmpty = () => <View />

const noRender = () => <View style={{ display: 'none' }} />

// Override `toJSON` of interpolated value because of
// an error when serializing style on view inside inspector.
// See: https://github.com/jaysoo/react-native-parallax-scroll-view/issues/23
const interpolate = (value: Animated.Value, opts: {inputRange: number[];
	outputRange: number[] | string[];
	easing?: ((input: number) => number) | undefined;
	extrapolate?: Animated.ExtrapolateType | undefined;
	extrapolateLeft?: Animated.ExtrapolateType | undefined;
	extrapolateRight?: Animated.ExtrapolateType | undefined;}) => {
	const x = value.interpolate(opts)

	// We have to play to make TypeScript happy
	const xAny = x as any
	xAny.toJSON = () => xAny.__getValue() as number

	// We want the return type to still make sense from the value.interpolate function
	return xAny as typeof x
}

// Properties that we set the defaults on
type ParallaxScrollViewDefaultProps = {
	backgroundColor: string | ColorValue
	backgroundScrollSpeed: number
	contentBackgroundColor: string | ColorValue
	fadeOutForeground: boolean
	fadeOutBackground: boolean
	onChangeHeaderVisibility: (isVisible: boolean) => void
	renderBackground: () => React.ReactElement
	renderContentBackground: () => React.ReactElement
	renderFixedHeader: () => React.ReactElement
	renderScrollComponent: (props: Animated.AnimatedProps<React.ComponentPropsWithRef<any>>) => React.ReactElement
	outputScaleValue: number
}

// Properties accepted by `ParallaxScrollView`.
export type ParallaxScrollViewProps = {
	parallaxHeaderHeight: number
	renderForeground: () => React.ReactElement
	renderStickyHeader?: () => React.ReactElement
	stickyHeaderHeightEx?: number
	contentContainerStyle?: StyleProp<ViewStyle>
	parallaxHeaderContainerStyle?: StyleProp<ViewStyle>
	parallaxHeaderStyle?: StyleProp<ViewStyle>
	backgroundImageStyle?: StyleProp<ViewStyle>
	stickyHeaderStyle?: StyleProp<ViewStyle>
	style?: StyleProp<ViewStyle>
	scrollEvent?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void
} & Partial<ParallaxScrollViewDefaultProps>

type InternalParallaxScrollViewProps = ParallaxScrollViewProps & ParallaxScrollViewDefaultProps & {
	stickyHeaderHeight: number
	onScroll: (e: any) => void
}

type ParallaxScrollViewState = {
	viewHeight: number
	viewWidth: number
}

class ParallaxScrollView extends Component<React.PropsWithChildren<InternalParallaxScrollViewProps>, ParallaxScrollViewState> {
	private scrollY = new Animated.Value(0)
	private _footerComponent = { setNativeProps(props: any) { } } // Initial stub
	private _footerHeight = 0
	private scrollViewRef = React.createRef<ScrollView>()

	static defaultProps: ParallaxScrollViewDefaultProps = {
		backgroundColor: '#000',
		backgroundScrollSpeed: 5,
		contentBackgroundColor: '#fff',
		fadeOutForeground: true,
		fadeOutBackground: false,
		onChangeHeaderVisibility: () => { },
		renderBackground: renderEmpty,
		renderContentBackground: noRender,
		renderFixedHeader: () => <View />,
		renderScrollComponent: renderScroll,
		outputScaleValue: 5,
	}

	constructor(props: React.PropsWithChildren<InternalParallaxScrollViewProps>) {
		super(props)
		if (props.renderStickyHeader && props.stickyHeaderHeightEx === undefined) {
			console.warn(
				'Property `stickyHeaderHeight` must be set if `renderStickyHeader` is used.'
			)
		}
		this.state = {
			viewHeight: window.height,
			viewWidth: window.width
		}
	}

	animatedEvent = Animated.event(
		[{ nativeEvent: { contentOffset: { y: this.scrollY } } }],
		{ useNativeDriver: true }
	)

	render() {
		const {
			backgroundColor,
			backgroundScrollSpeed,
			children,
			contentBackgroundColor,
			fadeOutForeground,
			fadeOutBackground,
			parallaxHeaderHeight,
			renderBackground,
			renderContentBackground,
			renderFixedHeader,
			renderForeground,
			renderScrollComponent,
			renderStickyHeader,
			stickyHeaderHeight,
			style,
			contentContainerStyle,
			outputScaleValue,
			...scrollViewProps
		} = this.props

		const background = this._renderBackground({
			fadeOutBackground,
			backgroundScrollSpeed,
			backgroundColor,
			parallaxHeaderHeight,
			stickyHeaderHeight,
			renderBackground,
			outputScaleValue
		})
		const foreground = this._renderForeground({
			fadeOutForeground,
			parallaxHeaderHeight,
			stickyHeaderHeight,
			renderForeground
		})
		const bodyComponent = this._wrapChildren(children, {
			contentBackgroundColor,
			stickyHeaderHeight,
			renderContentBackground,
			contentContainerStyle
		})
		const footerSpacer = this._renderFooterSpacer({ contentBackgroundColor })
		const maybeStickyHeader = this._maybeRenderStickyHeader({
			parallaxHeaderHeight,
			stickyHeaderHeight,
			backgroundColor,
			renderFixedHeader,
			renderStickyHeader
		})
		const scrollElement = renderScrollComponent(scrollViewProps)
		return (
			<View
				style={[style, styles.container]}
				onLayout={e => this._maybeUpdateViewDimensions(e)}
			>
				{background}
				{React.cloneElement(
					scrollElement,
					{
						ref: this.scrollViewRef,
						style: [styles.scrollView, scrollElement.props.style],
						scrollEventThrottle: 1,
						// Using Native Driver greatly optimizes performance
						onScroll: Animated.event(
							[{ nativeEvent: { contentOffset: { y: this.scrollY } } }],
							{ useNativeDriver: true, listener: this._onScroll.bind(this) }
						)
						// onScroll: this._onScroll.bind(this)
					},
					foreground,
					bodyComponent,
					footerSpacer
				)}
				{maybeStickyHeader}
			</View>
		)
	}

	/*
   * Expose `ScrollView` API so this component is composable with any component that expects a `ScrollView`.
   */
	getScrollResponder() {
		return this.scrollViewRef.current?.getScrollResponder()
	}
	getScrollableNode() {
		return this.scrollViewRef.current?.getScrollableNode()
	}
	getInnerViewNode() {
		return this.scrollViewRef.current?.getInnerViewNode()
	}
	scrollTo(...args: any) {
		this.scrollViewRef.current?.scrollTo(...args)
	}
	setNativeProps(props: object) {
		this.scrollViewRef.current?.setNativeProps(props)
	}

	/*
   * Private helpers
   */

	_onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
		const {
			parallaxHeaderHeight,
			stickyHeaderHeight,
			onChangeHeaderVisibility,
			onScroll: prevOnScroll = () => { }
		} = this.props
		this.props.scrollEvent && this.props.scrollEvent(e)
		const p = pivotPoint(parallaxHeaderHeight, stickyHeaderHeight)

		// This optimization wont run, since we update the animation value directly in onScroll event
		// this._maybeUpdateScrollPosition(e)

		if (e.nativeEvent.contentOffset.y >= p) {
			onChangeHeaderVisibility(false)
		} else {
			onChangeHeaderVisibility(true)
		}

		prevOnScroll(e)
	}

	// This optimizes the state update of current scrollY since we don't need to
	// perform any updates when user has scrolled past the pivot point.
	_maybeUpdateScrollPosition(e: NativeSyntheticEvent<NativeScrollEvent>) {
		const { parallaxHeaderHeight, stickyHeaderHeight } = this.props
		const { scrollY } = this
		const { nativeEvent: { contentOffset: { y: offsetY } } } = e
		const p = pivotPoint(parallaxHeaderHeight, stickyHeaderHeight)
		// @ts-ignore getting the internal value of scrollY
		const syv: number = scrollY._value
		if (offsetY <= p || syv <= p) {
			scrollY.setValue(offsetY)
		}
	}

	_maybeUpdateViewDimensions(e: any) {
		const { nativeEvent: { layout: { width, height } } } = e

		if (width !== this.state.viewWidth || height !== this.state.viewHeight) {
			this.setState({
				viewWidth: width,
				viewHeight: height
			})
		}
	}

	_renderBackground({
		fadeOutBackground,
		backgroundScrollSpeed,
		backgroundColor,
		parallaxHeaderHeight,
		stickyHeaderHeight,
		renderBackground,
		outputScaleValue
	}: {
		fadeOutBackground: boolean;
		backgroundScrollSpeed: number;
		backgroundColor: string | ColorValue;
		parallaxHeaderHeight: number;
		stickyHeaderHeight: number;
		renderBackground: () => React.ReactElement;
		outputScaleValue: number
	}) {
		const { viewWidth, viewHeight } = this.state
		const { scrollY } = this
		const p = pivotPoint(parallaxHeaderHeight, stickyHeaderHeight)
		return (
			<Animated.View
				style={[
					styles.backgroundImage,
					((this.props.backgroundImageStyle)?this.props.backgroundImageStyle:null),
					{
						backgroundColor: backgroundColor,
						height: parallaxHeaderHeight,
						width: viewWidth,
						opacity: fadeOutBackground
							? interpolate(scrollY, {
								inputRange: [0, p * (1 / 2), p * (3 / 4), p],
								outputRange: [1, 0.3, 0.1, 0],
								extrapolate: 'clamp'
							})
							: 1,
						transform: [
							{
								translateY: interpolate(scrollY, {
									inputRange: [0, p],
									outputRange: [0, -(p / backgroundScrollSpeed)],
									extrapolateRight: 'extend',
									extrapolateLeft: 'clamp'
								})
							},
							{
								scale: interpolate(scrollY, {
									inputRange: [-viewHeight, 0],
									outputRange: [outputScaleValue * 1.5, 1],
									extrapolate: 'clamp'
								})
							}
						]
					}
				]}
			>
				<View>
					{renderBackground()}
				</View>
			</Animated.View>
		)
	}

	_renderForeground({
		fadeOutForeground,
		parallaxHeaderHeight,
		stickyHeaderHeight,
		renderForeground
	}: {
		fadeOutForeground: boolean;
		parallaxHeaderHeight: number;
		stickyHeaderHeight: number;
		renderForeground: () => React.ReactElement
	}) {
		const { scrollY } = this
		const p = pivotPoint(parallaxHeaderHeight, stickyHeaderHeight)
		return (
			<View style={[
				styles.parallaxHeaderContainer,
				(this.props.parallaxHeaderContainerStyle)?this.props.parallaxHeaderContainerStyle:null
			]}>
				<Animated.View
					style={[
						styles.parallaxHeader,
						((this.props.parallaxHeaderStyle)?this.props.parallaxHeaderStyle:null),
						{
							height: parallaxHeaderHeight,
							opacity: fadeOutForeground
								? interpolate(scrollY, {
									inputRange: [0, p * (1 / 2), p * (3 / 4), p],
									outputRange: [1, 0.3, 0.1, 0],
									extrapolate: 'clamp'
								})
								: 1
						}
					]}
				>
					<View style={{ height: parallaxHeaderHeight }}>
						{renderForeground()}
					</View>
				</Animated.View>
			</View>
		)
	}

	_wrapChildren(
		children: React.ReactNode,
		{ contentBackgroundColor, stickyHeaderHeight, contentContainerStyle, renderContentBackground }: {contentBackgroundColor: string | ColorValue, stickyHeaderHeight: number, contentContainerStyle?: StyleProp<ViewStyle>, renderContentBackground: () => React.ReactElement}
	) {
		const { viewHeight } = this.state
		const containerStyles: StyleProp<ViewStyle>[] = [{ backgroundColor: contentBackgroundColor }]

		if (contentContainerStyle) containerStyles.push(contentContainerStyle)

		let containerHeight = this.state.viewHeight;

		React.Children.forEach(children, (item) => {
			if (item && Object.keys(item).length != 0) {
				containerHeight = 0;
			}
		});

		return (
			<View
				style={[containerStyles, { minHeight: containerHeight }]}
				onLayout={e => {
					// Adjust the bottom height so we can scroll the parallax header all the way up.
					const { nativeEvent: { layout: { height } } } = e
					const footerHeight = Math.max(
						0,
						viewHeight - height - stickyHeaderHeight
					)
					if (this._footerHeight !== footerHeight) {
						this._footerComponent.setNativeProps({
							style: { height: footerHeight }
						})
						this._footerHeight = footerHeight
					}
				}}
			>
				{renderContentBackground()}
				{children}
			</View>
		)
	}

	_renderFooterSpacer({ contentBackgroundColor }: { contentBackgroundColor: string | ColorValue }) {
		return (
			<View
				ref={ref => {
					if (ref) {
						this._footerComponent = ref;
					}
				}}
				style={{ backgroundColor: contentBackgroundColor }}
			/>
		)
	}

	_maybeRenderStickyHeader({
		parallaxHeaderHeight,
		stickyHeaderHeight,
		backgroundColor,
		renderFixedHeader,
		renderStickyHeader
	} :{
		parallaxHeaderHeight: number;
		stickyHeaderHeight: number;
		backgroundColor: string | ColorValue;
		renderFixedHeader?: () => React.ReactElement;
		renderStickyHeader?: () => React.ReactElement;
	}) {
		const { viewWidth } = this.state
		const { scrollY } = this
		if (renderStickyHeader || renderFixedHeader) {
			const p = pivotPoint(parallaxHeaderHeight, stickyHeaderHeight)
			return (
				<View
					style={[
						styles.stickyHeader,
						((this.props.stickyHeaderStyle)?this.props.stickyHeaderStyle:null),
						{
							width: viewWidth,
							...(stickyHeaderHeight ? { height: stickyHeaderHeight } : null)
						}
					]}
				>
					{renderStickyHeader
						? <Animated.View
							style={{
								backgroundColor: backgroundColor,
								height: stickyHeaderHeight,
								opacity: interpolate(scrollY, {
									inputRange: [0, p],
									outputRange: [0, 1],
									extrapolate: 'clamp'
								})
							}}
						>
							<Animated.View
								style={{
									transform: [
										{
											translateY: interpolate(scrollY, {
												inputRange: [0, p],
												outputRange: [stickyHeaderHeight, 0],
												extrapolate: 'clamp'
											})
										}
									]
								}}
							>
								{renderStickyHeader()}
							</Animated.View>
						</Animated.View>
						: null}
					{renderFixedHeader && renderFixedHeader()}
				</View>
			)
		} else {
			return null
		}
	}
}

export default ParallaxScrollView
