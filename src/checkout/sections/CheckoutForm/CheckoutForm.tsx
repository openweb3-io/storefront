import { Suspense, useState } from "react";
import { useCheckout } from "@/checkout/hooks/useCheckout";
import { ContactUser } from "@/checkout/sections/Contact/ContactUser";
import { DeliveryMethods } from "@/checkout/sections/DeliveryMethods";
import { ContactSkeleton } from "@/checkout/sections/Contact/ContactSkeleton";
import { DeliveryMethodsSkeleton } from "@/checkout/sections/DeliveryMethods/DeliveryMethodsSkeleton";
import { AddressSectionSkeleton } from "@/checkout/components/AddressSectionSkeleton";
import { getQueryParams } from "@/checkout/lib/utils/url";
import { CollapseSection } from "@/checkout/sections/CheckoutForm/CollapseSection";
import { Divider } from "@/checkout/components";
import { UserShippingAddressSection } from "@/checkout/sections/UserShippingAddressSection";
import { UserBillingAddressSection } from "@/checkout/sections/UserBillingAddressSection";
import { PaymentSection, PaymentSectionSkeleton } from "@/checkout/sections/PaymentSection";
import { useUser } from "@/checkout/hooks/useUser";

export const CheckoutForm = () => {
	const { user } = useUser();
	const { checkout } = useCheckout();
	const { passwordResetToken } = getQueryParams();
	const [showOnlyContact] = useState(!!passwordResetToken);

	return (
		<div className="flex flex-col items-end">
			<div className="flex w-full flex-col rounded">
				<div>
					<Suspense fallback={<ContactSkeleton />}>
						<ContactUser />
					</Suspense>
				</div>
				<>
					{checkout?.isShippingRequired && user && (
						<>
							<Suspense fallback={<AddressSectionSkeleton />}>
								<CollapseSection collapse={showOnlyContact}>
									<Divider />
									<div className="py-4" data-testid="shippingAddressSection">
										<UserShippingAddressSection />
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
								</CollapseSection>
							</Suspense>
						</>
					)}
				</>
			</div>
		</div>
	);
};
