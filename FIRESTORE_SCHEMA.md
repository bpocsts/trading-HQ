# Firestore Schema — Trading Journal

## Collections

### users/{userId}
```json
{
  "uid": "string",
  "email": "string",
  "displayName": "string",
  "photoURL": "string | null",
  "profile": {
    "name": "Ash",
    "role": "Smart Money Concept Trader",
    "level": 24,
    "xp": 720,
    "xpMax": 1000,
    "winRate": 67,
    "rrAverage": "1 : 2.4",
    "totalTrades": 128,
    "balance": 12450,
    "bestSession": "London",
    "currentStreak": 7
  },
  "dailyStats": {
    "hp": 8, "mood": 7, "focus": 8, "motivation": 9
  },
  "todayFocus": {
    "session": "London",
    "pair": "XAUUSD",
    "bias": "Bullish",
    "keyLevel": "2280.0",
    "notes": "..."
  },
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### trades/{tradeId}
```json
{
  "userId": "string",
  "pair": "XAUUSD",
  "direction": "Long | Short",
  "entry": 2275.20,
  "sl": 2270.00,
  "tp": 2285.00,
  "lotSize": 0.10,
  "rr": "1:1.88",
  "result": "Win | Loss | Pending",
  "pl": 310,
  "emotion": "Calm",
  "notes": "string",
  "screenshotUrl": "string | null",
  "session": "London | New York | Asia | Sydney",
  "date": "timestamp",
  "createdAt": "timestamp"
}
```

### journals/{journalId}
```json
{
  "userId": "string",
  "date": "YYYY-MM-DD",
  "content": "string",
  "mood": 7,
  "sessionsTraded": ["London"],
  "keyLearnings": "string",
  "tomorrowPlan": "string",
  "createdAt": "timestamp"
}
```

### habits/{habitId}
```json
{
  "userId": "string",
  "name": "Morning Meditation",
  "streak": 7,
  "longestStreak": 14,
  "completedDates": ["2024-05-01", "2024-05-02"],
  "createdAt": "timestamp"
}
```

### mistakes/{mistakeId}
```json
{
  "userId": "string",
  "type": "No Confirmation | Early Entry | FOMO | Revenge Trading | Over Risk",
  "tradeId": "string | null",
  "description": "string",
  "date": "timestamp",
  "createdAt": "timestamp"
}
```

### achievements/{achievementId}
```json
{
  "userId": "string",
  "title": "7 Win Streak",
  "icon": "🔥",
  "description": "string",
  "unlockedAt": "timestamp",
  "type": "streak | discipline | risk | routine"
}
```

### psychology/{entryId}
```json
{
  "userId": "string",
  "date": "timestamp",
  "emotionBefore": "Calm | Confident | Neutral | Anxious | Angry",
  "emotionAfter": "string",
  "stressLevel": 4,
  "notes": "string",
  "tradingDecisions": "string",
  "createdAt": "timestamp"
}
```

### strategies/{strategyId}
```json
{
  "userId": "string",
  "name": "BOS + Retest",
  "description": "string",
  "rules": ["string"],
  "timeframes": ["15m", "1H", "4H"],
  "pairs": ["XAUUSD", "EURUSD"],
  "screenshotUrls": ["string"],
  "winRate": 68,
  "createdAt": "timestamp"
}
```

### screenshots/{screenshotId}
```json
{
  "userId": "string",
  "tradeId": "string | null",
  "url": "string",
  "caption": "string",
  "pair": "string",
  "date": "timestamp",
  "createdAt": "timestamp"
}
```

## Security Rules (Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /trades/{tradeId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
    match /{collection}/{docId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
  }
}
```
