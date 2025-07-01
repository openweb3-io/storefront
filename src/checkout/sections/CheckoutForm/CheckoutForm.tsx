import { Suspense, useState } from "react";
import { useCheckout } from "@/checkout/hooks/useCheckout";
import { ContactUser, ContactSkeleton, Contact } from "@/checkout/sections/Contact";
import { DeliveryMethods } from "@/checkout/sections/DeliveryMethods";
import { DeliveryMethodsSkeleton } from "@/checkout/sections/DeliveryMethods/DeliveryMethodsSkeleton";
import { AddressSectionSkeleton } from "@/checkout/components/AddressSectionSkeleton";
import { getQueryParams } from "@/checkout/lib/utils/url";
import { CollapseSection } from "@/checkout/sections/CheckoutForm/CollapseSection";
import { Divider } from "@/checkout/components";
import { UserShippingAddressSection } from "@/checkout/sections/UserShippingAddressSection";
import { UserBillingAddressSection } from "@/checkout/sections/UserBillingAddressSection";
import { PaymentSection, PaymentSectionSkeleton } from "@/checkout/sections/PaymentSection";
import { useUser } from "@/checkout/hooks/useUser";
import { GuestBillingAddressSection } from "@/checkout/sections/GuestBillingAddressSection";
import { GuestShippingAddressSection } from "@/checkout/sections/GuestShippingAddressSection";

export const CheckoutForm = () => {
	const { user } = useUser();
	const { checkout } = useCheckout();
	const { passwordResetToken } = getQueryParams();

	const [showOnlyContact, setShowOnlyContact] = useState(!!passwordResetToken);

	console.log("user: ", user);

	return (
		<div className="flex flex-col items-end">
			<div className="flex w-full flex-col rounded">
				<div>
					{user ? (
						<Suspense fallback={<ContactSkeleton />}>
							<ContactUser />
						</Suspense>
					) : (
						<Suspense fallback={<ContactSkeleton />}>
							<Contact setShowOnlyContact={setShowOnlyContact} />
						</Suspense>
					)}
				</div>
				<>
					{checkout?.isShippingRequired && (
						<>
							<Suspense fallback={<AddressSectionSkeleton />}>
								<CollapseSection collapse={showOnlyContact}>
									<Divider />
									<div className="py-4" data-testid="shippingAddressSection">
										{user ? <UserShippingAddressSection /> : <GuestShippingAddressSection />}
									</div>
									<UserBillingAddressSection />
								</CollapseSection>
							</Suspense>
							<Suspense fallback={<DeliveryMethodsSkeleton />}>
								<DeliveryMethods collapsed={showOnlyContact} />
							</Suspense>
							<Suspense fallback={<PaymentSectionSkeleton />}>
								<CollapseSection collapse={showOnlyContact}>
									<PaymentSection />
									{user ? <UserBillingAddressSection /> : <GuestBillingAddressSection />}
								</CollapseSection>
							</Suspense>
						</>
					)}
				</>
			</div>
		</div>
	);
};
