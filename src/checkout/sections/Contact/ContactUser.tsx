import React, { useCallback, useEffect, useState } from "react";
import { retrieveLaunchParams } from "@telegram-apps/sdk";
import { SignUser } from "../SignedInUser/SignUser";
import { useCustomerAttach } from "@/checkout/hooks/useCustomerAttach";
import { Guest } from "@/checkout/sections/GuestUser/Guest";
import { useUser } from "@/checkout/hooks/useUser";

type Section = "signedInUser" | "guestUser";

// Check if it is a telegram email format and userid matches
const isEmail = (email: string) => {
	const telegramEmailRegex = /^telegram_(\d+)@telegram\.local$/;
	const match = email.match(telegramEmailRegex);

	console.log("isEmail check:", { email, match });

	if (!match) {
		return false;
	}

	const emailUserId = match[1];
	console.log("Extracted email userid:", emailUserId);

	// Get the current telegram userid
	try {
		const launchParams = retrieveLaunchParams();
		const currentUserId = launchParams?.tgWebAppData?.user?.id;
		console.log("Current telegram userid:", currentUserId);

		// If the current userid cannot be obtained, only check the email format
		if (!currentUserId) {
			console.log("No current userid, returning true for format match");
			return true;
		}

		// Check if userid matches
		const isMatch = emailUserId === currentUserId.toString();
		console.log("Userid match result:", isMatch);
		return isMatch;
	} catch (error) {
		console.error("Failed to get telegram user id:", error);
		// If failed to get, only check the email format
		return true;
	}
};

export const ContactUser = () => {
	useCustomerAttach();
	const { user } = useUser();

	// Decide which section to display based on the telegram email match result
	const selectInitialSection = (): Section => {
		if (isEmail(user?.email || "")) {
			return "guestUser"; // Match successful, show Guest component
		} else {
			return "signedInUser"; // Match unsuccessful, show SignUser component
		}
	};

	const [currentSection, setCurrentSection] = useState<Section>(selectInitialSection());

	const isCurrentSection = useCallback((section: Section) => currentSection === section, [currentSection]);

	useEffect(() => {
		// Update section based on telegram email match result
		if (isEmail(user?.email || "")) {
			setCurrentSection("guestUser");
		} else {
			setCurrentSection("signedInUser");
		}
	}, [user?.email]);

	console.log("currentSection", currentSection);
	console.log("user.email", user?.email);
	console.log("isEmailMatch", isEmail(user?.email || ""));

	return (
		<div>
			{isCurrentSection("guestUser") && <Guest />}

			{isCurrentSection("signedInUser") && <SignUser />}
		</div>
	);
};
