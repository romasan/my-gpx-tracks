export const HSLToRGB = ([h, s, l]) => {
	if (h < 0 || h > 360 || s < 0 || s > 100 || l < 0 || l > 100) {
		return [0, 0, 0];
	}

	s /= 100;
	l /= 100;

	if (s === 0) {
		const value = Math.round(l * 255);

		return [value, value, value];
	}

	const c = (1 - Math.abs(2 * l - 1)) * s;
	const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
	const m = l - c / 2;

	let rgb;

	if (h >= 0 && h < 60) {
		rgb = [c, x, 0];
	} else if (h >= 60 && h < 120) {
		rgb = [x, c, 0];
	} else if (h >= 120 && h < 180) {
		rgb = [0, c, x];
	} else if (h >= 180 && h < 240) {
		rgb = [0, x, c];
	} else if (h >= 240 && h < 300) {
		rgb = [x, 0, c];
	} else if (h >= 300 && h <= 360) {
		rgb = [c, 0, x];
	}

	const [r, g, b] = rgb || [0, 0, 0];

	return [
		Math.round((r + m) * 255),
		Math.round((g + m) * 255),
		Math.round((b + m) * 255),
	];
};

export const RGBToHEX = ([r, g, b]) => '#' +
	r.toString(16).padStart(2, '0') +
	g.toString(16).padStart(2, '0') +
	b.toString(16).padStart(2, '0');

export const getColorHeat = (v, angle = 359) => {
	const h = v * angle;
	const hsl = [h, 100, 50];
	const rgb = HSLToRGB(hsl);

	return RGBToHEX(rgb);
};

export const getGradient = (length) => Array(length)
	.fill(null)
	.map((_,i,a) => getColorHeat((1 / a.length) * i));
