"""
Facebook Messenger Full History Scraper
Fetches ALL messages using pagination cursors
"""

import requests
import json
from datetime import datetime
from pathlib import Path

PAGE_TOKEN = "EAANhZA15ws5IBRGnCLNz0eZBmnX5VYP0ZB9gMwPJTyIR7nzFTCyyNZAtwUJwGACEvSjRIocZCRcBEbN9nzkUES10alVjLZBYZBTiQQ8OoNWyYg3gE6HfPqf3ZCtvZCu02XHckcjOlM7S0nxaYQaeZATk9pRrUqZA1lhwkWdhv1jzFyjvrdUjOUeN7opnT37oyZC1TjEW94rJeM5KuNlToECkUY6A8Ud34QQ7sNm74HQBV3SP3dkZD"
PAGE_ID = "347395135120835"
BASE_URL = "https://graph.facebook.com/v18.0"

def get_all_conversations():
    """Get ALL conversations using pagination"""
    all_convs = []
    url = f"{BASE_URL}/{PAGE_ID}/conversations?access_token={PAGE_TOKEN}&limit=100"
    
    while url:
        print(f"Fetching: {url[:80]}...")
        resp = requests.get(url).json()
        
        if 'error' in resp:
            print(f"Error: {resp['error']}")
            break
        
        all_convs.extend(resp.get('data', []))
        
        # Get next page
        paging = resp.get('paging', {})
        url = paging.get('next')
        
        print(f"  Got {len(resp.get('data', []))} conversations, total: {len(all_convs)}")
    
    return all_convs

def get_all_messages_from_conversation(conv_id):
    """Get ALL messages from a conversation using pagination"""
    all_msgs = []
    url = f"{BASE_URL}/{conv_id}/messages?access_token={PAGE_TOKEN}&limit=50"
    
    while url:
        resp = requests.get(url).json()
        
        if 'error' in resp:
            break
        
        all_msgs.extend(resp.get('data', []))
        
        # Get next page
        paging = resp.get('paging', {})
        url = paging.get('next')
    
    return all_msgs

def scrape_all_history():
    """Scrape complete message history"""
    print("=" * 70)
    print("MORIX MESSENGER - FULL HISTORY SCRAPER")
    print("=" * 70)
    
    # Get all conversations
    print("\n📥 Fetching all conversations...")
    convs = get_all_conversations()
    print(f"✅ Found {len(convs)} total conversations\n")
    
    all_data = []
    total_messages = 0
    
    # Get messages from each conversation
    for i, conv in enumerate(convs, 1):
        conv_id = conv['id']
        updated = conv.get('updated_time', '')[:10]
        
        print(f"[{i}/{len(convs)}] Reading conversation {conv_id[:20]}... ({updated})")
        
        msgs = get_all_messages_from_conversation(conv_id)
        
        # Process messages
        customer_msgs = []
        for m in msgs:
            msg_id = m['id']
            detail = requests.get(f"{BASE_URL}/{msg_id}?fields=message,from,created_time&access_token={PAGE_TOKEN}").json()
            
            sender = detail.get('from', {}).get('name', '')
            text = detail.get('message', '')
            created = detail.get('created_time', '')
            
            if text and 'morix' not in sender.lower():
                customer_msgs.append({
                    'customer': sender,
                    'message': text,
                    'date': created[:10],
                    'time': created[11:16]
                })
        
        if customer_msgs:
            all_data.append({
                'conversation_id': conv_id,
                'date': updated,
                'messages': customer_msgs
            })
            total_messages += len(customer_msgs)
            print(f"  ✅ {len(customer_msgs)} customer messages")
    
    print(f"\n{'='*70}")
    print(f"📊 COMPLETE HISTORY")
    print(f"{'='*70}")
    print(f"Total Conversations: {len(all_data)}")
    print(f"Total Customer Messages: {total_messages}")
    
    # Save to file
    output = {
        'timestamp': datetime.now().isoformat(),
        'total_conversations': len(all_data),
        'total_messages': total_messages,
        'data': all_data
    }
    
    output_file = f"morix_full_history_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Saved to {output_file}")
    return output

if __name__ == "__main__":
    scrape_all_history()
