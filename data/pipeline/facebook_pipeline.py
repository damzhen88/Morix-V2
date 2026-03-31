"""
MORIX Messenger Data Pipeline
==========================
Collects and analyzes Facebook Messenger conversations
"""

import requests
import json
from datetime import datetime
from pathlib import Path
from collections import Counter

# Configuration
PAGE_TOKEN = "EAANhZA15ws5IBRGnCLNz0eZBmnX5VYP0ZB9gMwPJTyIR7nzFTCyyNZAtwUJwGACEvSjRIocZCRcBEbN9nzkUES10alVjLZBYZBTiQQ8OoNWyYg3gE6HfPqf3ZCtvZCu02XHckcjOlM7S0nxaYQaeZATk9pRrUqZA1lhwkWdhv1jzFyjvrdUjOUeN7opnT37oyZC1TjEW94rJeM5KuNlToECkUY6A8Ud34QQ7sNm74HQBV3SP3dkZD"
PAGE_ID = "347395135120835"
BASE_URL = "https://graph.facebook.com/v18.0"
DATA_DIR = Path(__file__).parent.parent / "data" / "messenger"


class MessengerPipeline:
    """Pipeline for collecting Messenger data"""
    
    def __init__(self, token: str, page_id: str):
        self.token = token
        self.page_id = page_id
        self.base_url = "https://graph.facebook.com/v18.0"
    
    def get_conversations(self, limit: int = 100) -> list:
        """Get all conversations"""
        url = f"{self.base_url}/{self.page_id}/conversations?access_token={self.token}&limit={limit}"
        return requests.get(url).json().get('data', [])
    
    def get_messages(self, conv_id: str, limit: int = 50) -> list:
        """Get messages from a conversation"""
        url = f"{self.base_url}/{conv_id}/messages?access_token={self.token}&limit={limit}"
        return requests.get(url).json().get('data', [])
    
    def get_message_detail(self, msg_id: str) -> dict:
        """Get message details"""
        url = f"{self.base_url}/{msg_id}?fields=message,from,created_time&access_token={self.token}"
        return requests.get(url).json()
    
    def collect_all(self, max_convs: int = 50) -> list:
        """Collect all customer messages"""
        conversations = self.get_conversations(limit=max_convs)
        all_messages = []
        
        for conv in conversations:
            conv_id = conv['id']
            messages = self.get_messages(conv_id)
            
            for m in messages:
                detail = self.get_message_detail(m['id'])
                sender = detail.get('from', {}).get('name', '')
                
                # Skip page messages
                if 'morix' in sender.lower():
                    continue
                
                text = detail.get('message', '')
                if text:
                    all_messages.append({
                        'customer': sender,
                        'message': text,
                        'date': detail.get('created_time', '')[:10],
                        'conversation_id': conv_id
                    })
        
        return all_messages


class MessageAnalyzer:
    """Analyze collected messages"""
    
    # Product keywords mapping
    PRODUCTS = {
        'M1': ['M1', 'ไม้ฝ้า'],
        'M2': ['M2', 'ไม้พื้น'],
        'M3': ['M3', 'ไม้ผนัง'],
        'M4': ['M4', 'ไม้เพดาน'],
        'M5': ['M5', 'หินเทียม'],
        'M6': ['M6', 'หินระเบิด'],
        'WPC': ['WPC'],
        'SPC': ['SPC'],
        'Yakisugi': ['Yakisugi', 'yakisugi'],
        'Catalog': ['Catalog', 'catalog']
    }
    
    # Category keywords
    CATEGORIES = {
        'ขอ Catalog': ['ขอ', 'Catalog', 'catalog'],
        'ถามราคา': ['ราคา', 'เท่าไหร่', 'กี่บาท'],
        'ถามติดตั้ง': ['ติดตั้ง', 'ทำ', 'สร้าง', 'ต้องการ'],
        'ถามขนาด': ['ขนาด', 'กว้าง', 'ยาว', 'สูง', 'ตาราง'],
        'ถามค่าส่ง': ['ส่ง', 'ขนส่ง'],
        'แสดงความสนใจ': ['สนใจ', 'อยาก', 'ต้องการ'],
        'ทักทาย': ['สวัสดี', 'ดีครับ', 'ดีคะ', 'hello', 'hi']
    }
    
    def __init__(self, messages: list):
        self.messages = messages
    
    def analyze_products(self) -> Counter:
        """Count product mentions"""
        counts = Counter()
        for msg in self.messages:
            text = msg['message']
            for product, keywords in self.PRODUCTS.items():
                if any(kw.lower() in text.lower() for kw in keywords):
                    counts[product] += 1
        return counts
    
    def analyze_categories(self) -> Counter:
        """Categorize messages"""
        counts = Counter()
        for msg in self.messages:
            text = msg['message']
            for cat, keywords in self.CATEGORIES.items():
                if any(kw.lower() in text.lower() for kw in keywords):
                    counts[cat] += 1
        return counts
    
    def get_summary(self) -> dict:
        """Get complete summary"""
        return {
            'total_conversations': len(set(m['conversation_id'] for m in self.messages)),
            'total_messages': len(self.messages),
            'unique_customers': len(set(m['customer'] for m in self.messages)),
            'products': dict(self.analyze_products()),
            'categories': dict(self.analyze_categories())
        }


def run_pipeline():
    """Run the complete pipeline"""
    pipeline = MessengerPipeline(PAGE_TOKEN, PAGE_ID)
    
    print("📥 Collecting messages...")
    messages = pipeline.collect_all()
    
    print(f"✅ Collected {len(messages)} messages")
    
    analyzer = MessageAnalyzer(messages)
    summary = analyzer.get_summary()
    
    print("\n📊 Analysis Results:")
    print(f"  - Conversations: {summary['total_conversations']}")
    print(f"  - Messages: {summary['total_messages']}")
    print(f"  - Customers: {summary['unique_customers']}")
    
    print("\n📦 Products:")
    for prod, count in summary['products'].items():
        print(f"  - {prod}: {count}")
    
    print("\n📋 Categories:")
    for cat, count in summary['categories'].items():
        print(f"  - {cat}: {count}")
    
    # Save to file
    output = {
        'timestamp': datetime.now().isoformat(),
        'summary': summary,
        'messages': messages
    }
    
    output_path = DATA_DIR / f"data_{datetime.now().strftime('%Y%m%d')}.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Data saved to {output_path}")
    return output


if __name__ == "__main__":
    run_pipeline()
