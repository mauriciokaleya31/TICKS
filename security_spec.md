# Security Specifications & Data Invariants

## 1. Data Invariants
- **User profiles (`/users/{userId}`)**: Users can only update their own profile. Only Administrators can update another user's role or status.
- **Events (`/events/{eventId}`)**: Public users can read approved events. Only organizers can create events, and they can only edit their own events. Only administrators can approve or feature events.
- **Orders (`/orders/{orderId}`)**: Only the purchaser (matching `userId`), the event organizer, or an administrator can read a specific order. Only the purchaser can create an order. Status transitions to "COMPLETADO" or "REEMBOLSADO" are protected and must only be performed by authorized actors (administrators or organizers approving manual payments).
- **Coupons (`/coupons/{couponId}`)**: Public users can read coupons to apply discounts. Only organizers and administrators can create or edit coupons.
- **Reviews (`/reviews/{reviewId}`)**: Anyone can read reviews. Only authenticated users can write reviews, and they must match the `userId` in the payload.
- **Blogs (`/blogs/{blogId}`)** & **FAQs (`/faqs/{faqId}`)** & **CMS Configs (`/cms_configs/{configId}`)**: Anyone can read these. Only administrators can write, modify, or delete them.

---

## 2. The "Dirty Dozen" Payloads (Vulnerability Scenarios)
1. **Identity Spoofing in Orders**: A user creates an order with a different `userId` in the payload than their actual `request.auth.uid`.
2. **Privilege Escalation via Role Modification**: A standard "Cliente" user attempts to update their user profile document to set `role: "Administrador"`.
3. **Unauthorized Event Approval**: An event organizer attempts to set `approved: true` on their own event without administrator intervention.
4. **Coupon Value Poisoning**: An attacker creates a coupon with a negative discount or extremely high discount value.
5. **Review Hijacking**: A user writes a review with someone else's `userId`.
6. **Order Hijacking**: A user attempts to read another user's private tickets/orders.
7. **Bypassing Payment Verification**: A customer creates an order with status already set to `COMPLETADO` using a manual payment method without paying.
8. **Malicious Blog Injection**: A non-admin user attempts to create a blog post containing malicious links or script tags.
9. **Spamming Reviews**: A user attempts to create a review with an invalid rating (e.g., 99 stars or -5 stars).
10. **Admin Configuration Overwrite**: An unauthenticated user attempts to update the site-wide `cms_configs` to alter the payment methods list.
11. **Altering Ticket Quantities**: A buyer updates an event's ticket categories directly from the client SDK to reset ticket allocations or prices.
12. **Bypassing Email Verification (if strict)**: A user with an unverified email address attempts to perform restricted writes.

---

## 3. Test Cases (TDD Rules validation)
We verify that these malicious payloads are strictly rejected by the Security Rules, ensuring high data integrity.
