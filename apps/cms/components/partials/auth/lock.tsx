"use client";
import {Button} from "@/components/ui";
import {Input} from "@/components/ui";
import {Label} from "@/components/ui";
import {useForm, SubmitHandler} from "react-hook-form";

type Inputs = {
	example: string;
	exampleRequired: string;
};

const LockScreen = () => {
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
					defaultValue="admin@genielight-co.com"
					{...register("example")}
					className="h-12 text-sm text-default-900 "
				/>
			</div>

			<Button type="submit" fullWidth>
				Unlock
			</Button>
		</form>
	);
};
export default LockScreen;
