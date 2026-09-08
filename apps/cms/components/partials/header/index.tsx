import React from "react";
import HeaderContent from "./header-content";
import ProfileInfo from "./profile-info";
import Notifications from "./notifications";
import ThemeSwitcher from "./theme-switcher";
import {SidebarToggle} from "@/components/partials/sidebar/sidebar-toggle";
import {SheetMenu} from "@/components/partials/sidebar/menu/sheet-menu";
import HorizontalMenu from "./horizontal-menu";
import HeaderLogo from "./header-logo";
import ThemeCustomize from "../customizer";
import {getAdminDataLocal} from "@/lib/auth-server";

const PharaanaHeader = async () => {
	const user = await getAdminDataLocal();

	return (
		<>
			<HeaderContent>
				<div className=" flex gap-3 items-center">
					<HeaderLogo />
					<SidebarToggle />
					{/* <HeaderSearch /> */}
				</div>
				<div className="nav-tools flex items-center  md:gap-4 gap-3">
					{/* <LocalSwitcher /> */}
					<Notifications />
					<ThemeSwitcher />
					{/* <Cart /> */}
					{/* <Messages /> */}
					<ThemeCustomize />
					<ProfileInfo user={user} />
					<SheetMenu />
				</div>
			</HeaderContent>
			<HorizontalMenu />
		</>
	);
};

export default PharaanaHeader;
