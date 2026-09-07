"use client";

import React from "react";
import { Ellipsis } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getMenuList } from "@/lib/menus";
import { ScrollArea } from "@/components/ui";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
	TooltipProvider
} from "@/components/ui";
import { useConfig } from "@/hooks/use-config";
import MenuLabel from "../common/menu-label";
import MenuItem from "../common/menu-item";
import { CollapseMenuButton } from "../common/collapse-menu-button";
import Logo from "@/components/logo";
import SidebarHoverToggle from "@/components/partials/sidebar/sidebar-hover-toggle";
import { useMenuHoverConfig } from "@/hooks/use-config";
import { useMediaQuery } from "@/hooks/use-config";
import { useCurrentUser } from "@/hooks/use-current-user";
import { DndContext } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

export function MenuClassic() {
	const pathname = usePathname();
	const { role } = useCurrentUser();

	const isDesktop = useMediaQuery("(min-width: 1280px)");

	const menuList = getMenuList(pathname, role);
	const [config, setConfig] = useConfig();
	const collapsed = config.collapsed;
	const [hoverConfig] = useMenuHoverConfig();
	const { hovered } = hoverConfig;

	// Collect all menu IDs for SortableContext (needed by useSortable in MenuItem)
	const allIds = menuList.flatMap(g => g.menus.map(m => m.id));

	const scrollableNodeRef = React.useRef<HTMLDivElement>(null);
	const [scroll, setScroll] = React.useState(false);

	React.useEffect(() => {
		const handleScroll = () => {
			if (
				scrollableNodeRef.current &&
				scrollableNodeRef.current.scrollTop > 0
			) {
				setScroll(true);
			} else {
				setScroll(false);
			}
		};
		scrollableNodeRef.current?.addEventListener("scroll", handleScroll);
	}, [scrollableNodeRef]);

	return (
		<>
			{isDesktop && (
				<div className="flex items-center justify-between  px-4 py-4">
					<Logo />
					<SidebarHoverToggle />
				</div>
			)}

			<ScrollArea className="[&>div>div[style]]:block!">
				{isDesktop && (
					<div
						className={cn(" space-y-3 mt-6 ", {
							"px-4": !collapsed || hovered,
							"text-center": collapsed || !hovered
						})}
					>
						{/* <TeamSwitcher /> */}
						{/* <SearchBar /> */}
					</div>
				)}

				<DndContext>
					<SortableContext items={allIds} strategy={verticalListSortingStrategy}>
						<nav className="mt-8 h-full w-full">
							<ul className=" h-full flex flex-col min-h-[calc(100vh-48px-36px-16px-32px)] lg:min-h-[calc(100vh-32px-40px-32px)] items-start space-y-1 px-4">
								{menuList?.map(({ groupLabel, menus }, index) => (
									<li
										className={cn("w-full", groupLabel ? "" : "")}
										key={index}
									>
										{((!collapsed || hovered) && groupLabel) ||
											!collapsed === undefined ? (
											<MenuLabel label={groupLabel} />
										) : collapsed &&
											!hovered &&
											!collapsed !== undefined &&
											groupLabel ? (
											<TooltipProvider>
												<Tooltip delayDuration={100}>
													<TooltipTrigger className="w-full">
														<div className="w-full flex justify-center items-center">
															<Ellipsis className="h-5 w-5 text-default-700" />
														</div>
													</TooltipTrigger>
													<TooltipContent side="right">
														<p>{groupLabel}</p>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										) : null}

										{menus.map(
											(
												{ href, label, icon, active, id, submenus },
												index
											) =>
												submenus.length === 0 ? (
													<div
														className="w-full mb-2 last:mb-0"
														key={index}
													>
														<TooltipProvider disableHoverableContent>
															<Tooltip delayDuration={100}>
																<TooltipTrigger asChild>
																	<div>
																		<MenuItem
																			label={label}
																			icon={icon}
																			href={href}
																			active={active}
																			id={id}
																			collapsed={collapsed}
																		/>
																	</div>
																</TooltipTrigger>
																{collapsed && (
																	<TooltipContent side="right">
																		{label}
																	</TooltipContent>
																)}
															</Tooltip>
														</TooltipProvider>
													</div>
												) : (
													<div className="w-full mb-2" key={index}>
														<CollapseMenuButton
															icon={icon}
															label={label}
															active={active}
															submenus={submenus}
															collapsed={collapsed}
															id={id}
														/>
													</div>
												)
										)}
									</li>
								))}
								{!collapsed && (
									<li className="w-full grow flex items-end">
										{/* <MenuWidget /> */}
									</li>
								)}
							</ul>
						</nav>
					</SortableContext>
				</DndContext>
			</ScrollArea>
		</>
	);
}
