import React from 'react';
import { Check, Lock, Radio } from 'lucide-react';

interface MissionMapProps {
  currentRound?: string;
  compact?: boolean;
}

const missions = [
  { id: '01', label: 'DISCOVER', description: 'Find the signal' },
  { id: '02', label: 'BUILD', description: 'Ship the MVP' },
  { id: '03', label: 'VALIDATE', description: 'Read the market' },
  { id: '04', label: 'GROW', description: 'Acquire demand' },
  { id: '05', label: 'SCALE', description: 'Reach one' },
];

const roundIndex = (round?: string) => {
  const match = round?.match(/\d+/);
  return match ? Math.max(0, Math.min(missions.length - 1, Number(match[0]) - 1)) : 0;
};

export const MissionMap: React.FC<MissionMapProps> = ({ currentRound, compact = false }) => {
  const activeIndex = roundIndex(currentRound);

  return (
    <section className={`zo-mission-map ${compact ? 'zo-mission-map--compact' : ''}`} aria-label="Mission progression">
      <div className="zo-section-kicker">
        <span>MISSION SEQUENCE</span>
        <span className="zo-kicker-line" />
        <span>{String(activeIndex + 1).padStart(2, '0')} / 05</span>
      </div>
      <div className="zo-mission-track">
        {missions.map((mission, index) => {
          const completed = index < activeIndex;
          const active = index === activeIndex;
          return (
            <React.Fragment key={mission.id}>
              <div className={`zo-mission-node ${completed ? 'is-complete' : ''} ${active ? 'is-active' : ''} ${index > activeIndex ? 'is-locked' : ''}`}>
                <div className="zo-mission-node__dot" aria-hidden="true">
                  {completed ? <Check size={14} strokeWidth={3} /> : active ? <Radio size={14} /> : <Lock size={12} />}
                </div>
                <div className="zo-mission-node__copy">
                  <span className="zo-mission-node__id">{mission.id}</span>
                  <strong>{mission.label}</strong>
                  {!compact && <small>{completed ? 'MISSION COMPLETE' : active ? mission.description : 'LOCKED'}</small>}
                </div>
              </div>
              {index < missions.length - 1 && <span className={`zo-mission-connector ${index < activeIndex ? 'is-complete' : ''}`} aria-hidden="true" />}
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
};
