// src/app/api/contact/route.ts
import { NextRequest } from 'next/server';
import { sanitize } from '@/lib/xss-protection';

// Define the expected request body structure
interface ContactRequestBody {
  name: string;
  email: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { name, email, message }: ContactRequestBody = await request.json();

    // Validate required fields
    if (!name || !email || !message) {
      return Response.json(
        { error: 'Name, email, and message are required fields' },
        { status: 400 }
      );
    }

    // Sanitize and validate inputs to prevent XSS
    const sanitizedInputs = {
      name: sanitize.text(name),
      email: sanitize.text(email),
      message: sanitize.text(message)
    };

    // Check if sanitized content is valid (not flagged as XSS)
    const validations = [
      sanitize.validate(name),
      sanitize.validate(email),
      sanitize.validate(message)
    ];

    for (const validation of validations) {
      if (!validation.isValid) {
        return Response.json(
          { error: validation.message },
          { status: 400 }
        );
      }
    }

    // Basic email validation after sanitization
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedInputs.email)) {
      return Response.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Format message for WhatsApp using sanitized inputs
    const whatsappMessage = `New Contact Form Submission%0A%0A*From:* ${sanitizedInputs.name}%0A*Email:* ${sanitizedInputs.email}%0A*Message:* ${sanitizedInputs.message}`;
    const phoneNumber = '254758302725'; // Your number in international format without leading 0 or +

    // Construct the WhatsApp API URL
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${whatsappMessage}`;

    // Return the WhatsApp URL for client-side redirect
    return Response.json({
      message: 'Preparing to send WhatsApp message...',
      whatsappUrl: whatsappUrl
    });
  } catch (error) {
    console.error('Unexpected error in contact API:', error);
    return Response.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}