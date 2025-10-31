# Chat Feature Documentation

## Overview
A simple, real-time chat functionality that allows users to communicate about lost and found items. The chat is designed to be straightforward without over-engineering.

## Features

### 1. **One-to-One Messaging**
- Direct communication between item poster and interested users
- Each conversation is tied to a specific item
- Simple message threads

### 2. **Real-Time Updates**
- Messages appear instantly using Supabase real-time subscriptions
- No need for page refresh
- Automatic scroll to latest messages

### 3. **Read Receipts**
- Messages are marked as read when viewed
- Unread message count displayed in conversations list

### 4. **Consistent UI**
- Clean, modern chat interface
- Message bubbles with timestamps
- Sender messages on right (primary color)
- Receiver messages on left (muted background)

## User Flow

### Starting a Chat
1. Browse items or view item details
2. Click "Contact Owner" button (visible only to non-owners when logged in)
3. Opens direct chat with the item owner
4. Start messaging immediately

### Viewing Conversations
1. Click the message icon (💬) in the header
2. See all active conversations
3. Shows item name, chat partner, last message, and unread count
4. Click any conversation to continue chatting

### Sending Messages
1. Type message in the input field at bottom
2. Click send button or press Enter
3. Message appears instantly in the chat
4. Other user sees it in real-time

## Technical Details

### Database Structure
- **messages table**: Stores all chat messages
  - `item_id`: Links to the item being discussed
  - `sender_id`: User who sent the message
  - `receiver_id`: User who receives the message
  - `content`: Message text
  - `read`: Boolean for read status
  - `created_at`: Timestamp

### Components
- **Chat.tsx**: Individual chat interface
- **Conversations.tsx**: List of all user conversations
- **ItemDetail.tsx**: Updated with "Contact Owner" button
- **Header.tsx**: Updated with messages icon/link

### Routes
- `/chat/:itemId/:userId` - Individual chat page
- `/conversations` - All conversations list

### Real-Time Implementation
- Uses Supabase real-time subscriptions
- Listens for INSERT events on messages table
- Automatically updates chat when new messages arrive
- No WebSocket complexity - handled by Supabase

## Security
- Row Level Security (RLS) policies ensure:
  - Users can only view messages they sent or received
  - Users can only send messages as themselves
  - Users can mark messages sent to them as read

## Future Enhancements (Optional)
- Message notifications
- Typing indicators
- Image/file sharing
- Block/report users
- Conversation search
