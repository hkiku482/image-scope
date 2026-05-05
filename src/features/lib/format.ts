export const formatResolutionPart = (value: number) =>
	value > 99999 ? ">99999" : String(value);

export const formatResolution = (resolution: {
	width: number;
	height: number;
}) =>
	`${formatResolutionPart(resolution.width)}x${formatResolutionPart(
		resolution.height,
	)}`;

export const formatZoom = (scale: number) => {
	const percent = Math.round(scale * 100);
	return percent > 9999 ? ">9999%" : `${percent}%`;
};
