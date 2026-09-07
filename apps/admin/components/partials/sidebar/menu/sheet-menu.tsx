"use client";
import Link from "next/link";
import {Icon} from "@/components/ui";
import {Button} from "@/components/ui";
import {Sheet, SheetHeader, SheetContent, SheetTrigger} from "@/components/ui";
import {MenuClassic} from "./menu-classic";
import Logo from "@/components/logo";
import {useMobileMenuConfig} from "@/hooks/use-config";
import {useMediaQuery} from "@/hooks/use-config";
import {useConfig} from "@/hooks/use-config";

export function SheetMenu() {
	const [mobileMenuConfig, setMobileMenuConfig] = useMobileMenuConfig();
	const [config, setConfig] = useConfig();
	const {isOpen} = mobileMenuConfig;

	const isDesktop = useMediaQuery("(min-width: 1280px)");
	if (isDesktop) return null;
	return (
		<Sheet
			open={isOpen}
			onOpenChange={() => setMobileMenuConfig({isOpen: !isOpen})}
		>
			<SheetTrigger className="xl:hidden" asChild>
				<Button
					className="h-8"
					variant="ghost"
					size="icon"
					onClick={() =>
						setConfig({
							...config,
							collapsed: false
						})
					}
				>
					<Icon icon="heroicons:bars-3-bottom-right" className="h-5 w-5" />
				</Button>
			</SheetTrigger>
			<SheetContent
				className="sm:w-72 px-3 h-full flex flex-col"
				side="left"
			>
				<SheetHeader className="flex items-start justify-start">
					<Logo />
				</SheetHeader>
				<MenuClassic />
			</SheetContent>
		</Sheet>
	);
}
