import {
	Bed,
	EscalatorDown,
	EscalatorUp,
	Fire,
	Footprints,
	ForkKnife,
	Headphones,
	Heart,
	Heartbeat,
	PersonSimple,
	PersonSimpleBike,
	PersonSimpleSwim,
	PersonSimpleWalk,
	Ruler,
	Stairs,
	Thermometer,
	YinYang,
} from "@phosphor-icons/react";

type HealthIconProps = {
	type: string;
};

const getIcon = (type: string) => {
	if (type.includes("Body") || type.includes("Stand")) {
		return <PersonSimple />;
	}
	if (type.includes("Walking")) {
		return <PersonSimpleWalk />;
	}
	if (type.includes("StepCount")) {
		return <Footprints />;
	}
	if (type.includes("Swimming")) {
		return <PersonSimpleSwim />;
	}
	if (type.includes("StairAscent")) {
		return <EscalatorUp />;
	}
	if (type.includes("StairDescent")) {
		return <EscalatorDown />;
	}
	if (type.includes("WaterTemperature")) {
		return <Thermometer />;
	}
	if (type.includes("Dietary")) {
		return <ForkKnife />;
	}
	if (type.includes("FlightsClimbed")) {
		return <Stairs />;
	}
	if (type.includes("Exercise") || type.includes("Energy")) {
		return <Fire />;
	}
	if (type.includes("Cycling")) {
		return <PersonSimpleBike />;
	}
	if (type.includes("Audio") || type.includes("Sound")) {
		return <Headphones />;
	}
	if (type.includes("HeartRate")) {
		return <Heartbeat />;
	}
	if (type.includes("Height")) {
		return <Ruler />;
	}
	if (type.includes("Sleep")) {
		return <Bed />;
	}
	if (type.includes("Mindful")) {
		return <YinYang />;
	}

	return <Heart />;
};

export const HealthIcon = ({ type }: HealthIconProps) => {
	return getIcon(type);
};
