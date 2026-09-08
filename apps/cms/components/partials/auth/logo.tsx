"use client";
import Image from "next/image";
import {useEffect, useState} from "react";

interface LogoProps {
	className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "w-44 sm:w-56 h-auto object-contain" }) => {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return <div className="w-44 sm:w-56 h-14" />; // Placeholder to avoid hydration mismatch
	}

	return (
		<div className="inline-block">
			<Image
				src="/images/logo/genie-light-logo.png"
				alt="Genie Light Logo"
				width={300}
				height={80}
				className={className}
				priority
			/>
		</div>
	);
};

export default Logo;
