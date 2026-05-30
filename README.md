# RashanMate

RashanMate is a simple rashan list maker for Indian households. Users can add grocery items with quantity, save a WhatsApp mobile number, and send the final list in one tap.

## Startup Hook

Create your rashan list and send it on WhatsApp in one tap.

## Version 1 Goal

The first version should stay very simple. It should help users create and send a clean grocery list without prices, AI, login, payments, or delivery tracking.

## Version 1 Features

- Add rashan item name
- Add quantity
- Select or type unit, such as kg, g, L, packet, piece
- Quick item buttons for common items
- Save one WhatsApp mobile number
- Send the list to WhatsApp
- Save the last list for reuse
- Edit or remove list items before sending

## Version 1 User Flow

1. User opens the app.
2. User adds items manually or taps common item buttons.
3. User enters quantity and unit.
4. User adds or confirms the saved WhatsApp number.
5. User reviews the final rashan list.
6. User taps "Send to WhatsApp".
7. App opens WhatsApp with the formatted list.
8. App saves the latest list so the user can reuse it next time.

## WhatsApp Message Format

```text
Rashan List - May 2026

1. Atta - 10kg
2. Rice - 5kg
3. Dal - 2kg
4. Oil - 1L
5. Milk - 2L
```

## Common Item Suggestions

- Atta
- Rice
- Dal
- Oil
- Milk
- Sugar
- Tea
- Salt
- Masala
- Onion
- Tomato
- Potato
- Fruits
- Vegetables

## Do Not Add In Version 1

- Price tracking
- Online price fetching
- AI price suggestions
- Monthly spend dashboard
- Login/signup
- Kirana store dashboard
- Payment system
- Delivery tracking
- Complex analytics

## Product Pipeline

### Phase 1: Simple MVP

Build the basic rashan list maker.

- Manual item input
- Quantity and unit input
- Quick item buttons
- Saved WhatsApp number
- WhatsApp send action
- Last list saved locally

Success signal: users send at least 2-3 lists using the app instead of typing directly in WhatsApp.

### Phase 2: Better Reuse

Make the app useful for repeated monthly use.

- Repeat previous list
- Save multiple lists
- Edit saved lists
- Add favorite items
- Add search for items
- Support Hindi and English item names

Success signal: users open the app again next week or next month.

### Phase 3: Monthly Spend

Add price only after the list workflow is useful.

- Optional price input
- Total list amount
- Monthly total
- Previous month comparison
- User-edited item prices

Success signal: users enter prices because they want to track spending, not because the app forces them.

### Phase 4: Smart Features

Add intelligence after real usage data exists.

- Suggested repeat items
- Low-stock reminders
- Smart monthly list generation
- AI-assisted item cleanup
- Optional online price suggestions

Success signal: the smart features save time without making the app confusing.

### Phase 5: Kirana / Business Version

Build for shopkeepers only after households are using the app.

- Multiple saved shopkeepers
- Customer order history
- Store order dashboard
- Order status: received, packed, delivered
- Shopkeeper subscription plan

Success signal: local stores ask for a better way to receive and manage customer lists.

## Launch Plan

### Week 1

- Finish Version 1 features
- Test on mobile
- Make WhatsApp sending reliable
- Save data in local storage

### Week 2

- Give it to family and friends
- Test with 10 households
- Watch how they add items
- Fix confusing parts

### Week 3

- Test with 3-5 local kirana stores
- Ask if the WhatsApp message format is useful
- Improve the list format based on feedback

### Week 4

- Launch publicly as a simple web app or PWA
- Share on WhatsApp groups
- Collect feedback
- Track repeat usage

## Validation Questions

Ask users:

- Do you currently send grocery lists on WhatsApp?
- How often do you make a rashan list?
- Do you repeat the same items every month?
- Would this save you time?
- What feels missing before you would use it regularly?

## Future Monetization Ideas

- Free household version
- Premium household features later
- Kirana store dashboard subscription
- Society or apartment group ordering
- Local vendor order management

## Current Positioning

RashanMate is not a grocery delivery app. It is a simple WhatsApp-first rashan list tool for people who already buy from local shops.
