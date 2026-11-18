import { useMemo, useState } from 'react';
import { DECKS } from '@ipl/content';
import { RichText } from '@/components/ui';
import { progress, useProgress } from '@/state/progress';
import { settingsStore, useSettings } from '@/state/settings';
import { isDue } from '@/lib/srs';

import { ALL_CARDS, cardReviewId, setFlashcardMode, useFlashcardMode, type CardMode as Mode } from './cards';

export default function FlashcardsPage() {
  const prog = useProgress();
  const { fcDeck } = useSettings();
  const m = useFlashcardMode();
  const [topic, setTopic] = useState('All');
  const [idx, setIdx] = useState(0);
  const [flip, setFlip] = useState(false);
  const [order, setOrder] = useState<Map<string, number> | null>(null);
  const known = new Set(prog.known);
  const deck = DECKS.find((d) => d.id === fcDeck)!;
  const inTopic = ALL_CARDS.filter((c) => c.deck === fcDeck && (topic === 'All' || c.topic === topic));
  const cards = useMemo(() => {
    let d = inTopic.filter((c) => (m === 'unknown' ? !known.has(c.id) : m === 'due' ? isDue(prog.sr[cardReviewId(c.id)]) : true));
    if (order) d = [...d].sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
    return d;
  }, [inTopic, m, prog, order]); // eslint-disable-line react-hooks/exhaustive-deps
  const i = idx < cards.length ? idx : 0;
  const card = cards[i];
  const reset = () => { setIdx(0); setFlip(false); };
  const answer = (knowIt: boolean) => {
    if (!card) return;
    progress.setKnown(card.id, knowIt);
    progress.rate(cardReviewId(card.id), knowIt ? 'easy' : 'fail');
    if (knowIt ? m === 'all' : m !== 'due') setIdx(i + 1);
    setFlip(false);
  };
  return (
    <>
      <h1>Technical Q&amp;A</h1>
      <p className="sub">Flashcards for phone screens and technical rounds, in two decks. Click a card to reveal the answer.</p>
      <div className="seg" role="tablist" aria-label="Deck" style={{ display: 'flex', width: 'max-content', margin: '0 auto 14px' }}>
        {DECKS.map((d) => <button key={d.id} className={fcDeck === d.id ? 'active' : ''} onClick={() => { settingsStore.setDeck(d.id); setTopic('All'); setOrder(null); reset(); }}>{d.name}</button>)}
      </div>
      <div className="chips" style={{ justifyContent: 'center' }}>
        {['All', ...deck.topics.map((t) => t.name)].map((t) => <button key={t} className={'btn sm' + (t === topic ? ' pri' : '')} onClick={() => { setTopic(t); reset(); }}>{t}</button>)}
      </div>
      <div className="controls" style={{ justifyContent: 'center' }}>
        <select value={m} onChange={(e) => { setFlashcardMode(e.target.value as Mode); reset(); }} aria-label="Which cards">
          <option value="all">All cards</option><option value="unknown">Cards I don't know yet</option><option value="due">Due for review</option>
        </select>
        <button className="btn sm" onClick={() => { setOrder(new Map(ALL_CARDS.map((c) => [c.id, Math.random()]))); reset(); }}>Shuffle</button>
        <span className="muted" style={{ fontSize: 14 }}>{cards.length ? i + 1 : 0} / {cards.length} · {inTopic.filter((c) => known.has(c.id)).length} of {inTopic.length} known</span>
      </div>
      <div className="card flash" onClick={() => setFlip((f) => !f)} role="button" tabIndex={0} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setFlip((f) => !f)}>
        {card ? <>
          <div className="muted" style={{ fontSize: 12.5, marginBottom: 8 }}>{card.topic}{known.has(card.id) ? ' · ✓ known' : ''}</div>
          <div className="q"><RichText text={card.q} /></div>
          {flip ? <div className="a"><RichText text={card.a} /></div> : <div className="muted" style={{ fontSize: 13, marginTop: 14 }}>Click to reveal the answer</div>}
        </> : <div className="q">{m === 'due' ? '🎉 Nothing due for review right now. Come back tomorrow.' : '🎉 You know every card in this set.'}</div>}
      </div>
      <div className="controls" style={{ justifyContent: 'center', marginTop: 12 }}>
        <button className="btn" onClick={() => { if (cards.length) { setIdx((i - 1 + cards.length) % cards.length); setFlip(false); } }}>← Prev</button>
        <button className="btn" onClick={() => answer(false)}>Review again</button>
        <button className="btn pri" onClick={() => answer(true)}>I know this ✓</button>
        <button className="btn" onClick={() => { if (cards.length) { setIdx((i + 1) % cards.length); setFlip(false); } }}>Next →</button>
      </div>
    </>
  );
}
