// v0.1.2. Engineering starting points, deliberately separate from cell ratings.
export const VERSION = '0.1.2';
export const CELL = Object.freeze({ capacity: 314, nominal: 3.2 });
// These are operating profiles, NOT an OCV/SOC curve or a manufacturer SOC table.
const upperProfiles = [[60,3.36],[65,3.37],[70,3.38],[75,3.39],[80,3.40],[85,3.42],[90,3.45],[95,3.50],[100,3.55]];
const lowerProfiles = [[5,3.00],[10,3.10],[15,3.15],[20,3.18],[25,3.20],[30,3.22],[35,3.23],[40,3.24]];
export function calculate({ series, lower, upper }) {
  if (![4,7,8].includes(series) || !lowerProfiles.some(([n])=>n===lower) || !upperProfiles.some(([n])=>n===upper) || lower>=upper) throw new RangeError('Unsupported configuration');
  const high=upperProfiles.find(([n])=>n===upper)[1];
  const low=lowerProfiles.find(([n])=>n===lower)[1];
  const pack=(v,step=.1)=>Math.round(v*series/step)*step;
  const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
  const cutoffRequested=pack(low);
  const gridRequested=pack(low+.03,.5);
  // BMS remains a backup: its thresholds sit outside the daily inverter window.
  // These tighter guards are engineering choices within EVE operating limits,
  // not a claim that cell voltage measures or enforces the chosen SOC.
  const bmsOvp=Math.min(3.6,high+.05);
  const bmsRcv=high-.02;
  const bmsUvp=Math.max(2.85,low-.15);
  const bmsUvpr=low+.02;
  return { series,lower,upper, high,low,bmsOvp,bmsRcv,bmsUvp,bmsUvpr,
    nominal:series*CELL.nominal,energy:series*CELL.nominal*CELL.capacity/1000*(upper-lower)/100,
    ah:CELL.capacity*(upper-lower)/100,bulk:pack(high),float:pack(Math.min(3.35,high-.03)),
    cutoff:clamp(cutoffRequested,21,25),cutoffRequested,
    backGrid:clamp(gridRequested,22,25.5),gridRequested,
    backBattery:clamp(pack(high-.02,.5),24,29),compatible:series===8,
    cutoffLimited:cutoffRequested>25,gridLimited:gridRequested>25.5 };
}
