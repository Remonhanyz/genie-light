"use client";
import React from "react";
import Logo from "@/components/logo";
import {useConfig} from "@/hooks/use-config";
import {useMediaQuery} from "@/hooks/use-config";

const HeaderLogo = () => {
	const [config] = useConfig();

	const isDesktop = useMediaQuery("(min-width: 1280px)");

	return config.layout === "horizontal" ? (
		<Logo />
	) : (
		!isDesktop && (
			<Logo />
		)
	);
};

export default HeaderLogo;
