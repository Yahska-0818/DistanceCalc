import { useState, useEffect, useCallback } from "react";
import InputField from "./InputField";
import { extractLatLngFromGoogleMapsUrl } from "../utils/parser";

const Calculator = () => {
	const [coords, setCoords] = useState({
		lat1: "",
		lon1: "",
		lat2: "",
		lon2: "",
	});
	const [links, setLinks] = useState({ link1: "", link2: "" });
	const [linkStatus, setLinkStatus] = useState({ link1: null, link2: null });
	const [errors, setErrors] = useState({});
	const [distance, setDistance] = useState(null);
	const [isCalculating, setIsCalculating] = useState(false);
	const [segments, setSegments] = useState([]);

	const validate = useCallback((name, value) => {
		if (value === "") return null;
		const num = parseFloat(value);
		if (isNaN(num)) return "Required";
		if (name.includes("lat") && (num < -90 || num > 90))
			return "Between -90 and 90";
		if (name.includes("lon") && (num < -180 || num > 180))
			return "Between -180 and 180";
		return null;
	}, []);

	const calculateHaversine = useCallback((currentCoords) => {
		setIsCalculating(true);

		setTimeout(() => {
			const toRad = (val) => (val * Math.PI) / 180;
			const R = 6371;

			const lat1 = parseFloat(currentCoords.lat1);
			const lon1 = parseFloat(currentCoords.lon1);
			const lat2 = parseFloat(currentCoords.lat2);
			const lon2 = parseFloat(currentCoords.lon2);

			const dLat = toRad(lat2 - lat1);
			const dLon = toRad(lon2 - lon1);

			const a =
				Math.sin(dLat / 2) * Math.sin(dLat / 2) +
				Math.cos(toRad(lat1)) *
					Math.cos(toRad(lat2)) *
					Math.sin(dLon / 2) *
					Math.sin(dLon / 2);

			const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
			const result = R * c;

			setDistance(result.toFixed(2));
			setIsCalculating(false);
		}, 300);
	}, []);

	useEffect(() => {
		const isReady =
			Object.values(coords).every((val) => val !== "") &&
			Object.keys(errors).every((key) => !errors[key]);

		if (
			isReady &&
			linkStatus.link1 !== "error" &&
			linkStatus.link2 !== "error"
		) {
			const timeoutId = setTimeout(() => {
				calculateHaversine(coords);
			}, 100);
			return () => clearTimeout(timeoutId);
		}
	}, [coords, errors, linkStatus.link1, linkStatus.link2, calculateHaversine]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setCoords((prev) => ({ ...prev, [name]: value }));

		const error = validate(name, value);
		setErrors((prev) => ({ ...prev, [name]: error }));

		setDistance(null);
	};

	const handleLinkChange = (e, pointNum) => {
		const url = e.target.value;
		const linkKey = `link${pointNum}`;

		setLinks((prev) => ({ ...prev, [linkKey]: url }));
		setDistance(null);

		if (!url.trim()) {
			setLinkStatus((prev) => ({ ...prev, [linkKey]: null }));
			return;
		}

		const extracted = extractLatLngFromGoogleMapsUrl(url);

		if (extracted) {
			setCoords((prev) => ({
				...prev,
				[`lat${pointNum}`]: extracted.lat,
				[`lon${pointNum}`]: extracted.lng,
			}));
			setLinkStatus((prev) => ({ ...prev, [linkKey]: "success" }));
			setErrors((prev) => ({
				...prev,
				[`lat${pointNum}`]: null,
				[`lon${pointNum}`]: null,
			}));
		} else {
			setLinkStatus((prev) => ({ ...prev, [linkKey]: "error" }));
		}
	};

	const handleAddSegment = () => {
		if (!distance) return;

		setSegments((prev) => [
			...prev,
			{
				id: Date.now(),
				distance: distance,
			},
		]);

		setCoords((prev) => ({
			lat1: prev.lat2,
			lon1: prev.lon2,
			lat2: "",
			lon2: "",
		}));
		setLinks({ link1: "", link2: "" });
		setLinkStatus({ link1: null, link2: null });
		setDistance(null);
	};

	const clearRoute = () => {
		setSegments([]);
		setCoords({ lat1: "", lon1: "", lat2: "", lon2: "" });
		setLinks({ link1: "", link2: "" });
		setLinkStatus({ link1: null, link2: null });
		setDistance(null);
	};

	const totalDistance = segments
		.reduce((acc, seg) => acc + parseFloat(seg.distance), 0)
		.toFixed(2);

	return (
		<div className="w-full max-w-lg bg-[#0a0a0a] border border-gray-800/60 rounded-2xl p-8 shadow-2xl shadow-black/50">
			<div className="mb-8 flex justify-between items-start">
				<div>
					<h2 className="text-xl font-semibold tracking-tight text-white mb-1">
						Route Builder
					</h2>
					<p className="text-sm text-gray-400">
						Chain points together to calculate total distance.
					</p>
				</div>
				{segments.length > 0 && (
					<button
						onClick={clearRoute}
						className="text-xs font-medium text-gray-500 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-red-400/10"
					>
						Clear Route
					</button>
				)}
			</div>

			<div className="space-y-8">
				<div className="space-y-4">
					<h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
						Point A<div className="h-px bg-gray-800 flex-1"></div>
					</h3>
					<InputField
						type="text"
						label="Google Maps Link"
						name="link1"
						value={links.link1}
						onChange={(e) => handleLinkChange(e, 1)}
						error={linkStatus.link1 === "error" ? "Invalid link" : null}
						success={linkStatus.link1 === "success" ? "Extracted" : null}
						placeholder="https://goo.gl/maps/..."
					/>
					<div className="flex gap-4">
						<InputField
							label="Latitude"
							name="lat1"
							value={coords.lat1}
							onChange={handleChange}
							error={errors.lat1}
							placeholder="37.7749"
							disabled={linkStatus.link1 === "success"}
						/>
						<InputField
							label="Longitude"
							name="lon1"
							value={coords.lon1}
							onChange={handleChange}
							error={errors.lon1}
							placeholder="-122.4194"
							disabled={linkStatus.link1 === "success"}
						/>
					</div>
				</div>

				<div className="space-y-4">
					<h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
						Point B<div className="h-px bg-gray-800 flex-1"></div>
					</h3>
					<InputField
						type="text"
						label="Google Maps Link"
						name="link2"
						value={links.link2}
						onChange={(e) => handleLinkChange(e, 2)}
						error={linkStatus.link2 === "error" ? "Invalid link" : null}
						success={linkStatus.link2 === "success" ? "Extracted" : null}
						placeholder="https://goo.gl/maps/..."
					/>
					<div className="flex gap-4">
						<InputField
							label="Latitude"
							name="lat2"
							value={coords.lat2}
							onChange={handleChange}
							error={errors.lat2}
							placeholder="34.0522"
							disabled={linkStatus.link2 === "success"}
						/>
						<InputField
							label="Longitude"
							name="lon2"
							value={coords.lon2}
							onChange={handleChange}
							error={errors.lon2}
							placeholder="-118.2437"
							disabled={linkStatus.link2 === "success"}
						/>
					</div>
				</div>

				<div className="pt-2">
					<button
						onClick={handleAddSegment}
						disabled={!distance || isCalculating}
						className="w-full bg-white text-black font-medium py-2.5 rounded-lg transition-all hover:bg-gray-100 disabled:bg-gray-900 disabled:text-gray-600 active:scale-[0.98] flex justify-center items-center h-11"
					>
						{isCalculating ? (
							<div className="w-4 h-4 border-2 border-gray-400 border-t-black rounded-full animate-spin" />
						) : distance ? (
							<div className="flex items-center gap-2">
								<span>Add Segment to Route</span>
								<span className="text-xs bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full font-bold">
									+{distance} km
								</span>
							</div>
						) : (
							"Enter Coordinates to Continue"
						)}
					</button>
				</div>

				{segments.length > 0 && (
					<div className="mt-8 pt-6 border-t border-gray-800/50 animate-in fade-in slide-in-from-bottom-2 duration-300">
						<h3 className="text-sm font-medium text-white mb-4">
							Route Aggregator
						</h3>
						<div className="space-y-2 mb-4 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
							{segments.map((seg, index) => (
								<div
									key={seg.id}
									className="flex justify-between items-center text-sm py-2 px-3 bg-gray-900/40 rounded-lg border border-gray-800/50"
								>
									<span className="text-gray-400">Segment {index + 1}</span>
									<span className="text-gray-200 font-medium">
										{seg.distance} km
									</span>
								</div>
							))}
						</div>
						<div className="flex justify-between items-center p-4 bg-gray-900/80 rounded-xl border border-gray-700">
							<span className="text-sm font-medium text-gray-400">
								Total Path Distance
							</span>
							<div className="flex items-baseline gap-1">
								<span className="text-2xl font-semibold tracking-tight text-white">
									{totalDistance}
								</span>
								<span className="text-gray-400 font-medium">km</span>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default Calculator;
