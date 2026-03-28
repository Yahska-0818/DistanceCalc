export const extractLatLngFromGoogleMapsUrl = (url) => {
	if (!url || typeof url !== "string") return null;

	const atRegex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
	const queryRegex = /[?&](?:ll|q|query)=(-?\d+\.\d+),(-?\d+\.\d+)/;

	const match = url.match(atRegex) || url.match(queryRegex);

	if (match && match.length >= 3) {
		return {
			lat: match[1],
			lng: match[2],
		};
	}
	return null;
};
