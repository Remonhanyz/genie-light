"use client";

import React from "react";
import {usePathname} from "next/navigation";
import { getMenuList } from "@/lib/menus";
import { useCurrentUser } from "@/hooks/use-current-user";

import IconNav from "./icon-nav";
import SidebarNav from "./sideabr-nav";

export function MenuTwoColumn() {
	const pathname = usePathname();
	const { role } = useCurrentUser();
	const menuList = getMenuList(pathname, role);

	return (
		<>
			<IconNav menuList={menuList} />
			<SidebarNav menuList={menuList} />
		</>
	);
}
