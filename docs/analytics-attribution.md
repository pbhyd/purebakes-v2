# Analytics attribution

The shared cake-enquiry flow emits `check_availability_open`, `check_availability_continue`, and `whatsapp_click` with controlled page, CTA, context, gallery, and enquiry attribution. No customer-entered values or WhatsApp message content are sent as analytics parameters.

## GA4 configuration

Register these event-scoped custom dimensions in GA4 if they are not already configured:

- `page_type`
- `page_slug`
- `page_path`
- `cta_location`
- `page_context`
- `gallery_search_active`
- `enquiry_id`

The `whatsapp_click` event can be marked manually as a GA4 key event. This repository does not configure GA4 remotely.
