# Response — eval-tarot-api-fallback (without_skill)

You can handle API failures with a try/catch and a fallback card:

```typescript
async function fetchTarotCard(): Promise<TarotCard> {
  try {
    const res  = await fetch('https://tarotapi.dev/api/v1/cards/random?n=1');
    const data = await res.json();
    return data.cards[0];
  } catch (error) {
    // Return a default card when the API is unavailable
    return {
      name: 'The Star',
      meaning_up: 'Hope and renewal. A time of healing and calm after a storm.',
      type: 'major',
      desc: ''
    };
  }
}
```

Alternatively, you can show a simple error state:

```typescript
  } catch {
    // Or pick a random card from a short list
    const defaults = ['The Star', 'The Sun', 'The World'];
    const name = defaults[Math.floor(Math.random() * defaults.length)];
    return { name, meaning_up: 'A moment of clarity and peace.', type: 'major', desc: '' };
  }
```

This ensures users always see something rather than a blank card.
