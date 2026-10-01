export function GearMark({ type = 'pack', color = '#f26b2b' }) {
  const common = { viewBox: '0 0 140 110', role: 'img', 'aria-label': `${type} gear illustration`, class: 'gear-mark' };
  if (type === 'pack') {
    return <svg {...common}><path d="M37 30h62l12 62H25L37 30Z" fill={color}/><path d="M45 30q8-20 25-20t25 20" fill="none" stroke="#f8e7c1" stroke-width="8"/><path d="M47 46h46M42 64h56M55 82h30" stroke="#221711" stroke-width="7" stroke-linecap="round"/></svg>;
  }
  if (type === 'shell') {
    return <svg {...common}><path d="M47 14 19 39l20 22 8-8v43h46V53l8 8 20-22-28-25-23 14-23-14Z" fill={color}/><path d="M70 28v68M47 53h46" stroke="#1d1710" stroke-width="6"/></svg>;
  }
  if (type === 'stove') {
    return <svg {...common}><path d="M40 50h60l-7 36H47l-7-36Z" fill={color}/><path d="M52 36h36l12 14H40l12-14Z" fill="#f8e7c1"/><path d="M60 24c-5 4-6 9-1 14M80 20c7 7 7 13 1 18" stroke="#f26b2b" stroke-width="6" fill="none" stroke-linecap="round"/></svg>;
  }
  if (type === 'tarp') {
    return <svg {...common}><path d="M16 82 70 20l54 62H16Z" fill={color}/><path d="M70 20v62M36 82l34-62 34 62" stroke="#1d1710" stroke-width="5"/><circle cx="16" cy="82" r="6" fill="#f8e7c1"/><circle cx="124" cy="82" r="6" fill="#f8e7c1"/></svg>;
  }
  if (type === 'bivy') {
    return <svg {...common}><path d="M17 78c20-36 78-45 106 0v15H17V78Z" fill={color}/><path d="M34 78c12-21 50-30 72 0" fill="none" stroke="#f8e7c1" stroke-width="7"/><path d="M25 93h90" stroke="#1d1710" stroke-width="6"/></svg>;
  }
  return <svg {...common}><path d="M50 30h40l8 58H42l8-58Z" fill={color}/><path d="M56 30q0-15 14-15t14 15" fill="none" stroke="#f8e7c1" stroke-width="7"/><path d="M50 48h40M47 70h46" stroke="#1d1710" stroke-width="6"/></svg>;
}
