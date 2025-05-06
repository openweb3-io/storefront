import { AdyenDropIn } from "./AdyenDropIn/AdyenDropIn";
import { adyenGatewayId } from "./AdyenDropIn/types";
import { DummyComponent } from "./DummyDropIn/dummyComponent";
import { dummyGatewayId } from "./DummyDropIn/types";
import { StripeComponent } from "./StripeElements/stripeComponent";
import { stripeGatewayId } from "./StripeElements/types";
import { Openweb3Elements } from "./Openweb3Elements";
import { openweb3GatewayId } from "./Openweb3Elements/types";

export const paymentMethodToComponent = {
	[adyenGatewayId]: AdyenDropIn,
	[stripeGatewayId]: StripeComponent,
	[dummyGatewayId]: DummyComponent,
	[openweb3GatewayId]: Openweb3Elements,
};
