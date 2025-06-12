import React from "react";
import { SignInFormContainer } from "../Contact/SignInFormContainer";
import { useUser } from "@/checkout/hooks/useUser";

export const SignUser = () => {
	const { user } = useUser();

	return (
		<SignInFormContainer title="Account" onSectionChange={() => {}}>
			<div className="flex flex-row justify-between">
				<p className="text-base font-bold">{user?.email}</p>
			</div>
		</SignInFormContainer>
	);
};
