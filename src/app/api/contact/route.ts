// src/app/api/contact/route.ts
import { NextRequest } from 'next/server';

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

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Format message for WhatsApp
    const whatsappMessage = `New Contact Form Submission%0A%0A*From:* ${name}%0A*Email:* ${email}%0A*Message:* ${message}`;
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