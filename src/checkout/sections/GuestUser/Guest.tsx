import { useState, useEffect } from "react";
import { SignInFormContainer } from "../Contact/SignInFormContainer";
import { TextInput } from "@/checkout/components/TextInput";
import { useGuestUserForm } from "@/checkout/sections/GuestUser/useGuestUserForm";
import { FormProvider } from "@/checkout/hooks/useForm/FormProvider";
import { Button } from "@/checkout/components/Button";
import { useEmailChangeRequest, useEmailChangeConfirmRequest } from "@/ui/components/RuntimePlatform/hooks";
import { useUser } from "@/checkout/hooks/useUser";

export const Guest: React.FC = () => {
	const { user } = useUser();
	const oldEmail = user?.email || ""; // Get the current user's email as oldEmail
	const form = useGuestUserForm({ initialEmail: "" }); // The new email input is initially empty
	const { handleChange } = form;
	const { email: newEmail, code } = form.values; // The new email entered by the user
	const { postEmailChange, loading: sendEmailCodeLoading } = useEmailChangeRequest();
	const { postEmailChangeConfirm, loading: bindEmailLoading } = useEmailChangeConfirmRequest();
	const [countdown, setCountdown] = useState(0);

	useEffect(() => {
		if (countdown > 0) {
			const timer = setTimeout(() => {
				setCountdown(countdown - 1);
			}, 1000);
			return () => clearTimeout(timer);
		}
	}, [countdown]);

	const handleSendCode = async () => {
		try {
			setCountdown(60);
			// Send email change request
			await postEmailChange(oldEmail, newEmail);
		} catch (error) {
			setCountdown(0);
			console.error("Failed to send email change request:", error);
		}
	};

	const handleBindEmail = async () => {
		try {
			// Confirm email change
			const res = await postEmailChangeConfirm(code, oldEmail, newEmail);
			if (res?.code === 0) {
				setCountdown(0);
				setTimeout(() => {
					window.location.reload();
				}, 3000);
			}
		} catch (error) {
			console.error("Failed to confirm email change:", error);
		}
	};

	return (
		<SignInFormContainer
			title="Contact details"
			redirectSubtitle="Already have an account?"
			onSectionChange={() => {}}
		>
			<FormProvider form={form}>
				<div className="grid grid-cols-1 gap-3">
					<TextInput
						required
						name="email"
						label="New Email"
						placeholder="Enter new email"
						onChange={handleChange}
					/>
					<div className="mt-2 flex items-center justify-center gap-2">
						<div className="flex-1">
							<TextInput
								required
								name="code"
								label="Verify code"
								placeholder="Enter code"
								className="w-full"
								onChange={handleChange}
							/>
						</div>
						<Button
							className="mt-4 min-w-[5rem]"
							label={countdown > 0 ? `${countdown}s` : "Send"}
							onClick={handleSendCode}
							variant="secondary"
							disabled={countdown > 0 || !newEmail || sendEmailCodeLoading}
						/>
					</div>
					<div className="mt-2 flex items-center justify-center gap-2">
						<Button
							disabled={!newEmail || !code || bindEmailLoading}
							className="mt-4 w-full"
							label="Confirm"
							onClick={handleBindEmail}
						/>
					</div>
				</div>
			</FormProvider>
		</SignInFormContainer>
	);
};
