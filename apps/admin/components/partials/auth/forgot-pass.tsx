"use client";
import React, {useState} from "react";

import {Label} from "@/components/ui";
import {Input} from "@/components/ui";
import {Button} from "@/components/ui";
type Inputs = {
	example: string;
	exampleRequired: string;
};
import {useForm, SubmitHandler} from "react-hook-form";
const ForgotPass = () => {
	const {
		register,
		handleSubmit,
		watch,
		formState: {errors}
	} = useForm<Inputs>();
	const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data);
	console.log(watch("example"));

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4 ">
			<div className="space-y-2">
				<Label htmlFor="email">Email</Label>
				<Input
					id="email"
					defaultValue="Pharaana@gmail.com"
					{...register("example")}
					className="h-12 text-sm text-default-900 "
				/>
			</div>

			<Button type="submit" fullWidth>
				Send recovery email
			</Button>
		</form>
	);
};

export default ForgotPass;
