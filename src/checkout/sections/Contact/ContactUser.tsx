import React, { useCallback, useEffect, useState } from "react";
import { SignUser } from "../SignedInUser/SignUser";
import { useCustomerAttach } from "@/checkout/hooks/useCustomerAttach";
import { Guest } from "@/checkout/sections/GuestUser/Guest";
import { useUser } from "@/checkout/hooks/useUser";

type Section = "signedInUser" | "guestUser";

export const ContactUser = () => {
	useCustomerAttach();
	const { user, authenticated } = useUser();
	const [email, setEmail] = useState(user?.email || "");
	const selectInitialSection = (): Section => {
		return user ? "signedInUser" : "guestUser";
	};

	const [currentSection, setCurrentSection] = useState<Section>(selectInitialSection());

	const isCurrentSection = useCallback((section: Section) => currentSection === section, [currentSection]);

	useEffect(() => {
		if (authenticated && currentSection !== "signedInUser") {
			setCurrentSection("signedInUser");
		} else if (!authenticated && currentSection === "signedInUser") {
			setCurrentSection("guestUser");
		}
	}, [authenticated, currentSection]);

	console.log("currentSection", currentSection);

	return (
		<div>
			{isCurrentSection("guestUser") && <Guest onEmailChange={setEmail} email={email} />}

			{isCurrentSection("signedInUser") && <SignUser />}
		</div>
	);
};
