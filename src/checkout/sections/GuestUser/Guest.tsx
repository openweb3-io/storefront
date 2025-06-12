import { useState, useEffect } from "react";
import { SignInFormContainer } from "../Contact/SignInFormContainer";
import { TextInput } from "@/checkout/components/TextInput";
import { useGuestUserForm } from "@/checkout/sections/GuestUser/useGuestUserForm";
import { FormProvider } from "@/checkout/hooks/useForm/FormProvider";
import { Button } from "@/checkout/components/Button";
import {
	useSendEmailCodeRequest,
	useBindEmailRequest,
	useAuthRequest,
} from "@/ui/components/RuntimePlatform/hooks";
import { useAlerts } from "@/checkout/hooks/useAlerts/useAlerts";

type GuestProps = {
	onEmailChange: (email: string) => void;
	email: string;
};

export const Guest: React.FC<GuestProps> = ({ onEmailChange, email: initialEmail }) => {
	const form = useGuestUserForm({ initialEmail });
	const { handleChange } = form;
	const { email, code } = form.values;
	const { postSendEmailCode, loading: sendEmailCodeLoading } = useSendEmailCodeRequest();
	const { postBindEmail, loading: bindEmailLoading } = useBindEmailRequest();
	const { postAuth } = useAuthRequest();
	const [countdown, setCountdown] = useState(0);
	const { showSuccess } = useAlerts();

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
			await postSendEmailCode(email);
		} catch (error) {
			setCountdown(0);
			console.error("Failed to send verification code:", error);
		}
	};

	const handleBindEmail = async () => {
		try {
			const res = await postBindEmail(email, code);
			if (res?.code === 0) {
				showSuccess("Email bound successfully, Please wait...");
				setCountdown(0);
				await postAuth();
				setTimeout(() => {
					window.location.reload();
				}, 3000);
			}
		} catch (error) {
			console.error("Failed to bind email:", error);
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
						label="Email"
						placeholder="Enter email"
						onChange={(event) => {
							handleChange(event);
							onEmailChange(event.currentTarget.value);
						}}
					/>
					<div className="mt-2 flex items-center justify-center gap-2">
						<TextInput
							required
							name="code"
							label="Verify code"
							placeholder="Enter code"
							className="flex-1"
							onChange={(event) => {
								handleChange(event);
							}}
						/>
						<Button
							className="mt-4 min-w-[5rem]"
							label={countdown > 0 ? `${countdown}s` : "Send"}
							onClick={handleSendCode}
							variant="secondary"
							disabled={countdown > 0 || !email || sendEmailCodeLoading}
						/>
					</div>
					<div className="mt-2 flex items-center justify-center gap-2">
						<Button
							disabled={!email || !code || bindEmailLoading}
							className="mt-4 w-full"
							label="Bind"
							onClick={handleBindEmail}
						/>
					</div>
				</div>
			</FormProvider>
		</SignInFormContainer>
	);
};
