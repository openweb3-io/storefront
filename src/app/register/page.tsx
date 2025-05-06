"use client";
import { useAuthRequest, useBindEmailRequest } from "@/ui/components/RuntimePlatform/hooks";

export default function RegisterForm() {
	const { postBindEmail, loading: bindLoading } = useBindEmailRequest();
	const { postAuth, loading: authLoading } = useAuthRequest();

	const loading = bindLoading || authLoading;

	return (
		<div className="mx-auto max-w-7xl p-8">
			<div className="mx-auto mt-16 w-full max-w-lg">
				{loading && <div className="mb-4 text-center">Registering Email ...</div>}
				<form
					className="rounded border p-8 shadow-md"
					action={async (formData) => {
						const email = formData.get("email")?.toString();
						const confirmPassword = formData.get("confirmPassword")?.toString();

						if (!email || !confirmPassword || email !== confirmPassword) {
							alert("Email and confirm password are required or not match");
							return;
						}

						const res = await postBindEmail(email);
						if (res?.code === 0) {
							await postAuth();
							window.location.replace("/default-channel/products");
						}
					}}
					hidden={loading}
				>
					<div className="mb-2">
						<label className="sr-only" htmlFor="email">
							Email
						</label>
						<input
							type="email"
							name="email"
							placeholder="Email"
							className="w-full rounded border bg-neutral-50 px-4 py-2"
						/>
					</div>
					<div className="mb-4">
						<label className="sr-only" htmlFor="password">
							Password
						</label>
						<input
							type="confirmPassword"
							name="confirmPassword"
							placeholder="Confirm Email"
							className="w-full rounded border bg-neutral-50 px-4 py-2"
						/>
					</div>

					<button
						className="rounded bg-neutral-800 px-4 py-2 text-neutral-200 hover:bg-neutral-700"
						type="submit"
					>
						Register
					</button>
				</form>
			</div>
		</div>
	);
}
