"use client";

import * as React from "react";
import {useState, useEffect} from "react";
import {useRouter} from "next/navigation";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {toast} from "sonner";
import {
	Eye,
	EyeOff,
	Loader2,
	ShieldCheck,
	Key,
	PackageCheck,
	Zap
} from "lucide-react";
import Image from "next/image";
import Logo from "@/components/partials/auth/logo";

export default function AdminLoginPage() {
	const router = useRouter();
	const [isSetupMode, setIsSetupMode] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [passwordType, setPasswordType] = useState("password");

	const [formData, setFormData] = useState({
		username: "",
		email: "",
		password: "",
		phone: "",
		age: ""
	});

	// Check if any admin exists on mount
	useEffect(() => {
		async function checkSetup() {
			try {
				const res = await fetch("/api/auth");
				const data = await res.json();
				if (data.needsSetup) {
					setIsSetupMode(true);
				}
			} catch (err) {
				console.error("Setup check failed:", err);
			}
		}
		checkSetup();
	}, []);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData((prev) => ({...prev, [e.target.name]: e.target.value}));
	};

	const togglePasswordType = () => {
		setPasswordType((prev) => (prev === "password" ? "text" : "password"));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			if (isSetupMode) {
				const res = await fetch("/api/auth", {
					method: "POST",
					headers: {"Content-Type": "application/json"},
					body: JSON.stringify({
						username: formData.username,
						email: formData.email,
						password: formData.password,
						phone: formData.phone,
						age: parseInt(formData.age) || 20
					})
				});
				const data = await res.json();

				if (res.ok && data.success) {
					toast.success("Initial Admin Account created successfully!");
					router.push("/admin/dashboard");
					router.refresh();
				} else {
					toast.error(data.error || "Failed to create admin account");
				}
			} else {
				const res = await fetch("/api/auth", {
					method: "PUT",
					headers: {"Content-Type": "application/json"},
					body: JSON.stringify({
						email: formData.email,
						password: formData.password
					})
				});
				const data = await res.json();

				if (res.ok && data.success) {
					toast.success("Welcome back to Genie Light Management Portal!");
					router.push("/admin/dashboard");
					router.refresh();
				} else {
					toast.error(data.error || "Invalid credentials");
				}
			}
		} catch (error) {
			toast.error("An error occurred during submission");
		} finally {
			setIsLoading(false);
		}
	};

	const currentYear = new Date().getFullYear();

	return (
		<div className="flex w-full items-center overflow-hidden min-h-screen h-screen basis-full">
			<div className="overflow-y-auto flex flex-wrap w-full h-screen">
				{/* Left Panel - Illustration and Branding */}
				<div className="lg:flex hidden flex-1 flex-col justify-between p-6 lg:p-8 xl:p-12 overflow-hidden text-[40px] leading-12 text-default-600 relative z-1 bg-default-50">
					<div className="flex-1 flex flex-col justify-center items-center h-full w-full text-center">
						<div className="max-w-[580px] w-full flex flex-col items-center px-4">
							<Image
								src="/images/logo/genie-light-logo.png"
								alt="Genie Light Egypt Logo"
								width={1000}
								height={1000}
								className="w-full max-w-[480px] xl:max-w-[520px] max-h-[40vh] h-auto object-contain mb-8 transition-all duration-300"
								priority
							/>
							<h3 className="text-2xl font-semibold tracking-tight text-default-900 leading-snug">
								Back-Office Management Portal <br />
								<span className="text-primary font-bold">
									Genie Light Egypt
								</span>
							</h3>
							<p className="text-sm text-default-500 mt-3 max-w-[380px] leading-relaxed">
								Centralized management console for architectural luminaires,
								technical child variant matrices, PDF datasheets, and fulfillment operations.
							</p>
						</div>
					</div>
					<div className="text-xs text-default-400 font-mono text-center select-none pt-4">
						SYSTEM HQ • v2.0.0
					</div>
				</div>

				{/* Right Panel - Form */}
				<div className="flex-1 relative">
					<div className="h-full flex flex-col dark:bg-default-100 bg-white">
						<div className="max-w-[524px] md:px-[42px] md:py-[44px] p-7 mx-auto w-full text-2xl text-default-900 mb-3 h-full flex flex-col justify-center">
							{/* Logo for mobile layout */}
							<div className="flex justify-center items-center text-center mb-6 lg:hidden">
								<Logo />
							</div>

							<div className="text-center 2xl:mb-10 mb-4">
								<h4 className="font-semibold text-2xl text-default-900">
									{isSetupMode ? "Setup Admin HQ" : "Sign In"}
								</h4>
								<div className="text-default-500 text-sm mt-1">
									{isSetupMode
										? "Configure the primary system administrator account."
										: "Enter your credentials to access the administrative ledger."}
								</div>
							</div>

							<form onSubmit={handleSubmit} className="space-y-4">
								{isSetupMode && (
									<>
										<div className="space-y-1.5">
											<Label
												htmlFor="username"
												className="font-medium text-default-600 text-sm"
											>
												Username
											</Label>
											<Input
												id="username"
												name="username"
												placeholder="hqadmin"
												required
												disabled={isLoading}
												value={formData.username}
												onChange={handleChange}
												className="bg-default-50/30 dark:bg-default-950/20 border-default-200"
											/>
										</div>
										<div className="space-y-1.5">
											<Label
												htmlFor="phone"
												className="font-medium text-default-600 text-sm"
											>
												Phone Number
											</Label>
											<Input
												id="phone"
												name="phone"
												placeholder="01012345678"
												required
												disabled={isLoading}
												value={formData.phone}
												onChange={handleChange}
												className="bg-default-50/30 dark:bg-default-950/20 border-default-200"
											/>
										</div>
										<div className="space-y-1.5">
											<Label
												htmlFor="age"
												className="font-medium text-default-600 text-sm"
											>
												Age
											</Label>
											<Input
												id="age"
												name="age"
												type="number"
												placeholder="25"
												required
												disabled={isLoading}
												value={formData.age}
												onChange={handleChange}
												className="bg-default-50/30 dark:bg-default-950/20 border-default-200"
											/>
										</div>
									</>
								)}

								<div className="space-y-1.5">
									<Label
										htmlFor="email"
										className="font-medium text-default-700 text-sm"
									>
										Email Address
									</Label>
									<Input
										id="email"
										name="email"
										type="email"
										placeholder="admin@blastersegy.com"
										required
										disabled={isLoading}
										value={formData.email}
										onChange={handleChange}
										className="bg-default-50/50 dark:bg-default-950/20 border-default-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
									/>
								</div>

								<div className="space-y-1.5">
									<Label
										htmlFor="password"
										className="font-medium text-default-700 text-sm"
									>
										Password
									</Label>
									<div className="relative">
										<Input
											id="password"
											name="password"
											type={passwordType}
											placeholder="••••••••"
											required
											disabled={isLoading}
											value={formData.password}
											onChange={handleChange}
											className="bg-default-50/50 dark:bg-default-950/20 border-default-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all pr-10"
										/>
										<button
											type="button"
											onClick={togglePasswordType}
											disabled={isLoading}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-default-500 dark:text-default-600 hover:text-default-700 dark:hover:text-default-800 cursor-pointer focus:outline-none transition-colors"
										>
											{passwordType === "password" ? (
												<EyeOff className="h-4 w-4" />
											) : (
												<Eye className="h-4 w-4" />
											)}
										</button>
									</div>
								</div>

								<Button
									type="submit"
									color="primary"
									shadow="md"
									className="w-full font-semibold mt-4 hover:shadow-lg transition-all cursor-pointer"
									disabled={isLoading}
								>
									{isLoading ? (
										<Loader2 className="h-4 w-4 animate-spin mr-2" />
									) : isSetupMode ? (
										"Complete Setup"
									) : (
										"Sign In"
									)}
								</Button>
							</form>
						</div>

						<div className="text-xs font-normal text-default-400 pb-8 text-center select-none">
							© {currentYear} Genie Light Egypt • All Rights Reserved
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
