import {
  DeliveryOrderSource as PrismaDeliveryOrderSource,
  DeliveryOrderStatus as PrismaDeliveryOrderStatus,
  DeliveryOrderType as PrismaDeliveryOrderType,
  Prisma,
  type WaylerAvailabilityRequest,
} from '@prisma/client';

/** Maps an accepted availability request to DeliveryOrder create input. */
export function toDeliveryOrderCreateFromAvailabilityRequest(
  request: WaylerAvailabilityRequest,
  acceptedAt: Date,
): Prisma.DeliveryOrderUncheckedCreateInput {
  return {
    senderId: request.senderId,
    acceptedWaylerId: request.waylerId,
    status: PrismaDeliveryOrderStatus.ACCEPTED,
    type: inferDeliveryOrderType(request.pickupCountry, request.dropoffCountry),
    sourceType: PrismaDeliveryOrderSource.WAYLER_AVAILABILITY_REQUEST,
    availabilityRequestId: request.id,
    title: request.title,
    description: request.packageDescription,
    pickupCountry: request.pickupCountry,
    pickupCity: request.pickupCity,
    pickupAddressText: request.pickupAddress,
    dropoffCountry: request.dropoffCountry,
    dropoffCity: request.dropoffCity,
    dropoffAddressText: request.dropoffAddress,
    pickupDateFrom: request.desiredPickupFrom,
    pickupDateTo: request.desiredPickupTo,
    deliveryDeadline: request.desiredDeliveryTo ?? request.desiredDeliveryFrom,
    currency: request.currency,
    offeredRewardAmount: new Prisma.Decimal(request.proposedRewardCents).div(100),
    notes: request.message,
    acceptedAt,
  };
}

function inferDeliveryOrderType(
  pickupCountry: string,
  dropoffCountry: string,
): PrismaDeliveryOrderType {
  if (pickupCountry.trim().toUpperCase() !== dropoffCountry.trim().toUpperCase()) {
    return PrismaDeliveryOrderType.INTERNATIONAL;
  }
  return PrismaDeliveryOrderType.LOCAL;
}
